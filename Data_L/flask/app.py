import eventlet
eventlet.monkey_patch()

import logging
logging.getLogger("ultralytics").setLevel(logging.ERROR)

import os
import cv2
import torch
import pymysql
import re
import time
import threading
import queue
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, send_from_directory, send_file, make_response, abort
from flask_cors import CORS
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename
from ultralytics import YOLO

# Flask 앱 및 SocketIO 설정
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, ping_timeout=60, ping_interval=25, cors_allowed_origins="*", async_mode="eventlet")

# 파일 및 결과 저장 폴더 설정
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
# detection 결과 저장 경로
DETECTION_FOLDER = os.path.join(app.root_path, 'detection_result')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(DETECTION_FOLDER, exist_ok=True)

# .env 파일 로드
load_dotenv()

# 모델 로드 (exit_high.py의 모델 경로 사용)
MODEL_PATH = os.path.join(app.root_path, "best.pt")
model = YOLO(MODEL_PATH)

# DB 연결 설정
DB_HOST = os.getenv("DB_IP_ADDRESS")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", 3306))

# 색상 매핑 (WebSocket 업데이트 시 사용)
color_mapping = {
    "06_brown_bottle": "brown",
    "06_brown_bottle+dirty": "brown",
    "06_brown_bottle+dirty+multi": "brown",
    "06_brown_bottle+multi": "brown",
    "07_green_bottle": "green",
    "07_green_bottle+dirty": "green",
    "07_green_bottle+dirty+multi": "green",
    "07_green_bottle+multi": "green",
    "08_white_bottle": "white",
    "08_white_bottle+dirty": "white",
    "08_white_bottle+dirty+multi": "white",
    "08_white_bottle+multi": "white",
    "09_glass": "glass",
    "09_glass+dirty": "glass",
    "09_glass+dirty+multi": "glass",
    "09_glass+multi": "glass",
    "10_blue_bottle": "blue"
}

# DB 연결 함수
def connect_db():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except pymysql.MySQLError as e:
        raise Exception("Database connection failed: " + str(e))

# detections 테이블에 저장 (동일 video_name+track_id이면 confidence가 더 높을 때 업데이트)
def save_detection_to_db(conn, video_name, frame_time, track_id, class_name, bbox, confidence):
    try:
        if track_id == -1:
            track_id = int(time.time() * 1000)  # Unix timestamp 기반 임시 ID 생성
                    
        with conn.cursor() as cursor:
            select_sql = """
                SELECT confidence FROM detections
                WHERE video_name = %s AND track_id = %s
            """
            cursor.execute(select_sql, (video_name, track_id))
            row = cursor.fetchone()
            
            if row is None:
                insert_sql = """
                    INSERT INTO detections (
                        video_name, frame_time, track_id, class_name,
                        bbox_x1, bbox_y1, bbox_x2, bbox_y2, confidence, detected_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """
                cursor.execute(insert_sql, (
                    video_name, frame_time, track_id, class_name,
                    float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3]),
                    float(confidence)
                ))
            else:
                existing_conf = float(row['confidence'])
                if confidence > existing_conf:
                    update_sql = """
                        UPDATE detections
                        SET frame_time = %s,
                            class_name = %s,
                            bbox_x1 = %s,
                            bbox_y1 = %s,
                            bbox_x2 = %s,
                            bbox_y2 = %s,
                            confidence = %s,
                            detected_at = NOW()
                        WHERE video_name = %s AND track_id = %s
                    """
                    cursor.execute(update_sql, (
                        frame_time, class_name,
                        float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3]),
                        float(confidence),
                        video_name, track_id
                    ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("DB error:", e)

# WebSocket으로 실시간 카운트 전송 (DB에서 detections 테이블 조회)
def send_realtime_count(conn, video_name):
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT track_id, class_name FROM detections
                WHERE video_name = %s AND track_id >= 0
            """
            cursor.execute(sql, (video_name,))
            rows = cursor.fetchall()
            
        distinct_ids = set()
        color_counts = {"blue": 0, "brown": 0, "green": 0, "white": 0, "glass": 0}
        trackid_to_color = {}
        
        for row in rows:
            tid = row["track_id"]
            cname = row["class_name"]
            distinct_ids.add(tid)
            if cname in color_mapping:
                cgroup = color_mapping[cname]
                if cgroup and tid not in trackid_to_color:
                    trackid_to_color[tid] = cgroup
                    
        for cgroup in trackid_to_color.values():
            color_counts[cgroup] += 1
            
        total_bottle_counts = len(distinct_ids)
        
        socketio.emit("update_count", {
            "bottle_counts": total_bottle_counts,
            "color_counts": color_counts,
        })
    except Exception as e:
        print("WebSocket error:", e)

# 허용 확장자 체크
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'avi', 'mov'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 이미지에 대해 YOLO 결과를 python dict로 변환 (이미지 분석용)
def process_yolo_tracking_results(yolo_results):
    formatted_results = []
    
    if isinstance(yolo_results, list):
        yolo_results = yolo_results[0]
    
    object_id_counter = 1
    
    for box in yolo_results.boxes:
        bbox = box.xyxy.cpu().numpy().tolist()[0]
        confidence = float(box.conf.cpu().numpy()[0])
        cls_idx = int(box.cls.cpu().numpy()[0])
        
        # 원래는 box.id가 추적 ID지만, 이미지라 None이므로 그냥 object_id_counter 사용
        if box.id is not None:
            track_id = int(box.id.cpu().numpy()[0])
        else:
            track_id = object_id_counter
            object_id_counter += 1 

        class_name = model.names[cls_idx] if cls_idx < len(model.names) else f"Unknown({cls_idx})"

        detection = {
            "track_id": track_id,
            "class": class_name,
            "bbox": bbox,
            "confidence": confidence,
        }
        formatted_results.append(detection)
    return formatted_results

# 전역 상태 관리
analysis_thread = None
analysis_thread_running = False
frame_queue = queue.Queue(maxsize=50)  # 실시간 스트리밍용 프레임 큐
ANNOTATED_VIDEO_PATH = None
current_video_path = None

# /upload 엔드포인트: 이미지/비디오 업로드 후 분석 시작
@app.route('/upload', methods=['POST'])
def upload_file():
    global ANNOTATED_VIDEO_PATH, current_video_path, analysis_thread, analysis_thread_running
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    original_filename = secure_filename(file.filename)
    unique_filename = f"{timestamp_str}_{original_filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)

    if not os.path.exists(file_path):
        print("File not saved:", file_path)
        return jsonify({"error": "File not saved"}), 500
    else:
        print("File uploaded successfully:", file_path)

    # detection 결과 저장 폴더 생성
    save_folder = os.path.join(DETECTION_FOLDER, unique_filename)
    images_folder = os.path.join(save_folder, "images")
    video_folder = os.path.join(save_folder, "video")
    os.makedirs(images_folder, exist_ok=True)
    os.makedirs(video_folder, exist_ok=True)
    print("Detection result folder created:", save_folder)

    conn = connect_db()
    try:
        # 이미지 파일인 경우
        if unique_filename.lower().endswith(('png', 'jpg', 'jpeg')):
            image = cv2.imread(file_path)
            if image is None:
                return jsonify({"error": "Failed to load image"}), 500

            results = model(image)

            formatted_results = process_yolo_tracking_results(results)
            
            for det in formatted_results:
                save_detection_to_db(conn, unique_filename, 0.0, det["track_id"], det["class"], det["bbox"], det["confidence"])
            conn.commit()

            # === 이미지 전용 처리 ===
            if len(formatted_results) > 0:
                # 프론트엔드에서 "new_detection"을 받아서 detectionList를 업데이트
                socketio.emit("new_detection", {
                    "detections": [
                        {
                            "time": 0.0,
                            "track_id": d["track_id"],
                            "class_name": d["class"],
                            "confidence": d["confidence"]
                        } for d in formatted_results
                    ]
                })

                # 카운트 업데이트
                send_realtime_count(conn, unique_filename)
                
                # Annotated 이미지 저장
                annotated_image = results[0].plot()
                img_save_path = os.path.join(images_folder, f"annotated_{unique_filename}")
                cv2.imwrite(img_save_path, annotated_image)
                ANNOTATED_VIDEO_PATH = None

            return jsonify({
                "filename": unique_filename,
                "file_type": "image",
                "results": formatted_results
            })

        # 동영상 파일인 경우
        elif unique_filename.lower().endswith(('mp4', 'avi', 'mov')):
            current_video_path = file_path
            base_filename, ext = os.path.splitext(unique_filename)
            annotated_video_filename = f"tracked_video_{base_filename}.mp4"
            annotated_video_path = os.path.join(video_folder, annotated_video_filename)
            if analysis_thread and analysis_thread_running:
                analysis_thread_running = False
                analysis_thread.join()
            analysis_thread = threading.Thread(
                target=analyze_video,
                args=(current_video_path, annotated_video_path, unique_filename, save_folder)
            )
            analysis_thread.start()
            return jsonify({
                "filename": unique_filename,
                "file_type": "video",
                "message": "Video upload successful. Background analysis started."
            })
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# exit count & highest precision 분석 로직 함수
def analyze_video(input_path, output_path, filename, save_folder):
    global analysis_thread_running, ANNOTATED_VIDEO_PATH
    
    analysis_thread_running = True
    conn = connect_db()
    try:
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            print("Failed to open video:", input_path)
            analysis_thread_running = False
            return

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # ROI 설정 (좌우 12.5% 제외)
        roi_x1 = int(frame_width * 0.125)
        roi_x2 = int(frame_width * 0.875)

        images_folder = os.path.join(save_folder, "images")
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

        frame_skip = 5
        frame_count = 0
        previous_objects = {}
        object_counts = 0
        object_best_confidence = {}
        detection_results = []
        
        # 이미지 캡쳐 주기 (초) - 그리드 표시용
        interval = 0.5
        last_capture_time = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            if frame_count % frame_skip != 0:
                continue
            frame_time = frame_count / fps
            
            # 해당 프레임에서 새로 업데이트된 감지 정보를 모으기 위한 리스트
            frame_detections = []

            # 객체 추적 (YOLO ByteTrack tracking)
            results = model.track(frame, 
                                  persist=True, 
                                  conf=0.49, 
                                  iou=0.3, 
                                  agnostic_nms=False)

            detected_objects = set()
            
            # ROI 선 그리기
            cv2.line(frame, (roi_x1, 0), (roi_x1, frame_height), (255, 255, 255), 2)
            cv2.line(frame, (roi_x2, 0), (roi_x2, frame_height), (255, 255, 255), 2)

            for result in results:
                for box in result.boxes:
                    if box.id is None:
                        continue
                    obj_id = int(box.id.item())
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0].item())
                    class_id = int(box.cls[0].item())
                    class_name = model.names[class_id] if class_id < len(model.names) else f"Unknown({class_id})"
                    detected_objects.add(obj_id)
                    previous_objects[obj_id] = 0  # reset lost counter

                    bbox_center_x = (x1 + x2) // 2
                    if roi_x1 <= bbox_center_x <= roi_x2:
                        # ROI 내일 때, 최고 신뢰도 업데이트
                        if obj_id not in object_best_confidence or conf > object_best_confidence[obj_id]["confidence"]:
                            object_best_confidence[obj_id] = {
                                "frame_time": frame_time,
                                "class_name": class_name,
                                "confidence": conf,
                                "bbox": (x1, y1, x2, y2)
                            }
                            save_detection_to_db(conn, filename, frame_time, obj_id, class_name, (x1, y1, x2, y2), conf)
                            frame_detections.append({
                                "time": frame_time,
                                "track_id": obj_id,
                                "class_name": class_name,
                                "confidence": conf
                            })
                                                    
                        best_data = object_best_confidence[obj_id]
                        label = f"{obj_id} | {best_data['class_name']} | {best_data['confidence']:.2f}"
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, label, (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    else:
                        label = f"ID:{obj_id} | {class_name} | {conf*100:.1f}%"
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (128, 128, 128), 2)
                        cv2.putText(frame, label, (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 128), 2)

            # 객체 추적 종료 처리 (연속 미검출 시 카운트)
            for obj_id in list(previous_objects.keys()):
                if obj_id not in detected_objects:
                    previous_objects[obj_id] += 1
                    if previous_objects[obj_id] > 5:
                        object_counts += 1
                        del previous_objects[obj_id]
                        
            # 주기적으로 annotated 이미지 저장 (이미지 그리드용)
            if frame_time - last_capture_time >= interval:
                last_capture_time = frame_time
                frame_filename = f"frame_{frame_time:.2f}.jpg"
                img_save_path = os.path.join(images_folder, frame_filename)
                cv2.imwrite(img_save_path, frame)
                
            # 프레임마다 새 감지 정보가 있다면, WebSocket으로 프론트엔드에 전송
            if frame_detections:
                socketio.emit("new_detection", {"detections": frame_detections})                

            # MJPEG 스트리밍용 프레임 큐 업데이트
            if not frame_queue.full():
                frame_queue.put(frame)
            else:
                frame_queue.get_nowait()
                frame_queue.put(frame)

            out.write(frame)
            send_realtime_count(conn, filename)
            socketio.sleep(0.01)

        out.release()
        cap.release()
        socketio.emit("final_video_ready", {"filename": filename})
        conn.commit()

        # CSV 저장 (최종 detection 결과)
        auto_increment_id = 1
        for obj_id, data in object_best_confidence.items():
            bbox_str = f"{data['bbox'][0]},{data['bbox'][1]},{data['bbox'][2]},{data['bbox'][3]}"
            detection_results.append([auto_increment_id, data["frame_time"], obj_id, data["class_name"], data["confidence"], bbox_str])
            auto_increment_id += 1
        if detection_results:
            df = pd.DataFrame(detection_results, columns=["ID", "Frame Time (s)", "Object ID", "Class", "Confidence", "BBox"])
            df = df.sort_values(by="Frame Time (s)", ascending=True)
            output_csv = os.path.join(save_folder, f"detection_results_{filename}.csv")
            df.to_csv(output_csv, index=False)
            print("Detection results saved to", output_csv)

        ANNOTATED_VIDEO_PATH = output_path
        print("Background analysis thread finished.")
        analysis_thread_running = False

    except Exception as e:
        conn.rollback()
        print("Error in video analysis:", e)
    finally:
        conn.close()
        analysis_thread_running = False

# 실시간 스트리밍 (MJPEG)
@app.route('/stream/live', methods=['GET'])
def stream_live():
    def generate_frames():
        while True:
            if not analysis_thread_running and frame_queue.empty():
                break
            frame = frame_queue.get()
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' +
                   buffer.tobytes() + b'\r\n')
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# detection 결과 이미지 목록 반환 (이미지 그리드용)
@app.route('/static/detection_result/<folder_name>', methods=['GET'])
def get_detection_images(folder_name):
    try:
        target_folder = os.path.join(DETECTION_FOLDER, folder_name, "images")
        if not os.path.exists(target_folder):
            return jsonify({"images": []})
        def sort_key(filename):
            match = re.search(r'\d+', filename)
            return int(match.group()) if match else float('inf')
        images = [f for f in os.listdir(target_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        images.sort(key=sort_key)
        return jsonify({"images": images})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# detection 결과 이미지 serve
@app.route('/static/detection_result/<folder_name>/<subfolder>/<filename>')
def send_detection_image(folder_name, subfolder, filename):
    target_folder = os.path.join(DETECTION_FOLDER, folder_name, subfolder)
    return send_from_directory(target_folder, filename)

# bottle_counts API (DB에서 조회)
@app.route('/bottle_counts', methods=['GET'])
def get_bottle_counts():
    video_name = request.args.get('video_name')
    if not video_name:
        return jsonify({"error": "Missing video_name parameter"}), 400
    conn = connect_db()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT COUNT(DISTINCT track_id) AS total FROM detections WHERE video_name = %s AND track_id >= 0"
            cursor.execute(sql, (video_name,))
            result = cursor.fetchone()
            bottle_counts = result['total'] if result else 0
        return jsonify({"bottle_counts": bottle_counts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000)

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { io } from "socket.io-client";
import FlipNumbers from "react-flip-numbers";
import Sidebar from './Sidebar';

const socket = io("http://10.125.121.225:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function FileUpload() {
  // 상태 선언
  const [file, setFile] = useState(null); // 업로드할 파일
  const [uploadedFilename, setUploadedFilename] = useState(""); // 서버에서 받은 고유 파일명
  const [results, setResults] = useState(null); // YOLO 결과(JSON)
  const [videoSrc, setVideoSrc] = useState(""); // 스트리밍 URL
  const [detectionImages, setDetectionImages] = useState([]); // 감지된 이미지 리스트
  const [selectedImage, setSelectedImage] = useState(null); // 클릭한 이미지 확대 표시
  const [bottleCounts, setBottleCounts] = useState(0);
  const [finalVideoSrc, setFinalVideoSrc] = useState(""); // 최종 영상 Range 스트리밍 URL

  const uploadedFilenameRef = useRef(uploadedFilename);
  useEffect(() => {
    uploadedFilenameRef.current = uploadedFilename;
  }, [uploadedFilename]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // 이전 분석 결과/이미지/스트림 초기화
    setResults(null);
    setVideoSrc("");
    setDetectionImages([]);
    setBottleCounts(0); // 새 파일 선택 시 병 개수 초기화
    setFinalVideoSrc("");
  };

  // 분석시작 버튼 -> /upload (POST)
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://10.125.121.225:5000/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedFile = response.data.filename;
      setUploadedFilename(uploadedFile);
      setResults(response.data);

      // 분석 완료 후 해당 파일과 관련된 이미지만 가져오기
      fetchDetectionImages(uploadedFile);

      // // 병 개수 API 호출 시도 
      // setUploadedFilename(response.data.filename);

      // // 업로드 후 YOLO 분석 결과(JSON) 받음
      // setResults(response.data);

      // annotated 이미지 가져오기
      // const imageResponse = await axios.get("http://10.125.121.225:5000/detection_images");
      // setDetectionImages(imageResponse.data.images);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  // (A) /detection_images API 통해 이미지 전체 목록을 fetch하는 함수
  const fetchDetectionImages = async (filename) => {
    if (!filename) return;

    try {
      const res = await axios.get("http://10.125.121.225:5000/detection_images");
      setDetectionImages(res.data.images || []);
    } catch (error) {
      console.error("Error fetching detection images:", error);
    }
  };

  // 분석 결과 스트리밍 (annotated video)
  const handleStream = () => {
    if (!uploadedFilename) {
      alert("Please upload a video first!");
      return;
    }
    setVideoSrc("http://10.125.121.225:5000/stream/live");
  };

  // 새로 추가된 함수: 최종 영상 Range 스트리밍
  const handleFinalVideo = () => {
    if (!uploadedFilename) {
      alert("Please upload a video first!");
      return;
    }
    // Python 코드에서 최종 mp4는 "annotated_업로드파일명" 으로 저장됨
    const finalUrl = `http://10.125.121.225:5000/video_file/annotated_${uploadedFilename}`;
    setFinalVideoSrc(finalUrl);
  };

  // 이미지 클릭 시 확대
  const handleImageClick = (img) => setSelectedImage(img);
  // 확대된 이미지 클릭 시 닫기
  const handleCloseImage = () => setSelectedImage(null);

  // 이전 이미지 보기
  const prevImage = useCallback(
    (event) => {
      event.stopPropagation();
      if (selectedImage && detectionImages.length > 0) {
        const currentIndex = detectionImages.indexOf(selectedImage);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + detectionImages.length) % detectionImages.length;
        setSelectedImage(detectionImages[prevIndex]);
      }
    },
    [selectedImage, detectionImages]
  );

  // 다음 이미지 보기
  const nextImage = useCallback(
    (event) => {
      event.stopPropagation();
      if (selectedImage && detectionImages.length > 0) {
        const currentIndex = detectionImages.indexOf(selectedImage);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + 1) % detectionImages.length;
        setSelectedImage(detectionImages[nextIndex]);
      }
    },
    [selectedImage, detectionImages]
  );

  // 컴포넌트 첫 렌더 시 한 번 불러오기 (선택)
  // useEffect(() => {
  //   fetchDetectionImages();
  // }, []);

  // (C) "new_frame_saved" 이벤트 수신 → 다시 목록 fetch
  useEffect(() => {
    const handleNewFrame = (data) => {
      if (data.filename === uploadedFilenameRef.current) {
        fetchDetectionImages(uploadedFilenameRef.current);
      }
    };

    socket.on("new_frame_saved", handleNewFrame);

    // 언마운트 시 핸들러 정리
    return () => {
      socket.off("new_frame_saved", handleNewFrame);
    };
  }, []);

  // WebSocket 이벤트 핸들러 등록
  useEffect(() => {
    socket.on("update_count", (data) => {
      setBottleCounts(data.bottle_counts);
    });
    socket.on("connect", () => {
      console.log("Socket connected!");
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  // 키보드 좌우 화살표 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedImage) {
        if (event.key === "ArrowLeft") {
          prevImage(event);
        } else if (event.key === "ArrowRight") {
          nextImage(event);
        } else if (event.key === "Escape") {
          setSelectedImage(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, prevImage, nextImage]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto p-4 bg-gray-100">
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <h1>File Upload and Streaming</h1>

          {/* 업로드 및 스트리밍 제어 */}
          <div style={{ marginBottom: "20px" }}>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
              분석 시작
            </button>
            <button
              onClick={handleStream}
              disabled={!uploadedFilename} // uploadedFilename이 없으면 버튼 비활성화
              style={{ marginLeft: "10px" }}
            >
              분석 과정 스트리밍
            </button>

            {/* 새로 추가된 버튼: 최종 영상 보기 */}
            <button
              onClick={handleFinalVideo}
              disabled={!uploadedFilename}
              style={{ marginLeft: "10px" }}
            >
              최종 영상 스트리밍
            </button>
          </div>

          {/* 총 감지된 병 개수 표시 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "15px",
                padding: "10px",
                background: "#333",
                color: "#fff",
                borderRadius: "8px",
                textAlign: "center",
                width: "30%",
                height: "50px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={bottleCounts.toString()} // 병 개수에 애니메이션 적용
              />
            </div>
          </div>

          {/* 스트리밍 영상 표시 (MJPEG) */}
          {videoSrc && (
            <div style={{ marginBottom: "20px" }}>
              <h2>Real-Time Stream</h2>
              <img
                src={videoSrc}
                alt="Stream"
                crossOrigin="anonymous"
                style={{ width: "50%", border: "1px solid #ccc" }}
              />
            </div>
          )}

          {/* (신규) 최종 영상 Range 스트리밍 (mp4) */}
          {finalVideoSrc && (
            <div style={{ marginBottom: "20px" }}>
              <h2>Final Video</h2>
              <video
                src={finalVideoSrc}
                controls
                style={{ width: "50%", border: "1px solid #ccc" }}
              />
            </div>
          )}

          {/* YOLO 결과(JSON) 표시 */}
          {results && (
            <div>
              <h2>JSON Results</h2>
              <pre
                style={{
                  background: "#f9f9f9",
                  padding: "10px",
                  borderRadius: "5px",
                  maxHeight: "350px", // 최대 높이 설정
                  overflowY: "auto", // 세로 스크롤 가능하게 설정
                }}
              >
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          {/* 감지된 이미지 그리드 표시 */}
          {detectionImages.length > 0 && (
            <div>
              <h2>Detected Images</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                }}
              >
                {detectionImages.map((img, index) => (
                  <img
                    key={index}
                    src={`http://10.125.121.225:5000/static/detection_result/${img}`}
                    alt={`Detected ${index}`}
                    style={{ width: "100%", cursor: "pointer", border: "1px solid #ccc" }}
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 확대된 이미지 표시 */}
          {selectedImage && (
            <div
              onClick={handleCloseImage}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* 좌측 화살표 */}
              <button
                onClick={prevImage}
                style={{
                  position: "absolute",
                  left: "20px",
                  fontSize: "2rem",
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={40} />
              </button>

              <img
                src={`http://10.125.121.225:5000/static/detection_result/${selectedImage}`}
                alt="Large View"
                style={{ maxWidth: "90%", maxHeight: "90%" }}
              />

              {/* 우측 화살표 */}
              <button
                onClick={nextImage}
                style={{
                  position: "absolute",
                  right: "20px",
                  fontSize: "2rem",
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={40} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUpload;

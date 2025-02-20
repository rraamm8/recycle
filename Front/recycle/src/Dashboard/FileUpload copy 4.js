import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { io } from "socket.io-client";
import FlipNumbers from "react-flip-numbers";
import { useDropzone } from "react-dropzone";
import Sidebar from './Sidebar';

const socket = io("http://10.125.121.225:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [results, setResults] = useState(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [detectionImages, setDetectionImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [bottleCounts, setBottleCounts] = useState(0);
  const [blueCount, setBlueCount] = useState(0);
  const [brownCount, setBrownCount] = useState(0);
  const [greenCount, setGreenCount] = useState(0);
  const [whiteCount, setWhiteCount] = useState(0);
  const [glassCount, setGlassCount] = useState(0);
  const [detectionList, setDetectionList] = useState([]);

  const uploadedFilenameRef = useRef(uploadedFilename);
  useEffect(() => {
    uploadedFilenameRef.current = uploadedFilename;
  }, [uploadedFilename]);

  const onDrop = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setResults(null);
    setVideoSrc("");
    setDetectionImages([]);
    setBottleCounts(0);
    setBlueCount(0);
    setBrownCount(0);
    setGreenCount(0);
    setWhiteCount(0);
    setGlassCount(0);

  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*,image/*", // 비디오 및 이미지 파일만 허용
    onDrop, // 파일 드롭 이벤트 핸들러
  });

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://10.125.121.225:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedFile = response.data.filename;
      setUploadedFilename(uploadedFile);
      setResults(response.data);
      setVideoSrc("http://10.125.121.225:5000/stream/live");
      await fetchDetectionImages(uploadedFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  // detection 결과 이미지 목록 fetch
  const fetchDetectionImages = async (filename) => {
    try {
      const folderName = filename; // 파일명 그대로 폴더명이 됨
      const url = `http://10.125.121.225:5000/static/detection_result/${folderName}`;
      console.log("Fetching detection images from:", url);
      const res = await axios.get(url);
      setDetectionImages(res.data.images || []);
    } catch (error) {
      console.error("Error fetching detection images:", error);
    }
  };



  // WebSocket 이벤트 핸들러 등록 (실시간 bottle count 업데이트)
  useEffect(() => {
    const updateCountHandler = (data) => {
      setBottleCounts(data.bottle_counts);
      if (data.color_counts) {
        setBlueCount(data.color_counts.blue || 0);
        setBrownCount(data.color_counts.brown || 0);
        setGreenCount(data.color_counts.green || 0);
        setWhiteCount(data.color_counts.white || 0);
        setGlassCount(data.color_counts.glass || 0);
      }
    };
    const connectHandler = () => console.log("Socket connected!");
    const connectErrorHandler = (error) => console.error("Socket connection error:", error);
    const disconnectHandler = (reason) => console.warn("Socket disconnected:", reason);

    const detectionHandler = (data) => {
      // data.detections: 배열 [{time, track_id, class_name, confidence}, ...]
      setDetectionList((prev) => [...prev, ...data.detections]);
    };

    const finalHandler = (data) => {
      // 분석 완료 후 이미지 목록 재조회
      console.log("Analysis finished for:", data.filename);
      fetchDetectionImages(data.filename);
    };

    socket.on("update_count", updateCountHandler);
    socket.on("connect", connectHandler);
    socket.on("connect_error", connectErrorHandler);
    socket.on("disconnect", disconnectHandler);
    socket.on("new_detection", detectionHandler);
    socket.on("final_video_ready", finalHandler);

    return () => {
      socket.off("update_count", updateCountHandler);
      socket.off("connect", connectHandler);
      socket.off("connect_error", connectErrorHandler);
      socket.off("disconnect", disconnectHandler);
      socket.off("new_detection", detectionHandler);
      socket.off("final_video_ready", finalHandler);
    };
  }, []);

  // 이미지 확대 관련 핸들러
  const handleImageClick = (img) => setSelectedImage(img);
  const handleCloseImage = () => setSelectedImage(null);

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

  // 키보드 이벤트 핸들러 (좌우 화살표, Esc)
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

  const boxStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
    padding: "10px",
    color: "#fff",
    borderRadius: "8px",
    textAlign: "center",
    width: "30%",
    height: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    // <div
    //   style={{
    //     width: "100%",
    //     height: "100vh",
    //     backgroundImage: `url('/video/g4.svg')`,
    //     backgroundSize: "cover",
    //     backgroundRepeat: "no-repeat",
    //     backgroundPosition: "center",
    //   }}
    // >
    <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center", // 수평 중앙 정렬
      justifyContent: "center", // 수직 중앙 정렬 (필요한 경우)
      minHeight: "100vh", // 최소 높이를 뷰포트 높이로 설정
      width: "100%",
      backgroundColor: "#f0f0f0", // 배경색 (선택 사항)
    }}
  >
    <div className="flex" style={{ width: "100%" ,overflowY:"auto" }}>
     
      {/* 최대 너비 제한 */}
      <Sidebar />
      <div
        className="flex-grow p-4 bg-gray-100"
        style={{ overflowY: "auto" }}
      >
        {" "}
        {/* Sidebar_Width는 사이드바의 너비 */}
        {/* 카운트 및 버튼 섹션 */}
        <div className="flex-col items-center" style={{width:"25%"}}>
           <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ ...boxStyle, backgroundColor: "black", margin:"10ox" }}>
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={bottleCounts.toString()}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ ...boxStyle, backgroundColor: "#6aa86e", margin: "10px" }}>
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={greenCount.toString()}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ ...boxStyle, backgroundColor: "#3d43b8", margin: "10px" }}>
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={blueCount.toString()}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ ...boxStyle, backgroundColor: "#edc453", margin: "10px" }}>
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={brownCount.toString()}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ ...boxStyle, backgroundColor: "#95c4cf", margin: "10px" }}>
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={whiteCount.toString()}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ ...boxStyle, backgroundColor: "#3d93b8", margin: "10px" }}>
              <FlipNumbers
                height={30}
                width={20}
                color="#ffffff"
                background="none"
                play
                numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
                numbers={glassCount.toString()}
              />
            </div>
          </div>
        </div>
        {/* 비디오 및 업로드 섹션 */}
        <div style={{ width: "100%" }}>
          {videoSrc && (
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <h2>실시간 분석 스트리밍</h2>
              <img
                src={videoSrc}
                alt="Stream"
                crossOrigin="anonymous"
                style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
              />
            </div>
          )}

          <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 className="text-xl font-bold text-center mb-4">
              SEOREU BOTTLE COUNT
            </h1>
            <div
              {...getRootProps()}
              style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              <input {...getInputProps()} />
              <p>
                {file
                  ? `선택된 파일: ${file.name}`
                  : "파일을 여기로 드래그 앤 드랍하거나 클릭하여 선택하세요."}
              </p>
            </div>
            <button
              onClick={handleUpload}
              className="ml-2 px-5 py-2 bg-slate-500 text-white font-semibold text-lg rounded-lg hover:bg-slate-600 transition-all duration-300"
            >
              분석 시작
            </button>
          </div>
          {/* 결과 및 이미지 섹션 */}
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          

          <h2>감지된 유리병 리스트</h2>
          {results && (
            <div style={{ maxHeight: "500px", overflowY: "auto", backgroundColor: "#f5f5f5" }}>

              {/* 실시간 감지 정보를 표 형태로 출력 */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px" }}>시간(초)</th>
                    <th style={{ padding: "8px" }}>아이디</th>
                    <th style={{ padding: "8px" }}>병 종류</th>
                    <th style={{ padding: "8px" }}>컨피던스</th>
                  </tr>
                </thead>
                <tbody>
                  {detectionList.map((item, index) => {
                    let bgColor = "#f5f5f5"; // 기본 배경색

                    // 첫 번째 그룹: 예시 (Bottle, Plastic)
                    if (["green"].includes(item.class_name)) {
                      bgColor = "bg-green-100"; // 초록색 배경
                    }
                    // 두 번째 그룹: 예시 (Glass, Paper)
                    else if (["blue"].includes(item.class_name)) {
                      bgColor = "bg-blue-100"; // 파란색 배경
                    }
                    // 세 번째 그룹: 예시 (Metal, Cardboard)
                    else if (["brown"].includes(item.class_name)) {
                      bgColor = "bg-brown-100"; // 노란색 배경
                    }
                    // 네 번째 그룹: 예시 (PlasticBag, Other)
                    else if (["white"].includes(item.class_name)) {
                      bgColor = "bg-white"; // 회색 배경
                    }

                    return (
                      <tr key={index} className={bgColor}>
                        <td style={{ padding: "8px" }}>{item.time.toFixed(2)}</td>
                        <td style={{ padding: "8px" }}>{item.track_id}</td>
                        <td style={{ padding: "8px" }}>{item.class_name}</td>
                        <td style={{ padding: "8px" }}>{item.confidence.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {detectionImages.length > 0 && (
            <div>
              <h2>분석 화면 캡쳐 이미지</h2>
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
                    src={`http://10.125.121.225:5000/static/detection_result/${uploadedFilename}/images/${img}`}
                    alt={`Detected ${index}`}
                    style={{ width: "100%", cursor: "pointer", border: "1px solid #ccc" }}
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </div>
            </div>
          )}
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
                src={`http://10.125.121.225:5000/static/detection_result/${uploadedFilename}/images/${selectedImage}`}
                alt="Large View"
                style={{ maxWidth: "90%", maxHeight: "90%" }}
              />
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
    </div>
  </div>

  );
}

export default FileUpload;

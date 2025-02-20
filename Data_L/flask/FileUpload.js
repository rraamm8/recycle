import React, { useState, useEffect, useCallback, useRef } from "react";
import './index.css';
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { io } from "socket.io-client";
import FlipNumbers from "react-flip-numbers";
import { useDropzone } from "react-dropzone";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: false,
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
    if (acceptedFiles.length === 0) return;

    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);

    setDetectionList([]);
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
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "video/mp4": [".mp4"] // 비디오 및 이미지 파일만 허용
    },
    onDrop, // 파일 드롭 이벤트 핸들러
  });

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setUploadedFilename("");
    setDetectionList([]); 
    setResults(null);
    setVideoSrc("");
    setDetectionImages([]);
    setBottleCounts(0);
    setBlueCount(0);
    setBrownCount(0);
    setGreenCount(0);
    setWhiteCount(0);
    setGlassCount(0);

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const uploadedFile = response.data.filename;
      
      setUploadedFilename(uploadedFile);
      setResults(response.data);
      setVideoSrc("http://localhost:5000/stream/live");
      
      await fetchDetectionImages(uploadedFile);
      
      setFile(null);
    
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  // detection 결과 이미지 목록 fetch
  const fetchDetectionImages = async (filename) => {
    try {
      const folderName = filename; // 파일명 그대로 폴더명이 됨
      const url = `http://localhost:5000/static/detection_result/${folderName}`;
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
      setDetectionList((prev) => {
        // 이전 상태를 복사해서 수정할 임시 배열
        const updatedList = [...prev];
    
        // 새로 들어온 detection들에 대해 하나씩 검사
        for (const newDet of data.detections) {
          // 기존에 동일 track_id가 있는지 찾음
          const existingIndex = updatedList.findIndex(
            (item) => item.track_id === newDet.track_id
          );
    
          // 만약 기존에 없으면(새로운 track_id) 추가
          if (existingIndex === -1) {
            updatedList.push(newDet);
          } else {
            // 기존에 있었으면 confidence 비교
            if (newDet.confidence > updatedList[existingIndex].confidence) {
              // 더 높은 confidence일 때만 갱신
              updatedList[existingIndex] = newDet;
            }
          }
        }
    
        return updatedList;
      });
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

  const getBgClassForName = (className) => {
    if (className.includes("brown")) {
      return "bg-[#d2b48c]"; 
    } else if (className.includes("green")) {
      return "bg-green-100";
    } else if (className.includes("blue")) {
      return "bg-blue-100";
    } else if (className.includes("white")) {
      return "bg-white";
    } else if (className.includes("glass")) {
      return "bg-gray-100";
    } else {
      return "bg-gray-200"; // default
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 className="flex flex-col mb-7
                     text-4xl font-bold text-center">SEOREU BOTTLE COUNT</h1>
      <div style={{ marginBottom: "20px" }}>
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #ccc",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          <input {...getInputProps()} />
          <p>
            {file
            ? `선택된 파일: ${file.name}`
            : "드래그 앤 드롭 또는 클릭하여 선택"}
          </p>
        </div>
        <button
          onClick={handleUpload}
          className="h-[50px] w-[145px] px-5 py-2 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition-all duration-300"
        >
          분석 시작
        </button>

      </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ ...boxStyle, backgroundColor: "black", width: "100%" }}>
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
          <div style={{ ...boxStyle, backgroundColor: "green" }}>
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
          <div style={{ ...boxStyle, backgroundColor: "brown" }}>
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
          <div style={{ ...boxStyle, backgroundColor: "white", border: "0.1px solid #ADD8E6" }}>
            <FlipNumbers
              height={30}
              width={20}
              color="#000000"
              background="none"
              play
              numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
              numbers={whiteCount.toString()}
            />
          </div>
          <div style={{ ...boxStyle, backgroundColor: "blue" }}>
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
          <div style={{ ...boxStyle, backgroundColor: "#ADD8E6" }}>
            <FlipNumbers
              height={30}
              width={20}
              color="#000000"
              background="none"
              play
              numberStyle={{ fontSize: "24px", fontWeight: "bold" }}
              numbers={glassCount.toString()}
            />
          </div>
      </div>
      {videoSrc && (
        <div style={{ marginBottom: "20px" }}>
          <h2 className="text-2xl font-bold text-center m-5">실시간 분석 스트리밍</h2>
          <img
            src={videoSrc}
            alt="Stream"
            crossOrigin="anonymous"
            style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
          />
        </div>
      )}
      <h2 className="text-2xl font-bold text-center mt-7 mb-5">감지된 유리병 리스트</h2>
      {results && (
        <div className="max-h-[500px] overflow-y-auto bg-gray-100">
          {/* 실시간 감지 정보를 표 형태로 출력 */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>번호</th>
                <th style={{ padding: "8px" }}>시간(초)</th>
                <th style={{ padding: "8px" }}>아이디</th>
                <th style={{ padding: "8px" }}>병 종류</th>
                <th style={{ padding: "8px" }}>컨피던스</th>
              </tr>
            </thead>
            <tbody>
            {detectionList.map((item, index) => {
                const textBgClass = getBgClassForName(item.class_name);

                return (
                  <tr key={index} /* 배경색 없음 */>
                    <td style={{ padding: "8px" }}>{index + 1}</td>
                    <td style={{ padding: "8px" }}>{item.time.toFixed(2)}</td>
                    <td style={{ padding: "8px" }}>{item.track_id}</td>
                    <td style={{ padding: "8px" }}>
                      <span
                        className={`py-2 px-4 rounded-md ${textBgClass} text-gray-700 inline-block`}
                      >
                        {item.class_name}
                      </span>
                    </td>
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
          <h2 className="text-2xl font-bold text-center mt-8 mb-5">분석 화면 캡쳐 이미지</h2>
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
                src={`http://localhost:5000/static/detection_result/${uploadedFilename}/images/${img}`}
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
            src={`http://localhost:5000/static/detection_result/${uploadedFilename}/images/${selectedImage}`}
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
  );
}

export default FileUpload;

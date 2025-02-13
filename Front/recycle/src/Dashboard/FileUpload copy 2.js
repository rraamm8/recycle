import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [file, setFile] = useState(null);    // 업로드할 파일
  const [results, setResults] = useState(null);  // YOLO 결과(JSON)
  const [videoSrc, setVideoSrc] = useState("");   // 스트리밍 URL

  // 파일 선택
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setResults(null);
    setVideoSrc("");
  };

  // 업로드 버튼 -> /upload (POST)
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

      // 업로드 후 YOLO 분석 결과(JSON) 받음
      setResults(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  // 스트리밍 버튼 -> /stream (GET)
  const handleStream = () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    // /upload로 이미 업로드했으므로, 이제 GET /stream 경로를 <img>에 설정
    setVideoSrc("http://10.125.121.225:5000/stream");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>File Upload and Streaming</h1>

      {/* 업로드 및 스트리밍 제어 */}
      <div style={{ marginBottom: "20px" }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          Upload
        </button>
        <button
          onClick={handleStream}
          disabled={!file}
          style={{ marginLeft: "10px" }}
        >
          Start Streaming
        </button>
      </div>

      {/* 스트리밍 영상 표시 (MJPEG) */}
      {videoSrc && (
        <div style={{ marginBottom: "20px" }}>
          <h2>Real-Time Stream</h2>
          <img
            src={videoSrc}
            alt="Stream"
            crossOrigin="anonymous"  // CORS 관련 속성 추가
            style={{ width: "100%", border: "1px solid #ccc" }}
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
            }}
          >
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FileUpload;

import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";


function FileUpload() {
  const [file, setFile] = useState(null); // 업로드할 파일
  const [results, setResults] = useState(null); // YOLO 결과(JSON)
  const [videoSrc, setVideoSrc] = useState(""); // 스트리밍 URL

  // 파일 선택 (드래그 앤 드롭 처리)
  const onDrop = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0]; // 첫 번째 파일을 가져옴
    setFile(uploadedFile); // 업로드된 파일 상태에 저장
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
    console.log(...formData);

    try {
      const response = await axios.post(
        "http://10.125.121.225:5000/upload",
        formData
      );
      console.log("Server response:", response.data); // 서버 응답 확인

      // 업로드 후 YOLO 분석 결과(JSON) 받음
      setResults(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
      console.log(error.response ? error.response.data : error); // 서버 응답 내용 출력
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

  // 드래그 앤 드롭 영역 설정
  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*,image/*", // 비디오 및 이미지 파일만 허용
    onDrop, // 드래그 앤 드롭 이벤트 처리
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>File Upload and Streaming</h1>

      {/* 드래그 앤 드롭 및 업로드 제어 */}
      <div style={{ marginBottom: "20px" }}>
        {/* 드래그 앤 드롭 영역 */}
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
          <p>Drag & Drop images or videos here, or click to select</p>
        </div>

        {/* 업로드 및 스트리밍 버튼 */}
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

      {/* 스트리밍 영상 표시 */}
      {videoSrc && (
        <div style={{ marginBottom: "20px" }}>
          <h2>Real-Time Stream</h2>
          <img
            src={videoSrc}
            alt="Stream"
            crossOrigin="anonymous"
            style={{ width: "100%", border: "1px solid #ccc" }}
          />
        </div>
      )}

      {/* YOLO 분석 결과(JSON) 표시 */}
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

      {/* 업로드된 비디오 목록 */}
      {file && (
        <div>
          <h2>Uploaded Videos</h2>
          <div>
            <video
              src={URL.createObjectURL(file)}
              controls
              style={{
                width: "100%",
                height: "auto",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;

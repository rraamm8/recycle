import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Sidebar from "./Sidebar"; // 사이드바 컴포넌트 import

const MediaUploader = () => {
  const [mediaFiles, setMediaFiles] = useState({ images: [], videos: [] });
  const [file, setFile] = useState(null); // 업로드할 파일
  const [results, setResults] = useState(null); // YOLO 결과(JSON)
  const [videoSrc, setVideoSrc] = useState(""); // 스트리밍 URL

  // 파일 업로드
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

  // 스트리밍 버튼
  const handleStream = () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    // /upload로 이미 업로드했으므로, 이제 GET /stream 경로를 <img>에 설정
    setVideoSrc("http://10.125.121.225:5000/stream");
  };

  const onDrop = (acceptedFiles) => {
    const images = [];
    const videos = [];

    acceptedFiles.forEach((file) => {
      const fileURL = URL.createObjectURL(file);
      if (file.type.startsWith("image/")) {
        images.push({ url: fileURL, name: file.name });
      } else if (file.type.startsWith("video/")) {
        videos.push({ url: fileURL, name: file.name });
      }
    });

    setMediaFiles({
      images: [...mediaFiles.images, ...images],
      videos: [...mediaFiles.videos, ...videos],
    });

    // 파일이 드래그 앤 드롭 되면 첫 번째 비디오를 업로드할 파일로 설정
    if (videos.length > 0) {
      setFile(videos[0]); // 첫 번째 비디오를 업로드 대상으로 설정
    }
  };

  const handleRemoveMedia = (type, index) => {
    const updatedMedia = { ...mediaFiles };
    const targetArray = updatedMedia[type];
    const removedFile = targetArray[index];

    URL.revokeObjectURL(removedFile.url);
    updatedMedia[type] = targetArray.filter((_, i) => i !== index);
    setMediaFiles(updatedMedia);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"],
      "video/*": [".mp4", ".mkv", ".avi", ".mov", ".webm"],
    },
    onDrop,
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto p-6 bg-gray-100">
        <div className="flex-1 flex flex-col items-center justify-start p-4">
          <h1 className="text-2xl font-semibold mb-4">File Upload and Streaming</h1>

          {/* 업로드 버튼 */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleUpload}
              style={{
                marginLeft: "10px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "5px",
                width: "40%",
              }}
            >
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
                crossOrigin="anonymous" // CORS 관련 속성 추가
                style={{ width: "100%", border: "1px solid #ccc" }}
              />
            </div>
          )}

          {/* YOLO 분석 결과 */}
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

          {/* 드래그 앤 드롭 미디어 업로드 */}
          <div
            {...getRootProps()}
            className="w-full max-w-lg border-2 border-dashed border-gray-400 bg-white rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 focus:outline-none"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              Drag & Drop images or videos here, or{" "}
              <span className="text-blue-500">click to select</span>
            </p>
          </div>

          <div className="w-full max-w-lg mt-6">
            {/* 이미지 목록 */}
            {mediaFiles.images.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Uploaded Images</h2>
                <div className="grid grid-cols-1 gap-4">
                  {mediaFiles.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-contain bg-gray-200 rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => handleRemoveMedia("images", index)}
                        className="absolute top-1 right-1 bg-white text-black text-sm px-2 py-1 rounded-lg hover:bg-slate-200 transition"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 비디오 목록 */}
            {mediaFiles.videos.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Uploaded Videos</h2>
                {mediaFiles.videos.map((video, index) => (
                  <div
                    key={index}
                    className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md mb-4"
                  >
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full object-contain bg-gray-200 rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => handleRemoveMedia("videos", index)}
                      className="absolute top-1 right-1 bg-white text-black text-sm px-2 py-1 rounded-lg hover:bg-slate-200 transition"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;

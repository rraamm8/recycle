import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Sidebar from "./Sidebar"; // 사이드바 컴포넌트 import

const MediaUploader = () => {
  const [mediaFiles, setMediaFiles] = useState({ images: [], videos: [] });

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
      <div className="flex-1 h-screen overflow-y-auto p-6 bg-gray-100">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start p-4">
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

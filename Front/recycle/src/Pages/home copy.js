import React, { useState } from "react";
import "../App.css";
import Login from "./Login"; // 로그인 모달 컴포넌트 import

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 배경 동영상 */}
      <video
        src="/video/24540-343454476_small.mp4"
        autoPlay
        muted
        loop
        className="absolute inset-0 h-full w-full object-cover"
      ></video>

      {/* 콘텐츠 레이어 (영상 위에 표시) */}
      <div className="overlay">
        {/* 로고 */}
        <button onClick={openModal}>
          <h1 className="text-4xl font-bold mb-6 tracking-wider">SEOREU</h1>
        </button>
      </div>

      {/* 로그인 모달 */}
      {isModalOpen && <Login onClose={closeModal} />}
    </div>
  );
}

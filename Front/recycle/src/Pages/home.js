import React, { useState } from "react";
import "../App.css";
import Login from "./Login";
import SignUp from "./SignUp"; // 회원가입 모달 컴포넌트 import

export default function Home() {
  const [modalType, setModalType] = useState(null); // "login" or "signup"

  const openLoginModal = () => setModalType("login");
  const openSignUpModal = () => setModalType("signup");
  const closeModal = () => setModalType(null);

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

      {/* 콘텐츠 레이어 */}
      <div className="overlay">
        {/* 로고 */}
        <button onClick={openLoginModal}>
          <h1 className="text-4xl font-bold mb-6 tracking-wider">SEOREU</h1>
        </button>
      </div>

      {/* 로그인 모달 */}
      {modalType === "login" && <Login onClose={closeModal} onSignUp={openSignUpModal} />}
      {/* 회원가입 모달 */}
      {modalType === "signup" && <SignUp onClose={closeModal} onSwitchToLogin={openLoginModal}/>}
    </div>
  );
}

import React from 'react'
import '../App.css'

export default function home() {
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
        <h1 className="text-4xl font-bold mb-6 tracking-wider">SEOREU</h1>
      </div>
    </div>

  )
}

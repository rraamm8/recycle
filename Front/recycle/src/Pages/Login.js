import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onClose, onSignUp }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    userId: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 로그인 로직 추가
    console.log("로그인 시도:", user);
    const loginData = {
      userId: user.userId,
      password: user.password,
    };
    try {
      const res = await fetch('http://10.125.121.221:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (res.status === 200) {
        const token = res.headers.get('Authorization');
        if (token) {
          console.log('token:', token);
          sessionStorage.setItem('username', user.userId);
          sessionStorage.setItem('jwtToken', token);
          navigate('/fileupload');
        } else {
          alert('로그인 실패: 토큰 없음');
        }
      } else {
        alert('로그인 실패');
      }
    } catch (error) {
      console.error('error', error);
    }


  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white/70 w-full max-w-xs p-6 sm:p-8 h-auto sm:h-80 rounded-xl shadow-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
        <h1 className="text-4xl sm:text-6xl font-bold text-center text-white absolute -top-12 sm:-top-20 left-1/2 transform -translate-x-1/2">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="userId" className="block text-sm font-bold text-[#4d634b]">아이디</label>
            <input
              type="text"
              id="userId"
              name="userId"
              placeholder="아이디 입력"
              value={user.userId}
              onChange={handleChange}
              className="w-full mt-1 mb-1 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#4d634b]">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="비밀번호 입력"
              value={user.password}
              onChange={handleChange}
              className="w-full mt-1 p-2 mb-6 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
            />
          </div>
          <button type="submit" className="w-full p-2 bg-[#4d634b] text-white font-semibold rounded-md hover:bg-[#3f513d] transition">
            로그인
          </button>
          <button onClick={onSignUp} type="button" className="w-full mt-4 text-sm text-[#4d634b] cursor-pointer hover:underline">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

import React from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useState } from "react";





export default function Login() {
  // const [userId, setUserId] = useState('');
  // const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [user, setUser] = useState({
    userId: '',
    password: '',
});

  const handleChange = (e) => {
    const {name, value } = e.target;
    setUser({ ...user, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로그인 처리 로직 추가 (API 호출)
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
        body: JSON.stringify(loginData), //loginData 객체를 보냄
      });

      if (res.status === 200) {
        const token = res.headers.get('Authorization');
        if (token) {
          console.log("token:", token);
          sessionStorage.setItem("username", user.userId);
          sessionStorage.setItem("jwtToken", token);
          
          navigate('/dashboard');
          
        } else {
          alert("로그인 실패: 토큰 없음");
        }
      } else {
        alert("로그인 실패");
      }
    } catch (error) {
      console.error('error', error);
    }
    console.log('로그인 시도:', user.userId, user.password);
  }



  return (
    <div className="flex items-center justify-center min-h-screen bg-[#a2b9a8] px-4 sm:px-8">
    <div className="bg-white w-full max-w-xs p-6 sm:p-8 h-auto sm:h-80 rounded-xl shadow-md relative">
      <h1 className="text-4xl sm:text-6xl font-bold text-center text-[#4d634b] absolute -top-12 sm:-top-20 left-1/2 transform -translate-x-1/2 bg-[#a2b9a8] px-2 sm:px-4">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-bold text-[#4d634b]">
            아이디
          </label>
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
          <label htmlFor="password" className="block text-sm font-bold text-[#4d634b]">
            비밀번호
          </label>
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
        <button
          type="submit"
          className="w-full p-2 bg-[#4d634b] text-white font-semibold rounded-md hover:bg-[#3f513d] transition"
        >
          로그인
        </button>
        <Link to={'/signup'}>
          <button
            type="button"
            className="w-full mt-4 text-sm text-[#4d634b] cursor-pointer hover:underline"
          >
            회원가입
          </button>
        </Link>
      </form>
    </div>
  </div>
  )
}

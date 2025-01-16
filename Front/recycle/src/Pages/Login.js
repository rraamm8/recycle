import React from 'react'
import { Link } from 'react-router-dom'
// import { useState } from "react";



// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = (e) => {
//     e.preventDefault();
//     console.log("로그인 시도", { username, password });
//   };
// };


export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#a2b9a8]">
    <div className="bg-white w-96 p-8 h-80 rounded-xl shadow-md relative">
        {/* Login 텍스트 */}
        <h1 className="text-6xl font-bold text-center text-[#4d634b] absolute -top-20 left-1/2 transform -translate-x-1/2 bg-[#a2b9a8] px-4">
          Login
        </h1>
      
      {/* <form onSubmit={handleLogin} className="space-y-4"> */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-[#4d634b] ">
            아이디
          </label>
          <input
            type="text"
            id="username"
            placeholder="아이디 입력"
            // value={username}
            // onChange={(e) => setUsername(e.target.value)}
            className="w-full mt-1 my-6 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#4d634b]">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호 입력"
            // value={password}
            // onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2  my-6 bg-[#4d634b] text-white font-semibold rounded-md hover:bg-[#3f513d] transition"
        >
          로그인
        </button>
        <Link to ={'/signup'}>
        <button type="submit" className="w-full text-sm text-[#4d634b] mt-2 cursor-pointer hover:underline">
          회원가입
        </button>
        </Link>
      {/* </form> */}
    </div>
  </div>
  )
}

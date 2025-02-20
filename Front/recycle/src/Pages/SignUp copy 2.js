import React, { useState } from "react";

export default function SignUp({ onClose }) {
  const [inputValue, setInputValue] = useState({
    userId: "",
    password: "",
    pwCheck: "",
    name: "",
    agree: false,
  });

  const [error, setError] = useState(""); // 오류 메시지 상태
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 상태

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInputValue((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.agree) {
      setError("회원가입을 위해 정보 제공에 동의해야 합니다.");
      return;
    }

    if (inputValue.password !== inputValue.pwCheck) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const requestBody = {
      userId: inputValue.userId,
      password: inputValue.password,
      name: inputValue.name,
    };

    try {
      const response = await fetch("http://10.125.121.221:8080/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("회원가입이 완료되었습니다!");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || "회원가입 실패");
      }
    } catch (err) {
      setError("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white/70 w-full max-w-xs p-6 sm:p-8 h-auto rounded-xl shadow-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
        <h1 className="text-4xl sm:text-6xl font-bold text-center text-white absolute -top-12 sm:-top-20 left-1/2 transform -translate-x-1/2">
          SignUp
        </h1>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="userId" className="block text-sm font-bold text-[#4d634b]">아이디</label>
            <input
              type="text"
              id="userId"
              placeholder="아이디 입력"
              value={inputValue.userId}
              onChange={handleInputChange}
              className="w-full mt-1 mb-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#4d634b]">비밀번호</label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호 입력(6자 이상)"
              value={inputValue.password}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
          </div>
          <div>
            <label htmlFor="pwCheck" className="block text-sm font-bold text-[#4d634b]">비밀번호 확인</label>
            <input
              type="password"
              id="pwCheck"
              placeholder="비밀번호 재입력"
              value={inputValue.pwCheck}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
          </div>
          <div className='my-2'>
            <label htmlFor="name" className="block text-sm font-bold text-[#4d634b]">이름</label>
            <input
              type="text"
              id="name"
              value={inputValue.name}
              onChange={handleInputChange}
              placeholder="이름을 입력해주세요"
              className="w-full mt-1 p-2 border my-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
          </div>

          <div className="my-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={inputValue.agree}
                onChange={(e) => setInputValue((prev) => ({ ...prev, agree: e.target.checked }))}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm font-bold text-[#4d634b]">정보 제공에 동의합니다.</span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

          <button
            type="submit"
            className={`w-full py-2 text-white font-semibold rounded-md transition ${inputValue.agree ? "bg-[#4d634b] hover:bg-[#3f513d]" : "bg-gray-400"}`}
            disabled={!inputValue.agree}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp({ onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    userId: "", // 아이디
    validId: false, // 아이디 정규식 충족 여부
    nonIdDuplication: null, // 아이디 중복 확인 여부 (true: 사용 가능, false: 중복됨, null: 아직 확인 안함)
    password: "", // 비밀번호
    validPw: false, // 비밀번호 정규식 충족 여부
    pwCheck: "", // 비밀번호 확인
    correctPwCheck: false, // 비밀번호 확인 일치 여부
    username: "", // 이름
    agree: false, // 정보 제공 동의 여부
  });

  // 정규식 모음 객체
  const inputRegexs = {
    // 아이디: 영문 및 숫자로 구성, 6~20자
    idRegex: /^[a-zA-Z0-9]{6,20}$/,
    // 비밀번호: 최소 6자 이상의 영문 및 숫자 (필요 시 추가 규칙 적용 가능)
    pwRegex: /^[a-zA-Z0-9]{6,}$/,
  };

  // 경고 메시지
  const alertMessage = {
    validId: "아이디는 6~20자의 영문 및 숫자만 가능합니다.",
    nonIdDuplication: "이미 사용 중인 아이디입니다.",
    validPw: "사용할 수 없는 비밀번호입니다.",
    correctPwCheck: "비밀번호가 일치하지 않습니다.",
    username: "이름이 입력되지 않았습니다.",
    agree: "회원가입을 위해 정보 제공에 동의해야 합니다.",
  };

  // 안내 메시지
  const passMessage = {
    validId: "사용할 수 있는 아이디입니다.",
    validpw: "사용할 수 있는 비밀번호입니다.",
    correctPwCheck: "비밀번호가 일치합니다.",
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setInputValue((prev) => {
      let updatedValues = { ...prev, [id]: value };
       // 아이디 변경 시 중복 확인 결과 초기화
      if (id === "userId") {
        updatedValues.validId = inputRegexs.idRegex.test(value);

        updatedValues.nonIdDuplication = null; // 아이디 변경 시 중복 확인 초기화
      } else if (id === "password") {
        updatedValues.validPw = inputRegexs.pwRegex.test(value);
        updatedValues.correctPwCheck = updatedValues.pwCheck === value;
      } else if (id === "pwCheck") {
        updatedValues.correctPwCheck = updatedValues.password === value;
      }
      return updatedValues;
    });
  };

  // 아이디 중복 확인 API 호출 (JSON의 exists 값을 사용)
  const checkUserIdAvailability = async () => {
    if (!inputValue.validId) {
      alert(alertMessage.validId);
      return;
    }

    try {
      const response = await fetch(
        `http://10.125.121.221:8080/users/check-id/${inputValue.userId}`
      );
      // 백엔드 로직에 따르면,
      // - 이미 존재하면 HTTP 200과 { exists: true }가 반환 → 중복 (nonIdDuplication: false)
      // - 존재하지 않으면 HTTP 404와 { exists: false }가 반환 → 사용 가능 (nonIdDuplication: true)
      
      // data.exists가 true이면 아이디가 이미 존재하는 경우
      if (response.ok) {
        const data = await response.json();
        console.log("check-id API response:", data);
        if (data.exists === true) {
          setInputValue((prev) => ({ ...prev, nonIdDuplication: false }));
        } else {
          // 예외 케이스 처리
          setInputValue((prev) => ({ ...prev, nonIdDuplication: false }));
        }
      } else if (response.status === 404) {
        const data = await response.json();
        console.log("check-id API response (404):", data);
        if (data.exists === false) {
          setInputValue((prev) => ({ ...prev, nonIdDuplication: true }));
        } else {
          setInputValue((prev) => ({ ...prev, nonIdDuplication: true }));
        }
      } else {
        alert("아이디 중복 확인에 실패했습니다.");
        setInputValue((prev) => ({ ...prev, nonIdDuplication: null }));
      }
    } catch (err) {
      console.error(err);
      alert("서버와 연결할 수 없습니다.");
      setInputValue((prev) => ({ ...prev, nonIdDuplication: null }));
    }
  };

  

  // 회원가입 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputValue.nonIdDuplication === null) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }
    if (!inputValue.nonIdDuplication) {
      alert(alertMessage.nonIdDuplication);
      return;
    }
    if (!inputValue.agree) {
      alert(alertMessage.agree);
      return;
    }
    if (!inputValue.correctPwCheck) {
      alert(alertMessage.correctPwCheck);
      return;
    }
    if (!inputValue.validPw) {
      alert(alertMessage.validPw);
      return;
    }
    if (!inputValue.username.trim()) {
      alert(alertMessage.username);
      return;
    }

    const requestBody = {
      userId: inputValue.userId,
      password: inputValue.password,
      name: inputValue.username,
    };

    try {
      const response = await fetch("http://10.125.121.221:8080/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        // onClose();
        // navigate("");
        onSwitchToLogin();
      } else {
        const data = await response.json();
        alert(data.error || "회원가입 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white/70 w-full max-w-xs p-6 sm:p-8 h-auto rounded-xl shadow-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          ✕
        </button>
        <h1 className="text-4xl sm:text-6xl font-bold text-center text-white absolute -top-12 sm:-top-20 left-1/2 transform -translate-x-1/2">
          SignUp
        </h1>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* 아이디 입력 및 중복 확인 */}
          <div>
            <label htmlFor="userId" className="block text-sm font-bold text-[#4d634b]">
              아이디
            </label>
            <div className="flex">
              <input
                type="text"
                id="userId"
                placeholder="아이디 입력"
                value={inputValue.userId}
                onChange={handleInputChange}
                className="w-full mt-1 mb-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
                required
              />
              <button
                type="button"
                className="w-1/3 ml-2 mt-1 my-3 bg-[#4d634b] text-white font-bold text-sm rounded-md hover:bg-[#3f513d] transition"
                onClick={checkUserIdAvailability}
              >
                중복 확인
              </button>
            </div>
            {inputValue.nonIdDuplication === true && (
              <p className="text-green-500 text-sm">{passMessage.validId}</p>
            )}
            {inputValue.nonIdDuplication === false && (
              <p className="text-red-500 text-sm">{alertMessage.nonIdDuplication}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#4d634b]">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호 입력(6자 이상)"
              value={inputValue.password}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
            {inputValue.password && !inputValue.validPw && (
              <p className="text-red-500 text-sm">{alertMessage.validPw}</p>
            )}
            {inputValue.password && inputValue.validPw && (
              <p className="text-green-500 text-sm">{passMessage.validpw}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="pwCheck" className="block text-sm font-bold text-[#4d634b]">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="pwCheck"
              placeholder="비밀번호 재입력"
              value={inputValue.pwCheck}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
            {inputValue.pwCheck && !inputValue.correctPwCheck && (
              <p className="text-red-500 text-sm">{alertMessage.correctPwCheck}</p>
            )}
            {inputValue.pwCheck && inputValue.correctPwCheck && (
              <p className="text-green-500 text-sm">{passMessage.correctPwCheck}</p>
            )}
          </div>

          {/* 이름 입력 */}
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-[#4d634b]">
              이름
            </label>
            <input
              type="text"
              id="username"
              placeholder="이름을 입력해주세요"
              value={inputValue.username}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border my-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
              required
            />
            {inputValue.username.trim() === "" && (
              <p className="text-red-500 text-sm">{alertMessage.username}</p>
            )}
          </div>

          {/* 정보 제공 동의 */}
          <div className="my-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={inputValue.agree}
                onChange={(e) =>
                  setInputValue((prev) => ({ ...prev, agree: e.target.checked }))
                }
                className="form-checkbox"
              />
              <span className="ml-2 text-sm font-bold text-[#4d634b]">정보 제공에 동의합니다.</span>
            </label>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="w-full py-2 text-white font-semibold rounded-md transition bg-[#4d634b] hover:bg-[#3f513d]"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

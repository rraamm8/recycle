import React, { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'


export default function SignUp() {

  const [inputValue, setInputValue] = useState({
    userid: "", // 입력된 아이디 데이터
    validId: false, // 아이디 정규식 충족 여부
    nonIdDuplication: false, // 아이디 중복확인 여부
    pw: "", // 입력된 패스워드 데이터
    validPw: false, // 패스워드 정규식 충족 여부
    pwCheck: "", // 입력된 패스워드 확인 데이터
    correctPwCheck: false, // 패드워드 데이터와 일치하는지 여부
    username: "", // 입력된 사용자 이름 데이터
    // district: "", //거주지 선택 정보
    agree: false, // 정보 제공 동의 여부
  });

  const submitRequirements = // 아래 조건을 모두 충족할 시 제출 버튼 활성화.
    inputValue.userid && // 아이디가 입력되었는가?
    inputValue.validId && // 아이디가 정규식에 부합하는가? 6-20
    // inputValue.nonIdDuplication && // 아이디가 중복되지 않았는가?
    inputValue.pw && // 비밀번호가 입력되었는가? 
    inputValue.validPw && // 비밀번호가 정규식에 부합하는가? 6자리 이상
    inputValue.pwCheck && // 비밀번호가 입력되었는가?
    inputValue.correctPwCheck && // 비밀번호 확인이 비밀번호와 일치하는가?
    inputValue.username && // 이름이 입력되었는가?
    inputValue.agree; // 정보제공에 동의 하였는가

  // 정규식 모음 객체
  const inputRegexs = {
    // 아이디 : 문자로 시작하여, 영문자, 숫자, 하이픈(-), 언더바(_)를 사용하여 3~20자 이내
    idRegex: /^[a-zA-Z0-9]{6,20}$/,
    // 비밀번호 : 최소 8자 이상, 최소한 하나의 대문자, 하나의 소문자, 하나의 숫자, 하나의 특수문자를 포함, 공백 허용하지 않음
    pwRegex: /^[a-zA-Z0-9]{6,}$/,
  };

  // 조건에 부합하지 않는 경우 빨간글씨 경고 문구
  const alertMessage = {
    userid: "아이디가 입력되지 않았습니다.",
    validId: "사용할 수 없는 아이디입니다.",
    nonIdDuplication: "이미 사용중인 아이디입니다.",
    pw: "비밀번호가 입력되지 않았습니다.",
    validPw: "사용할 수 없는 비밀번호입니다.",
    correctPwCheck: "비밀번호가 일치하지 않습니다.",
    username: "이름이 입력되지 않았습니다",
    agree: "회원가입을 위해 정보 제공에 동의가 필요합니다. 동의하지 않을 경우 회원가입이 제한됩니다.",
  };

  // 조건에 부합할 경우 초록글씨 경고 문구
  const passMessage = {
    validid: "사용할 수 있는 아이디입니다.",
    validpw: "사용할 수 있는 비밀번호입니다.",
    correctPwCheck: "비밀번호가 일치합니다.",
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target; // 입력 필드의 id와 값 가져오기

    setInputValue((prev) => {
      let updatedValue = { ...prev, [id]: value }; // 기존 상태 복사 후 해당 필드 업데이트

      // 유효성 검사: 입력 필드에 따라 검사 로직 다르게 적용
      if (id === "userid") {
        updatedValue.validId = inputRegexs.idRegex.test(value); // 아이디 유효성 검사
        updatedValue.nonIdDuplication = false; // 중복 확인 초기화
      } else if (id === "pw") {
        updatedValue.validPw = inputRegexs.pwRegex.test(value); // 비밀번호 유효성 검사
        updatedValue.correctPwCheck = value === prev.pwCheck; // 비밀번호 확인 일치 여부
      } else if (id === "pwCheck") {
        updatedValue.correctPwCheck = value === prev.pw; // 비밀번호 확인 일치 여부
      }

      return updatedValue; // 업데이트된 상태 반환
    });
  };

  const navigate = useNavigate();

  //userid 값이 있는지
  const handleCheckUserId = async () => {
    if (!inputValue.userid) {
      alert(alertMessage.userid);
    } else if (!inputValue.validId) {
      alert(alertMessage.validId);
      return;
    }
  }





  const handleSubmit = () => {
    const isConfirmed = window.confirm("가입이 완료되었습니다.");
    if (!submitRequirements) {
      alert("모든 조건을 충족해야 회원가입이 가능합니다.");

    } else if (isConfirmed) {
      navigate("/login")
      return;
    }
  }

  // const SignUpOk = () => {
  //   const isConfirmed = window.confirm("가입이 완료되었습니다.");
  //   if (isConfirmed) {

  //     navigate("/login");
  //   }
  // };



  return (
    <div className="flex items-center justify-center min-h-screen bg-[#a2b9a8]">
      <div className="bg-white w-96 p-8 h-150 rounded-xl shadow-md relative">
        {/* Login 텍스트 */}
        <h1 className="text-6xl font-bold text-center text-[#4d634b] absolute -top-20 left-1/2 transform -translate-x-1/2 bg-[#a2b9a8] px-4">
          SignUp
        </h1>

        {/* <form onSubmit={handleSignUp} className="space-y-4"> */}
        <div>
          <label htmlFor="userid" className="block text-sm font-bold text-[#4d634b] ">
            아이디
          </label>
          <div className='flex'>
            <input
              type="text"
              id="userid"
              placeholder="아이디 입력(6~20자)"
              value={inputValue.userid}
              onChange={handleInputChange}
              className="w-3/4 mt-1 my-4 p-2   border rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
            />
            <button type="button" className="confirm-btn w-1/4 mt-1 my-4  ml-2  bg-[#4d634b]
              text-white font-bold text-sm rounded-md hover:bg-[#3f513d] transition" onClick={handleCheckUserId} >

              중복 확인
            </button>
          </div>
          {inputValue.userid && !inputValue.validId ? (
            <p className="text-red-500 text-sm ">{alertMessage.validId}</p>
          ) : inputValue.userid && inputValue.validId ? (
            <p className="text-green-500 text-sm">{passMessage.validid}</p>
          ) : null}
        </div>

        <div className='my-2'>
          <label htmlFor="password" className="block text-sm font-bold text-[#4d634b]">
            비밀번호
          </label>
          <input
            type="password"
            id="pw"
            placeholder="비밀번호 입력(6자 이상)"
            value={inputValue.pw}
            onChange={handleInputChange}
            className="w-full mt-1  my-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
          />
          {inputValue.pw && !inputValue.validPw ? (
            <p className="text-red-500 text-sm">{alertMessage.validPw}</p>
          ) : inputValue.pw && inputValue.validPw ? (
            <p className="text-green-500 text-sm">{passMessage.validpw}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="pwCheck" className="block text-sm font-bold text-[#4d634b]">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="pwCheck"
            value={inputValue.pwCheck}
            onChange={handleInputChange}
            placeholder="비밀번호 재입력"
            className="w-full mt-1 p-2 my-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
          />
          {inputValue.pwCheck && !inputValue.correctPwCheck ? (
            <p className="text-red-500 text-sm">{alertMessage.correctPwCheck}</p>
          ) : inputValue.pwCheck && inputValue.correctPwCheck ? (
            <p className="text-green-500 text-sm">{passMessage.correctPwCheck}</p>
          ) : null}
        </div>
        <div className='my-2'>
          <label htmlFor="username" className="block text-sm font-bold text-[#4d634b]">
            이름
          </label>
          <input
            type="text"
            id="username"
            value={inputValue.username}
            onChange={handleInputChange}
            placeholder="이름을 입력해주세요"
            className="w-full mt-1 p-2 border my-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b9a8] bg-[#f5f5f5]"
          />
          {!inputValue.username && (
            <p className="text-red-500 text-sm">{alertMessage.username}</p>
          )}
        </div>




        <div className="my-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={inputValue.agree}
              onChange={(e) =>
                setInputValue((prev) => ({ ...prev, agree: e.target.checked }))}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm font-bold text-[#4d634b]">
              정보 제공에 동의합니다.
            </span>
          </label>
        </div>
        <button
          type="submit"
          className={`w-full py-2  text-white font-semibold rounded-md transition ${submitRequirements ? "bg-[#4d634b] hover:bg-[#3f513d]" : "bg-gray-400"}`}
          // className={`${submitRequirements ? styles.allFilled : styles.submitBtn} w-full py-2 my-6 text-white font-semibold rounded-md transition hover:bg-[#3f513d]`}
          // onClick={SignUpOk}
          onClick={handleSubmit}
          disabled={!submitRequirements}
        >
          회원가입
        </button>
        {/* </form> */}
      </div>
    </div>
  )
}



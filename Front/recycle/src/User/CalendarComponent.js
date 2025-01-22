import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 react-calendar 스타일 가져오기
import "./CustomCalendar.css"; // 커스텀 스타일 가져오기

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date()); // 선택한 날짜
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 현재 월

  // 현재 월 외의 날짜 숨기기
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      return date.getMonth() !== currentMonth;
    }
    return false;
  };

  // 날짜를 원 안에 배치하고 배경 색상 설정
  const getTileContent = ({ date, view }) => {
    if (view === "month" && date.getMonth() === currentMonth) {
      return (
        <div className="circle">
          <span>{date.getDate()}</span>
        </div>
      );
    }
    return null;
  };

  // 월 변경 시 현재 월 업데이트
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate.getMonth());
  };

  return (
    <div className="calendar-container">
      <h3 className="calendar-title">History</h3>
      <Calendar
        onChange={setDate}
        value={date}
        tileDisabled={tileDisabled} // 현재 월 외의 날짜 비활성화
        tileContent={getTileContent} // 원 안에 날짜 표시
        onActiveStartDateChange={handleActiveStartDateChange} // 월 변경 시 호출
      />
    </div>
  );
};

export default CalendarComponent;

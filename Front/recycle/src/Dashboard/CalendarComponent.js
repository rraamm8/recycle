import React, { useState, useEffect } from "react";
import { format } from "date-fns"; // 날짜 포맷 변환 라이브러리

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 월 상태
  const [dataDates, setDataDates] = useState([]); // API에서 가져온 날짜와 totalCount 데이터 저장
  const [selectedDate, setSelectedDate] = useState(null); // 클릭된 날짜 상태

  // 요일과 월 이름 배열
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
  ];

  // 특정 월의 일 수 계산
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  // 이전 달로 이동
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 이전 연도로 이동
  const handlePrevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };

  // 다음 연도로 이동
  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };

  // 날짜 클릭 이벤트
  const handleDateClick = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1; // 0부터 시작하므로 +1
    const selectedDate = new Date(year, month - 1, day); // 선택한 날짜 객체 생성
    const formattedDate = format(selectedDate, "yyyy-MM-dd"); // yyyy-MM-dd 형식으로 변환

    // 데이터 배열에서 선택한 날짜에 해당하는 데이터 찾기
    const selectedData = dataDates.find((item) => {
      if (!item || !item.date) return false; // 유효하지 않은 데이터 무시
      const itemDateFormatted = format(new Date(item.date), "yyyy-MM-dd"); // API 데이터 날짜 포맷
      return itemDateFormatted === formattedDate; // 선택된 날짜와 비교
    });

    // 결과 출력
    console.log(
      selectedData
        ? `{ date: "${formattedDate}", totalCount: ${selectedData.totalCount} }`
        : "해당 데이터 없음"
    );

    setSelectedDate(selectedDate); // 선택한 날짜를 상태로 설정
  };

  // API 데이터 가져오기
  const fetchData = async () => {
    try {
      const response = await fetch("http://10.125.121.221:8080/api/detections/result"); // API 요청
      const data = await response.json(); // JSON 데이터 파싱

      // 날짜별 totalCount 합산
      const groupedData = data.reduce((acc, item) => {
        const dateKey = format(new Date(item.timePeriod), "yyyy-MM-dd"); // yyyy-MM-dd 포맷
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey] += item.totalCount; // 같은 날짜의 totalCount를 합산
        return acc;
      }, {});

      // 합산 데이터를 배열로 변환
      const fetchedDates = Object.keys(groupedData).map((date) => ({
        date: new Date(date),
        totalCount: groupedData[date],
      }));

      setDataDates(fetchedDates); // 상태에 저장
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // 컴포넌트 마운트 시 데이터 가져오기
  }, []);

  // 날짜 렌더링
  const renderDays = () => {
    const year = currentMonth.getFullYear(); // 현재 연도
    const month = currentMonth.getMonth(); // 현재 월
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 월의 첫날 요일
    const totalDays = daysInMonth(year, month); // 월의 총 일 수
    const days = [];

    // 월의 첫날 이전 공백 추가
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: "30px", height: "30px" }}></div>);
    }

    // 월의 날짜 렌더링
    for (let day = 1; day <= totalDays; day++) {
      const dataItem = dataDates.find((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === year &&
          itemDate.getMonth() === month &&
          itemDate.getDate() === day
        );
      });

      const totalCount = dataItem ? dataItem.totalCount : 0;

      // 배경색 결정 (totalCount 합산 반영)
      let backgroundColor = "transparent";
      if (totalCount > 0) {
        if (totalCount <= 50) {  
          backgroundColor = "#c8e6c9"; // 옅은 녹색
        } else if (totalCount <= 500) {
          backgroundColor = "#81c784"; // 중간 녹색
        } else if (totalCount <= 1000) {
          backgroundColor = "#388e3c"; // 진한 녹색
        }
      }

      const date = new Date(year, month, day);
      const isSunday = date.getDay() === 0; // 일요일 확인
      const isSaturday = date.getDay() === 6; // 토요일 확인

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)} // 클릭 이벤트
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "30px",
            height: "30px",
            border: "none",
            borderRadius: "50%", // 원형
            backgroundColor: backgroundColor, // totalCount에 따라 색상 변경
            color: totalCount > 0 ? "#fff" : isSunday ? "red" : isSaturday ? "blue" : "#000",
            cursor: "pointer",
            margin: "5px",
            fontSize: "14px",
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-lg max-w-md mx-auto bg-gray-100">
      {/* <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize:"24px" }}>History</h2> 제목 */}

      <div
        style={{
          width: "370px",
          margin: "0 auto",
          padding: "16px",
          border: "2px solid gray", // 테두리
          borderRadius: "8px", // 둥근 모서리
          boxSizing: "border-box",
          boxShadow: "0px 0px 3px gray"
        }}
      >
        {/* 연도 및 월 변경 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", color: "#374151" }}>
          <button onClick={handlePrevYear} style={arrowButtonStyle}>«</button>
          <button onClick={handlePrevMonth} style={arrowButtonStyle}>‹</button>
          <span style={{ fontSize: "16px", fontWeight: "bold", color: "gray" }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={handleNextMonth} style={arrowButtonStyle}>›</button>
          <button onClick={handleNextYear} style={arrowButtonStyle}>»</button>
        </div>

        {/* 요일 표시 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: "bold", marginBottom: "8px" }}>
          {daysOfWeek.map((day, index) => (
            <div key={index} style={{ padding: "8px 0" }}>{day}</div>
          ))}
        </div>

        {/* 날짜 렌더링 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

// 공통 화살표 버튼 스타일
const arrowButtonStyle = {
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "4px",
  padding: "5px 10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default Calendar;
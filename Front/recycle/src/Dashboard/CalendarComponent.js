import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns"; // 날짜 포맷 변환 라이브러리

const Calendar = () => {
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 월 상태
  const [dataDates, setDataDates] = useState([]); // API에서 가져온 날짜와 totalCount 데이터 저장

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

  // 날짜 클릭 이벤트
  const handleDateClick = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    navigate(`/dashboard/${formattedDate}`); // 클릭한 날짜를 URL로 전달
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
          backgroundColor = "#9ec2e6"; // 옅은 파란색
        } else if (totalCount <= 500) {
          backgroundColor = "#4083c7"; // 중간 파란색
        } else if (totalCount <= 1000) {
          backgroundColor = "#0a4078"; // 진한 파란색
        }else {
          // totalCount가 1000보다 큰 경우
          backgroundColor = "#032242";
        }
      }

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
            color: totalCount > 0 ? "#fff" : "#000",
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
    <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
      <div className="w-full max-w-md p-4 border border-gray-300 rounded-md shadow-md bg-white">
        {/* 연도 및 월 변경 버튼 */}
        <div className="flex justify-between items-center mb-4 text-gray-700">
          <button onClick={handlePrevMonth} className="px-2 py-1 text-gray-500">
            ‹
          </button>
          <span className="font-bold text-lg">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="px-2 py-1 text-gray-500">
            ›
          </button>
        </div>

        {/* 요일 표시 */}
        <div className="grid grid-cols-7 text-center text-gray-500 font-bold text-sm mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>

        {/* 날짜 렌더링 */}
        <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
      </div>
    </div>
  );
};

export default Calendar;

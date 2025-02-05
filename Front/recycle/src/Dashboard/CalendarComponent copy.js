import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

const CustomCalendar = () => {
  const [data, setData] = useState([]); // API에서 가져온 데이터
  const [value, setValue] = useState(new Date()); // 현재 선택된 날짜
  const [marks, setMarks] = useState([]); // 하이라이트할 날짜 목록

  // 데이터 Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://10.125.121.221:8080/api/detections/result");
        const result = await response.json();

        // 날짜 데이터 변환
        const transformedData = result.map((row) => ({
          date: row.timePeriod.split(" ")[0], // YYYY-MM-DD 형식
          count: row.totalCount,
        }));

        setData(transformedData);
        setMarks(transformedData.map((item) => item.date)); // marks 배열 생성
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      }
    };

    fetchData();
  }, []);

  const onChange = (date) => {
    setValue(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    const selectedData = data.find((item) => item.date === formattedDate);
    console.log("선택된 날짜 데이터:", selectedData || "해당 데이터 없음");
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-lg  max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">History</h2>
      <Calendar
        onChange={onChange}
        value={value}
        minDetail="month"
        maxDetail="month"
        showNeighboringMonth={false}
        locale="en-US"
        tileClassName={({ date, view }) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          if (marks.includes(formattedDate)) {
            return "highlight"; // 하이라이트 클래스 적용
          }
        }}
        formatDay={(locale, date) => `${date.getDate()}`} // 날짜만 표시
        className="mx-auto w-full text-sm border-b"
      />
      <style jsx>{`
        .highlight {
          color: #ffffff;
          background-color: #9fd6ad;
          border-radius: 50px;
        }
          .react-calendar__month-view__weekdays {
          
          font-size: 0.875rem; /* Tailwind text-sm */
          text-transform: uppercase; /* 대문자로 표시 */
          color: #374151; /* Tailwind text-gray-700 */
          font-weight: 600; /* Tailwind font-semibold */
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 4px;
          border: none;
          
        }
          
      `}</style>
    </div>
  );
};

export default CustomCalendar;

import React, { useEffect, useState } from "react";
import axios from "axios";

const TodayBottleCount = () => {
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const response = await axios.get("http://10.125.121.221:8080/api/detections/result");
        const data = response.data;

        console.log("API Data:", data); // 디버깅: API 데이터 출력

        // 오늘 날짜 계산
        const todayDate = new Date().toISOString().split("T")[0];
        console.log("Today's Date:", todayDate); // 디버깅: 오늘 날짜 출력

        // 오늘 날짜 + 재활용 가능한 데이터 필터링
        const todayTotal = data
          .filter(
            (row) =>
              row.timePeriod.startsWith(todayDate) && Number(row.recyclable) === 1
          )
          .reduce((sum, row) => sum + row.totalCount, 0);

        console.log("Today's Total Count:", todayTotal); // 디버깅: 최종 합산 출력

        setTodayCount(todayTotal);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTodayData();
  }, []);

  return (
    <div className="flex items-center justify-center h-20 bg-white rounded-lg shadow-md my-1">
      <div className="text-center">
        {/* <p className="text-5xl font-bold text-black">{todayCount}</p>
        <p className="text-lg text-gray-600">Today's Recyclable Bottles</p> */}

        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-black">
          {todayCount}
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
        Today's Recyclable Bottles
        </p>
      </div>
    </div>
  );
};

export default TodayBottleCount;

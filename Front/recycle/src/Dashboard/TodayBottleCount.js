import React, { useEffect, useState } from "react";
import axios from "axios";

const TodayBottleCount = () => {
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const response = await axios.get("http://10.125.121.221:8080/api/detections/result");
        const data = response.data;

        // 오늘 날짜 계산 (YYYY-MM-DD 형식)
        const todayDate = new Date().toISOString().split("T")[0];

        // 오늘 날짜의 totalCount 합산
        const todayTotal = data
          .filter((row) => row.timePeriod.startsWith(todayDate)) // 오늘 날짜 필터링
          .reduce((sum, row) => sum + row.totalCount, 0); // totalCount 합산

        setTodayCount(todayTotal);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTodayData();
  }, []);

  return (
    <div className="flex items-center justify-center h-15 bg-white rounded-lg shadow-md my-1">
      <div className="text-center">
        {/* <p className="text-5xl font-bold text-black">{todayCount}</p> */}
        {/* <p className="text-lg text-gray-600">Today's Bottle Collection</p> */}
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-black">
          {todayCount}
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
          Today's Bottle Collection
        </p>
      </div>
    </div>
  );
};

export default TodayBottleCount;

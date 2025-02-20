import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const DAY_MAPPING = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const RecentWeekBarChart = () => {
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    // API 호출
    axios
      .get("http://10.125.121.221:8080/api/detections/result")
      .then((response) => {
        const data = response.data;

        // 요일별 데이터 집계
        const daySums = {};
        data.forEach((row) => {
          const day = DAY_MAPPING[row.dayOfWeek] || row.dayOfWeek;
          if (!daySums[day]) {
            daySums[day] = 0;
          }
          daySums[day] += parseFloat(row.totalCarbonReduction) || 0;
        });

        // 그래프용 데이터 생성
        const chartData = Object.entries(DAY_MAPPING).map(([full, short]) => ({
          day: short,
          total: parseFloat((daySums[short] || 0).toFixed(2)), // 소수점 두 자리 제한
        }));

        setWeeklyData(chartData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-2 bg-white rounded-lg shadow"
          style={{ border: "1px solid #ccc" }}
        >
          <p className="font-bold" style={{ color: "#000" }}>{label}</p>
          <p style={{ color: "#000" }}>
            <span className="font-semibold">total:</span> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    // <div className="p-6 max-w-full mx-auto ">
    //   <h2 className="text-xl font-bold text-start mb-2">
    //     최근 일주일간 총 탄소배출 감소량
    //   </h2>
    //   <div className="bg-slate-800 p-4 rounded-lg">
    <div className="ml-6 mr-6 p-6 max-w-auto mx-auto bg-slate-800 rounded-lg">
      <h2 className="text-lg font-bold text-white mb-3 ml-8">요일별 총 탄소절감량</h2>
        <ResponsiveContainer width="100%" height={242}>
          <BarChart data={weeklyData}>
            <Tooltip content={<CustomTooltip />} />
            <XAxis
              dataKey="day"
              tick={{ fill: "#fff", fontSize: 16 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar
              dataKey="total"
              fill="#8ef5f5"
              // #adf58e
              radius={[20, 20, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    
  );
};

export default RecentWeekBarChart;

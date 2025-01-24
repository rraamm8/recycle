import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const COLORS = ["#8884d8", "#82ca9d"]; // 색상 설정

const RecyclePieChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // API 호출
    axios
      .get("http://10.125.121.221:8080/api/detections/result")
      .then((response) => {
        console.log("API Response:", response.data); // 디버깅: API 응답
        const transformedData = transformData(response.data);
        setChartData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const transformData = (rawData) => {
    const groupedData = {
      recyclable: 0,
      nonRecyclable: 0,
    };

    rawData.forEach((row) => {
      const isRecyclable = row.recyclable === true ? 1 : 0;
      const totalCount = parseInt(row.totalCount, 10) || 0;

      if (isRecyclable === 1) {
        groupedData.recyclable += totalCount;
      } else {
        groupedData.nonRecyclable += totalCount;
      }
    });

    console.log("Grouped Data:", groupedData); // 디버깅: 그룹화된 데이터

    return [
      { name: "재활용 가능", value: groupedData.recyclable },
      { name: "재활용 불가능", value: groupedData.nonRecyclable },
    ];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">총 병 재활용 데이터</h2>
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              fill="#8884d8"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecyclePieChart;

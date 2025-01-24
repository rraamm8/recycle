import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]; // 병 종류별 색상

// 병 종류 매핑
const BOTTLE_MAPPING = {
  brown: [
    "06_brown_bottle",
    "06_brown_bottle+multi",
    "06_brown_bottle+dirty",
    "06_brown_bottle+dirty+multi",
  ],
  green: [
    "07_green_bottle",
    "07_green_bottle+multi",
    "07_green_bottle+dirty",
    "07_green_bottle+dirty+multi",
  ],
  white: [
    "08_white_bottle",
    "08_white_bottle+multi",
    "08_white_bottle+dirty",
    "08_white_bottle+dirty+multi",
  ],
  glass: [
    "09_glass",
    "09_glass+multi",
    "09_glass+dirty",
    "09_glass+dirty+multi",
  ],
};

const PieChartComponent = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("recyclable"); // 기본값: "재활용 가능"

  useEffect(() => {
    axios
      .get("http://10.125.121.221:8080/api/detections/result")
      .then((response) => {
        const rawData = response.data;
        console.log("API Response:", rawData); // API 데이터 확인
  
        const transformedData = transformData(rawData);
        setData(transformedData);
  
        // 기본 차트 데이터 설정
        setChartData(transformedData.recyclable);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const transformData = (rawData) => {
    const groupedData = {
      recyclable: { brown: 0, green: 0, white: 0, glass: 0 },
      nonRecyclable: { brown: 0, green: 0, white: 0, glass: 0 },
    };
  
    rawData.forEach((row) => {
      // `recyclable`과 `totalCount` 값을 안전하게 변환
      const isRecyclable = row.recyclable === true; // `recyclable`이 true인지 확인
      const totalCount = parseInt(row.totalCount, 10) || 0; // 숫자로 변환, 기본값 0
  
      // 병 종류 매핑 확인 및 값 추가
      for (const [category, bottleTypes] of Object.entries(BOTTLE_MAPPING)) {
        if (bottleTypes.includes(row.bottleType)) {
          if (isRecyclable) {
            groupedData.recyclable[category] += totalCount;
          } else {
            groupedData.nonRecyclable[category] += totalCount;
          }
        }
      }
    });
  
    // 분류된 데이터 확인
    console.log("Grouped Data:", groupedData);
  
    // 데이터 포맷 변경
    const formatData = (group) =>
      Object.entries(group).map(([key, value]) => ({
        name: key,
        value,
      }));
  
    return {
      recyclable: formatData(groupedData.recyclable),
      nonRecyclable: formatData(groupedData.nonRecyclable),
    };
  };
  
  
  useEffect(() => {
    console.log("Chart Data:", chartData);
  }, [chartData]);

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);
  
    // `data`가 있는 경우에만 `chartData` 업데이트
    if (data[selectedFilter]) {
      setChartData(data[selectedFilter]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">병 종류별 재활용 데이터</h2>

      {/* 셀렉트 박스 */}
      <div className="text-center mb-4">
        <select
          className="border border-gray-300 rounded px-3 py-2"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="recyclable">재활용 가능</option>
          <option value="nonRecyclable">재활용 불가능</option>
        </select>
      </div>

      {/* 파이 차트 */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
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

export default PieChartComponent;

import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 병 종류 매핑
const BOTTLE_TYPE_MAPPING = {
  "06_brown_bottle": "갈색병",
  "06_brown_bottle+dirty": "갈색병(오염)",
  "06_brown_bottle+dirty+multi": "갈색병(오염+복합)",
  "06_brown_bottle+multi": "갈색병(복합)",
  "07_green_bottle": "초록병",
  "07_green_bottle+dirty": "초록병(오염)",
  "07_green_bottle+dirty+multi": "초록병(오염+복합)",
  "07_green_bottle+multi": "초록병(복합)",
  "08_white_bottle": "흰색병",
  "08_white_bottle+dirty": "흰색병(오염)",
  "08_white_bottle+dirty+multi": "흰색병(오염+복합)",
  "08_white_bottle+multi": "흰색병(복합)",
  "09_glass": "유리병",
  "09_glass+dirty": "유리병(오염)",
  "09_glass+dirty+multi": "유리병(오염+복합)",
  "09_glass+multi": "유리병(복합)",
};

const DAY_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TableWithChart = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    dayOfWeek: "",
    bottleType: "",
    videoName: "",
    recyclable: "",
  });

  // 차트 데이터 필터링 상태
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  // 데이터 로드
  useEffect(() => {
    fetch("http://10.125.121.221:8080/api/detections/result")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => {
        const transformedData = data.map((row) => ({
          ...row,
          timePeriod: row.timePeriod.split("T")[0], // 날짜만 추출
          bottleType: BOTTLE_TYPE_MAPPING[row.bottleType] || row.bottleType, // 병 종류 한글화
        }));
        setData(transformedData);
      })
      .catch((err) => {
        console.error("Error fetching data:", err.message);
      });
  }, []);

  // 차트 데이터 필터링
  const chartData = useMemo(() => {
    if (!data.length) return [];
    let filtered = [...data];

    if (selectedYear) {
      filtered = filtered.filter((row) => row.timePeriod.startsWith(selectedYear));
    }
    if (selectedMonth) {
      filtered = filtered.filter((row) => {
        const [year, month] = row.timePeriod.split("-");
        return month === selectedMonth.padStart(2, "0");
      });
    }
    if (selectedDay) {
      filtered = filtered.filter((row) => {
        const [, , day] = row.timePeriod.split("-");
        return day === selectedDay.padStart(2, "0");
      });
    }

    const grouped = filtered.reduce((acc, row) => {
      const key = selectedDay ? row.timePeriod.split("T")[1].slice(0, 2) : row.timePeriod;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += row.totalCount;
      return acc;
    }, {});

    return Object.entries(grouped).map(([key, total]) => ({
      label: selectedDay ? `${key}시` : key,
      total,
    }));
  }, [data, selectedYear, selectedMonth, selectedDay]);

  // 테이블 데이터 필터링
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return (
        (!filters.dayOfWeek || row.dayOfWeek === filters.dayOfWeek) &&
        (!filters.bottleType || row.bottleType === filters.bottleType) &&
        (!filters.videoName || row.videoName === filters.videoName) &&
        (!filters.recyclable || String(row.recyclable) === filters.recyclable)
      );
    });
  }, [data, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto p-6 bg-gray-100">
        <div className="p-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">차트 및 테이블</h2>

          {/* 차트 필터 */}
          <div className="flex gap-4 mb-6">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">연도 선택</option>
              {Array.from(new Set(data.map((row) => row.timePeriod.split("-")[0]))).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded"
              disabled={!selectedYear}
            >
              <option value="">월 선택</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((month) => (
                <option key={month} value={month}>
                  {parseInt(month)}월
                </option>
              ))}
            </select>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="p-2 border border-gray-300 rounded"
              disabled={!selectedMonth}
            >
              <option value="">일 선택</option>
              {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((day) => (
                <option key={day} value={day}>
                  {parseInt(day)}일
                </option>
              ))}
            </select>
          </div>

          {/* 차트 */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          {/* 필터 옵션 */}
          <div className="grid grid-cols-4 gap-4 my-6">
            {/* 요일 필터 */}
            <select
              value={filters.dayOfWeek}
              onChange={(e) => handleFilterChange("dayOfWeek", e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">요일 선택</option>
              {DAY_OF_WEEK.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            {/* 병 종류 필터 */}
            <select
              value={filters.bottleType}
              onChange={(e) => handleFilterChange("bottleType", e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">병 종류 선택</option>
              {Object.entries(BOTTLE_TYPE_MAPPING).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>

            {/* 비디오 이름 필터 */}
            <select
              value={filters.videoName}
              onChange={(e) => handleFilterChange("videoName", e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">비디오 선택</option>
              {Array.from(new Set(data.map((row) => row.videoName))).map((video) => (
                <option key={video} value={video}>
                  {video}
                </option>
              ))}
            </select>

            {/* 재활용 여부 필터 */}
            <select
              value={filters.recyclable}
              onChange={(e) => handleFilterChange("recyclable", e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">재활용 여부</option>
              <option value="1">가능</option>
              <option value="0">불가능</option>
            </select>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">요일</th>
                  <th className="border border-gray-300 p-2">비디오 이름</th>
                  <th className="border border-gray-300 p-2">병 종류</th>
                  <th className="border border-gray-300 p-2">재활용 여부</th>
                  <th className="border border-gray-300 p-2">총 개수</th>
                  <th className="border border-gray-300 p-2">탄소 배출 감소량</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="border border-gray-300 p-2">{row.dayOfWeek}</td>
                    <td className="border border-gray-300 p-2">{row.videoName}</td>
                    <td className="border border-gray-300 p-2">{row.bottleType}</td>
                    <td className="border border-gray-300 p-2">
                      {row.recyclable ? "가능" : "불가능"}
                    </td>
                    <td className="border border-gray-300 p-2">{row.totalCount}</td>
                    <td className="border border-gray-300 p-2">
                      {parseFloat(row.totalCarbonReduction).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableWithChart;

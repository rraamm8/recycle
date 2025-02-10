import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "./Sidebar";

function LearningTimeChart() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  // Select 박스 상태
  const [selectedFilter, setSelectedFilter] = useState("연도별"); // 연도별, 월별, 일별
  const [selectedYear, setSelectedYear] = useState("전체");
  const [selectedMonth, setSelectedMonth] = useState("전체");
  const [selectedDay, setSelectedDay] = useState("전체");

  // API 데이터 로드
  useEffect(() => {
    fetch("http://10.125.121.221:8080/api/detections/result")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setFilteredData(result);
      })
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  // 연도 리스트 생성
  const years = useMemo(() => {
    const uniqueYears = [...new Set(data.map((item) => new Date(item.timePeriod).getFullYear()))];
    return uniqueYears.sort((a, b) => a - b);
  }, [data]);

  // 월 리스트
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 일 리스트
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 필터링 로직
  useEffect(() => {
    let filtered = [...data];
    if (selectedYear !== "전체") {
      filtered = filtered.filter((item) => new Date(item.timePeriod).getFullYear() === parseInt(selectedYear));
    }
    if (selectedMonth !== "전체" && selectedFilter !== "연도별") {
      filtered = filtered.filter((item) => new Date(item.timePeriod).getMonth() + 1 === parseInt(selectedMonth));
    }
    if (selectedDay !== "전체" && selectedFilter === "일별") {
      filtered = filtered.filter((item) => new Date(item.timePeriod).getDate() === parseInt(selectedDay));
    }
    setFilteredData(filtered);

    // 차트 데이터 그룹화
    if (selectedFilter === "연도별") {
      const grouped = groupByYear(filtered);
      setChartData(grouped);
    } else if (selectedFilter === "월별") {
      const grouped = groupByMonth(filtered);
      setChartData(grouped);
    } else if (selectedFilter === "일별") {
      const grouped = groupByHour(filtered);
      setChartData(grouped);
    }
  }, [data, selectedYear, selectedMonth, selectedDay, selectedFilter]);

  // 그룹화 함수
  const groupByYear = (data) => {
    const yearMap = {};
    data.forEach((item) => {
      const year = new Date(item.timePeriod).getFullYear();
      yearMap[year] = (yearMap[year] || 0) + item.totalCount;
    });
    return Object.keys(yearMap).map((key) => ({ label: key, total: yearMap[key] }));
  };

  const groupByMonth = (data) => {
    const monthMap = {};
    data.forEach((item) => {
      const month = new Date(item.timePeriod).getMonth() + 1;
      monthMap[month] = (monthMap[month] || 0) + item.totalCount;
    });
    return months.map((month) => ({ label: `${month}월`, total: monthMap[month] || 0 }));
  };

  const groupByHour = (data) => {
    const hourMap = {};
    data.forEach((item) => {
      const hour = new Date(item.timePeriod).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + item.totalCount;
    });
    return Array.from({ length: 24 }, (_, i) => ({ label: `${i}시`, total: hourMap[i] || 0 }));
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-center">기간별 병 수거량</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* 필터 선택 */}
          <select
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              setSelectedMonth("전체");
              setSelectedDay("전체");
            }}
            className="border p-2 rounded"
          >
            <option value="연도별">연도별</option>
            <option value="월별">월별</option>
            <option value="일별">일별</option>
          </select>

          {/* 연도 선택 */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="전체">전체</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* 월 선택 */}
          {selectedFilter !== "연도별" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="전체">전체</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          )}

          {/* 일 선택 */}
          {selectedFilter === "일별" && selectedMonth !== "전체" && (
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="전체">전체</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}일
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 차트 */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LearningTimeChart;

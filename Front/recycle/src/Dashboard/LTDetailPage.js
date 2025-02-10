import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush, // 🔹 추가
} from "recharts";
import Sidebar from "./Sidebar";

function LearningTimeChart() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("연도별");
  const [selectedYear, setSelectedYear] = useState("전체");
  const [selectedMonth, setSelectedMonth] = useState("전체");
  const [selectedDay, setSelectedDay] = useState("전체");

  // 데이터 로드
  useEffect(() => {
    fetch("http://10.125.121.221:8080/api/detections/result")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setChartData(groupByYear(result)); // 기본값: 연도별
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

  // 데이터 그룹화 함수
  const groupByYear = (data) => {
    const yearMap = {};
    data.forEach((item) => {
      const year = new Date(item.timePeriod).getFullYear();
      yearMap[year] = (yearMap[year] || 0) + item.totalCount;
    });
    return Object.keys(yearMap).map((key) => ({ label: key, total: yearMap[key] }));
  };

  const groupByMonth = (data, year) => {
    const filtered = data.filter((item) => new Date(item.timePeriod).getFullYear() === parseInt(year));
    const monthMap = {};
    filtered.forEach((item) => {
      const month = new Date(item.timePeriod).getMonth() + 1;
      monthMap[month] = (monthMap[month] || 0) + item.totalCount;
    });
    return months.map((month) => ({ label: `${month}월`, total: monthMap[month] || 0 }));
  };

  const groupByDay = (data, year, month) => {
    const filtered = data.filter(
      (item) =>
        new Date(item.timePeriod).getFullYear() === parseInt(year) &&
        new Date(item.timePeriod).getMonth() + 1 === parseInt(month)
    );
    const dayMap = {};
    filtered.forEach((item) => {
      const day = new Date(item.timePeriod).getDate();
      dayMap[day] = (dayMap[day] || 0) + item.totalCount;
    });
    return Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}일`, total: dayMap[i + 1] || 0 }));
  };

  const groupByHour = (data, year, month, day) => {
    const filtered = data.filter(
      (item) =>
        new Date(item.timePeriod).getFullYear() === parseInt(year) &&
        new Date(item.timePeriod).getMonth() + 1 === parseInt(month) &&
        new Date(item.timePeriod).getDate() === parseInt(day)
    );
    const hourMap = {};
    filtered.forEach((item) => {
      const hour = new Date(item.timePeriod).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + item.totalCount;
    });
    return Array.from({ length: 24 }, (_, i) => ({ label: `${i}시`, total: hourMap[i] || 0 }));
  };

  useEffect(() => {
    if (selectedFilter === "연도별") {
      setChartData(groupByYear(data));
    } else if (selectedFilter === "월별" && selectedYear !== "전체") {
      setChartData(groupByMonth(data, selectedYear));
    } else if (selectedFilter === "일별" && selectedYear !== "전체" && selectedMonth !== "전체") {
      if (selectedDay === "전체") {
        setChartData(groupByDay(data, selectedYear, selectedMonth));
      } else {
        setChartData(groupByHour(data, selectedYear, selectedMonth, selectedDay));
      }
    }
  }, [data, selectedFilter, selectedYear, selectedMonth, selectedDay]);

  // ✅ 드래그 줌 기능: 선택된 영역의 데이터 개수를 확인하여 자동 변경
  const handleZoom = (range) => {
    const dataLength = range.endIndex - range.startIndex;

    if (dataLength <= 5 && selectedFilter === "연도별") {
      setSelectedFilter("월별");
    } else if (dataLength <= 10 && selectedFilter === "월별") {
      setSelectedFilter("일별");
    } else if (dataLength > 10 && selectedFilter === "일별") {
      setSelectedFilter("시간별");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 text-center">
          기간별 병 수거량
        </h2>

        <div className="max-w-7xl mx-auto mb-6 bg-white p-4 rounded">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
              
              {/* ✅ 줌 기능 추가 */}
              <Brush dataKey="label" height={20} stroke="#8884d8" onChange={handleZoom} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default LearningTimeChart;

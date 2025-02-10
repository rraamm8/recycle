import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

  // 테이블 데이터 필터링
  const filteredTableData = useMemo(() => {
    return data.filter((row) => {
      const year = selectedYear !== "전체" ? new Date(row.timePeriod).getFullYear() === parseInt(selectedYear) : true;
      const month =
        selectedMonth !== "전체"
          ? new Date(row.timePeriod).getMonth() + 1 === parseInt(selectedMonth)
          : true;
      const day =
        selectedDay !== "전체"
          ? new Date(row.timePeriod).getDate() === parseInt(selectedDay)
          : true;
      return year && month && day;
    });
  }, [data, selectedYear, selectedMonth, selectedDay]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundImage: `url('/video/g4.svg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="flex">
        <Sidebar />
        <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-3xl font-bold mb-4 text-center ">
            기간별 병 수거량
          </h2>
          <div className="max-w-7xl mx-auto sm:flex-row gap-2 sm:gap-4 mb-4 ">
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setSelectedYear("전체");
                setSelectedMonth("전체");
                setSelectedDay("전체");
              }}
              className="border border-slate-400 p-2 rounded bg-slate-200"
            >
              <option value="연도별">연도별</option>
              <option value="월별">월별</option>
              <option value="일별">일별</option>
            </select>
            {selectedFilter !== "연도별" && (
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth("전체");
                  setSelectedDay("전체");
                }}
                className="ml-4 border p-2 rounded "
              >
                <option value="전체">전체</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
            {selectedFilter === "일별" && selectedYear !== "전체" && (
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedDay("전체");
                }}
                className="ml-4 border p-2 rounded "
              >
                <option value="전체">전체</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}월
                  </option>
                ))}
              </select>
            )}
            {selectedFilter === "일별" && selectedMonth !== "전체" && (
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="ml-4 border p-2 rounded "
              >
                <option value="전체">전체</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}일
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="max-w-7xl mx-auto mb-6  bg-white p-4 rounded">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="max-w-7xl mx-auto  bg-white p-4 rounded">
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">요일</th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">비디오 이름</th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">병 종류</th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">재활용 여부</th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">총 개수</th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">탄소 배출 감소량</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableData.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{row.dayOfWeek}</td>
                      <td className="border border-gray-300 p-2">{row.videoName}</td>
                      <td className="border border-gray-300 p-2">{row.bottleType}</td>
                      <td className="border border-gray-300 p-2">{row.recyclable ? "가능" : "불가능"}</td>
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
    </div>
  );
}

export default LearningTimeChart;

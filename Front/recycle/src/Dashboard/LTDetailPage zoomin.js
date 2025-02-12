import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [selectedYear, setSelectedYear] = useState("전체");
  const [selectedMonth, setSelectedMonth] = useState("전체");
  const [selectedDay, setSelectedDay] = useState("전체");
  const [title, setTitle] = useState("병 수거량 데이터");
  const zoomLevels = ["연도별", "월별", "일별", "시간별"];
  const [zoomIndex, setZoomIndex] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    fetch("http://10.125.121.221:8080/api/detections/result")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setChartData(groupByYear(result));
      })
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  const years = useMemo(() => {
    return [...new Set(data.map((item) => new Date(item.timePeriod).getFullYear()))]
      .sort((a, b) => a - b)
      .map(String);
  }, [data]);

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  const groupByYear = (data) => {
    const yearMap = {};
    data.forEach((item) => {
      const year = new Date(item.timePeriod).getFullYear().toString();
      yearMap[year] = (yearMap[year] || 0) + item.totalCount;
    });
    return Object.keys(yearMap).map((key) => ({ label: key, total: yearMap[key] }));
  };

  const groupByMonth = (data, year) => {
    const filtered = data.filter((item) => new Date(item.timePeriod).getFullYear().toString() === year);
    const monthMap = {};
    filtered.forEach((item) => {
      const month = (new Date(item.timePeriod).getMonth() + 1).toString();
      monthMap[month] = (monthMap[month] || 0) + item.totalCount;
    });
    return months.map((month) => ({ label: month, total: monthMap[month] || 0 }));
  };

  const groupByDay = (data, year, month) => {
    const filtered = data.filter(
      (item) =>
        new Date(item.timePeriod).getFullYear().toString() === year &&
        (new Date(item.timePeriod).getMonth() + 1).toString() === month
    );
    const dayMap = {};
    filtered.forEach((item) => {
      const day = new Date(item.timePeriod).getDate().toString();
      dayMap[day] = (dayMap[day] || 0) + item.totalCount;
    });
    return Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), total: dayMap[(i + 1).toString()] || 0 }));
  };

  const groupByHour = (data, year, month, day) => {
    const filtered = data.filter(
      (item) =>
        new Date(item.timePeriod).getFullYear().toString() === year &&
        (new Date(item.timePeriod).getMonth() + 1).toString() === month &&
        new Date(item.timePeriod).getDate().toString() === day
    );
    const hourMap = {};
    filtered.forEach((item) => {
      const hour = new Date(item.timePeriod).getHours().toString();
      hourMap[hour] = (hourMap[hour] || 0) + item.totalCount;
    });
    return Array.from({ length: 24 }, (_, i) => ({ label: `${i}시`, total: hourMap[i.toString()] || 0 }));
  };

  const handleWheel = (e) => {
    if (!chartRef.current) return;

    // 🔥 마우스 위치에서 가장 가까운 데이터 항목 가져오기
    const hoveredIndex = Math.round((e.clientX / window.innerWidth) * chartData.length);
    const hoveredLabel = chartData[hoveredIndex]?.label.replace(/\D/g, ""); // 숫자만 추출

    if (e.deltaY < 0) {
      // 🔍 Zoom in (상세한 데이터로 이동)
      if (zoomIndex < zoomLevels.length - 1) {
        setZoomIndex(zoomIndex + 1);
        if (zoomIndex === 0) {
          setSelectedYear(hoveredLabel || years[years.length - 1]);
        } else if (zoomIndex === 1) {
          setSelectedMonth(hoveredLabel || "1");
        } else if (zoomIndex === 2) {
          setSelectedDay(hoveredLabel || "1");
        }
      }
    } else {
      // 🔎 Zoom out (상위 데이터로 이동)
      if (zoomIndex > 0) {
        setZoomIndex(zoomIndex - 1);
        if (zoomIndex === 1) {
          setSelectedYear("전체");
        } else if (zoomIndex === 2) {
          setSelectedMonth("전체");
        } else if (zoomIndex === 3) {
          setSelectedDay("전체");
        }
      }
    }
  };

  useEffect(() => {
    if (zoomLevels[zoomIndex] === "연도별") {
      setChartData(groupByYear(data));
      setTitle("연도별 병 수거량");
    } else if (zoomLevels[zoomIndex] === "월별") {
      setChartData(groupByMonth(data, selectedYear));
      setTitle(`${selectedYear}년 월별 병 수거량`);
    } else if (zoomLevels[zoomIndex] === "일별") {
      setChartData(groupByDay(data, selectedYear, selectedMonth));
      setTitle(`${selectedYear}년 ${selectedMonth}월 일별 병 수거량`);
    } else if (zoomLevels[zoomIndex] === "시간별") {
      setChartData(groupByHour(data, selectedYear, selectedMonth, selectedDay));
      setTitle(`${selectedYear}년 ${selectedMonth}월 ${selectedDay}일 시간별 병 수거량`);
    }
  }, [zoomIndex, data, selectedYear, selectedMonth, selectedDay]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "white" }} onWheel={handleWheel}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6">
          <h2 className="text-xl sm:text-3xl font-bold mb-4 text-center">{title}</h2>
          <div className="max-w-7xl mx-auto mb-6 bg-white p-4 rounded">
            <ResponsiveContainer width="100%" height={300} ref={chartRef}>
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
      </div>
    </div>
  );
}

export default LearningTimeChart;

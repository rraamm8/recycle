import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LearningTimeChart = () => {
  const [reports, setReports] = useState([]);
  const [selectedBottleType, setSelectedBottleType] = useState("전체");
  const [selectedPeriod, setSelectedPeriod] = useState("WEEKLY");

  useEffect(() => {
    fetch("http://10.125.121.221:8080/api/detections/result")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => {
        setReports(data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  const filterByBottleType = (data, bottleType) => {
    if (bottleType === "전체") return data;
    return data.filter((r) => r.bottleType === bottleType);
  };

  const groupWeekly = (data) => {
    const daySums = {};
    data.forEach((item) => {
      const day = item.dayOfWeek;
      if (!daySums[day]) {
        daySums[day] = 0;
      }
      daySums[day] += item.totalCount || 0;
    });

    return [
      { label: "Mon", total: daySums["Monday"] || 0 },
      { label: "Tue", total: daySums["Tuesday"] || 0 },
      { label: "Wed", total: daySums["Wednesday"] || 0 },
      { label: "Thu", total: daySums["Thursday"] || 0 },
      { label: "Fri", total: daySums["Friday"] || 0 },
      { label: "Sat", total: daySums["Saturday"] || 0 },
      { label: "Sun", total: daySums["Sunday"] || 0 },
    ];
  };

  const chartData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    const filtered = filterByBottleType(reports, selectedBottleType);
    return groupWeekly(filtered);
  }, [reports, selectedBottleType]);

  return (
    <div className="max-w-full mx-auto bg-gray-50 rounded-lg shadow-md p-4">
      <h2 className="text-center text-lg font-bold mb-4">기간별 병 수거량</h2>
      <div className="flex flex-wrap gap-4 justify-end mb-3">
        <select
          value={selectedBottleType}
          onChange={(e) => setSelectedBottleType(e.target.value)}
          className="p-1 border border-gray-300 rounded text-sm"
        >
          <option value="전체">전체</option>
        </select>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="p-1 border border-gray-300 rounded text-sm"
        >
          <option value="WEEKLY">주간</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#0c3259" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LearningTimeChart;

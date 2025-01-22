import React, { useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

// Chart.js 구성요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MostUsed = () => {
  const [timeframe, setTimeframe] = useState("주간");

  // 더미 데이터: 병 종류별 수거량
  const data = {
    주간: [30, 50, 70, 52, 27],
    월간: [120, 200, 300, 250, 180],
    연간: [1200, 1500, 1800, 1700, 1400],
  };

  const labels = ["A", "B", "C", "X", "Be"];

  // Chart.js 데이터 생성
  const chartData = {
    labels,
    datasets: [
      {
        label: "병 종류별 수거량",
        data: data[timeframe],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(231, 76, 60, 0.6)",
          "rgba(52, 152, 219, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(231, 76, 60, 1)",
          "rgba(52, 152, 219, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: timeframe === "주간" ? 100 : timeframe === "월간" ? 400 : 2000,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">월간 수거량</h3>
      <Bar data={chartData} options={chartOptions} />

      {/* 필터 버튼 */}
      <div className="flex justify-center mt-4 space-x-4">
        {["주간", "월간", "연간"].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeframe(filter)}
            className={`px-4 py-2 rounded-lg ${
              timeframe === filter
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MostUsed;

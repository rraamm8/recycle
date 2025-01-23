import React from "react";

const BarChart = () => {
  // 데이터 정의 (아이콘, 색상, 퍼센트 등)
  const data = [
    { label: "Link", percentage: 30, color: "bg-teal-300", icon: "🔗" },
    { label: "Instagram", percentage: 72, color: "bg-purple-300", icon: "📸" },
    { label: "X (Twitter)", percentage: 52, color: "bg-black", icon: "✖️" },
    { label: "Behance", percentage: 76, color: "bg-teal-200", icon: "🖌️" },
    { label: "Dribbble", percentage: 27, color: "bg-pink-300", icon: "🏀" },
  ];
 //커밋
  return (
    <div className="flex flex-col items-center text-center font-sans">
      <h2 className="text-2xl font-bold mb-2">Most used</h2>
      <p className="text-sm text-gray-500 mb-6">5 most visited resources</p>
      <div className="flex justify-around w-full max-w-md">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* 막대 그래프 */}
            <div
              className={`relative w-10 bg-gray-200 rounded-lg overflow-hidden flex justify-end`}
              style={{ height: "160px" }}
            >
              <div
                className={`absolute bottom-0 w-full ${item.color} transition-all duration-500 ease-in-out`}
                style={{ height: `${item.percentage}%` }}
              >
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-white">
                  {item.percentage}%
                </span>
              </div>
            </div>
            {/* 아이콘 */}
            <div className="mt-4 text-2xl">{item.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;

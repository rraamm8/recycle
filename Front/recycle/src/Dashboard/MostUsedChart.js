import React, { useEffect, useState, useMemo } from "react";
import Brown from '../Icons/brown.svg';
import Glass from '../Icons/glass.svg';
import green from '../Icons/green.svg';
import white from '../Icons/white.svg';


const MostUsedChart = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bottleGroups = {
    brown: [
      "06_brown_bottle",
      "06_brown_bottle+dirty",
      "06_brown_bottle+dirty+multi",
      "06_brown_bottle+multi",
    ],
    green: [
      "07_green_bottle",
      "07_green_bottle+dirty",
      "07_green_bottle+dirty+multi",
      "07_green_bottle+multi",
    ],
    white: [
      "08_white_bottle",
      "08_white_bottle+dirty",
      "08_white_bottle+dirty+multi",
      "08_white_bottle+multi",
    ],
    glass: [
      "09_glass",
      "09_glass+dirty",
      "09_glass+dirty+multi",
      "09_glass+multi",
    ],
  };

  // 데이터 로드: Spring Boot API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://10.125.121.221:8080/api/detections/result");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setReports(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 최근 한 달 데이터를 필터링하고 그룹화
  const groupedData = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // 최근 한 달 동안의 데이터 필터링
    const recentData = reports.filter((item) => {
      const itemDate = new Date(item.timePeriod);
      return itemDate >= oneMonthAgo && itemDate <= now;
    });

    // 그룹별 합산 초기화
    const groupTotals = {
      brown: 0,
      green: 0,
      white: 0,
      glass: 0,
    };

    // 병 타입별 합산
    recentData.forEach((item) => {
      const bottleType = item.bottleType;
      if (bottleGroups.brown.includes(bottleType)) {
        groupTotals.brown += item.totalCount || 0;
      } else if (bottleGroups.green.includes(bottleType)) {
        groupTotals.green += item.totalCount || 0;
      } else if (bottleGroups.white.includes(bottleType)) {
        groupTotals.white += item.totalCount || 0;
      } else if (bottleGroups.glass.includes(bottleType)) {
        groupTotals.glass += item.totalCount || 0;
      }
    });

    // 전체 합계 계산
    const totalSum = groupTotals.brown + groupTotals.green + groupTotals.white + groupTotals.glass;

    // 각 그룹의 비율 계산
    return [
      {  percentage: (groupTotals.brown / totalSum) * 100, color: "bg-amber-300", icon: Brown },
      {  percentage: (groupTotals.green / totalSum) * 100, color: "bg-green-300", icon: green },
      {  percentage: (groupTotals.white / totalSum) * 100, color: "bg-gray-300", icon: white },
      {  percentage: (groupTotals.glass / totalSum) * 100, color: "bg-blue-300", icon: Glass},
    ];
  }, [reports]);

  // 로딩/에러 처리
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col items-center text-center font-sans">
      <h2 className="text-2xl font-bold mb-2">Bottle Types in the Last Month</h2>
      <p className="text-sm text-gray-500 mb-6">Recent month data grouped by bottle type</p>
      <div className="flex justify-around w-full max-w-md">
        {groupedData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`relative w-10 bg-white rounded-lg overflow-hidden flex justify-end`}
              style={{ height: "160px" }}
            >
              <div
                className={`absolute bottom-0 w-full ${item.color} transition-all duration-500 ease-in-out`}
                style={{ height: `${item.percentage}%` }}
              >
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-white">
                  {Math.round(item.percentage)}%
                </span>
              </div>
            </div>
            <div className="mt-4 text-2xl">
              <img src={item.icon} alt={`${item.label} Icon`} className="w-8 h-8" />
            </div>
            <div className="text-sm mt-2">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MostUsedChart;

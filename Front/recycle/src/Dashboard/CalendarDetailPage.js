import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function CalendarDetailPage() {
  const { date } = useParams(); // URL에서 날짜 가져오기
  const navigate = useNavigate(); // navigate 훅 사용
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // API 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://10.125.121.221:8080/api/detections/result");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };
    fetchData();
  }, []);

  // 날짜별 데이터 필터링 (차트 데이터)
  useEffect(() => {
    if (data.length > 0 && date) {
      // 1) 먼저 date와 같은 날짜만 필터링 (로컬 날짜 기준)
      const filteredData = data.filter((item) => {
        const localDateStr = new Date(item.timePeriod).toLocaleDateString("en-CA");
        return localDateStr === date; 
      });

      // 2) 시간별 합계
      const hourMap = {};
      filteredData.forEach((item) => {
        const hour = new Date(item.timePeriod).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + item.totalCount;
      });

      // 3) 24시간 차트 데이터 생성
      const newChartData = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}시`,
        total: hourMap[i] || 0,
      }));

      setChartData(newChartData);
    } else {
      // date가 없거나 data가 비어있을 경우 차트 초기화
      setChartData([]);
    }
  }, [data, date]);

  // 테이블 데이터 필터링
  const filteredTableData = useMemo(() => {
    return data.filter((row) => {
      const localDateStr = new Date(row.timePeriod).toLocaleDateString("en-CA");
      return localDateStr === date;
    });
  }, [data, date]);

  // 날짜 이동 함수: 하루 전으로 이동
  const goToPreviousDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDateStr = currentDate.toLocaleDateString("en-CA"); 
    // toISOString() 대신 toLocaleDateString("en-CA")로 YYYY-MM-DD 포맷 얻기
    navigate(`/calendar/${newDateStr}`);
  };

  // 날짜 이동 함수: 하루 후로 이동
  const goToNextDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDateStr = currentDate.toLocaleDateString("en-CA");
    navigate(`/calendar/${newDateStr}`);
  };

  if (loading) {
    return <div>Loading...</div>; // 로딩 중일 때 메시지 표시
  }

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
        <div className="flex-1  h-screen overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-center mb-4">
            {/* 날짜 이동 버튼 */}
            <button
              onClick={goToPreviousDay}
              className="px-4 py-2 bg-gray-300 rounded-l hover:bg-gray-400"
            >
              &lt;
            </button>
            <h2 className="text-xl sm:text-3xl font-bold px-4">
              {date} 병 수거량
            </h2>
            <button
              onClick={goToNextDay}
              className="px-4 py-2 bg-gray-300 rounded-r hover:bg-gray-400"
            >
              &gt;
            </button>
          </div>
          <div className="max-w-7xl mx-auto mb-6 my-6 bg-white p-4 rounded">
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
          <div className="max-w-7xl mx-auto bg-white p-4 rounded">
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">
                      요일
                    </th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">
                      비디오 이름
                    </th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">
                      병 종류
                    </th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">
                      재활용 여부
                    </th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">
                      총 개수
                    </th>
                    <th className="border border-gray-300 p-2 sticky top-0 bg-white z-10">
                      탄소 배출 감소량
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableData.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        {row.dayOfWeek}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {row.videoName}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {row.bottleType}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {row.recyclable ? "가능" : "불가능"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {row.totalCount}
                      </td>
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

export default CalendarDetailPage;

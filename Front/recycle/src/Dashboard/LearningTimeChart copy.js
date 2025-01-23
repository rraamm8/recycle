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

/** 병 종류 옵션 (여기에 "전체"를 추가해서 전체 표시 가능) */
// const BOTTLE_TYPE_MAPPING = {
//   "06_brown_bottle": "갈색병",
//   "06_brown_bottle+dirty": "갈색병(오염)",
//   "06_brown_bottle+dirty+multi": "갈색병(오염+복합)",
//   "06_brown_bottle+multi": "갈색병(복합)",
//   "07_green_bottle": "초록병",
//   "07_green_bottle+dirty": "초록병(오염)",
//   "07_green_bottle+dirty+multi": "초록병(오염+복합)",
//   "07_green_bottle+multi": "초록병(복합)",
//   "08_white_bottle": "흰색병",
//   "08_white_bottle+dirty": "흰색병(오염)",
//   "08_white_bottle+dirty+multi": "흰색병(오염+복합)",
//   "08_white_bottle+multi": "흰색병(복합)",
//   "09_glass": "유리병",
//   "09_glass+dirty": "유리병(오염)",
//   "09_glass+dirty+multi": "유리병(오염+복합)",
//   "09_glass+multi": "유리병(복합)",
// };

/** 병 종류 옵션 */
// const BOTTLE_TYPE_OPTIONS = [
//   { label: "전체", value: "전체" },
//   ...Object.entries(BOTTLE_TYPE_MAPPING).map(([key, value]) => ({
//     label: value,
//     value: key,
//   })),
// ];


/** 병 종류 옵션 (직접 작성) */
const BOTTLE_TYPE_OPTIONS = [
  { label: "전체", value: "전체" },
  { label: "갈색병", value: "06_brown_bottle" },
  { label: "갈색병(오염)", value: "06_brown_bottle+dirty" },
  { label: "갈색병(오염+복합)", value: "06_brown_bottle+dirty+multi" },
  { label: "갈색병(복합)", value: "06_brown_bottle+multi" },
  { label: "초록병", value: "07_green_bottle" },
  { label: "초록병(오염)", value: "07_green_bottle+dirty" },
  { label: "초록병(오염+복합)", value: "07_green_bottle+dirty+multi" },
  { label: "초록병(복합)", value: "07_green_bottle+multi" },
  { label: "흰색병", value: "08_white_bottle" },
  { label: "흰색병(오염)", value: "08_white_bottle+dirty" },
  { label: "흰색병(오염+복합)", value: "08_white_bottle+dirty+multi" },
  { label: "흰색병(복합)", value: "08_white_bottle+multi" },
  { label: "유리병", value: "09_glass" },
  { label: "유리병(오염)", value: "09_glass+dirty" },
  { label: "유리병(오염+복합)", value: "09_glass+dirty+multi" },
  { label: "유리병(복합)", value: "09_glass+multi" },
];




/** 기간 옵션: 주간, 월간, 연간 */
const PERIOD_OPTIONS = [
  { label: "주간", value: "WEEKLY" },
  { label: "월간", value: "MONTHLY" },
  { label: "연간", value: "YEARLY" },
];

const LearningTimeChart = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 병 종류 / 기간 드롭다운 선택 상태
  const [selectedBottleType, setSelectedBottleType] = useState("전체");
  const [selectedPeriod, setSelectedPeriod] = useState("WEEKLY");

  // 최초 로딩 시 Spring Boot API 호출
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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /** 
   * 1) 병 종류 필터 
   *    selectedBottleType이 "전체"가 아니면 해당 타입만 필터링 
   */
  const filterByBottleType = (data, bottleType) => {
    if (!data) return [];
    if (bottleType === "전체") {
      return data;
    }
    return data.filter((r) => r.bottleType === bottleType);
  };

  /** 
   * 2) 기간(주간/월간/연간) 필터
   *    실제로는 timePeriod(날짜)를 파싱해 날짜 범위를 비교해야 합니다.
   *    여기서는 예시로 필터 로직 없이 전체 반환.
   */
  const filterByPeriod = (data, period) => {
    if (!data) return [];
  
    const now = new Date();
  
    switch (period) {
      case "WEEKLY": {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7); // 1주일 전
        return data.filter((r) => {
          const recordDate = new Date(r.timePeriod);
          return recordDate >= oneWeekAgo && recordDate <= now;
        });
      }
      case "MONTHLY": {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1); // 1개월 전
        return data.filter((r) => {
          const recordDate = new Date(r.timePeriod);
          return recordDate >= oneMonthAgo && recordDate <= now;
        });
      }
      case "YEARLY": {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1); // 1년 전
        return data.filter((r) => {
          const recordDate = new Date(r.timePeriod);
          return recordDate >= oneYearAgo && recordDate <= now;
        });
      }
      default:
        return data;
    }
  };
  

  /**
   * 3) 차트에 맞는 데이터 가공
   *    - X축: Monday ~ Sunday
   *    - Y축: 각 요일별 totalCount 합산
   *
   *    실제 DB에는 dayOfWeek가 "Monday", "Tuesday" 등으로 들어오므로
   *    그 순서대로 totalCount를 합산하여 하나의 라인으로 표현.
   */
  const chartData = useMemo(() => {
    // 로딩/에러 시엔 빈 데이터
    if (!reports || reports.length === 0) {
      return [];
    }

    // 병 종류 + 기간으로 필터링
    let filtered = filterByBottleType(reports, selectedBottleType);
    filtered = filterByPeriod(filtered, selectedPeriod);

    // 요일 순서 정의
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    // 요일 레이블(차트에 표시할 축 라벨)
    const dayLabelMap = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };

    // dayOfWeek 기준으로 totalCount 합산
    // 결과 형태 예) [{ day: 'Mon', total: 10 }, { day: 'Tue', total: 5 }, ...]
    const result = dayOrder.map((dayKey) => {
      // dayKey가 "Monday"인 report들의 totalCount 합
      const sum = filtered
        .filter((r) => r.dayOfWeek === dayKey)
        .reduce((acc, cur) => acc + (cur.totalCount || 0), 0);

      return {
        day: dayLabelMap[dayKey], // x축 레이블
        total: sum, // y축 값
      };
    });

    return result;
  }, [reports, selectedBottleType, selectedPeriod]);

  // 로딩/에러 처리
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // 최종 렌더링
  return (
    <div style={{ margin: "2rem auto", maxWidth: "600px" }}>
      <h2 style={{ marginBottom: "1rem", fontWeight: "bold" }}>
        기간별 병 수거량
      </h2>

      {/* 드롭다운 영역 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "1rem" }}>
        {/* 병 타입 드롭다운 */}
        <select
          value={selectedBottleType}
          onChange={(e) => setSelectedBottleType(e.target.value)}
        >
          {BOTTLE_TYPE_OPTIONS.map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 기간 드롭다운 */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 라인 차트 영역 */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            label={{ value: "시간별", position: "insideBottom", offset: -5 }}
          />
          <YAxis 
            label={{ value: "개수", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          {/* 단일 라인 */}
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#98B58B" // 예시 연한 녹색 계열
            strokeWidth={3} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LearningTimeChart;

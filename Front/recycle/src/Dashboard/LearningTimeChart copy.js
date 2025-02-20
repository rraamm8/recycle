import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/** 병 종류 옵션 (맨 앞에 "전체") */
const BOTTLE_TYPE_MAPPING = {
  "06_brown_bottle": "갈색병",
  "06_brown_bottle+dirty": "갈색병(오염)",
  "06_brown_bottle+dirty+multi": "갈색병(오염+복합)",
  "06_brown_bottle+multi": "갈색병(복합)",
  "07_green_bottle": "초록병",
  "07_green_bottle+dirty": "초록병(오염)",
  "07_green_bottle+dirty+multi": "초록병(오염+복합)",
  "07_green_bottle+multi": "초록병(복합)",
  "08_white_bottle": "흰색병",
  "08_white_bottle+dirty": "흰색병(오염)",
  "08_white_bottle+dirty+multi": "흰색병(오염+복합)",
  "08_white_bottle+multi": "흰색병(복합)",
  "09_glass": "유리병",
  "09_glass+dirty": "유리병(오염)",
  "09_glass+dirty+multi": "유리병(오염+복합)",
  "09_glass+multi": "유리병(복합)",
};

/** 병 종류 옵션 */
const BOTTLE_TYPE_OPTIONS = [
  { label: "전체", value: "전체" },
  ...Object.entries(BOTTLE_TYPE_MAPPING).map(([key, value]) => ({
    label: value,
    value: key,
  })),
];

/** 기간 옵션: 주간, 월간, 연간 */
const PERIOD_OPTIONS = [
  { label: "주간", value: "WEEKLY" },
  { label: "월간", value: "MONTHLY" },
  { label: "연간", value: "YEARLY" },
];

/** 주간용 요일 순서 & 약자 매핑 */
const WEEK_DAYS = [
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
  { full: "Sunday", short: "Sun" },
];

/** 월 약자 배열 (인덱스 0=Jan, 1=Feb, ... 11=Dec) */
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function LearningTimeChart() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 병 종류 / 기간 선택
  const [selectedBottleType, setSelectedBottleType] = useState("전체");
  const [selectedPeriod, setSelectedPeriod] = useState("WEEKLY");

  // 데이터 로드
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

  // 병 타입 필터
  const filterByBottleType = (data, bottleType) => {
    if (bottleType === "전체") return data;
    return data.filter((r) => r.bottleType === bottleType);
  };

  // 주간 그룹화 (월~일, 없으면 0)
  const groupWeekly = (data) => {
    const daySums = {}; // { Monday: 10, Tuesday: 20, ... }
    data.forEach((item) => {
      const day = item.dayOfWeek; // "Monday"~"Sunday"
      if (!daySums[day]) {
        daySums[day] = 0;
      }
      daySums[day] += item.totalCount || 0;
    });

    // WEEK_DAYS 순서대로 배열 생성
    return WEEK_DAYS.map(({ full, short }) => ({
      label: short,             // ex) "Mon"
      total: daySums[full] || 0,
    }));
  };

  // 월간 그룹화 (1~12월, 없으면 0)
  const groupMonthly = (data) => {
    // 1) (month: totalCount) 형태로 합산
    const monthSums = {}; // key: 0~11, value: sum
    data.forEach((item) => {
      const d = new Date(item.timePeriod);
      const m = d.getMonth(); // 0~11
      if (!monthSums[m]) {
        monthSums[m] = 0;
      }
      monthSums[m] += item.totalCount || 0;
    });


    // 2) 0~11 순회하며 배열 생성
    return Array.from({ length: 12 }, (_, i) => ({
      label: MONTH_LABELS[i],   // "Jan"..."Dec"
      total: monthSums[i] || 0,
    }));

  };

  // 연간 그룹화 (데이터에 등장하는 모든 연도 or 고정 범위)
  const groupYearly = (data) => {
    // 1) 연도별 합산
    const yearSums = {}; // { 2025: 30, 2026: 40, ... }
    data.forEach((item) => {
      const d = new Date(item.timePeriod);
      const y = d.getFullYear();
      if (!yearSums[y]) {
        yearSums[y] = 0;
      }
      yearSums[y] += item.totalCount || 0;
    });

    // 2) 필요한 범위만큼 연도를 순회
    // 방법 A) 데이터에 있는 최소~최대 연도만 표시
    const allYears = Object.keys(yearSums)
      .map((y) => parseInt(y))
      .sort((a, b) => a - b);

    // 최종 배열
    return allYears.map((y) => ({
      label: String(y),      // "2025" 등
      total: yearSums[y],
    }));

    // 방법 B) 미리 2019~2025 등 고정 범위를 돌며, 없는 해는 0
    // const fixedRange = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
    // return fixedRange.map((y) => ({
    //   label: String(y),
    //   total: yearSums[y] || 0,
    // }));
  };

  // 기간(주간/월간/연간)에 따라 데이터 그룹화
  const groupByPeriod = (data, period) => {
    if (period === "WEEKLY") {
      return groupWeekly(data);
    } else if (period === "MONTHLY") {
      return groupMonthly(data);
    } else if (period === "YEARLY") {
      return groupYearly(data);
    }
    return [];
  };

  // 최종 차트 데이터
  const chartData = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    // 1) 병 필터
    let filtered = filterByBottleType(reports, selectedBottleType);
    // 2) 기간별 그룹
    return groupByPeriod(filtered, selectedPeriod);
  }, [reports, selectedBottleType, selectedPeriod]);

  // 로딩/에러 처리
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="max-w-4xl mx-auto p-3 my-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-center mb-4 font-bold text-2xl text-gray-800">
        기간별 병 수거량
      </h2>

      {/* 드롭다운 2개 */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mb-4">
        {/* 병 종류 */}
        <select
          value={selectedBottleType}
          onChange={(e) => setSelectedBottleType(e.target.value)}
          className="p-2 border border-gray-300 rounded text-sm w-full sm:w-auto"
        >
          {BOTTLE_TYPE_OPTIONS.map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 기간 */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="p-2 border border-gray-300 rounded text-sm w-full sm:w-auto"
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <Link to={'/LTDetailPage'}>
        <button
        className="p-2 border border-gray-300 bg-white mr-1 rounded text-sm w-full sm:w-auto"
        
        >
          상세
        </button>
        </Link>
      </div>

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#0c3259"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

  );
}

export default LearningTimeChart;

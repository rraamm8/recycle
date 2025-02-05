import React from 'react';
import Sidebar from './Sidebar';
import CarbonReductionChart from './CarbonReductionChart';
import LearningTimeChart from './LearningTimeChart';
import MostUsedChart from './MostUsedChart';
import SuccessRateChart from './SuccessRateChart';
import DeviceRecyclingChart from './DeviceRecyclingChart';
import { useState } from 'react';
import Calendar from 'moedim';
import RecentWeekBarChart from './RecentWeekBarChart';
import TodayBottleCount from './TodayBottleCount';
import RecyclePieChart from './RecyclePieChart';
import RecyclablePieChart from './RecyclablePieChart'

const Dashboard = () => {
  const [value, setValue] = useState(new Date());

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto p-6 bg-gray-100">
        {/* Dashboard Title */}
        <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 상단 차트 (탄소 배출 감소량 & 기간별 병 수거량) */}
          <div className="lg:col-span-6">
            <CarbonReductionChart />
          </div>
          <div className="lg:col-span-6">
            <LearningTimeChart />
          </div>

          {/* 중간 차트 (Most Used, Calendar) */}
          <div className="lg:col-span-4">
            <MostUsedChart />
          </div>
          <div className="lg:col-span-2">
            <Calendar value={value} onChange={(d) => setValue(d)} />
          </div>

          {/* 하단 차트 (탄소배출 감소량 막대그래프) */}
          <div className="lg:col-span-4">
            <RecentWeekBarChart/>
          </div>
          <div className="lg:col-span-2">
            <TodayBottleCount/>
          </div>
          <div className="lg:col-span-4">
            <RecyclePieChart/>
          </div>
          <div className="lg:col-span-4">
            <RecyclablePieChart/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

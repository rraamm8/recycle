import React, { useState } from 'react';
import Sidebar from './Sidebar';
// import Calendar from 'moedim';
import RecentWeekBarChart from './RecentWeekBarChart';
import TodayBottleCount from './TodayBottleCount';
import LearningTimeChart from './LearningTimeChart';
import MostUsedChart from './MostUsedChart';
import RecyclePieChart from './RecyclePieChart';
import RecyclablePieChart from './RecyclablePieChart';
import TodayRecyclableCount from './TodayRecyclableCount';
import CalendarComponent from './CalendarComponent';


const Dashboard = () => {
  const [value, setValue] = useState(new Date());

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto p-4 bg-gray-100">
        {/* Dashboard Title */}
        {/* <h1 className="text-xl font-bold mb-4">관리자 대시보드</h1> */}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Top Row */}
          <div className="lg:col-span-5  rounded-md p-3 ">
            <div className="grid grid-cols-2 gap-3 mr-6 ml-6">
              <TodayBottleCount />
              <TodayRecyclableCount />
            </div>
            <RecentWeekBarChart />
          </div>
          <div className="lg:col-span-7  rounded-md p-3">
            <LearningTimeChart />
          </div>

          {/* Bottom Section */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className=" rounded-md p-3 flex items-center justify-center">
              <MostUsedChart />
            </div>
            <div className=" rounded-md p-3 flex items-center justify-center">
              {/* <Calendar value={value} onChange={(d) => setValue(d)} /> */}
              <CalendarComponent/>
            </div>
            <div className=" rounded-md p-3">
              <RecyclePieChart />
            </div>
            <div className=" rounded-md p-3">
              <RecyclablePieChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

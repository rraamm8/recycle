import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Select from 'react-select';
import Sidebar from "./Sidebar";

export default function DashBoard() {
  const [selectedTime, setSelectedTime] = useState('weekly');

  const data = [
    { name: 'Mon', value: 10 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 20 },
    { name: 'Thu', value: 40 },
    { name: 'Fri', value: 60 },
    { name: 'Sat', value: 30 },
    { name: 'Sun', value: 50 },
  ];

  const timeOptions = [
    { value: 'weekly', label: '주간' },
    { value: 'monthly', label: '월간' },
    { value: 'yearly', label: '연간' },
  ];


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      {/* <aside className="w-1/6 bg-[#a2b9a8] p-4">
        <h1 className="text-lg font-bold text-white mb-6">DASHBOARD</h1>
        <div className="space-y-4">
          <button className="w-full p-3 bg-gray-200 text-gray-700 rounded-lg">탄소 배출량</button>
          <button className="w-full p-3 bg-gray-200 text-gray-700 rounded-lg">병 수거량</button>
          <button className="w-full p-3 bg-gray-200 text-gray-700 rounded-lg">방문자 수</button>
        </div>
      </aside> */}
      <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <div className="w-1/3">
            <Select 
              options={timeOptions} 
              defaultValue={timeOptions[0]} 
              onChange={(selected) => setSelectedTime(selected.value)}
            />
          </div>
        </div>

        {/* Graph Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">탄소 배출량 추이</h2>
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">주간 성공률</h3>
            <div className="text-3xl font-bold text-green-500">75%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">기기 상태</h3>
            <div className="text-3xl font-bold text-red-500">25%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">방문자 수</h3>
            <div className="text-3xl font-bold text-blue-500">1,200명</div>
          </div>
        </div>
      </main>
    </div>
  );
}

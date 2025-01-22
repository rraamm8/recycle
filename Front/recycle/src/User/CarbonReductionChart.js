import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CarbonReductionChart = () => {
  const data = [
    { name: 'Mon', value: 10 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 20 },
    { name: 'Thu', value: 40 },
    { name: 'Fri', value: 60 },
    { name: 'Sat', value: 30 },
    { name: 'Sun', value: 50 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">탄소 배출 감소량</h2>
      <ResponsiveContainer width="100%" height={300}>
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
  );
};

export default CarbonReductionChart;

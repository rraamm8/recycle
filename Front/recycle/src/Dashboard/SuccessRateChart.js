import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const SuccessRateChart = () => {
  const data = [
    { name: 'Completed Task', value: 75 },
    { name: 'Unfinished Task', value: 25 },
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">수거 성공 비율</h2>
      <PieChart width={200} height={200}>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={60} fill="#8884d8" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default SuccessRateChart;

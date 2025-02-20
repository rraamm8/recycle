import React from 'react';
import { RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';

const DeviceRecyclingChart = () => {
  const data = [
    { name: 'Device 1', uv: 75 },
    { name: 'Device 2', uv: 25 },
  ];

  return (
    <div className="flex  bg-white p-6 rounded-lg shadow-md">
      <div>
        <h2 className="text-xl text-center font-bold mb-4">기기 적재량</h2>
        <RadialBarChart
          width={200}
          height={200}
          cx="50%"
          cy="50%"
          innerRadius="10%"
          outerRadius="80%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar minAngle={15} label background clockWise dataKey="uv" />
          <Tooltip />
          <Legend />
        </RadialBarChart>
      </div>
   
    </div>
  );
};

export default DeviceRecyclingChart;

import React, { useState, useEffect, PureComponent } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer , Cell} from "recharts";
import axios from "axios";
//brown green white glass
// const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]; // 병 종류별 색상
const COLORS = ["#edc453", "#6aa86e", "#95c4cf", "#3d93b8","#3d43b8"]; // 병 종류별 색상
//brown  "#b5592b", "#77b52b", "#c8e0e0" ,"#2baeb5"
// 병 종류 매핑
const BOTTLE_MAPPING = {
  brown: [
    "06_brown_bottle",
    "06_brown_bottle+multi",
    "06_brown_bottle+dirty",
    "06_brown_bottle+dirty+multi",
  ],
  green: [
    "07_green_bottle",
    "07_green_bottle+multi",
    "07_green_bottle+dirty",
    "07_green_bottle+dirty+multi",
  ],
  white: [
    "08_white_bottle",
    "08_white_bottle+multi",
    "08_white_bottle+dirty",
    "08_white_bottle+dirty+multi",
  ],
  glass: [
    "09_glass",
    "09_glass+multi",
    "09_glass+dirty",
    "09_glass+dirty+multi",
  ],
  blue:[
    "10_blue_bottle",
  ]
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const PieChartComponent = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("recyclable");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    axios
      .get("http://10.125.121.221:8080/api/detections/result")
      .then((response) => {
        const transformedData = transformData(response.data);
        setData(transformedData);
        setChartData(transformedData[filter]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const transformData = (rawData) => {
    const groupedData = {
      recyclable: { brown: 0, green: 0, white: 0, glass: 0, blue: 0 },
      nonRecyclable: { brown: 0, green: 0, white: 0, glass: 0, blue: 0 },
    };

    rawData.forEach((row) => {
      const isRecyclable = row.recyclable === true;
      const totalCount = parseInt(row.totalCount, 10) || 0;

      for (const [category, bottleTypes] of Object.entries(BOTTLE_MAPPING)) {
        if (bottleTypes.includes(row.bottleType)) {
          if (isRecyclable) {
            groupedData.recyclable[category] += totalCount;
          } else {
            groupedData.nonRecyclable[category] += totalCount;
          }
        }
      }
    });

    const formatData = (group) =>
      Object.entries(group).map(([key, value]) => ({
        name: key,
        value,
      }));

    return {
      recyclable: formatData(groupedData.recyclable),
      nonRecyclable: formatData(groupedData.nonRecyclable),
    };
  };

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);
    setChartData(data[selectedFilter]);
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center ">병 종류별 재활용 데이터</h2>
      <div className="text-center ">
        
      </div>
      
        <ResponsiveContainer width="150%" height={250}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="33%"
              cy="57%"
              innerRadius={50}
              outerRadius={70}
              fill="#8884d8"
              onMouseEnter={onPieEnter}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <select
          className="border border-gray-300 rounded px-3 py-2 mt-7"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="recyclable">재활용 가능</option>
          <option value="nonRecyclable">재활용 불가능</option>
        </select>
    </div>
  );
};

export default PieChartComponent;

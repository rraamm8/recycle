import React, { PureComponent } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import axios from "axios";

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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
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

export default class DynamicPieChart extends PureComponent {
  state = {
    data: [], // 데이터 상태
    activeIndex: 0, // 활성화된 인덱스
  };

  componentDidMount() {
    // API 호출
    axios
      .get("http://10.125.121.221:8080/api/detections/result")
      .then((response) => {
        const transformedData = this.transformData(response.data);
        this.setState({ data: transformedData });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  transformData = (rawData) => {
    const groupedData = {
      recyclable: 0,
      nonRecyclable: 0,
    };

    rawData.forEach((row) => {
      const isRecyclable = row.recyclable === true ? 1 : 0;
      const totalCount = parseInt(row.totalCount, 10) || 0;

      if (isRecyclable === 1) {
        groupedData.recyclable += totalCount;
      } else {
        groupedData.nonRecyclable += totalCount;
      }
    });

    return [
      { name: "재활용 가능", value: groupedData.recyclable },
      { name: "재활용 불가능", value: groupedData.nonRecyclable },
    ];
  };

  onPieEnter = (_, index) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    const { data, activeIndex } = this.state;

    return (
      <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">총 병 재활용 데이터</h2>
      <div className="bg-gray-100 p-4 rounded-lg shadow">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={this.onPieEnter}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
      </div>
    );
  }
}

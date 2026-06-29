import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const TrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis dataKey="date" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="totalCalls"
          stroke="#2563eb"
          strokeWidth={3}
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="successfulCalls"
          stroke="#16a34a"
          strokeWidth={3}
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="missedCalls"
          stroke="#ea580c"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;

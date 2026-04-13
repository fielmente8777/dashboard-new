import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const UsageChart = ({ data }) => {
  return (
    <div className="bg-primary p-6 rounded-xl shadow-sm h-[350px]">
    <div className="bg-white p-5 rounded-xl shadow-sm h-[300px]">
      <h2 className="text-lg font-semibold mb-4">Usage Analytics</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line type="monotone" dataKey="ai" stroke="#6366f1" />
          <Line type="monotone" dataKey="whatsapp" stroke="#22c55e" />
          <Line type="monotone" dataKey="email" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
};

export default UsageChart;
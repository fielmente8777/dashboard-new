import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0ea5e9", "#16a34a", "#f97316"];

const DirectionChart = ({ data }) => {
  return (
    <div className="bg-white p-6 drop-shadow-xl">
      <h3 className="mb-6 text-lg font-semibold">Calls by Direction</h3>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="direction"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DirectionChart;

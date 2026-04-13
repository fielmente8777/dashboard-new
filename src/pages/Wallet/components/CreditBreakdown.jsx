import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

const CreditBreakdown = ({ data }) => {
  return (
    <div className="bg-primary p-6 rounded-xl shadow-sm h-[350px]">
    <div className="bg-white p-5 rounded-xl shadow-sm h-[300px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Credit Breakdown</h2>

      <div className="flex-1 flex items-center justify-center"> 
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={80}
            innerRadius={50}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index]} />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
      </ResponsiveContainer>
    </div>
    </div>
    </div>
  );
};

export default CreditBreakdown;
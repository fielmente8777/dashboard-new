import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { tooltipProps } from "./chartTheme";

// A donut with the total in the middle. Pair it with a list that names each
// slice (the donut itself has no legend).
// data: [{ name, value, color }]
const DonutChart = ({ data, centerLabel, unit = "", height = 220 }) => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            // the gap between slices is the surface showing through
            stroke="var(--app-surface)"
            strokeWidth={2}
            animationDuration={500}
          >
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipProps}
            formatter={(value) => `${value.toLocaleString()} ${unit}`.trim()}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums text-app-text">
          {total.toLocaleString()}
        </span>
        {centerLabel && (
          <span className="text-[11px] uppercase tracking-wide text-app-text-muted">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default DonutChart;

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CHART_COLORS,
  axisProps,
  formatDayLabel,
  gridProps,
  tooltipProps,
} from "../../../../components/Charts/chartTheme";

// Rank over time. The axis is flipped: rank #1 sits at the top.
// data: [{ date, [dataKey]: rank }]
const RankTrendChart = ({ data, dataKey = "rank", label = "Rank", height = 240, id }) => (
  <div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} />
            <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="date" {...axisProps} tickFormatter={formatDayLabel} minTickGap={24} />
        <YAxis
          {...axisProps}
          reversed
          width={36}
          allowDecimals={false}
          domain={["dataMin - 1", "dataMax + 1"]}
          tickFormatter={(v) => `#${Math.round(v)}`}
        />
        <Tooltip
          {...tooltipProps}
          labelFormatter={formatDayLabel}
          formatter={(v) => [`#${Number(v).toFixed(1).replace(/\.0$/, "")}`, label]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          fill={`url(#${id})`}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default RankTrendChart;

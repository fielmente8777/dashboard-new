import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_COLORS,
  axisProps,
  formatCompact,
  formatDayLabel,
  gridProps,
  tooltipProps,
} from "../../../components/Charts/chartTheme";
import Card from "../../../components/ui/Card";

// Reach and engagements are on very different scales, so each gets its own
// chart (and its own axis) instead of sharing one with two axes.
const SERIES = [
  { key: "reach", title: "Reach", color: CHART_COLORS[0] },
  { key: "engagements", title: "Engagements", color: CHART_COLORS[1] },
];

// data: { reach: [{ date, value }], engagements: [{ date, value }] }
const MetaPerformanceCharts = ({ data }) => {
  const rows = useMemo(
    () =>
      (data?.reach || []).map((point, index) => ({
        date: point.date,
        reach: point.value || 0,
        engagements: data.engagements?.[index]?.value || 0,
      })),
    [data],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {SERIES.map((series) => (
        <Card key={series.key} title={series.title} description="Per day">
          <div className="h-64">
            {rows.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-app-text-muted">
                No data for this period.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rows}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid {...gridProps} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDayLabel}
                    minTickGap={24}
                    {...axisProps}
                  />
                  <YAxis tickFormatter={formatCompact} {...axisProps} />
                  <Tooltip
                    {...tooltipProps}
                    labelFormatter={formatDayLabel}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    name={series.title}
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: series.color,
                      stroke: "var(--app-surface)",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetaPerformanceCharts;

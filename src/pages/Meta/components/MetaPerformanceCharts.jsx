import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import Segmented from "../../../components/ui/Segmented";

// each series gian sends under performanceOverview, with its own colour
const METRICS = [
  { value: "reach", label: "Reach", color: CHART_COLORS[0] },
  { value: "views", label: "Views", color: CHART_COLORS[6] },
  { value: "engagements", label: "Engagements", color: CHART_COLORS[1] },
  { value: "newFollowers", label: "New followers", color: CHART_COLORS[2] },
];

// Meta sends some daily values as a breakdown object; the chart needs the total
const total = (value) =>
  value && typeof value === "object"
    ? Object.values(value).reduce((sum, v) => sum + Number(v || 0), 0)
    : Number(value || 0);

// data: { reach: [{ date, value }], views: [...], engagements: [...], newFollowers: [...] }
const MetaPerformanceCharts = ({ data }) => {
  // only the metrics this answer has (older gian answers send reach + engagements only)
  const available = METRICS.filter((m) => data?.[m.value]?.length);
  const [picked, setPicked] = useState("reach");
  const metric = available.find((m) => m.value === picked) || available[0] || METRICS[0];

  const rows = useMemo(
    () => (data?.[metric.value] || []).map((p) => ({ date: p.date, value: total(p.value) })),
    [data, metric.value],
  );
  const sum = rows.reduce((s, r) => s + r.value, 0);

  return (
    <Card
      title="Performance over time"
      description={rows.length ? `${metric.label} per day · ${sum.toLocaleString("en-IN")} in this period` : "Per day"}
      actions={
        available.length > 1 && (
          <Segmented label="Metric" options={available} value={metric.value} onChange={setPicked} />
        )
      }
    >
      <div className="h-72">
        {rows.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-app-text-muted">
            No data for this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="meta-performance-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tickFormatter={formatDayLabel} minTickGap={28} {...axisProps} />
              <YAxis tickFormatter={formatCompact} width={48} {...axisProps} />
              <Tooltip
                {...tooltipProps}
                labelFormatter={formatDayLabel}
                formatter={(value) => [value.toLocaleString("en-IN"), metric.label]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={metric.color}
                strokeWidth={2}
                fill="url(#meta-performance-fill)"
                dot={false}
                activeDot={{ r: 4, fill: metric.color, stroke: "var(--app-surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default MetaPerformanceCharts;

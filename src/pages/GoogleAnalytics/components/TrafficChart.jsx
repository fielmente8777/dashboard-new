import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_OTHER,
  axisProps,
  formatDayLabel,
  gridProps,
} from "../../../components/Charts/chartTheme";
import Card from "../../../components/ui/Card";
import Switch from "../../../components/ui/Switch";
import { changeOf, formatMetric, totalOf } from "../analyticsUtils";
import ChartTooltip from "./ChartTooltip";
import Delta from "./Delta";

const longDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "—";

// The picked metric day by day, with the previous period as a dashed line
// (day 1 against day 1 of the period before, and so on).
const TrafficChart = ({ metric, rows, previousRows, rangeLabel, fetching }) => {
  const [compare, setCompare] = useState(true);
  const hasPrevious = previousRows.length > 0;

  const data = rows.map((row, i) => ({
    date: row.date,
    current: row[metric.key] || 0,
    previous: previousRows[i]?.[metric.key],
    previousDate: previousRows[i]?.date,
  }));

  const total = totalOf(rows, metric);
  const before = hasPrevious ? totalOf(previousRows, metric) : null;
  const gradientId = `ga-traffic-${metric.key}`;

  return (
    <Card
      title="Traffic overview"
      description={`${metric.label} per day · ${rangeLabel}`}
      actions={
        hasPrevious && (
          <div className="flex items-center gap-2 text-xs font-medium text-app-text-muted">
            Compare to previous period
            <Switch checked={compare} onChange={setCompare} label="Compare to previous period" />
          </div>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-app-text">
            {formatMetric(metric, total)}
          </p>
          <p className="mt-0.5 text-xs text-app-text-muted">{metric.label}, this period</p>
        </div>
        {before != null && (
          <div className="pb-1">
            <Delta value={changeOf(total, before)} />
            <span className="ml-2 text-xs text-app-text-muted">
              vs {formatMetric(metric, before)} the period before
            </span>
          </div>
        )}
        <ul className="ml-auto flex items-center gap-4 pb-1 text-xs text-app-text-muted">
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: metric.color }} />
            This period
          </li>
          {compare && hasPrevious && (
            <li className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed" style={{ borderColor: CHART_OTHER }} />
              Previous period
            </li>
          )}
        </ul>
      </div>

      <div className={`h-80 transition-opacity ${fetching ? "opacity-50" : ""}`}>
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-app-text-muted">
            No traffic data for this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tickFormatter={formatDayLabel} minTickGap={28} {...axisProps} />
              <YAxis tickFormatter={(v) => formatMetric(metric, v)} width={52} {...axisProps} />
              <Tooltip
                cursor={{ stroke: "var(--chart-grid)", strokeWidth: 1 }}
                content={
                  <ChartTooltip
                    title={(payload) => longDate(payload[0].payload.date)}
                    rows={(payload) => {
                      const point = payload[0].payload;
                      return [
                        { label: "This period", value: formatMetric(metric, point.current), color: metric.color },
                        ...(compare && point.previous != null
                          ? [{
                              label: longDate(point.previousDate),
                              value: formatMetric(metric, point.previous),
                              color: CHART_OTHER,
                              dashed: true,
                            }]
                          : []),
                      ];
                    }}
                  />
                }
              />
              {compare && hasPrevious && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke={CHART_OTHER}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={false}
                  animationDuration={500}
                />
              )}
              <Area
                type="monotone"
                dataKey="current"
                stroke={metric.color}
                strokeWidth={2.25}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 5, fill: metric.color, stroke: "var(--app-surface)", strokeWidth: 2 }}
                animationDuration={600}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default TrafficChart;

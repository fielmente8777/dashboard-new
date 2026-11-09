import { useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
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
import { addDays, parseISODate, toISODate } from "../../../utils/datePresets";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  previousRange,
} from "../googleAdsUtils";

const METRICS = [
  { value: "cost", label: "Spend", format: formatCurrency, axis: formatCurrencyCompact },
  { value: "clicks", label: "Clicks", format: formatNumber, axis: formatCompact },
  { value: "impressions", label: "Impressions", format: formatNumber, axis: formatCompact },
  { value: "conversions", label: "Conversions", format: formatNumber, axis: formatCompact },
];

const COLOR = CHART_COLORS[0];

// every day of the range, so a day without activity shows as 0 instead of
// the line jumping over it
const days = ({ start, end }) => {
  const list = [];
  for (let d = parseISODate(start); toISODate(d) <= end; d = addDays(d, 1)) {
    list.push(toISODate(d));
  }
  return list;
};

// One chart: the chosen metric per day, with the same days of the previous
// period as a dashed line to compare against.
const PerformanceChart = ({ series = [], previousSeries = [], range }) => {
  const [metric, setMetric] = useState("cost");
  const def = METRICS.find((m) => m.value === metric);

  const data = useMemo(() => {
    const current = new Map(series.map((r) => [r.date, r]));
    const before = new Map(previousSeries.map((r) => [r.date, r]));
    const previousDays = days(previousRange(range));
    return days(range).map((date, i) => ({
      date,
      value: current.get(date)?.[metric] || 0,
      previous: before.get(previousDays.at(i))?.[metric] || 0,
      previousDate: previousDays.at(i),
    }));
  }, [series, previousSeries, range, metric]);

  return (
    <Card
      title="Performance over time"
      description="Daily, with the previous period as a dashed line"
      actions={
        <Segmented
          label="Metric"
          options={METRICS}
          value={metric}
          onChange={setMetric}
        />
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ads-performance-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="date"
              {...axisProps}
              tickFormatter={formatDayLabel}
              minTickGap={28}
            />
            <YAxis {...axisProps} width={56} tickFormatter={def.axis} />
            <Tooltip
              {...tooltipProps}
              labelFormatter={formatDayLabel}
              formatter={(value, name, item) => [
                def.format(value),
                name === "previous"
                  ? `Previous (${formatDayLabel(item.payload.previousDate)})`
                  : def.label,
              ]}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="previous"
              stroke="var(--chart-other)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="value"
              stroke={COLOR}
              strokeWidth={2}
              fill="url(#ads-performance-fill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PerformanceChart;

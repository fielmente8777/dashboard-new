import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_COLORS,
  CHART_OTHER,
  axisProps,
  formatDayLabel,
  formatDuration,
  gridProps,
  tooltipProps,
} from "../../components/Charts/chartTheme";
import DonutChart from "../../components/Charts/DonutChart";
import Card from "../../components/ui/Card";
import { Select } from "../../components/ui/Field";
import ProgressList from "../../components/ui/ProgressList";
import StatCard from "../../components/ui/StatCard";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useGetCallAnalyticsQuery } from "../../redux/api/callsApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { getDateRange } from "../../utils/dateRange";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "90days", label: "Last 90 days" },
];

// `key` is the field in the analytics summary
const SUMMARY_CARDS = [
  { key: "totalCalls", label: "Total calls", icon: Phone },
  { key: "successfulCalls", label: "Successful calls", icon: PhoneCall },
  {
    key: "missedCalls",
    label: "Missed calls",
    icon: PhoneMissed,
    lowerIsBetter: true,
  },
  { key: "followUps", label: "Follow ups", icon: CalendarDays },
  {
    key: "totalTalkTime",
    label: "Talk time",
    icon: Timer,
    format: formatDuration,
  },
  {
    key: "averageDuration",
    label: "Average duration",
    icon: Clock3,
    format: (v) => `${v}s`,
  },
  {
    key: "successRate",
    label: "Success rate",
    icon: BadgeCheck,
    format: (v) => `${v}%`,
  },
  {
    key: "missedRate",
    label: "Missed rate",
    icon: PhoneOff,
    format: (v) => `${v}%`,
  },
];

// one colour per line of the trend chart
const TREND_SERIES = [
  { key: "totalCalls", label: "Total", color: CHART_COLORS[0] },
  { key: "successfulCalls", label: "Successful", color: CHART_COLORS[2] },
  { key: "missedCalls", label: "Missed", color: CHART_COLORS[1] },
];

// a status or direction keeps its colour whatever its share is
const SLICE_COLORS = {
  completed: CHART_COLORS[2],
  "no-answer": CHART_COLORS[1],
  busy: CHART_COLORS[3],
  failed: CHART_COLORS[7],
  canceled: CHART_COLORS[4],
  inbound: CHART_COLORS[0],
  incoming: CHART_COLORS[0],
  "outbound-dial": CHART_COLORS[1],
  "outbound-api": CHART_COLORS[6],
};

const toSlices = (rows = [], nameKey) =>
  rows.map((row) => ({
    name: row[nameKey] || "unknown",
    value: row.count || 0,
    color: SLICE_COLORS[row[nameKey]] || CHART_OTHER,
  }));

// The summary figures are either plain numbers or { value, change, trend }.
const toMetric = (metric) =>
  metric !== null && typeof metric === "object" ? metric : { value: metric };

const Distribution = ({ title, slices }) => (
  <Card title={title}>
    {slices.length === 0 ? (
      <p className="py-10 text-center text-sm text-app-text-muted">
        No calls in this period.
      </p>
    ) : (
      <div className="grid items-center gap-5 sm:grid-cols-2">
        <DonutChart data={slices} centerLabel="Calls" unit="calls" />
        <ProgressList
          showShare
          total={slices.reduce((sum, slice) => sum + slice.value, 0)}
          items={slices.map((slice) => ({
            label: slice.name,
            value: slice.value,
            color: slice.color,
          }))}
        />
      </div>
    )}
  </Card>
);

const CallsAnalytics = () => {
  const hid = useSelector(selectHid);
  const [rangeType, setRangeType] = useState("7days");
  // worked out once per choice, so the request is not repeated on every render
  const range = useMemo(() => getDateRange(rangeType), [rangeType]);

  const analytics = useGetCallAnalyticsQuery(
    { hid, ...range },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );
  const data = analytics.data;
  const isLoading = analytics.isLoading || analytics.isUninitialized;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-app-text">
            Call Analytics
          </h2>
          <p className="mt-0.5 text-sm text-app-text-muted">
            Monitor call performance and trends.
          </p>
        </div>
        <div className="w-40">
          <Select
            aria-label="Period"
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
            options={RANGE_OPTIONS}
          />
        </div>
      </div>

      {analytics.isError && (
        <ErrorState
          message="Could not load the call analytics."
          onRetry={analytics.refetch}
        />
      )}

      {isLoading && <Skeleton className="h-80" />}

      {!isLoading && !analytics.isError && !data && (
        <p className="rounded-xl border border-dashed border-app-border! py-10 text-center text-sm text-app-text-muted">
          No call data for this period.
        </p>
      )}

      {data && (
        <div
          className={`space-y-5 transition-opacity ${analytics.isFetching ? "opacity-60" : ""}`}
        >
          <div className="anim-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SUMMARY_CARDS.map(
              ({ key, label, icon, format, lowerIsBetter }) => {
                const metric = toMetric(data.summary?.[key]);
                const value = metric.value ?? 0;

                return (
                  <StatCard
                    key={key}
                    label={label}
                    icon={icon}
                    value={
                      format ? format(value) : Number(value).toLocaleString()
                    }
                    trend={metric.trend}
                    growth={metric.change}
                    caption="vs previous period"
                    lowerIsBetter={lowerIsBetter}
                  />
                );
              },
            )}
          </div>

          <Card title="Call trend" description="Calls per day">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.trend || []}
                  margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid {...gridProps} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDayLabel}
                    minTickGap={24}
                    {...axisProps}
                  />
                  <YAxis allowDecimals={false} {...axisProps} />
                  <Tooltip {...tooltipProps} labelFormatter={formatDayLabel} />
                  <Legend
                    iconType="plainline"
                    wrapperStyle={{
                      fontSize: 12,
                      color: "var(--app-text-muted)",
                    }}
                    formatter={(label) => (
                      <span style={{ color: "var(--app-text)" }}>{label}</span>
                    )}
                  />
                  {TREND_SERIES.map((series) => (
                    <Line
                      key={series.key}
                      type="monotone"
                      name={series.label}
                      dataKey={series.key}
                      stroke={series.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 5,
                        stroke: "var(--app-surface)",
                        strokeWidth: 2,
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Distribution
              title="Calls by status"
              slices={toSlices(data.statusDistribution, "status")}
            />
            <Distribution
              title="Calls by direction"
              slices={toSlices(data.directionDistribution, "direction")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsAnalytics;

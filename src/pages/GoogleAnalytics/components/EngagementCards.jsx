import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DonutChart from "../../../components/Charts/DonutChart";
import {
  axisProps,
  formatCompact,
  formatDayLabel,
  formatDuration,
  gridProps,
} from "../../../components/Charts/chartTheme";
import { metricByKey, percent, totalOf } from "../analyticsUtils";
import ChartTooltip from "./ChartTooltip";
import ReportCard from "./ReportCard";

const SESSIONS = metricByKey("sessions");
const DURATION = metricByKey("avgSessionDuration");

// Sessions per day (bars) against the average session length (line), on
// two axes: is more traffic also staying longer?
export const EngagementChart = ({ rows, loading, className = "" }) => (
  <ReportCard
    className={className}
    title="Sessions & engagement time"
    description="Daily sessions against the average session length"
    loading={loading}
    empty={!rows.length}
    actions={
      <ul className="flex items-center gap-4 text-xs text-app-text-muted">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: SESSIONS.color }} />
          Sessions
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: DURATION.color }} />
          Avg. session
        </li>
      </ul>
    }
  >
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 0, left: -8, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" tickFormatter={formatDayLabel} minTickGap={28} {...axisProps} />
          <YAxis yAxisId="sessions" tickFormatter={formatCompact} width={44} {...axisProps} />
          <YAxis
            yAxisId="duration"
            orientation="right"
            tickFormatter={(v) => formatDuration(v)}
            width={60}
            {...axisProps}
          />
          <Tooltip
            cursor={{ fill: "rgba(127,127,127,0.08)" }}
            content={
              <ChartTooltip
                title={(payload) => formatDayLabel(payload[0].payload.date)}
                rows={(payload) => [
                  {
                    label: "Sessions",
                    value: (payload[0].payload.sessions || 0).toLocaleString(),
                    color: SESSIONS.color,
                  },
                  {
                    label: "Avg. session",
                    value: formatDuration(payload[0].payload.avgSessionDuration || 0),
                    color: DURATION.color,
                  },
                ]}
              />
            }
          />
          <Bar
            yAxisId="sessions"
            dataKey="sessions"
            fill={SESSIONS.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            animationDuration={500}
          />
          <Line
            yAxisId="duration"
            type="monotone"
            dataKey="avgSessionDuration"
            stroke={DURATION.color}
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4, fill: DURATION.color, stroke: "var(--app-surface)", strokeWidth: 2 }}
            animationDuration={600}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </ReportCard>
);

const Ratio = ({ label, value, hint }) => (
  <div className="rounded-lg border border-app-border! bg-app-surface-secondary/50 px-3 py-2.5">
    <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted">{label}</p>
    <p className="mt-0.5 text-lg font-semibold tabular-nums text-app-text">{value}</p>
    {hint && <p className="text-[11px] text-app-text-faint">{hint}</p>}
  </div>
);

// New against returning users, plus how deep a visit goes.
export const AudienceQualityCard = ({ rows, loading, className = "" }) => {
  const users = totalOf(rows, metricByKey("users"));
  const newUsers = Math.min(totalOf(rows, metricByKey("newUsers")), users);
  const returning = Math.max(users - newUsers, 0);
  const sessions = totalOf(rows, SESSIONS);
  const pageViews = totalOf(rows, metricByKey("pageViews"));
  const events = totalOf(rows, metricByKey("eventCount"));

  const slices = [
    { name: "New", value: Math.round(newUsers), color: metricByKey("newUsers").color },
    { name: "Returning", value: Math.round(returning), color: "var(--chart-7)" },
  ];

  return (
    <ReportCard
      className={className}
      title="Visitor quality"
      description="New vs returning users and visit depth"
      loading={loading}
      empty={!users}
    >
      <div className="flex items-center gap-4">
        <div className="w-36 shrink-0">
          <DonutChart data={slices} centerLabel="Users" unit="users" height={144} />
        </div>
        <ul className="flex-1 space-y-2.5 text-sm">
          {slices.map((slice) => (
            <li key={slice.name} className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: slice.color }} />
              <span className="flex-1 text-app-text-muted">{slice.name}</span>
              <span className="font-semibold tabular-nums text-app-text">
                {percent(slice.value, users).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Ratio label="Pages / session" value={sessions ? (pageViews / sessions).toFixed(2) : "—"} />
        <Ratio label="Events / session" value={sessions ? (events / sessions).toFixed(1) : "—"} />
        <Ratio label="Sessions / user" value={users ? (sessions / users).toFixed(2) : "—"} />
      </div>
    </ReportCard>
  );
};

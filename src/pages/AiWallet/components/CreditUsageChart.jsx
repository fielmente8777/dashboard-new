import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  dayEndISO,
  dayStartISO,
  formatCredits,
  formatTokens,
  providerLabel,
  serviceLabel,
} from "../../../components/AiCredits/aiCredits";
import { CHART_COLORS, axisProps, formatCompact, gridProps, tooltipProps } from "../../../components/Charts/chartTheme";
import Card from "../../../components/ui/Card";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import Segmented from "../../../components/ui/Segmented";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetAiUsageQuery } from "../../../redux/api/aiCreditsApi";
import { addDays, toISODate } from "../../../utils/datePresets";

const RANGES = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
  { value: "custom", label: "Custom" },
];

const GROUPS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

// "2026-10-08" -> the Monday of its week / "2026-10"
const bucketOf = (date, group) => {
  if (group === "day") return date;
  if (group === "month") return date.slice(0, 7);
  const day = new Date(`${date}T00:00:00`);
  return toISODate(addDays(day, -((day.getDay() + 6) % 7)));
};

const labelOf = (bucket, group) => {
  const date = new Date(group === "month" ? `${bucket}-01T00:00:00` : `${bucket}T00:00:00`);
  if (group === "month") return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const text = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return group === "week" ? `Week of ${text}` : text;
};

// every day of the period, so quiet days show as zero instead of disappearing
const daysBetween = (start, end) => {
  const days = [];
  for (let d = new Date(`${start}T00:00:00`); toISODate(d) <= end && days.length < 400; d = addDays(d, 1)) {
    days.push(toISODate(d));
  }
  return days;
};

const Breakdown = ({ title, rows, labelOfRow, total }) => (
  <div className="min-w-0">
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">{title}</p>
    {rows.length === 0 ? (
      <p className="text-sm text-app-text-faint">No usage</p>
    ) : (
      <ul className="space-y-2.5">
        {rows.map((row, index) => {
          const share = total ? Math.round((row.credits / total) * 100) : 0;
          return (
            <li key={labelOfRow(row)}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-app-text">{labelOfRow(row)}</span>
                <span className="shrink-0 tabular-nums text-app-text">{formatCredits(row.credits)} credits</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${share}%`, background: CHART_COLORS[index % CHART_COLORS.length] }}
                />
              </div>
              <p className="mt-0.5 text-xs text-app-text-faint">
                {formatTokens(row.totalTokens)} tokens · {formatCredits(row.requests)} requests
              </p>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

// Credits used per day / week / month, and by provider, model and service.
const CreditUsageChart = () => {
  const [range, setRange] = useState(30);
  const [custom, setCustom] = useState(null);
  const [group, setGroup] = useState("day");

  const today = toISODate(new Date());
  const { start, end } =
    range === "custom"
      ? custom?.start
        ? { start: custom.start, end: custom.end || today }
        : { start: null, end: today }
      : { start: toISODate(addDays(new Date(), -(range - 1))), end: today };

  const { data, isFetching, isLoading, error, refetch } = useGetAiUsageQuery(
    { from: dayStartISO(start), to: dayEndISO(end), limit: 1 },
    { skip: !start },
  );
  const summary = data?.summary;

  const chartData = useMemo(() => {
    if (!summary || !start) return [];
    const byDay = new Map(summary.daily.map((d) => [d.date, d.credits]));
    const buckets = new Map();
    for (const day of daysBetween(start, end)) {
      const key = bucketOf(day, group);
      buckets.set(key, (buckets.get(key) || 0) + (byDay.get(day) || 0));
    }
    return [...buckets].map(([bucket, credits]) => ({ bucket, credits }));
  }, [summary, start, end, group]);

  const total = summary?.totals?.credits ?? 0;

  return (
    <Card
      title="Credit usage"
      description={
        summary
          ? `${formatCredits(total)} credits · ${formatTokens(summary.totals.totalTokens)} tokens in this period`
          : "Credits used by your AI services"
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="Group by" options={GROUPS} value={group} onChange={setGroup} />
          <Segmented label="Period" options={RANGES} value={range} onChange={setRange} />
          {range === "custom" && (
            <DateRangePicker value={custom} onChange={setCustom} placeholder="Pick dates" className="h-8!" />
          )}
        </div>
      }
    >
      {!start ? (
        <EmptyState icon={BarChart3} title="Pick a date range" description="Choose the days you want to see." />
      ) : isLoading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load your AI usage.")} onRetry={refetch} />
      ) : total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No usage in this period"
          description="Credits used by the AI chatbot and knowledge base show up here."
        />
      ) : (
        <div className={`space-y-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="bucket"
                  {...axisProps}
                  tickFormatter={(bucket) => labelOf(bucket, group).replace("Week of ", "")}
                  minTickGap={16}
                />
                <YAxis {...axisProps} width={48} tickFormatter={formatCompact} allowDecimals={false} />
                <Tooltip
                  {...tooltipProps}
                  labelFormatter={(bucket) => labelOf(bucket, group)}
                  formatter={(value) => [`${formatCredits(value)} credits`, "Used"]}
                />
                <Bar dataKey="credits" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-6 border-t border-app-border! pt-5 md:grid-cols-3">
            <Breakdown title="By provider" rows={summary.byProvider} labelOfRow={(r) => providerLabel(r.provider)} total={total} />
            <Breakdown
              title="By model"
              rows={summary.byModel}
              labelOfRow={(r) => `${providerLabel(r.provider)} · ${r.model}${r.kind === "embedding" ? " (embeddings)" : ""}`}
              total={total}
            />
            <Breakdown title="By service" rows={summary.byService} labelOfRow={(r) => serviceLabel(r.service)} total={total} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default CreditUsageChart;

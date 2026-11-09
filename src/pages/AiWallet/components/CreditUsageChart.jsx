import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CHART_COLORS,
  axisProps,
  formatCompact,
  gridProps,
  tooltipProps,
} from "../../../components/Charts/chartTheme";
import { formatCredits } from "../../../components/AiCredits/aiCredits";
import Card from "../../../components/ui/Card";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import Segmented from "../../../components/ui/Segmented";
import { EmptyState } from "../../../components/ui/States";
import { BarChart3 } from "lucide-react";
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

// dailyUsage: [{ date: "YYYY-MM-DD", credits }], oldest first
const CreditUsageChart = ({ dailyUsage }) => {
  const [range, setRange] = useState(30);
  const [custom, setCustom] = useState(null);
  const [group, setGroup] = useState("day");

  const data = useMemo(() => {
    const today = toISODate(new Date());
    const { start, end } =
      range === "custom"
        ? custom || { start: "", end: today }
        : { start: toISODate(addDays(new Date(), -(range - 1))), end: today };

    const buckets = new Map();
    dailyUsage
      .filter((day) => day.date >= start && day.date <= end)
      .forEach((day) => {
        const key = bucketOf(day.date, group);
        buckets.set(key, (buckets.get(key) || 0) + day.credits);
      });
    return [...buckets].map(([bucket, credits]) => ({ bucket, credits }));
  }, [dailyUsage, range, custom, group]);

  const total = data.reduce((sum, row) => sum + row.credits, 0);

  return (
    <Card
      title="Credit usage"
      description={`${formatCredits(total)} credits used in this period`}
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
      {data.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No usage in this period"
          description="Pick another period to see how your AI credits were used."
        />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="bucket"
                {...axisProps}
                tickFormatter={(bucket) => labelOf(bucket, group).replace("Week of ", "")}
                minTickGap={16}
              />
              <YAxis {...axisProps} width={48} tickFormatter={formatCompact} />
              <Tooltip
                {...tooltipProps}
                labelFormatter={(bucket) => labelOf(bucket, group)}
                formatter={(value) => [`${formatCredits(value)} credits`, "Used"]}
              />
              <Bar dataKey="credits" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default CreditUsageChart;

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  gridProps,
  tooltipProps,
} from "../../components/Charts/chartTheme";
import DonutChart from "../../components/Charts/DonutChart";
import Card from "../../components/ui/Card";
import PageShell from "../../components/ui/PageShell";
import ProgressList from "../../components/ui/ProgressList";
import StatCard from "../../components/ui/StatCard";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useTenant } from "../../hooks/useTenant";
import { useGetAllEnquiriesQuery } from "../../redux/api/leadsApi";

const DAY = 24 * 60 * 60 * 1000;
const TREND_DAYS = 30;

const PERIODS = [
  { label: "Total enquiries", days: Infinity },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 6 months", days: 180 },
  { label: "Last year", days: 365 },
];

// a stage keeps its colour whatever its share is; the rest are "Other"
const STAGE_COLORS = {
  Open: CHART_COLORS[0],
  Contacted: CHART_COLORS[1],
  Converted: CHART_COLORS[2],
  "Follow Up": CHART_COLORS[3],
  Qualified: CHART_COLORS[4],
  "Turn Away": CHART_COLORS[5],
  "Dead Lead": CHART_COLORS[6],
};

// local "YYYY-MM-DD"
const toDayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Everything the page shows, counted from the raw enquiries.
const summarize = (enquiries) => {
  const now = Date.now();
  const ages = enquiries.map(
    (enquiry) => (now - new Date(enquiry.Created_at).getTime()) / DAY,
  );

  const periods = PERIODS.map((period) => ({
    label: period.label,
    // the total also counts enquiries whose date cannot be read
    count:
      period.days === Infinity
        ? enquiries.length
        : ages.filter((age) => age <= period.days).length,
  }));

  // one bar per day, including the days with no enquiries
  const perDay = new Map();
  for (let offset = TREND_DAYS - 1; offset >= 0; offset -= 1) {
    perDay.set(toDayKey(new Date(now - offset * DAY)), 0);
  }
  enquiries.forEach((enquiry) => {
    const key = toDayKey(new Date(enquiry.Created_at));
    if (perDay.has(key)) perDay.set(key, perDay.get(key) + 1);
  });
  const trend = [...perDay].map(([date, count]) => ({ date, count }));

  const byStage = {};
  enquiries.forEach((enquiry) => {
    const stage = STAGE_COLORS[enquiry.status] ? enquiry.status : "Other";
    byStage[stage] = (byStage[stage] || 0) + 1;
  });
  const stages = Object.entries(byStage)
    .map(([name, value]) => ({
      name,
      value,
      color: STAGE_COLORS[name] || CHART_OTHER,
    }))
    // largest first, "Other" always last
    .sort((a, b) => (a.name === "Other") - (b.name === "Other") || b.value - a.value);

  return { periods, trend, stages };
};

const LeadsAnalytics = () => {
  const { hid } = useTenant();
  const enquiries = useGetAllEnquiriesQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const summary = useMemo(
    () => (enquiries.data ? summarize(enquiries.data) : null),
    [enquiries.data],
  );

  return (
    <PageShell
      title="Enquiries Analytics"
      description="How many enquiries you receive and where they stand."
    >
      {enquiries.isError && (
        <ErrorState
          message="Could not load the enquiries."
          onRetry={enquiries.refetch}
        />
      )}

      {!summary && !enquiries.isError && <Skeleton className="h-80" />}

      {summary && (
        <>
          <div className="anim-stagger grid grid-cols-2 gap-4 lg:grid-cols-5">
            {summary.periods.map((period) => (
              <StatCard
                key={period.label}
                label={period.label}
                value={period.count.toLocaleString()}
              />
            ))}
          </div>

          <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card
              title="Enquiries per day"
              description={`Last ${TREND_DAYS} days`}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.trend}
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
                    <Tooltip
                      {...tooltipProps}
                      labelFormatter={formatDayLabel}
                    />
                    <Bar
                      name="Enquiries"
                      dataKey="count"
                      fill={CHART_COLORS[0]}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Enquiries by stage" description="All time">
              {summary.stages.length === 0 ? (
                <p className="py-10 text-center text-sm text-app-text-muted">
                  No enquiries yet.
                </p>
              ) : (
                <div className="grid items-center gap-5 sm:grid-cols-2">
                  <DonutChart
                    data={summary.stages}
                    centerLabel="Enquiries"
                    unit="enquiries"
                  />
                  <ProgressList
                    showShare
                    total={summary.stages.reduce(
                      (sum, stage) => sum + stage.value,
                      0,
                    )}
                    items={summary.stages.map((stage) => ({
                      label: stage.name,
                      value: stage.value,
                      color: stage.color,
                    }))}
                  />
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
};

export default LeadsAnalytics;

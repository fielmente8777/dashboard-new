import { useGetTrafficSourcesQuery } from "../../redux/api/analyticsApi";
import { CHART_COLORS, CHART_OTHER } from "../Charts/chartTheme";
import Card from "../ui/Card";
import DataTable from "../ui/DataTable";
import ProgressList from "../ui/ProgressList";
import { Skeleton } from "../ui/States";
import { useAnalyticsReport } from "./analyticsRange";
import DonutChart from "../Charts/DonutChart";

// a channel always has the same colour, whatever its rank
const CHANNEL_COLORS = {
  "Organic Search": CHART_COLORS[0],
  Direct: CHART_COLORS[1],
  "Organic Social": CHART_COLORS[2],
  Referral: CHART_COLORS[3],
  Social: CHART_COLORS[4],
  Email: CHART_COLORS[5],
  "Paid Search": CHART_COLORS[6],
  Display: CHART_COLORS[7],
};

const SOURCE_COLUMNS = [
  { key: "source", header: "Source", className: "font-medium" },
  { key: "medium", header: "Medium" },
  {
    key: "sessions",
    header: "Sessions",
    className: "text-right tabular-nums",
    render: (row) => row.sessions.toLocaleString(),
  },
  {
    key: "users",
    header: "Users",
    className: "text-right tabular-nums",
    render: (row) => row.users.toLocaleString(),
  },
];

const TrafficSources = () => {
  const report = useAnalyticsReport(useGetTrafficSourcesQuery);

  if (report.isLoading) return <Skeleton className="h-72" />;
  if (!report.data?.channels.length) return null;

  const { channels, sources } = report.data;
  const totalSessions = channels.reduce((sum, c) => sum + c.sessions, 0);
  const slices = channels.map((channel) => ({
    name: channel.channel,
    value: channel.sessions,
    color: CHANNEL_COLORS[channel.channel] || CHART_OTHER,
  }));

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Traffic by channel" description="Sessions per channel">
        <div className="grid items-center gap-5 sm:grid-cols-2">
          <DonutChart data={slices} centerLabel="Sessions" unit="sessions" />
          <ProgressList
            showShare
            total={totalSessions}
            items={slices.map((slice) => ({
              label: slice.name,
              value: slice.value,
              color: slice.color,
            }))}
          />
        </div>
      </Card>

      {sources.length > 0 && (
        <Card title="Top source / medium">
          <DataTable
            columns={SOURCE_COLUMNS}
            rows={sources.slice(0, 6)}
            rowKey={(row) => `${row.source}-${row.medium}`}
          />
        </Card>
      )}
    </div>
  );
};

export default TrafficSources;

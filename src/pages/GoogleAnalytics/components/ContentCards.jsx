import { ExternalLink, Flag } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAnalyticsReport } from "../../../components/Analytics/analyticsRange";
import { axisProps, formatCompact, formatDuration, gridProps } from "../../../components/Charts/chartTheme";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Icon from "../../../components/ui/Icon";
import { useGetConversionsQuery, useGetTopPagesQuery } from "../../../redux/api/analyticsApi";
import { percent } from "../analyticsUtils";
import ChartTooltip from "./ChartTooltip";
import ReportCard from "./ReportCard";

const NUMBER = "text-right tabular-nums";
const bounceTone = (rate) => (rate > 0.7 ? "red" : rate > 0.4 ? "amber" : "green");

// The most viewed pages with how well each one holds a visitor.
export const TopPagesCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetTopPagesQuery);
  const pages = (report.data || []).slice(0, 10);
  const maxViews = Math.max(...pages.map((p) => p.views), 1);

  const columns = [
    {
      key: "rank",
      header: "#",
      className: "w-10 text-app-text-faint tabular-nums",
      render: (_, i) => i + 1,
    },
    {
      key: "page",
      header: "Page",
      render: (page) => (
        <div className="max-w-md">
          <p className="truncate font-medium" title={page.pageName}>
            {page.pageName}
          </p>
          <a
            href={page.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-app-text-muted hover:text-blue-600 hover:underline dark:hover:text-blue-400"
          >
            <span className="truncate">{page.fullUrl?.replace(/^https?:\/\/[^/]+/, "") || "/"}</span>
            <Icon icon={ExternalLink} size="xs" className="shrink-0" />
          </a>
        </div>
      ),
    },
    {
      key: "views",
      header: "Views",
      className: NUMBER,
      render: (page) => (
        <div className="flex items-center justify-end gap-3">
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-seo-track md:block">
            <div
              className="anim-grow-x h-full rounded-full"
              style={{ width: `${percent(page.views, maxViews)}%`, backgroundColor: "var(--chart-1)" }}
            />
          </div>
          <span className="min-w-12 font-semibold">{page.views.toLocaleString()}</span>
        </div>
      ),
    },
    { key: "users", header: "Users", className: NUMBER, render: (page) => page.users.toLocaleString() },
    {
      key: "perUser",
      header: "Views / user",
      className: `${NUMBER} text-app-text-muted`,
      render: (page) => (page.users ? (page.views / page.users).toFixed(1) : "—"),
    },
    {
      key: "avgDuration",
      header: "Avg. time",
      className: NUMBER,
      render: (page) => formatDuration(page.avgDuration),
    },
    {
      key: "bounceRate",
      header: "Bounce",
      className: "text-right",
      render: (page) => (
        <Badge tone={bounceTone(page.bounceRate)}>{(page.bounceRate * 100).toFixed(1)}%</Badge>
      ),
    },
  ];

  return (
    <ReportCard
      className={className}
      title="Top pages"
      description="The 10 most viewed pages · bounce: green under 40%, red over 70%"
      loading={report.isLoading}
      empty={!pages.length}
    >
      <DataTable columns={columns} rows={pages} rowKey={(page) => page.fullUrl} />
    </ReportCard>
  );
};

// The most triggered events as a bar chart.
export const EventsCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetConversionsQuery);
  const events = (report.data?.events || []).slice(0, 8);

  return (
    <ReportCard
      className={className}
      title="Top events"
      description="Most triggered events"
      loading={report.isLoading}
      empty={!events.length}
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={events} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} vertical horizontal={false} />
            <XAxis type="number" tickFormatter={formatCompact} {...axisProps} />
            <YAxis dataKey="eventName" type="category" width={120} {...axisProps} />
            <Tooltip
              cursor={{ fill: "rgba(127,127,127,0.08)" }}
              content={
                <ChartTooltip
                  title={(payload) => payload[0].payload.eventName}
                  rows={(payload) => [
                    {
                      label: "Events",
                      value: payload[0].payload.eventCount.toLocaleString(),
                      color: "var(--chart-2)",
                    },
                  ]}
                />
              }
            />
            <Bar dataKey="eventCount" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={14} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportCard>
  );
};

// Events marked as key events in GA4.
export const KeyEventsCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetConversionsQuery);
  const conversions = report.data?.conversions || [];

  return (
    <ReportCard
      className={className}
      title="Key events"
      description="Events marked as conversions in GA4"
      loading={report.isLoading}
      empty={!conversions.length}
      emptyText='No key events yet. Mark events as "Key events" in GA4 to track them here.'
    >
      <ul className="space-y-2">
        {conversions.map((c) => (
          <li
            key={c.eventName}
            className="flex items-center gap-3 rounded-lg border border-app-border! bg-app-surface-secondary/50 p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
              <Icon icon={Flag} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-app-text">{c.eventName}</p>
              <p className="mt-0.5 text-xs text-app-text-muted">{c.users.toLocaleString()} users</p>
            </div>
            <p className="text-xl font-semibold tabular-nums text-app-text">
              {c.conversions.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </ReportCard>
  );
};

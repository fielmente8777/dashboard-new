import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { useGetTopPagesQuery } from "../../redux/api/analyticsApi";
import { formatDuration } from "../Charts/chartTheme";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import DataTable from "../ui/DataTable";
import { Skeleton } from "../ui/States";
import { useAnalyticsReport } from "./analyticsRange";
import Icon from "../ui/Icon";

const numberClassName = "text-right tabular-nums";

const getBounceTone = (rate) =>
  rate > 0.7 ? "red" : rate > 0.4 ? "amber" : "green";

const TopPagesTable = () => {
  const report = useAnalyticsReport(useGetTopPagesQuery);
  const pages = report.data;

  const columns = useMemo(() => {
    const maxViews = Math.max(...(pages || []).map((page) => page.views), 1);

    return [
      { key: "rank", header: "#", className: "w-10", render: (_, i) => i + 1 },
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
              className="flex items-center gap-1 text-xs text-app-text-muted hover:text-blue-500 hover:underline"
            >
              <Icon icon={ExternalLink} size="xs" className="shrink-0" />
              <span className="truncate">
                {page.fullUrl?.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </div>
        ),
      },
      {
        key: "views",
        header: "Views",
        className: numberClassName,
        render: (page) => (
          <div className="flex items-center justify-end gap-3">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-app-surface-secondary">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(page.views / maxViews) * 100}%`,
                  backgroundColor: "var(--chart-1)",
                }}
              />
            </div>
            <span className="min-w-12 font-semibold">
              {page.views.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        key: "users",
        header: "Users",
        className: numberClassName,
        render: (page) => page.users.toLocaleString(),
      },
      {
        key: "avgDuration",
        header: "Avg. time",
        className: numberClassName,
        render: (page) => formatDuration(page.avgDuration),
      },
      {
        key: "bounceRate",
        header: "Bounce",
        className: "text-right",
        render: (page) => (
          <Badge tone={getBounceTone(page.bounceRate)}>
            {(page.bounceRate * 100).toFixed(1)}%
          </Badge>
        ),
      },
    ];
  }, [pages]);

  if (report.isLoading) return <Skeleton className="h-72" />;
  if (!pages?.length) return null;

  return (
    <Card title="Top pages" description="Ranked by total page views">
      <DataTable
        columns={columns}
        rows={pages}
        rowKey={(page) => page.fullUrl}
      />
    </Card>
  );
};

export default TopPagesTable;

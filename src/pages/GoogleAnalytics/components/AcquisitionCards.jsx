import DonutChart from "../../../components/Charts/DonutChart";
import { useAnalyticsReport } from "../../../components/Analytics/analyticsRange";
import { useGetTrafficSourcesQuery } from "../../../redux/api/analyticsApi";
import { channelColor, percent } from "../analyticsUtils";
import ReportCard from "./ReportCard";

const ShareBar = ({ value, color = "var(--chart-1)" }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-seo-track">
    <div
      className="anim-grow-x h-full rounded-full"
      style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
    />
  </div>
);

// Sessions per default channel group: a donut and a ranked table.
export const ChannelsCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetTrafficSourcesQuery);
  const channels = report.data?.channels || [];
  const total = channels.reduce((sum, c) => sum + c.sessions, 0);
  const slices = channels.map((c) => ({
    name: c.channel,
    value: c.sessions,
    color: channelColor(c.channel),
  }));

  return (
    <ReportCard
      className={className}
      title="Traffic by channel"
      description="Sessions per default channel group"
      loading={report.isLoading}
      empty={!channels.length}
    >
      <div className="grid flex-1 items-center gap-6 sm:grid-cols-[13rem_1fr]">
        <DonutChart data={slices} centerLabel="Sessions" unit="sessions" height={208} />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-app-text-muted">
              <th className="pb-2 font-medium">Channel</th>
              <th className="pb-2 text-right font-medium">Sessions</th>
              <th className="hidden w-28 pb-2 pl-4 font-medium sm:table-cell">Share</th>
              <th className="pb-2 text-right font-medium">Users</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => {
              const share = percent(c.sessions, total);
              return (
                <tr key={c.channel} className="border-t border-app-border!">
                  <td className="py-2 pr-2">
                    <span className="flex items-center gap-2 text-app-text">
                      <span
                        className="size-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: channelColor(c.channel) }}
                      />
                      <span className="truncate">{c.channel}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right font-semibold tabular-nums text-app-text">
                    {c.sessions.toLocaleString()}
                  </td>
                  <td className="hidden py-2 pl-4 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <ShareBar value={share} color={channelColor(c.channel)} />
                      <span className="w-10 text-right text-xs tabular-nums text-app-text-muted">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 text-right tabular-nums text-app-text-muted">
                    {(c.users ?? 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
};

// The source / medium pairs that bring the most sessions.
export const SourcesCard = ({ className = "" }) => {
  const report = useAnalyticsReport(useGetTrafficSourcesQuery);
  const sources = (report.data?.sources || []).slice(0, 8);
  const max = Math.max(...sources.map((s) => s.sessions), 1);

  return (
    <ReportCard
      className={className}
      title="Top source / medium"
      description="Where sessions come from"
      loading={report.isLoading}
      empty={!sources.length}
    >
      <ul className="space-y-3">
        {sources.map((s) => (
          <li key={`${s.source}-${s.medium}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-medium text-app-text">{s.source}</span>
                <span className="text-app-text-faint"> / </span>
                <span className="text-app-text-muted">{s.medium}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-app-text">{s.sessions.toLocaleString()}</span>
                <span className="ml-2 text-xs text-app-text-muted">
                  {(s.users ?? 0).toLocaleString()} users
                </span>
              </span>
            </div>
            <ShareBar value={percent(s.sessions, max)} />
          </li>
        ))}
      </ul>
    </ReportCard>
  );
};

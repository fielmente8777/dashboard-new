import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, axisProps, gridProps, tooltipProps } from "../../components/Charts/chartTheme";
import StatCard from "../../components/ui/StatCard";
import { Skeleton } from "../../components/ui/States";
import { SOURCE_LABELS, formatNumber, monthLabel } from "./newsletterUtils";

// The four numbers, 12 months of joins and leaves, and where subscribers came from.
export default function NewsletterOverview({ stats, loading }) {
  // on a phone the two charts fold away, so the list below is not a long scroll down
  const [showCharts, setShowCharts] = useState(false);
  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const rate = stats.total ? Math.round((stats.unsubscribed / stats.total) * 1000) / 10 : 0;
  const chart = (stats.months || []).map((m) => ({ ...m, label: monthLabel(m.month) }));
  const hasHistory = chart.some((m) => m.subscribed || m.unsubscribed);
  const sources = Object.entries(stats.bySource || {})
    .filter(([source]) => source !== "campaign")
    .sort((a, b) => b[1] - a[1]);
  const sourceTotal = sources.reduce((n, [, count]) => n + count, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Subscribers" value={formatNumber(stats.subscribed)} caption="Get your newsletters now" />
        <StatCard
          label="New, last 30 days"
          value={formatNumber(stats.newLast30Days)}
          trend={stats.newLast30Days > 0 ? "up" : undefined}
          caption="Joined and still subscribed"
        />
        <StatCard
          label="Left, last 30 days"
          value={formatNumber(stats.unsubscribedLast30Days)}
          lowerIsBetter
          trend={stats.unsubscribedLast30Days > 0 ? "down" : undefined}
          caption="Unsubscribed"
        />
        <StatCard
          label="Unsubscribe rate"
          value={`${rate}%`}
          caption={`${formatNumber(stats.unsubscribed)} of ${formatNumber(stats.total)} ever`}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowCharts((v) => !v)}
        aria-expanded={showCharts}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-app-border! bg-app-surface py-2 text-xs font-medium text-app-text-muted sm:hidden"
      >
        {showCharts ? "Hide growth and sources" : "Show growth and sources"}
        <ChevronDown className={`size-3.5 transition ${showCharts ? "rotate-180" : ""}`} />
      </button>

      <div className={`gap-4 lg:grid-cols-3 ${showCharts ? "grid" : "hidden sm:grid"}`}>
        <section className="rounded-xl border border-app-border! bg-app-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-app-text">Growth, last 12 months</h2>
          <p className="mb-3 text-xs text-app-text-muted">People who joined and who left, each month.</p>
          {hasHistory ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis allowDecimals={false} {...axisProps} />
                  <Tooltip {...tooltipProps} />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                  <Bar dataKey="subscribed" name="Joined" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="unsubscribed" name="Left" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="grid h-56 place-content-center text-center text-sm text-app-text-muted">
              Nothing in the last 12 months yet.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-app-border! bg-app-surface p-4">
          <h2 className="text-sm font-semibold text-app-text">Where they came from</h2>
          <p className="mb-4 text-xs text-app-text-muted">Everyone on the list, by how they joined.</p>
          {sources.length ? (
            <ul className="space-y-3">
              {sources.map(([source, count], i) => {
                const share = sourceTotal ? Math.round((count / sourceTotal) * 100) : 0;
                return (
                  <li key={source}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-app-text">{SOURCE_LABELS[source] || source}</span>
                      <span className="tabular-nums text-app-text-muted">
                        {formatNumber(count)} · {share}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-app-surface-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${share}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-app-text-muted">No subscribers yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

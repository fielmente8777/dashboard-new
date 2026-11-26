import { CircleCheck, MailOpen, MousePointerClick, RefreshCw, Send, TriangleAlert, UserX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmtPct, pct, TIME_ZONE } from "./analyticsFormat";
import { BarChart, Delta, Kpi } from "./analyticsParts";
import { formatNumber } from "../../pages/EmailMarketing/emailUtils.js";
import { getEmailPerformance } from "../../redux/api/emailMarketingApi";
import IconButton from "../ui/IconButton";
import { Skeleton } from "../ui/States";
import SentBySenderPanel from "./SentBySenderPanel";

const DAY = 24 * 60 * 60 * 1000;
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
// periods end tonight at midnight, in the user's own time zone
const PERIODS = [
  { value: "today", label: "Today", days: 1, compare: "yesterday" },
  { value: "7d", label: "7 days", days: 7, compare: "the 7 days before" },
  { value: "30d", label: "30 days", days: 30, compare: "the 30 days before" },
  { value: "90d", label: "90 days", days: 90, compare: "the 90 days before" },
];
const rangeOf = (period) => {
  const end = new Date(startOfToday().getTime() + DAY);
  return { from: new Date(end.getTime() - period.days * DAY), to: end };
};
// Email marketing → Sent: how emails are doing in a period, against the period
// before it: six headline numbers, emails sent per day, and who sent them.
//   reloadSignal       change it to count again (after sending)
//   onOpenCampaign(id) a campaign picked in "Sent by"
export default function PerformancePanel({ reloadSignal = 0, onOpenCampaign }) {
  const [periodValue, setPeriodValue] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState("");
  const period = PERIODS.find((p) => p.value === periodValue);
  const range = useMemo(() => ({ ...rangeOf(period), label: period.value === "today" ? "today" : `in the last ${period.label}` }), [period]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed("");
    try {
      setData(await getEmailPerformance({ from: range.from.toISOString(), to: range.to.toISOString(), tz: TIME_ZONE }));
    } catch (error) {
      setFailed(error?.message || "Couldn't load the numbers.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load, reloadSignal]);

  const now = data?.current;
  // no earlier period in the answer: compare with zeros instead of failing
  const before = data?.previous || { sent: 0, failed: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0 };
  const buckets = data?.buckets || [];
  // reached = accepted by the guest's mail server (sent) out of everything tried
  const tried = (x) => (x ? x.sent + x.failed : 0);

  return (
    <section className="rounded-xl border border-app-border! bg-app-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-app-text">Performance</h2>
          <p className="text-xs text-app-text-muted">
            Every email sent {range.label}, compared with {period.compare}. Opens and clicks count until now.
          </p>
        </div>
        <div className="hide-scrollbar flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-app-surface-secondary p-0.5 ring-1 ring-app-border">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriodValue(p.value)}
              aria-pressed={periodValue === p.value}
              className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition ${
                periodValue === p.value ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted hover:text-app-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <IconButton icon={RefreshCw} label="Refresh" onClick={load} className={loading && data ? "animate-spin" : ""} />
      </div>

      {failed && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          <TriangleAlert className="size-4" /> {failed}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {!now
          ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
          : (
            <>
              <Kpi
                icon={Send}
                tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                label="Emails sent"
                value={formatNumber(now.sent)}
                delta={<Delta now={now.sent} before={before.sent} />}
                caption={before.sent ? `vs ${formatNumber(before.sent)}` : ""}
              />
              <Kpi
                icon={CircleCheck}
                tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                label="Delivered"
                value={fmtPct(pct(now.sent, tried(now)))}
                title="Accepted by the guests' mail servers, out of every email tried. Amazon also confirms each delivery; a hotel's own mail server does not."
                delta={<Delta now={pct(now.sent, tried(now))} before={pct(before.sent, tried(before))} points />}
                caption={now.delivered ? `${formatNumber(now.delivered)} confirmed` : `${formatNumber(now.sent)} accepted`}
              />
              <Kpi
                icon={MailOpen}
                tone="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                label="Open rate"
                value={fmtPct(pct(now.opened, now.sent))}
                delta={<Delta now={pct(now.opened, now.sent)} before={pct(before.opened, before.sent)} points />}
                caption={`${formatNumber(now.opened)} people`}
              />
              <Kpi
                icon={MousePointerClick}
                tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                label="Click rate"
                value={fmtPct(pct(now.clicked, now.sent))}
                delta={<Delta now={pct(now.clicked, now.sent)} before={pct(before.clicked, before.sent)} points />}
                caption={`${formatNumber(now.clicked)} people`}
              />
              <Kpi
                icon={TriangleAlert}
                tone="bg-red-500/10 text-red-600 dark:text-red-400"
                label="Failed"
                value={formatNumber(now.failed)}
                delta={<Delta now={now.failed} before={before.failed} goodWhenUp={false} />}
                caption={tried(now) ? `${fmtPct(pct(now.failed, tried(now)))} of tried` : ""}
              />
              <Kpi
                icon={UserX}
                tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                label="Unsubscribed"
                value={formatNumber(now.unsubscribed)}
                delta={<Delta now={now.unsubscribed} before={before.unsubscribed} goodWhenUp={false} />}
                caption=""
              />
            </>
          )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-app-border! px-4 py-3">
          <h3 className="text-sm font-semibold text-app-text">Emails sent per {data?.unit === "hour" ? "hour" : "day"}</h3>
          <p className="text-xs text-app-text-muted">
            <span className="sm:hidden">Tap</span>
            <span className="hidden sm:inline">Hover</span> a bar for sent, opened and clicked
          </p>
          {data ? (
            buckets.some((b) => b.sent) ? (
              <BarChart
                buckets={buckets}
                unit={data.unit}
                value={(b) => b.sent}
                describe={(b) => `${b.sent} sent, ${b.opened} opened, ${b.clicked} clicked`}
                tooltip={(b) => (
                  <>
                    <b>{formatNumber(b.sent)} sent</b> · {formatNumber(b.opened)} opened · {formatNumber(b.clicked)} clicked
                  </>
                )}
              />
            ) : (
              <p className="flex h-52 items-center justify-center text-sm text-app-text-muted">No emails sent {range.label}.</p>
            )
          ) : (
            <Skeleton className="mt-3 h-52 rounded-lg" />
          )}
        </div>
        <SentBySenderPanel range={range} reloadSignal={reloadSignal} onOpenCampaign={onOpenCampaign} />
      </div>
    </section>
  );
}

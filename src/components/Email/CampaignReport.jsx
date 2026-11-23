import { ArrowRight, CircleCheck, MailOpen, MousePointerClick, Send, TriangleAlert, UserX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { describeSendProblem, formatDate, formatNumber } from "../../pages/EmailMarketing/emailUtils.js";
import useStaleAfter from "../../hooks/useStaleAfter";
import { getCampaignReport } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import RefreshNotice from "../ui/RefreshNotice";
import { Skeleton } from "../ui/States";
import { STALE_IDLE_MS } from "./staleTimes";
import { bucketLabel, fmtPct, pct, TIME_ZONE } from "./analyticsFormat";
import { BarChart, Delta, Kpi } from "./analyticsParts";
import CampaignDeliveryBar from "./CampaignDeliveryBar";

const LIVE = ["sending", "stopping"];

// one step of "From sent to click": a bar as wide as its share of the emails sent
function FunnelStep({ label, value, of, note, onShow }) {
  const share = pct(value, of);
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-app-text">{label}</span>
        <span className="tabular-nums text-app-text">
          <b>{formatNumber(value)}</b> <span className="text-xs text-app-text-muted">{fmtPct(share)}</span>
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-app-surface-secondary">
        <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: `${Math.max(value ? 1 : 0, share)}%` }} />
      </div>
      {(note || onShow) && (
        <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-app-text-muted">
          <span>{note}</span>
          {onShow && value > 0 && (
            <button type="button" onClick={onShow} className="inline-flex items-center gap-0.5 font-medium text-blue-600 hover:underline dark:text-blue-400">
              See who <ArrowRight className="size-3" />
            </button>
          )}
        </p>
      )}
    </li>
  );
}

// One campaign's report (open an email → Report): its six numbers against the
// property's average of the 90 days before it, from sent to click, when people
// opened, and why some failed. "See who" opens the Recipients tab filtered.
//   campaign             the campaign (status, for following a send in progress)
//   onShowRecipients(f)  open Recipients with filter f ("opened", "clicked", "failed")
//   onChanged()          retried / resumed: reload the campaign
export default function CampaignReport({ campaign, campaignId, onShowRecipients, onChanged }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await getCampaignReport({ campaignId, tz: TIME_ZONE }));
      setFailed("");
    } catch (error) {
      setFailed(error?.message || "Couldn't load the report.");
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  // No auto-refresh (it loaded the server). While it is going out the delivery
  // bar offers Refresh; once sent, opens and clicks still come in, so a line
  // offers Refresh after a while. One Refresh reloads the report and the bar.
  const live = LIVE.includes(campaign?.status);
  const [refreshing, setRefreshing] = useState(false);
  const [barSignal, setBarSignal] = useState(0);
  const { stale, loadedAt, markFresh } = useStaleAfter(STALE_IDLE_MS, { enabled: Boolean(data) && !live });
  useEffect(() => {
    markFresh();
  }, [data, markFresh]);
  const refresh = async () => {
    setRefreshing(true);
    setBarSignal((s) => s + 1);
    try {
      await Promise.all([load(), onChanged?.()]);
    } finally {
      setRefreshing(false);
    }
  };

  // failure reasons in plain words, the same reason counted once
  const reasons = useMemo(() => {
    const merged = new Map();
    for (const f of data?.failures || []) {
      const { title, hint } = describeSendProblem(f.error);
      const row = merged.get(title) || { title, hint, count: 0 };
      row.count += f.count;
      merged.set(title, row);
    }
    return [...merged.values()].sort((a, b) => b.count - a.count);
  }, [data]);

  const peak = useMemo(() => {
    const top = (data?.buckets || []).reduce((best, b) => (!best || b.opened > best.opened ? b : best), null);
    return top?.opened ? top : null;
  }, [data]);

  if (failed && !data) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
        <TriangleAlert className="size-4" /> {failed}
        <Button size="sm" variant="ghost" onClick={load} className="ml-auto">
          Try again
        </Button>
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const t = data.totals;
  const avg = data.average;
  const tried = t.sent + t.failed;
  const openRate = pct(t.opened, t.sent);
  const clickRate = pct(t.clicked, t.sent);
  const avgOpen = avg ? pct(avg.opened, avg.sent) : null;
  const avgClick = avg ? pct(avg.clicked, avg.sent) : null;
  const vsAverage = (now, before) => (avg ? <Delta now={now} before={before} points /> : null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-app-text-muted">
        {data.firstSentAt ? (
          <>
            Went out {formatDate(data.firstSentAt, true)} to {formatNumber(t.recipients)} {t.recipients === 1 ? "person" : "people"}
            {t.pending > 0 && <> · {formatNumber(t.pending)} still to go</>}.{" "}
            {avg
              ? "▲ / ▼ compare with your emails of the 90 days before it."
              : "No emails in the 90 days before it to compare with."}
          </>
        ) : (
          <>Nothing has gone out yet. The numbers appear here as soon as it starts sending.</>
        )}
      </p>

      <RefreshNotice show={stale} loadedAt={loadedAt} refreshing={refreshing} onRefresh={refresh}>
        New opens and clicks may have come in.
      </RefreshNotice>

      <CampaignDeliveryBar
        campaignId={campaignId}
        refreshSignal={barSignal}
        onChanged={() => Promise.all([load(), onChanged?.()])}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          icon={Send}
          tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          label="Emails sent"
          value={formatNumber(t.sent)}
          caption={`of ${formatNumber(t.recipients)} recipients`}
        />
        <Kpi
          icon={CircleCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          label="Delivered"
          value={fmtPct(pct(t.sent, tried))}
          title="Accepted by the guests' mail servers, out of every email tried. Amazon also confirms each delivery; a hotel's own mail server does not."
          caption={t.delivered ? `${formatNumber(t.delivered)} confirmed` : `${formatNumber(t.sent)} accepted`}
        />
        <Kpi
          icon={MailOpen}
          tone="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          label="Open rate"
          value={fmtPct(openRate)}
          delta={vsAverage(openRate, avgOpen)}
          caption={`${formatNumber(t.opened)} people${avg ? ` · avg ${fmtPct(avgOpen)}` : ""}`}
        />
        <Kpi
          icon={MousePointerClick}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          label="Click rate"
          value={fmtPct(clickRate)}
          delta={vsAverage(clickRate, avgClick)}
          caption={`${formatNumber(t.clicked)} people${avg ? ` · avg ${fmtPct(avgClick)}` : ""}`}
        />
        <Kpi
          icon={TriangleAlert}
          tone="bg-red-500/10 text-red-600 dark:text-red-400"
          label="Failed"
          value={formatNumber(t.failed)}
          caption={tried ? `${fmtPct(pct(t.failed, tried))} of tried` : ""}
        />
        <Kpi
          icon={UserX}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          label="Unsubscribed"
          value={formatNumber(t.unsubscribed)}
          caption={t.unsubscribed ? `${fmtPct(pct(t.unsubscribed, t.recipients))} of recipients` : ""}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col rounded-xl border border-app-border! bg-app-surface px-4 py-3">
          <h3 className="text-sm font-semibold text-app-text">Opens per {data.unit === "hour" ? "hour" : "day"}</h3>
          <p className="text-xs text-app-text-muted">
            {peak
              ? `People opening it for the first time · most on ${bucketLabel(peak.key, data.unit, true)} (${formatNumber(peak.opened)})`
              : "People opening it for the first time · hover a bar for opens and clicks"}
          </p>
          {data.buckets.some((b) => b.opened || b.clicked) ? (
            <BarChart
              buckets={data.buckets}
              unit={data.unit}
              className="h-52 lg:h-auto lg:min-h-52 lg:flex-1"
              value={(b) => b.opened}
              describe={(b) => `${b.opened} opened, ${b.clicked} clicked`}
              tooltip={(b) => (
                <>
                  <b>{formatNumber(b.opened)} opened</b> · {formatNumber(b.clicked)} clicked
                </>
              )}
            />
          ) : (
            <p className="flex h-52 items-center justify-center text-sm text-app-text-muted">No opens yet.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-app-border! bg-app-surface px-4 py-3">
            <h3 className="text-sm font-semibold text-app-text">From sent to click</h3>
            <p className="text-xs text-app-text-muted">Share of the emails that went out</p>
            <ul className="mt-3 space-y-3">
              <FunnelStep label="Sent" value={t.sent} of={t.sent} />
              {t.delivered > 0 && <FunnelStep label="Delivered (confirmed)" value={t.delivered} of={t.sent} />}
              <FunnelStep label="Opened" value={t.opened} of={t.sent} onShow={() => onShowRecipients("opened")} />
              <FunnelStep
                label="Clicked"
                value={t.clicked}
                of={t.sent}
                note={t.opened ? `${fmtPct(pct(t.clicked, t.opened))} of those who opened` : ""}
                onShow={() => onShowRecipients("clicked")}
              />
            </ul>
          </div>

          {t.failed > 0 && (
            <div className="rounded-xl border border-app-border! bg-app-surface px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-app-text">Why {formatNumber(t.failed)} failed</h3>
                <button
                  type="button"
                  onClick={() => onShowRecipients("failed")}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  See who <ArrowRight className="size-3" />
                </button>
              </div>
              <ul className="mt-2 space-y-2">
                {reasons.map((r) => (
                  <li key={r.title} className="flex gap-2 text-sm">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-app-text">{r.title}</span>
                      <span className="block text-xs text-app-text-muted">{r.hint}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-app-text">{formatNumber(r.count)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

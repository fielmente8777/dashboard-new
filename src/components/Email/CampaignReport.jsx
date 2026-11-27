import { ArrowRight, Ban, CircleCheck, CloudDownload, CloudOff, Loader2, MailOpen, MailX, MousePointerClick, Send, ShieldAlert, TriangleAlert, UserX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { describeSendProblem, formatDate, formatNumber } from "../../pages/EmailMarketing/emailUtils.js";
import useStaleAfter from "../../hooks/useStaleAfter";
import { getCampaignReport, startAmazonSync } from "../../redux/api/emailMarketingApi";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import RefreshNotice from "../ui/RefreshNotice";
import { Skeleton } from "../ui/States";
import { STALE_IDLE_MS } from "./staleTimes";
import { bucketLabel, fmtPct, pct, TIME_ZONE } from "./analyticsFormat";
import { Delta, Kpi, TrendChart } from "./analyticsParts";
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
//   renderRecipients(filter, onClose)  the people behind a card, shown right under the cards
export default function CampaignReport({ campaign, campaignId, onShowRecipients, onChanged, renderRecipients }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState("");
  const { showToast } = useToast();
  // the card whose people are listed under the cards ("" = none)
  const [shown, setShown] = useState("");
  const show = (filter) => {
    if (!renderRecipients) return onShowRecipients?.(filter);
    setShown((current) => (current === filter ? "" : filter));
  };

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

  // getting the results from Amazon: reload every 5 s until it is done
  const syncing = data?.amazon?.sync?.status === "running";
  useEffect(() => {
    if (!syncing) return undefined;
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [syncing, load]);
  const [startingSync, setStartingSync] = useState(false);
  const getFromAmazon = async () => {
    setStartingSync(true);
    try {
      await startAmazonSync({ campaignId });
      await load();
    } catch (error) {
      showToast({ message: error?.message || "Couldn't reach Amazon. Please try again.", type: "error" });
    } finally {
      setStartingSync(false);
    }
  };

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
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
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

      {t.viaAmazon > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
          <CloudDownload className="size-3.5 shrink-0" aria-hidden />
          {syncing ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Getting each email&apos;s result from Amazon: {formatNumber(data.amazon.sync.checked)} of {formatNumber(data.amazon.sync.total)}…
            </span>
          ) : (
            <span>
              Delivery, bounces and spam complaints come from Amazon
              {data.amazon?.sync?.finishedAt ? ` · last checked ${formatDate(data.amazon.sync.finishedAt, true)}` : ""}.
            </span>
          )}
          {!syncing && (
            <button type="button" onClick={getFromAmazon} disabled={startingSync} className="font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400">
              {startingSync ? "Starting…" : "Get latest from Amazon"}
            </button>
          )}
        </div>
      ) : (
        t.sent > 0 && (
          <p className="text-xs text-app-text-muted">
            Sent from your own mailbox: bounces and spam complaints go back to that inbox, so they can&apos;t be counted here. Send through Amazon (Sender
            settings) to track everything.
          </p>
        )
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          icon={Send}
          tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          label="Emails sent"
          value={formatNumber(t.sent)}
          caption={`of ${formatNumber(t.recipients)} recipients`}
          onClick={() => show("sent")}
          active={shown === "sent"}
        />
        <Kpi
          icon={CircleCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          label="Delivered"
          value={fmtPct(t.viaAmazon ? pct(t.delivered, tried) : pct(t.sent, tried))}
          title={
            t.viaAmazon
              ? "Confirmed by the guest's mail server (Amazon's report), out of every email tried."
              : "Accepted by your mailbox for sending, out of every email tried. Your own mail server doesn't report deliveries."
          }
          caption={t.viaAmazon ? `${formatNumber(t.delivered)} confirmed` : `${formatNumber(t.sent)} accepted`}
          onClick={() => show(t.viaAmazon ? "delivered" : "sent")}
          active={shown === "delivered"}
        />
        <Kpi
          icon={MailOpen}
          tone="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          label="Open rate"
          value={fmtPct(openRate)}
          delta={vsAverage(openRate, avgOpen)}
          caption={`${formatNumber(t.opened)} people${avg ? ` · avg ${fmtPct(avgOpen)}` : ""}`}
          onClick={() => show("opened")}
          active={shown === "opened"}
        />
        <Kpi
          icon={MousePointerClick}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          label="Click rate"
          value={fmtPct(clickRate)}
          delta={vsAverage(clickRate, avgClick)}
          caption={`${formatNumber(t.clicked)} people${avg ? ` · avg ${fmtPct(avgClick)}` : ""}`}
          onClick={() => show("clicked")}
          active={shown === "clicked"}
        />
        <Kpi
          icon={TriangleAlert}
          tone="bg-red-500/10 text-red-600 dark:text-red-400"
          label="Failed"
          value={formatNumber(t.failed)}
          caption={tried ? `${fmtPct(pct(t.failed, tried))} of tried` : ""}
          onClick={() => show("failed")}
          active={shown === "failed"}
        />
        <Kpi
          icon={UserX}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          label="Unsubscribed"
          value={formatNumber(t.unsubscribed)}
          caption={t.unsubscribed ? `${fmtPct(pct(t.unsubscribed, t.recipients))} of recipients` : ""}
          onClick={() => show("unsubscribed")}
          active={shown === "unsubscribed"}
        />
        {t.viaAmazon > 0 && (
          <>
            <Kpi
              icon={Ban}
              tone="bg-red-500/10 text-red-600 dark:text-red-400"
              label="Hard bounces"
              value={formatNumber(t.hardBounced)}
              title="The address doesn't exist or can't receive email. They are on your do-not-email list now and never emailed again. Amazon's limit: under 5% bounces."
              caption={tried ? `${fmtPct(pct(t.hardBounced, tried))} of tried${pct(t.hardBounced, tried) >= 5 ? " · too high" : ""}` : ""}
              onClick={() => show("hard_bounced")}
              active={shown === "hard_bounced"}
            />
            <Kpi
              icon={CloudOff}
              tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              label="Soft bounces"
              value={formatNumber(t.softBounced)}
              title="A temporary problem (mailbox full, server busy). Amazon tried again; most arrive later."
              caption="mailbox full, server busy"
              onClick={() => show("soft_bounced")}
              active={shown === "soft_bounced"}
            />
            <Kpi
              icon={ShieldAlert}
              tone="bg-rose-500/10 text-rose-600 dark:text-rose-400"
              label="Spam complaints"
              value={formatNumber(t.complained)}
              title="Guests who pressed 'Report spam'. They are unsubscribed for good. Amazon's limit: under 0.1%."
              caption={t.delivered ? `${fmtPct(pct(t.complained, t.delivered))} of delivered` : ""}
              onClick={() => show("complained")}
              active={shown === "complained"}
            />
            <Kpi
              icon={MailX}
              tone="bg-slate-500/10 text-slate-600 dark:text-slate-300"
              label="Not opened"
              value={formatNumber(t.notOpened)}
              caption={t.sent ? `${fmtPct(pct(t.notOpened, t.sent))} of sent` : ""}
              onClick={() => show("not_opened")}
              active={shown === "not_opened"}
            />
          </>
        )}
      </div>

      {shown && renderRecipients?.(shown, () => setShown(""))}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col rounded-xl border border-app-border! bg-app-surface px-3 py-3 sm:px-4">
          <h3 className="text-sm font-semibold text-app-text">Opens and clicks, per {data.unit === "hour" ? "hour" : "day"}</h3>
          <p className="text-xs text-app-text-muted">
            {peak
              ? `People opening it for the first time · most on ${bucketLabel(peak.key, data.unit, true)} (${formatNumber(peak.opened)})`
              : "People opening it for the first time"}
          </p>
          {data.buckets.some((b) => b.opened || b.clicked) ? (
            <TrendChart
              buckets={data.buckets}
              unit={data.unit}
              series={[
                { key: "opened", label: "Opened", color: "var(--chart-2)" },
                { key: "clicked", label: "Clicked", color: "var(--chart-3)" },
              ]}
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
              <FunnelStep label="Opened" value={t.opened} of={t.sent} onShow={() => show("opened")} />
              <FunnelStep
                label="Clicked"
                value={t.clicked}
                of={t.sent}
                note={t.opened ? `${fmtPct(pct(t.clicked, t.opened))} of those who opened` : ""}
                onShow={() => show("clicked")}
              />
            </ul>
          </div>

          {data.providers?.length > 0 && (
            <div className="rounded-xl border border-app-border! bg-app-surface px-4 py-3">
              <h3 className="text-sm font-semibold text-app-text">By mailbox provider</h3>
              <p className="text-xs text-app-text-muted">Where Amazon could tell (company mailboxes are not named)</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {data.providers.map((p) => (
                  <li key={p.provider} className="flex items-center justify-between gap-2">
                    <span className="truncate text-app-text">{p.provider}</span>
                    <span className="shrink-0 text-xs tabular-nums text-app-text-muted">
                      {formatNumber(p.sent)} sent · {fmtPct(pct(p.opened, p.sent))} opened
                      {p.bounced ? <span className="text-red-600 dark:text-red-400"> · {formatNumber(p.bounced)} bounced</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {t.failed > 0 && (
            <div className="rounded-xl border border-app-border! bg-app-surface px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-app-text">Why {formatNumber(t.failed)} failed</h3>
                <button
                  type="button"
                  onClick={() => show("failed")}
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

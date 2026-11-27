import { Activity, Ban, CircleCheck, Lightbulb, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getSenderHealth } from "../../redux/api/emailMarketingApi";
import { formatDate, formatNumber } from "../../pages/EmailMarketing/emailUtils.js";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Notice from "../ui/Notice";
import { Skeleton } from "../ui/States";
import { Kpi } from "./analyticsParts";

const LEVEL = {
  good: { tone: "green", label: "Healthy", icon: ShieldCheck },
  warning: { tone: "amber", label: "Needs attention", icon: ShieldAlert },
  danger: { tone: "red", label: "At risk", icon: ShieldAlert },
  unknown: { tone: "gray", label: "No data yet", icon: Activity },
};

/**
 * Sender health (Email marketing → Sender health): the last 30 days of this property's sender
 * in Amazon (delivered, hard / soft bounces, spam complaints, opens, clicks) next to Amazon's
 * limits, the domain's signature, and plain-words advice. Like Mailchimp's "Audience health".
 */
export default function SenderHealthPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    try {
      setData(await getSenderHealth({ fresh }));
      setError("");
    } catch (e) {
      setError(e?.message || "Couldn't load sender health.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !data) return <Notice tone="warning">{error}</Notice>;
  if (!data)
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
    );

  const level = LEVEL[data.level] || LEVEL.unknown;
  const t = data.totals || {};
  const maxDay = Math.max(1, ...(data.daily || []).map((d) => d.sent));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-app-text">Sender health</h2>
        <Badge tone={level.tone}>{level.label}</Badge>
        {data.identity && <span className="text-xs text-app-text-muted">{data.identity} · last 30 days</span>}
        <Button size="sm" variant="ghost" icon={RefreshCw} loading={loading} onClick={() => load(true)} className="ml-auto">
          Refresh
        </Button>
      </div>

      {data.advice?.length > 0 && (
        <Notice tone={data.level === "danger" ? "warning" : "info"} icon={Lightbulb} title="What to do">
          <ul className="list-disc space-y-1 pl-4">
            {data.advice.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Notice>
      )}

      {data.identity && (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Kpi icon={Activity} tone="bg-blue-500/10 text-blue-600 dark:text-blue-400" label="Sent" value={formatNumber(t.SEND)} caption="last 30 days" />
            <Kpi
              icon={CircleCheck}
              tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              label="Delivered"
              value={`${data.rates.delivery}%`}
              caption={`${formatNumber(t.DELIVERY)} emails`}
            />
            <Kpi
              icon={Ban}
              tone="bg-red-500/10 text-red-600 dark:text-red-400"
              label="Hard bounce rate"
              value={`${data.rates.bounce}%`}
              caption={`${formatNumber(t.PERMANENT_BOUNCE)} · limit under 5%`}
              title="Amazon reviews the account above 5% and can pause sending near 10%."
            />
            <Kpi
              icon={Ban}
              tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              label="Soft bounces"
              value={formatNumber(t.TRANSIENT_BOUNCE)}
              caption="mailbox full, server busy"
            />
            <Kpi
              icon={ShieldAlert}
              tone="bg-rose-500/10 text-rose-600 dark:text-rose-400"
              label="Spam complaint rate"
              value={`${data.rates.complaint}%`}
              caption={`${formatNumber(t.COMPLAINT)} · limit under 0.1%`}
            />
            <Kpi
              icon={ShieldCheck}
              tone="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              label="Opened / clicked"
              value={`${data.rates.open}%`}
              caption={`${data.rates.click}% clicked`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="min-w-0 rounded-xl border border-app-border! bg-app-surface px-4 py-3">
              <h3 className="text-sm font-semibold text-app-text">Per day</h3>
              <p className="text-xs text-app-text-muted">Sent, with hard bounces in red</p>
              {data.daily?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {data.daily.map((d) => (
                    <li key={d.day} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2 text-xs">
                      <span className="text-app-text-muted">{formatDate(d.day)}</span>
                      <span className="flex h-2 overflow-hidden rounded-full bg-app-surface-secondary">
                        <span className="h-full bg-blue-600 dark:bg-blue-500" style={{ width: `${((d.sent - d.hardBounced) / maxDay) * 100}%` }} />
                        <span className="h-full bg-red-500" style={{ width: `${(d.hardBounced / maxDay) * 100}%` }} />
                      </span>
                      <span className="tabular-nums text-app-text">
                        {formatNumber(d.sent)}
                        {d.hardBounced ? <span className="text-red-600 dark:text-red-400"> · {formatNumber(d.hardBounced)} bounced</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-app-text-muted">Nothing sent through Amazon in the last 30 days.</p>
              )}
            </div>
            <div className="space-y-2 rounded-xl border border-app-border! bg-app-surface px-4 py-3 text-sm">
              <h3 className="font-semibold text-app-text">Sender set-up</h3>
              <Row ok={data.verified} label="Sender verified in Amazon" />
              <Row ok={data.dkim === "SUCCESS"} label={`Domain signature (DKIM): ${data.dkim ? data.dkim.toLowerCase() : "not set"}`} />
              <Row ok={data.liveEvents} label={data.liveEvents ? "Amazon reports each result live" : "Results are fetched from Amazon every 30 minutes"} />
              <Row ok={!data.feedbackForwarding} label={data.feedbackForwarding ? "Bounce notices are emailed to your inbox" : "Bounce notices stay out of your inbox"} />
              <Row ok={data.account === "HEALTHY"} label={`Eazotel's Amazon account: ${data.account ? data.account.toLowerCase() : "unknown"}`} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Row({ ok, label }) {
  return (
    <p className="flex items-start gap-2">
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden />
      <span className="text-app-text">{label}</span>
    </p>
  );
}

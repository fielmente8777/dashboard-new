import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  Mail,
  MoonStar,
  PauseCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  TimerReset,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useStaleAfter from "../../hooks/useStaleAfter";
import { emailMarketingApi } from "../../redux/api/emailMarketingApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import RefreshNotice from "../ui/RefreshNotice";
import { STALE_IDLE_MS, STALE_WHILE_SENDING_MS } from "./staleTimes";
import StatCard from "../ui/StatCard";
import { ErrorState, LoadingState } from "../ui/States";

// Email quota: what this hotel's sender may still send, and what the mail
// server is actually answering. gian /email-marketing/quota builds the data
// (services/emailQuota.service.ts); providers have no API for the remaining
// allowance, so the server's replies are the real signal of a limit.

const number = (value) => (value == null ? "—" : Number(value).toLocaleString("en-IN"));

const time = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "—";

// "12:46:05 pm" for the live list
const clockSec = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "—";

// "40 s ago" / "3 min ago"
const ago = (iso) => {
  if (!iso) return "";
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} s ago`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`;
};

const clock = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "—");

// "in 12 min" / "in 3 h"
const fromNow = (iso) => {
  if (!iso) return "";
  const min = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (min <= 0) return "now";
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60);
  return `in ${h} h${min % 60 ? ` ${min % 60} min` : ""}`;
};

const LEVEL = {
  ok: { icon: CheckCircle2, ring: "border-emerald-500/40 bg-emerald-500/8", text: "text-emerald-600 dark:text-emerald-400" },
  idle: { icon: MoonStar, ring: "border-app-border! bg-app-surface", text: "text-app-text-muted" },
  slowed: { icon: TimerReset, ring: "border-amber-500/40 bg-amber-500/8", text: "text-amber-600 dark:text-amber-400" },
  limit_reached: { icon: PauseCircle, ring: "border-red-500/40 bg-red-500/8", text: "text-red-600 dark:text-red-400" },
  blocked: { icon: ShieldAlert, ring: "border-red-500/40 bg-red-500/8", text: "text-red-600 dark:text-red-400" },
  login_failed: { icon: KeyRound, ring: "border-red-500/40 bg-red-500/8", text: "text-red-600 dark:text-red-400" },
};

// what each kind of server answer is called, and its badge colour
const KIND = {
  accepted: { label: "Accepted", tone: "green" },
  rate_limited: { label: "Slow down", tone: "amber" },
  daily_limit: { label: "Limit reached", tone: "red" },
  blocked: { label: "Blocked", tone: "red" },
  login_failed: { label: "Login failed", tone: "red" },
  invalid_address: { label: "Invalid address", tone: "purple" },
  rejected: { label: "Rejected", tone: "red" },
  network: { label: "Network", tone: "gray" },
  other: { label: "Other", tone: "gray" },
};

export default function EmailQuotaPanel() {
  const hid = useSelector((state) => state.userProfile.hid);
  // No polling (it loaded the server): loaded once, then a line offers Refresh
  // after a while, sooner while a campaign is going out.
  const { currentData, error, isFetching, refetch, fulfilledTimeStamp } = emailMarketingApi.useGetEmailQuotaQuery(
    { hid },
    { skip: !hid },
  );
  const liveCount = currentData?.result?.live?.length || 0;
  const { stale, loadedAt, markFresh } = useStaleAfter(liveCount ? STALE_WHILE_SENDING_MS : STALE_IDLE_MS, {
    enabled: Boolean(currentData),
  });
  useEffect(() => {
    if (fulfilledTimeStamp) markFresh();
  }, [fulfilledTimeStamp, markFresh]);
  if (!hid) return <ErrorState message="Select a hotel to view its sending limits." />;
  const data = currentData?.result;
  if (!data && error) {
    return <ErrorState message={getApiErrorMessage(error, "Couldn't load the sending limits.")} onRetry={refetch} />;
  }
  if (!data) return <LoadingState label="Loading the mail server's replies…" />;

  return (
    <section className="space-y-5" aria-label="Sending limits">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-app-text">Sending limits & server replies</h2>
          <p className="mt-1 text-sm text-app-text-muted">
            What the mail server actually answered for this hotel's emails. Providers don't share how much allowance is
            left, so their replies are the real signal of a limit.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} loading={isFetching} onClick={refetch}>
          Refresh
        </Button>
      </div>
      {error && <ErrorState message="Refresh failed. Showing the last successful update." onRetry={refetch} />}
      <RefreshNotice show={stale && !error} loadedAt={loadedAt} refreshing={isFetching} onRefresh={refetch}>
        {liveCount ? "A campaign is still going out." : "The mail server may have replied since."}
      </RefreshNotice>

      <StatusHero status={data.status} lastReply={data.lastReply} />

      {data.live?.map((c) => <LiveCampaign key={c.id} campaign={c} />)}

      {data.lastProblem && data.lastProblem !== data.lastReply && <LastProblem reply={data.lastProblem} />}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Sender sender={data.sender} />
        <ReplySummary counts={data.replyCounts} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Accepted · last 5 min" value={number(data.usage.fiveMinutes)} caption="By the mail server" icon={Clock3} />
        <StatCard label="Accepted · last hour" value={number(data.usage.hour)} caption="By the mail server" icon={Clock3} />
        <StatCard label="Accepted · 24 hours" value={number(data.usage.day)} caption="Campaigns and newsletters" icon={Mail} />
        <StatCard label="Waiting to send" value={number(data.usage.pending)} caption="Pending, incl. paused campaigns" icon={Send} />
      </div>

      {data.pausedCampaigns?.length > 0 && <PausedCampaigns campaigns={data.pausedCampaigns} />}

      <Replies hid={hid} replies={data.replies} source={data.repliesSource} nextBefore={data.repliesNextBefore} />

      <div className="space-y-1.5 text-xs text-app-text-muted">
        <p>{data.note}</p>
        <p>"Accepted" means the mail server took the email, not that it reached the inbox.</p>
        <p>
          Updated {new Date(data.checkedAt).toLocaleString("en-IN")} · press Refresh for the latest replies.
        </p>
      </div>
    </section>
  );
}

// ---------------- the verdict ----------------

function StatusHero({ status, lastReply }) {
  const look = LEVEL[status.level] || LEVEL.idle;
  const Icon = look.icon;
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${look.ring}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 size-6 shrink-0 ${look.text}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-base font-semibold ${look.text}`}>{status.title}</p>
          <p className="mt-1 break-words text-sm text-app-text">{status.detail}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-app-text-muted">
            {status.since && <span>Since {time(status.since)}</span>}
            {status.until && (
              <span className="font-medium text-app-text">
                Can send again around {clock(status.until)} ({fromNow(status.until)})
              </span>
            )}
          </div>
        </div>
      </div>
      {lastReply && (
        <div className="mt-4 rounded-xl border border-app-border! bg-app-surface p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
            <span className="font-semibold uppercase tracking-wide">Last server reply</span>
            <Badge tone={KIND[lastReply.kind]?.tone}>{KIND[lastReply.kind]?.label || lastReply.kind}</Badge>
            {lastReply.code && <Badge tone="gray">{lastReply.code}</Badge>}
            <span>{time(lastReply.at)}</span>
            <span className="truncate">to {lastReply.to}</span>
          </div>
          <p className="mt-2 break-all font-mono text-xs text-app-text">{lastReply.response || "(no text)"}</p>
          <p className="mt-1 text-xs text-app-text-muted">{lastReply.meaning}</p>
        </div>
      )}
    </div>
  );
}

// ---------------- a campaign going out right now ----------------

const LIVE = {
  sending: { label: "Sending now", tone: "green" },
  waiting: { label: "Waiting between batches", tone: "amber" },
  stopping: { label: "Stopping", tone: "amber" },
  stalled: { label: "Not moving", tone: "red" },
};

function LiveCampaign({ campaign: c }) {
  const look = LIVE[c.state] || LIVE.waiting;
  const done = c.sent + c.failed;
  const share = c.total ? Math.min(100, Math.round((done / c.total) * 100)) : 0;
  const hint = {
    sending: `Last email accepted ${ago(c.lastSentAt)}.`,
    waiting: c.lastSentAt
      ? `Last email went ${ago(c.lastSentAt)}. The mailbox paces its sending (or rests after a "slow down"); the next batch follows by itself.`
      : "Getting ready to send the first emails.",
    stopping: "Finishing the email in progress, then it pauses.",
    stalled: `Nothing sent since ${c.lastSentAt ? ago(c.lastSentAt) : "the start"} and the sending server gave no sign of life for 3 minutes. Stop and Start it again.`,
  }[c.state];
  return (
    <div className="rounded-2xl border border-app-border! bg-app-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
            {c.state === "sending" && <Loader2 className="size-3.5 animate-spin text-emerald-500" />}
            Campaign going out
          </p>
          <p className="mt-1 truncate text-base font-semibold text-app-text">{c.subject}</p>
        </div>
        <Badge tone={look.tone}>{look.label}</Badge>
      </div>
      <p className="mt-1 text-sm text-app-text-muted">{hint}</p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-surface-secondary">
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${share}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-5">
        <Fact label="Sent" value={`${number(c.sent)} / ${number(c.total)}`} />
        <Fact label="Failed" value={number(c.failed)} />
        <Fact label="Waiting" value={number(c.pending)} />
        <Fact label="Last 5 min" value={number(c.perFiveMinutes)} />
        <Fact label="Last hour" value={number(c.perHour)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Just went out</p>
          {c.recent.length === 0 ? (
            <p className="mt-2 text-sm text-app-text-muted">Nothing sent yet.</p>
          ) : (
            <ul className="mt-1 divide-y divide-app-border!">
              {c.recent.map((r, i) => (
                <li key={`${r.to}-${i}`} className="py-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone={KIND[r.kind]?.tone}>{KIND[r.kind]?.label || r.kind}</Badge>
                    <span className="tabular-nums text-app-text-muted">{clockSec(r.at)}</span>
                    <span className="min-w-0 truncate text-app-text">{r.to}</span>
                  </div>
                  {!r.ok && <p className="mt-1 break-all font-mono text-xs text-app-text">{r.response}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Next in line</p>
          {c.next.length === 0 ? (
            <p className="mt-2 text-sm text-app-text-muted">No one left to send to.</p>
          ) : (
            <ul className="mt-1 space-y-1.5">
              {c.next.map((n) => (
                <li key={n.email} className="truncate text-sm text-app-text">
                  {n.email}
                </li>
              ))}
              {c.pending > c.next.length && (
                <li className="text-xs text-app-text-muted">and {number(c.pending - c.next.length)} more</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div>
      <p className="text-xs text-app-text-muted">{label}</p>
      <p className="font-semibold tabular-nums text-app-text">{value}</p>
    </div>
  );
}

// ---------------- the newest failed reply (when the last one was fine) ----------------

function LastProblem({ reply }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
        <span className="font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Last problem reply</span>
        <Badge tone={KIND[reply.kind]?.tone}>{KIND[reply.kind]?.label || reply.kind}</Badge>
        {reply.code && <Badge tone="gray">{reply.code}</Badge>}
        <span>{time(reply.at)}</span>
        <span className="truncate">to {reply.to}</span>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-app-text">{reply.response || "(no text)"}</p>
      <p className="mt-1 text-xs text-app-text-muted">{reply.meaning}</p>
    </div>
  );
}

// ---------------- who sends ----------------

function Sender({ sender }) {
  return (
    <div className="rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Sending from</p>
        <Badge tone={sender.status === "error" ? "red" : sender.connected ? "blue" : "gray"}>
          {sender.status === "error" ? "Needs reconnecting" : sender.connected ? "Own mailbox" : "Shared Eazotel account"}
        </Badge>
      </div>
      <p className="mt-2 break-all text-base font-semibold text-app-text">{sender.email}</p>
      <dl className="mt-3 divide-y divide-app-border! text-sm">
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-app-text-muted">Provider</dt>
          <dd className="text-app-text">{sender.provider}</dd>
        </div>
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-app-text-muted">Mail server</dt>
          <dd className="break-all text-right font-mono text-xs text-app-text">{sender.host}</dd>
        </div>
      </dl>
    </div>
  );
}

// ---------------- replies in the last 24 hours, by kind ----------------

function ReplySummary({ counts = {} }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const shown = Object.keys(KIND).filter((k) => counts[k]);
  return (
    <div className="rounded-xl border border-app-border! bg-app-surface p-4">
      <p className="text-sm font-semibold text-app-text">Server replies · last 24 hours</p>
      <p className="text-xs text-app-text-muted">{number(total)} replies recorded</p>
      {shown.length === 0 ? (
        <p className="mt-6 text-center text-sm text-app-text-muted">No emails sent in the last 24 hours.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {shown.map((k) => {
            const share = total ? Math.round((counts[k] / total) * 100) : 0;
            return (
              <li key={k}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <Badge tone={KIND[k].tone}>{KIND[k].label}</Badge>
                  <span className="tabular-nums text-app-text">
                    {number(counts[k])} <span className="text-xs text-app-text-muted">{share}%</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
                  <div
                    className={`h-full rounded-full ${KIND[k].tone === "green" ? "bg-emerald-500" : KIND[k].tone === "amber" ? "bg-amber-500" : KIND[k].tone === "red" ? "bg-red-500" : "bg-gray-400"}`}
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------- campaigns stopped by a limit ----------------

function PausedCampaigns({ campaigns }) {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
        <AlertTriangle className="size-4" /> Paused campaigns
      </p>
      <ul className="mt-2 divide-y divide-amber-500/20">
        {campaigns.map((c) => (
          <li key={c.id} className="py-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-app-text">{c.subject}</p>
              <span className="text-xs text-app-text-muted">
                {number(c.pending)} waiting · paused {time(c.pausedAt)}
              </span>
            </div>
            {c.pauseReason && <p className="mt-0.5 text-xs text-app-text-muted">{c.pauseReason}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-app-text-muted">Open a campaign in Sent emails and press Start once capacity frees up.</p>
    </div>
  );
}

// ---------------- the server's replies, newest first ----------------

function Replies({ hid, replies = [], source, nextBefore }) {
  // once the person scrolls into older pages, the first page is kept as it was,
  // so the list doesn't jump under them while the page refreshes
  const [frozen, setFrozen] = useState(null);
  const [older, setOlder] = useState([]);
  const [cursor, setCursor] = useState(nextBefore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef(null);
  const [loadReplies] = emailMarketingApi.useLazyGetEmailQuotaRepliesQuery();

  const reset = () => {
    setFrozen(null);
    setOlder([]);
    setFailed(false);
  };
  useEffect(reset, [hid, source]);
  // still on the first page: follow its cursor as it refreshes
  useEffect(() => {
    if (!frozen) setCursor(nextBefore);
  }, [frozen, nextBefore]);

  const top = frozen || replies;
  const list = [...top, ...older];
  const newer = frozen && replies[0] && replies[0].at !== frozen[0]?.at;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor || loading || failed) return undefined;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setLoading(true);
        try {
          const res = await loadReplies({ hid, before: cursor, source }).unwrap();
          const page = res?.result || {};
          setFrozen((f) => f || replies);
          setOlder((rows) => {
            const seen = new Set(rows.map((r) => `${r.at}|${r.to}`));
            return [...rows, ...(page.items || []).filter((r) => !seen.has(`${r.at}|${r.to}`))];
          });
          setCursor(page.nextBefore || null);
        } catch {
          setFailed(true);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loading, failed, hid, source, replies, loadReplies]);

  return (
    <div className="rounded-xl border border-app-border! bg-app-surface">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-app-border! px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-app-text">Latest server replies</h3>
          <p className="text-xs text-app-text-muted">
            {source === "recipient"
              ? "Read from each email's record, newest first. The server sending right now doesn't save the full reply yet: accepted emails show the mail server's message id, failed ones show the server's own words."
              : "The mail server's own words for each email, newest first (kept 7 days)."}
          </p>
        </div>
        {newer && (
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reset}>
            Show newest
          </Button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-app-text-muted">
          No replies recorded yet. They show here as soon as emails go out.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-app-border!">
            {list.map((r, i) => (
              <li key={`${r.at}-${r.to}-${i}`} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone={KIND[r.kind]?.tone}>{KIND[r.kind]?.label || r.kind}</Badge>
                  {r.code && <span className="font-mono text-app-text-muted">{r.code}</span>}
                  <span className="text-app-text-muted">
                    {time(r.at)} · {ago(r.at)}
                  </span>
                  <span className="min-w-0 truncate text-app-text">{r.to}</span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-app-text">{r.response || "(no text)"}</p>
                {!r.ok && <p className="mt-0.5 text-xs text-app-text-muted">{r.meaning}</p>}
              </li>
            ))}
          </ul>
          <div ref={sentinel} className="border-t border-app-border! px-4 py-3 text-center text-xs text-app-text-muted">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" /> Loading older replies…
              </span>
            ) : failed ? (
              <button type="button" className="font-medium text-app-text underline" onClick={() => setFailed(false)}>
                Couldn't load older replies. Try again
              </button>
            ) : cursor ? (
              <span>{number(list.length)} shown · scroll for more</span>
            ) : (
              <span>All {number(list.length)} replies shown</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

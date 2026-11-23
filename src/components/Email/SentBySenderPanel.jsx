import { ChevronDown, RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatNumber } from "../../pages/EmailMarketing/emailUtils.js";
import { getSentSummary } from "../../redux/api/emailMarketingApi";
import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";
import { Skeleton } from "../ui/States";
import { avatarColor, mailDate, SENDER_VIA } from "./mailFormat";

// periods in the user's own time zone
const DAY = 24 * 60 * 60 * 1000;
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const PERIODS = [
  { value: "today", label: "Today", range: () => [startOfToday(), new Date(startOfToday().getTime() + DAY)] },
  { value: "yesterday", label: "Yesterday", range: () => [new Date(startOfToday().getTime() - DAY), startOfToday()] },
  { value: "7d", label: "Last 7 days", range: () => [new Date(startOfToday().getTime() - 6 * DAY), new Date(startOfToday().getTime() + DAY)] },
  { value: "30d", label: "Last 30 days", range: () => [new Date(startOfToday().getTime() - 29 * DAY), new Date(startOfToday().getTime() + DAY)] },
];

const senderTitle = (s) =>
  s.source === "unknown" ? "Sender not recorded" : s.name || s.email || "Sender not recorded";

// One sender address: how many went out from it, and (opened) in which emails
function SenderRow({ sender, max, onOpenCampaign }) {
  const [open, setOpen] = useState(false);
  const via = SENDER_VIA[sender.via];
  const unknown = sender.source === "unknown";
  const title = senderTitle(sender);
  const share = max > 0 ? Math.max(2, Math.round((sender.sent / max) * 100)) : 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-app-surface-secondary sm:px-4"
      >
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase text-white ${
            unknown ? "bg-slate-400" : avatarColor(title)
          }`}
          aria-hidden
        >
          {unknown ? "?" : title[0]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`truncate text-sm font-medium ${unknown ? "text-app-text-muted" : "text-app-text"}`}>{title}</span>
            {sender.email && sender.name && <span className="truncate text-xs text-app-text-muted">&lt;{sender.email}&gt;</span>}
            {via && <Badge tone={via.tone}>{via.label}</Badge>}
            {sender.source === "amazon-id" && (
              <span className="text-[11px] text-app-text-faint" title="Worked out from Amazon's message ID (sent before senders were recorded)">
                from Amazon's ID
              </span>
            )}
            {sender.source === "send-log" && (
              <span className="text-[11px] text-app-text-faint" title="Worked out from the mail server's log (kept 7 days)">
                from the send log
              </span>
            )}
          </span>
          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
            <span className="block h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${share}%` }} />
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums text-app-text">{formatNumber(sender.sent)}</span>
          <span className="block text-[11px] tabular-nums text-app-text-muted">
            {sender.failed ? <span className="text-red-500">{formatNumber(sender.failed)} failed</span> : "sent"}
          </span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-app-text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="border-t border-app-border! bg-app-surface-secondary/50 py-1 pl-14 pr-4">
          {sender.campaigns.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => onOpenCampaign?.(c._id)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-app-surface"
              >
                <span className="min-w-0 flex-1 truncate text-app-text">{c.subject}</span>
                {c.failed > 0 && <span className="shrink-0 text-xs text-red-500">{formatNumber(c.failed)} failed</span>}
                <span className="shrink-0 text-xs tabular-nums text-app-text-muted">{formatNumber(c.sent)} sent</span>
                <span className="hidden w-14 shrink-0 text-right text-xs text-app-text-faint sm:block">{mailDate(c.lastSentAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// How many emails went out in a period from each sender address guests saw
// in From, and from which dashboard login. A sender opens its emails; an
// email opens in the reading pane. Inside the Performance card it follows
// that card's period (`range`); on its own it has its own period switch.
//
//   range          { from: Date, to: Date, label } chosen outside, or none
//   reloadSignal   change it to count again
//   onOpenCampaign(id)
export default function SentBySenderPanel({ range = null, reloadSignal = 0, onOpenCampaign }) {
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState("");
  const embedded = Boolean(range);
  const fromIso = range?.from?.toISOString();
  const toIso = range?.to?.toISOString();

  const load = useCallback(async () => {
    setLoading(true);
    setFailed("");
    try {
      const [from, to] = fromIso ? [fromIso, toIso] : PERIODS.find((p) => p.value === period).range().map((d) => d.toISOString());
      setData(await getSentSummary({ from, to }));
    } catch (error) {
      setFailed(error?.message || "Couldn't load who sent what.");
    } finally {
      setLoading(false);
    }
  }, [period, fromIso, toIso]);

  useEffect(() => {
    load();
  }, [load, reloadSignal]);

  const periodLabel = (range?.label || PERIODS.find((p) => p.value === period).label).toLowerCase();
  const max = Math.max(0, ...(data?.senders || []).map((s) => s.sent));

  const body = failed ? (
    <p className="flex items-center gap-2 px-4 py-3 text-sm text-red-600">
      <TriangleAlert className="size-4" /> {failed}
    </p>
  ) : loading && !data ? (
    <div className="space-y-2 p-4">
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-10 rounded-lg" />
    </div>
  ) : !data?.senders.length ? (
    <p className="px-4 py-6 text-center text-sm text-app-text-muted">No emails were sent {periodLabel}.</p>
  ) : (
    <>
      <ul className="divide-y divide-app-border">
        {data.senders.map((s) => (
          <SenderRow key={`${s.via}|${s.email || s.provider || s.source}`} sender={s} max={max} onOpenCampaign={onOpenCampaign} />
        ))}
      </ul>
      {data.sentBy.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-app-border! px-4 py-2.5 text-xs text-app-text-muted">
          <span className="font-medium">Sent from the dashboard by:</span>
          {data.sentBy.map((p) => (
            <span key={p.login || "unknown"}>
              <span className="text-app-text">{p.login || "not recorded"}</span> · {formatNumber(p.sent)} in {p.campaigns}{" "}
              email{p.campaigns === 1 ? "" : "s"}
            </span>
          ))}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-app-border!">
        <div className="px-4 pb-1 pt-3">
          <h3 className="text-sm font-semibold text-app-text">Sent by</h3>
          <p className="text-xs text-app-text-muted">The address guests saw in “From”</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-app-border! px-3 py-2.5 sm:px-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-app-text">Emails sent, by sender</h3>
          <p className="text-xs text-app-text-muted">
            {loading && !data
              ? "Counting…"
              : data
                ? `${formatNumber(data.total.sent)} sent ${periodLabel}${data.total.failed ? `, ${formatNumber(data.total.failed)} failed` : ""} · ${formatNumber(data.total.campaigns)} email${data.total.campaigns === 1 ? "" : "s"}`
                : ""}
          </p>
        </div>
        <div className="hide-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-lg bg-app-surface-secondary p-0.5 ring-1 ring-app-border">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              aria-pressed={period === p.value}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                period === p.value ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted hover:text-app-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <IconButton icon={RefreshCw} label="Refresh" onClick={load} className={loading ? "animate-spin" : ""} />
      </div>
      {body}
    </section>
  );
}

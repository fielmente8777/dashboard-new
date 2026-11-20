import {
  AtSign,
  BarChart3,
  CircleCheck,
  Clock,
  CornerUpLeft,
  Loader2,
  MailOpen,
  MousePointerClick,
  Newspaper,
  Paperclip,
  Pause,
  Send,
  TriangleAlert,
  User,
  Users,
} from "lucide-react";
import { formatNumber, percent } from "../../pages/EmailMarketing/emailUtils.js";
import Button from "../ui/Button";
import CampaignDeleteButton from "./CampaignDeleteButton";
import CampaignRunControl from "./CampaignRunControl";
import { mailDate, recipientsSummary } from "./mailFormat";

// newsletters are campaigns named "Newsletter: …" (pages/Newsletter)
const isNewsletter = (c) => String(c.name || "").startsWith("Newsletter: ");

// the row's icon: who it went to
const kindOf = (c) =>
  isNewsletter(c)
    ? { icon: Newspaper, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Newsletter" }
    : (c.recipientCount || 0) > 1
      ? { icon: Users, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: "Group email" }
      : { icon: User, tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300", label: "One person" };

// status as a chip with its icon
const STATUS = {
  sent: { icon: CircleCheck, label: "Sent", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  sending: { icon: Loader2, label: "Sending", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400", spin: true },
  stopping: { icon: Loader2, label: "Stopping", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400", spin: true },
  scheduled: { icon: Clock, label: "Scheduled", tone: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  paused: { icon: Pause, label: "Paused", tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  draft: { icon: Pause, label: "Not sent", tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  failed: { icon: TriangleAlert, label: "Failed", tone: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

export function StatusChip({ campaign }) {
  const s = STATUS[campaign.status] || STATUS.draft;
  const ChipIcon = s.icon;
  const progress =
    campaign.status === "sending" && campaign.recipientCount
      ? ` · ${percent(campaign.stats?.sent, campaign.recipientCount)}%`
      : "";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.tone}`}>
      <ChipIcon className={`size-3 ${s.spin ? "animate-spin" : ""}`} />
      {s.label}
      {progress}
    </span>
  );
}

// a number with its label and a thin bar (Mailchimp's Opens / Clicks columns)
function Metric({ value, label, share, barClass, muted }) {
  return (
    <div className="min-w-0">
      <p className={`text-sm font-semibold tabular-nums ${muted ? "text-app-text-faint" : "text-app-text"}`}>{value}</p>
      <p className="truncate text-[11px] text-app-text-muted">{label}</p>
      {share !== undefined && (
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-app-surface-secondary">
          <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, share)}%` }} />
        </div>
      )}
    </div>
  );
}

// columns: icon · campaign · audience · delivered · opens · clicks · sent · actions
const GRID = "lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_6.5rem_6.5rem_6.5rem_5.5rem_12rem] lg:items-center lg:gap-4";

const HEADS = [
  { label: "", icon: null },
  { label: "Campaign", icon: null },
  { label: "Audience", icon: Users },
  { label: "Delivered", icon: Send },
  { label: "Opens", icon: MailOpen },
  { label: "Clicks", icon: MousePointerClick },
  { label: "Sent", icon: Clock },
  { label: "Actions", icon: null, right: true },
];

// Every email sent, one row each, under one header like Mailchimp's campaign
// list: who it went to (icon), subject + status, From and files, the audience,
// delivered / opens / clicks with bars, the date, and View report / Start-Stop / Delete.
// On phones the header hides and each row stacks.
//
//   campaigns           rows from gian GET /campaigns (with toPreview, snippet, sentFrom)
//   onOpen(campaign, tab)  open it in the reading pane (the report is at its top)
//   onChanged()         a run was stopped / started
//   onDeleted(c)        it was deleted
export default function SentMailList({ campaigns, loading, onOpen, onChanged, onDeleted, emptyMessage }) {
  return (
    <div className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div
        className={`hidden border-b border-app-border! bg-app-surface-secondary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted ${GRID}`}
        role="row"
      >
        {HEADS.map(({ label, icon: HeadIcon, right }, i) => (
          <span key={i} role="columnheader" className={`flex items-center gap-1.5 ${right ? "justify-end" : ""}`}>
            {HeadIcon && <HeadIcon className="size-3.5" />}
            {label}
          </span>
        ))}
      </div>

      {loading && (
        <div className="space-y-2 p-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-app-surface-secondary" />
          ))}
        </div>
      )}

      {!loading && !campaigns.length && <p className="p-8 text-center text-sm text-app-text-muted">{emptyMessage}</p>}

      {!loading && campaigns.length > 0 && (
        <ul className="divide-y divide-app-border">
          {campaigns.map((c) => {
            const kind = kindOf(c);
            const KindIcon = kind.icon;
            const sent = c.stats?.sent || 0;
            const failed = c.stats?.failed || 0;
            const tried = sent + failed;
            const sending = ["sending", "stopping"].includes(c.status);
            const notSent = !sent && !failed;
            const from = c.sentFrom?.email;
            const audience = c.audienceLabel || (isNewsletter(c) ? "Newsletter" : "");
            return (
              <li key={c._id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(c, "message")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(c, "message"))}
                  className={`group cursor-pointer px-4 py-3.5 transition hover:bg-app-surface-secondary/70 focus-visible:bg-app-surface-secondary focus-visible:outline-none ${GRID}`}
                >
                  {/* icon + campaign (on phones these two share the first line) */}
                  <span
                    className={`hidden size-10 items-center justify-center rounded-xl lg:flex ${kind.tone}`}
                    title={kind.label}
                    aria-label={kind.label}
                  >
                    <KindIcon className="size-[18px]" />
                  </span>

                  <div className="flex min-w-0 gap-3">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl lg:hidden ${kind.tone}`} aria-hidden>
                      <KindIcon className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-app-text" title={c.subject}>
                          {c.subject || c.name || "(no subject)"}
                        </p>
                        <StatusChip campaign={c} />
                      </div>
                      <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-app-text-muted">
                        <span className="inline-flex min-w-0 items-center gap-1 lg:hidden">
                          <Clock className="size-3.5 shrink-0" />
                          {mailDate(c.createdAt)}
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1 lg:hidden">
                          <Users className="size-3.5 shrink-0" />
                          {formatNumber(c.recipientCount)}
                        </span>
                        {from ? (
                          <span className="inline-flex min-w-0 items-center gap-1" title="The address guests saw in From">
                            <AtSign className="size-3.5 shrink-0" />
                            <span className="truncate">{from}</span>
                          </span>
                        ) : (
                          c.fromEmail && (
                            <span className="inline-flex min-w-0 items-center gap-1" title="Replies went here (the sender of older emails wasn't saved)">
                              <CornerUpLeft className="size-3.5 shrink-0" />
                              <span className="truncate">{c.fromEmail}</span>
                            </span>
                          )
                        )}
                        {c.attachments?.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Paperclip className="size-3.5" />
                            {c.attachments.length} file{c.attachments.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </p>
                      {failed > 0 && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-500">
                          <TriangleAlert className="size-3.5" />
                          {formatNumber(failed)} failed — open Recipients to see why
                        </p>
                      )}
                      {c.status === "paused" && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <Pause className="size-3.5" />
                          {c.pauseReason || "Stopped — press Start to send the rest"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* audience (desktop column) */}
                  <div className="hidden min-w-0 lg:block">
                    <p className="text-sm font-semibold tabular-nums text-app-text">
                      {formatNumber(c.recipientCount)} {c.recipientCount === 1 ? "person" : "people"}
                    </p>
                    <p className="truncate text-[11px] text-app-text-muted" title={audience || recipientsSummary(c, { names: false })}>
                      {audience || recipientsSummary(c)}
                    </p>
                  </div>

                  {/* numbers: a 3-column strip on phones, three columns on desktop */}
                  <div className="mt-3 grid grid-cols-3 gap-3 pl-[3.25rem] lg:contents">
                    {sending ? (
                      <Metric
                        value={formatNumber(sent)}
                        label={`of ${formatNumber(c.recipientCount)} sent`}
                        share={percent(sent, c.recipientCount)}
                        barClass="bg-amber-500"
                      />
                    ) : (
                      <Metric
                        value={notSent ? "—" : `${percent(sent, tried)}%`}
                        label={notSent ? `0 of ${formatNumber(c.recipientCount)}` : `${formatNumber(sent)} reached`}
                        share={notSent ? undefined : percent(sent, tried)}
                        barClass="bg-emerald-500"
                        muted={notSent}
                      />
                    )}
                    <Metric
                      value={sent ? `${percent(c.stats?.opened, sent)}%` : "—"}
                      label={sent ? `${formatNumber(c.stats?.opened)} opened` : "Opens"}
                      share={sent ? percent(c.stats?.opened, sent) : undefined}
                      barClass="bg-violet-500"
                      muted={!sent}
                    />
                    <Metric
                      value={sent ? `${percent(c.stats?.clicked, sent)}%` : "—"}
                      label={sent ? `${formatNumber(c.stats?.clicked)} clicked` : "Clicks"}
                      share={sent ? percent(c.stats?.clicked, sent) : undefined}
                      barClass="bg-sky-500"
                      muted={!sent}
                    />
                  </div>

                  {/* date (desktop column) */}
                  <p
                    className="hidden text-xs tabular-nums text-app-text-muted lg:block"
                    title={new Date(c.createdAt).toLocaleString("en-IN")}
                  >
                    {mailDate(c.createdAt)}
                  </p>

                  {/* actions */}
                  <div
                    className="mt-3 flex items-center justify-end gap-1.5 lg:mt-0"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <CampaignRunControl campaign={c} onChanged={onChanged} />
                    {!["sending", "stopping", "paused"].includes(c.status) && (
                      <Button size="sm" variant="secondary" icon={BarChart3} onClick={() => onOpen(c, "report")}>
                        View report
                      </Button>
                    )}
                    <CampaignDeleteButton campaign={c} onDeleted={onDeleted} iconOnly />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

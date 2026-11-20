import {
  ArrowLeft,
  CalendarClock,
  Eye,
  Info,
  Paperclip,
  Reply,
  Send,
  UserRound,
  Users,
  CircleCheck,
  Clock,
  Inbox,
  MailOpen,
  MousePointerClick,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Monitor,
  RefreshCw,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { campaignStatus, describeSendProblem, formatDate, RECIPIENT_TONE } from "../../pages/EmailMarketing/emailUtils.js";
import { getCampaignMessage, getCampaignRecipients, getEmailCampaign } from "../../redux/api/emailMarketingApi";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import { Skeleton } from "../ui/States";
import Tabs from "../ui/Tabs";
import CampaignDeleteButton from "./CampaignDeleteButton";
import CampaignDeliveryBar from "./CampaignDeliveryBar";
import CampaignReport from "./CampaignReport";
import RecipientsTable from "./RecipientsTable";
import CampaignRunControl from "./CampaignRunControl";
import MailBody from "./MailBody";
import { avatarColor, mailFullDate, recipientsSummary, SENDER_VIA, senderNote, sentBy } from "./mailFormat";

// the filters above the table, with their icon and colour
const FILTERS = [
  { value: "", label: "All", icon: Inbox },
  {
    value: "sent",
    label: "Sent",
    icon: CircleCheck,
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "opened",
    label: "Opened",
    icon: MailOpen,
    tone: "text-violet-600 dark:text-violet-400",
  },
  {
    value: "clicked",
    label: "Clicked",
    icon: MousePointerClick,
    tone: "text-sky-600 dark:text-sky-400",
  },
  {
    value: "failed",
    label: "Failed",
    icon: TriangleAlert,
    tone: "text-red-500",
  },
  { value: "pending", label: "Pending", icon: Clock, tone: "text-slate-500" },
];

const PAGE_SIZE = 50;

const formatSize = (bytes) =>
  !bytes ? "" : bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ---------------- pieces ---------------- */

// Desktop / Phone for the email body
function DeviceSwitch({ phone, onChange }) {
  return (
    <div className="inline-flex shrink-0 rounded-full bg-app-surface-secondary p-0.5 ring-1 ring-app-border">
      {[
        { value: false, label: "Desktop", icon: Monitor },
        { value: true, label: "Phone", icon: Smartphone },
      ].map(({ value, label, icon: DeviceIcon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={phone === value}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
            phone === value ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted hover:text-app-text"
          }`}
        >
          <DeviceIcon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

// one labelled detail of the envelope: icon, label, value
function EnvelopeRow({ icon: RowIcon, label, children }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-app-surface-secondary text-app-text-muted">
        <RowIcon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-faint">{label}</p>
        <div className="break-words text-sm text-app-text">{children}</div>
      </div>
    </div>
  );
}

// The envelope: who it came from (as guests saw it), to whom, where replies go,
// how it was sent and who sent it from the dashboard. `extra` goes under it.
function SenderHeader({ from, toLine, toFull, date, by, extra }) {
  const [showAll, setShowAll] = useState(false);
  const via = SENDER_VIA[from?.via];
  const unknown = !from || from.source === "unknown";
  const name = unknown ? from?.name || "Sender not recorded" : from.name || from.email || "Your mailbox";
  const note = senderNote(from);
  // say how we know only when it was worked out, or isn't known
  const showNote = unknown || from?.source === "send-log" || from?.source === "amazon-id";

  return (
    <div className="rounded-xl border border-app-border! bg-app-surface">
      <div className="flex items-start gap-3 p-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold uppercase text-white ${
            unknown ? "bg-slate-400" : avatarColor(name)
          }`}
          aria-hidden
        >
          {unknown ? "?" : name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-[15px] font-semibold ${unknown ? "text-app-text-muted" : "text-app-text"}`}>{name}</span>
            {via && <Badge tone={via.tone}>{via.label}</Badge>}
          </div>
          {!unknown && from.email && <p className="truncate text-sm text-app-text-muted">{from.email}</p>}
        </div>
        <p className="flex shrink-0 items-center gap-1 text-right text-xs text-app-text-muted">
          <CalendarClock className="size-3.5 shrink-0" />
          {mailFullDate(date)}
        </p>
      </div>

      <div className="grid gap-x-6 gap-y-3 border-t border-app-border! px-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
        <EnvelopeRow icon={Users} label="To">
          <span className={showAll ? "" : "line-clamp-2"}>{showAll ? toFull : toLine}</span>
          {toFull && toFull !== toLine && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {showAll ? "Show less" : "Show addresses"}
            </button>
          )}
        </EnvelopeRow>
        <EnvelopeRow icon={Reply} label="Replies go to">
          {from?.replyTo || (!unknown && from?.email) || <span className="text-app-text-faint">—</span>}
        </EnvelopeRow>
        <EnvelopeRow icon={Send} label="Sent through">
          {via ? from.provider ? `${via.label} (${from.provider})` : via.label : <span className="text-app-text-faint">Not recorded</span>}
        </EnvelopeRow>
        <EnvelopeRow icon={UserRound} label="Sent by">
          {by || <span className="text-app-text-faint">—</span>}
        </EnvelopeRow>
      </div>

      {showNote && note && (
        <p
          className={`flex items-start gap-1.5 border-t border-app-border! px-4 py-2 text-xs ${
            unknown ? "bg-amber-500/5 text-amber-700 dark:text-amber-400" : "text-app-text-muted"
          }`}
        >
          {unknown ? <TriangleAlert className="mt-px size-3.5 shrink-0" /> : <Info className="mt-px size-3.5 shrink-0" />}
          {note}
        </p>
      )}
      {extra && <div className="border-t border-app-border! px-4 py-3">{extra}</div>}
    </div>
  );
}

// the email as guests got it, below its sender; loads gian /campaigns/:id/message
function useMessage(campaignId, recipientId) {
  const [message, setMessage] = useState(null);
  const [failed, setFailed] = useState("");
  const load = useCallback(async () => {
    setFailed("");
    try {
      setMessage(await getCampaignMessage({ campaignId, recipientId }));
    } catch (error) {
      setFailed(error?.message || "Couldn't load this email.");
    }
  }, [campaignId, recipientId]);
  useEffect(() => {
    setMessage(null);
    load();
  }, [load]);
  return { message, failed, reload: load };
}

function BodyBlock({ html, attachments = [] }) {
  const [phone, setPhone] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-app-border!">
      <div className="flex items-center gap-2 border-b border-app-border! bg-app-surface px-4 py-2.5">
        <Eye className="size-4 text-app-text-muted" />
        <p className="text-sm font-semibold text-app-text">Email</p>
        <span
          className="hidden items-center gap-1 text-[11px] text-app-text-faint sm:inline-flex"
          title="The footer shown is the one saved now. The unsubscribe link does nothing here, and opening this doesn't count as an open."
        >
          <Info className="size-3.5" /> as guests see it
        </span>
        <span className="ml-auto">
          <DeviceSwitch phone={phone} onChange={setPhone} />
        </span>
      </div>

      {/* desktop: on white like Gmail; phone: in a phone, on grey */}
      <div className={phone ? "bg-slate-100 px-3 py-6 sm:py-8 dark:bg-slate-900/50" : "bg-white"}>
        <MailBody html={html} phone={phone} />
      </div>

      {attachments.length > 0 && (
        <div className="border-t border-app-border! bg-app-surface px-4 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-app-text-muted">
            <Paperclip className="size-3.5" />
            {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, i) => (
              <a
                key={`${file.key || file.url}-${i}`}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-3 py-2 text-xs hover:border-blue-400!"
              >
                <FileText className="size-4 shrink-0 text-red-500" />
                <span className="max-w-56 truncate font-medium text-app-text">{file.fileName || "Attachment"}</span>
                {file.size ? <span className="shrink-0 text-app-text-faint">{formatSize(file.size)}</span> : null}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- the email ---------------- */

function MessagePane({ campaign, campaignId }) {
  const { message, failed, reload } = useMessage(campaignId, null);
  if (failed) {
    return (
      <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
        {failed}{" "}
        <button type="button" onClick={reload} className="font-medium underline">
          Try again
        </button>
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {message ? (
        <SenderHeader
          from={message.from}
          toLine={recipientsSummary(campaign)}
          toFull={recipientsSummary(campaign, { names: false })}
          date={campaign.createdAt}
          by={sentBy(campaign)}
        />
      ) : (
        <Skeleton className="h-14 rounded-lg" />
      )}
      {message ? <BodyBlock html={message.html} attachments={campaign.attachments} /> : <Skeleton className="h-96 rounded-lg" />}
    </div>
  );
}

/* ---------------- one person's copy ---------------- */

const STEP = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";

function PersonPane({ campaign, campaignId, recipientId, onBack }) {
  const { message, failed, reload } = useMessage(campaignId, recipientId);
  const r = message?.recipient;
  const problem = r?.error ? describeSendProblem(r.error) : null;

  return (
    <div className="space-y-4">
      {onBack && (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-app-text-muted hover:text-app-text">
          <ArrowLeft className="size-4" /> All recipients
        </button>
      )}

      {failed && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {failed}{" "}
          <button type="button" onClick={reload} className="font-medium underline">
            Try again
          </button>
        </p>
      )}

      {!message && !failed && <Skeleton className="h-14 rounded-lg" />}

      {message && (
        <>
          <SenderHeader
            from={message.from}
            toLine={r.name ? `${r.name} <${r.email}>` : r.email}
            toFull={r.email}
            date={r.sentAt || campaign.createdAt}
            by={sentBy(campaign)}
            extra={
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge tone={RECIPIENT_TONE[r.status] || "gray"}>{r.status}</Badge>
                {r.sentAt && (
                  <span className={`${STEP} bg-app-surface-secondary text-app-text-muted`}>Sent {formatDate(r.sentAt, true)}</span>
                )}
                {r.deliveredAt && (
                  <span className={`${STEP} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
                    Delivered {formatDate(r.deliveredAt, true)}
                  </span>
                )}
                {r.openedAt && (
                  <span className={`${STEP} bg-violet-500/10 text-violet-700 dark:text-violet-400`}>
                    Opened {formatDate(r.openedAt, true)}
                  </span>
                )}
                {r.clickedAt && (
                  <span className={`${STEP} bg-sky-500/10 text-sky-700 dark:text-sky-400`}>Clicked {formatDate(r.clickedAt, true)}</span>
                )}
              </div>
            }
          />
          {problem && (
            <div
              className="rounded-lg border border-red-200! bg-red-50 px-4 py-3 dark:border-red-500/30! dark:bg-red-500/10"
              title={r.error}
            >
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{problem.title}</p>
              <p className="mt-1 text-xs text-app-text-muted">{problem.hint}</p>
            </div>
          )}
          {r.status === "pending" || r.status === "held" ? (
            <p className="rounded-lg bg-app-surface-secondary px-4 py-3 text-sm text-app-text-muted">
              This person hasn't been sent the email yet.
            </p>
          ) : null}
          <BodyBlock html={message.html} attachments={campaign.attachments} />
        </>
      )}
    </div>
  );
}

/* ---------------- an email to one person ---------------- */

// No report, chart or recipients list for one person: the email, with what
// happened to it (sent, delivered, opened, clicked) on its envelope, like
// Gmail's tracking; and Retry when it failed.
function SinglePane({ campaign, campaignId, onChanged }) {
  const [recipientId, setRecipientId] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    getCampaignRecipients({ campaignId, page: 1, limit: 1 })
      .then((res) => {
        if (!alive) return;
        const id = res?.doc?.[0]?._id;
        if (id) setRecipientId(id);
        else setMissing(true);
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [campaignId]);

  return (
    <div className="space-y-4">
      <CampaignDeliveryBar campaignId={campaignId} onChanged={onChanged} />
      {recipientId ? (
        <PersonPane campaign={campaign} campaignId={campaignId} recipientId={recipientId} />
      ) : missing ? (
        <MessagePane campaign={campaign} campaignId={campaignId} />
      ) : (
        <Skeleton className="h-96 rounded-lg" />
      )}
    </div>
  );
}

/* ---------------- recipients & results ---------------- */

function RecipientsPane({ campaignId, initialFilter = "", onOpenPerson }) {
  const [recipients, setRecipients] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState(initialFilter);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCampaignRecipients({
        campaignId,
        status: filter,
        page,
        limit: PAGE_SIZE,
      });
      setRecipients(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch {
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter recipients">
          {FILTERS.map((f) => {
            const on = filter === f.value;
            const FilterIcon = f.icon;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/30 dark:text-blue-300"
                    : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
                }`}
              >
                <FilterIcon className={`size-3.5 ${on ? "" : f.tone || ""}`} />
                {f.label}
              </button>
            );
          })}
        </div>
        {!loading && total > 0 && (
          <span className="ml-auto text-xs tabular-nums text-app-text-muted">
            {((page - 1) * PAGE_SIZE + 1).toLocaleString("en-IN")}–{Math.min(page * PAGE_SIZE, total).toLocaleString("en-IN")} of{" "}
            {total.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <RecipientsTable
        recipients={recipients}
        loading={loading}
        onOpen={onOpenPerson}
        emptyMessage={filter ? `No one is “${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}” yet.` : "No recipients."}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs text-app-text-muted">
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </Button>
          {page} / {totalPages}
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------------- the reading pane ---------------- */

// One sent email, opened in place of the list like Gmail: a toolbar (back,
// refresh, stop / start, delete, older / newer), the subject, the real sender
// and the email; "Recipients" lists everyone, and a person opens their copy.
//
//   position / total, onPrev / onNext   "3 of 13" and the arrows (optional)
//   onChanged()                         stopped, started or deleted: refresh the list
export default function CampaignDetail({
  campaignId,
  onClose,
  position,
  total,
  onPrev,
  onNext,
  onChanged,
  initialTab = "message",
  onTabChange,
}) {
  const [campaign, setCampaign] = useState(null);
  // the report sits above the email, so only Message / Recipients are tabs ("report" opens on Message)
  const [tab, setTabState] = useState(initialTab === "recipients" ? "recipients" : "message");
  const tabsRef = useRef(null);
  const [recipientFilter, setRecipientFilter] = useState("");
  const setTab = (value) => {
    setTabState(value);
    onTabChange?.(value);
  };
  const [personId, setPersonId] = useState(null);
  const [version, setVersion] = useState(0);

  const loadCampaign = useCallback(async () => {
    try {
      const res = await getEmailCampaign({ campaignId });
      setCampaign(res?.doc || null);
    } catch {
      // the header waits
    }
  }, [campaignId]);

  useEffect(() => {
    setCampaign(null);
    setPersonId(null);
    loadCampaign();
  }, [loadCampaign]);

  // Esc goes back to the list, like Gmail's "u"
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // a confirm box or the compose window has Esc first
      if (document.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal="true"]')) return;
      if (personId) setPersonId(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [personId, onClose]);

  const refresh = () => {
    loadCampaign();
    setVersion((v) => v + 1);
    onChanged?.();
  };

  const status = campaign ? campaignStatus(campaign.status) : null;
  // an email to one person needs no report or recipients list
  const single = campaign?.recipientCount === 1;
  const tabs = [
    { value: "message", label: "Message" },
    {
      value: "recipients",
      label: "Recipients",
      count: campaign?.recipientCount || 0,
    },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      {/* toolbar */}
      <div className="flex items-center gap-1 border-b border-app-border! px-2 py-1.5 sm:px-3">
        <IconButton icon={ArrowLeft} label="Back to Sent" onClick={onClose} />
        <IconButton icon={RefreshCw} label="Refresh" onClick={refresh} />
        {campaign && (
          <div className="flex items-center gap-1.5 pl-1">
            <CampaignRunControl campaign={campaign} onChanged={refresh} />
            <CampaignDeleteButton
              campaign={campaign}
              onDeleted={async () => {
                await onChanged?.();
                onClose();
              }}
            />
          </div>
        )}
        {total > 1 && (
          <div className="ml-auto flex items-center gap-1 text-xs tabular-nums text-app-text-muted">
            <span className="hidden sm:inline">
              {position} of {total}
            </span>
            <IconButton icon={ChevronLeft} label="Newer" onClick={onPrev} disabled={!onPrev || position <= 1} />
            <IconButton icon={ChevronRight} label="Older" onClick={onNext} disabled={!onNext || position >= total} />
          </div>
        )}
      </div>

      <div className="px-4 py-5 sm:px-8">
        {/* subject, like Gmail: big, with its label */}
        <div className="flex flex-wrap items-center gap-2">
          {campaign ? (
            <h2 className="min-w-0 break-words text-xl font-normal text-app-text sm:text-[22px]">{campaign.subject || "(no subject)"}</h2>
          ) : (
            <Skeleton className="h-7 w-72" />
          )}
          {status && <Badge tone={status.tone}>{status.label}</Badge>}
        </div>

        {single ? (
          <div className="mt-5" key={version}>
            <SinglePane campaign={campaign} campaignId={campaignId} onChanged={loadCampaign} />
          </div>
        ) : (
          <>
            {/* the report, always first, the full width of the page */}
            <div className="mt-4" key={version}>
              {campaign ? (
                <CampaignReport
                  campaign={campaign}
                  campaignId={campaignId}
                  onChanged={loadCampaign}
                  onShowRecipients={(filter) => {
                    setRecipientFilter(filter);
                    setPersonId(null);
                    setTab("recipients");
                    requestAnimationFrame(() =>
                      tabsRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      }),
                    );
                  }}
                />
              ) : (
                <Skeleton className="h-64 rounded-xl" />
              )}
            </div>

            <div ref={tabsRef} className="mt-6 scroll-mt-4 border-b border-app-border!">
              <Tabs
                tabs={tabs}
                value={tab}
                onChange={(value) => {
                  setTab(value);
                  setPersonId(null);
                  setRecipientFilter("");
                }}
                className="-mb-px pb-2"
              />
            </div>

            <div className="pt-5" key={version}>
              {!campaign ? (
                <Skeleton className="h-96 rounded-lg" />
              ) : tab === "message" ? (
                <MessagePane campaign={campaign} campaignId={campaignId} />
              ) : personId ? (
                <PersonPane campaign={campaign} campaignId={campaignId} recipientId={personId} onBack={() => setPersonId(null)} />
              ) : (
                <RecipientsPane key={recipientFilter} campaignId={campaignId} initialFilter={recipientFilter} onOpenPerson={setPersonId} />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Monitor,
  RefreshCw,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  campaignStatus,
  deliveredCount,
  describeSendProblem,
  formatDate,
  rate,
  RECIPIENT_TONE,
} from "../../pages/EmailMarketing/emailUtils.js";
import { getCampaignMessage, getCampaignRecipients, getEmailCampaign } from "../../redux/api/emailMarketingApi";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import { Skeleton } from "../ui/States";
import Tabs from "../ui/Tabs";
import CampaignDeleteButton from "./CampaignDeleteButton";
import CampaignDeliveryBar from "./CampaignDeliveryBar";
import CampaignRunControl from "./CampaignRunControl";
import MailBody from "./MailBody";
import {
  avatarColor,
  mailDate,
  mailFullDate,
  personName,
  recipientsSummary,
  SENDER_VIA,
  senderNote,
  sentBy,
} from "./mailFormat";

const FILTERS = [
  { value: "", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "opened", label: "Opened" },
  { value: "clicked", label: "Clicked" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];

const STATS = [
  { key: "sent", label: "Sent" },
  { key: "delivered", label: "Delivered" },
  { key: "opened", label: "Opened", showRate: true },
  { key: "clicked", label: "Clicked", showRate: true },
  { key: "failed", label: "Failed", danger: true },
  { key: "unsubscribed", label: "Unsubscribed" },
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

// Gmail's sender block: avatar, name <address>, "to …" with details, the date
function SenderHeader({ from, toLine, toFull, date, subject, by, extra }) {
  const [open, setOpen] = useState(false);
  const via = SENDER_VIA[from?.via];
  const unknown = !from || from.source === "unknown";
  const name = unknown ? from?.name || "Sender not recorded" : from.name || from.email || "Your mailbox";
  const note = senderNote(from);

  const rows = [
    ["from", unknown ? "not recorded" : from.email ? `${from.name ? `${from.name} ` : ""}<${from.email}>` : "not recorded"],
    from?.replyTo && ["reply-to", from.replyTo],
    ["to", toFull],
    ["date", formatDate(date, true)],
    ["subject", subject],
    via && ["sent through", from.provider ? `${via.label} (${from.provider})` : via.label],
    by && ["sent by", `${by} (dashboard login)`],
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase text-white ${
          unknown ? "bg-slate-400" : avatarColor(name)
        }`}
        aria-hidden
      >
        {unknown ? "?" : name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={`text-sm font-semibold ${unknown ? "text-app-text-muted" : "text-app-text"}`}>{name}</span>
          {!unknown && from.email && from.name && (
            <span className="min-w-0 truncate text-xs text-app-text-muted">&lt;{from.email}&gt;</span>
          )}
          {via && (
            <Badge tone={via.tone} className="self-center">
              {via.label}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-0.5 inline-flex max-w-full items-center gap-1 text-left text-xs text-app-text-muted hover:text-app-text"
        >
          <span className="truncate">to {toLine}</span>
          <ChevronDown className={`size-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open ? (
          <dl className="mt-2 grid max-w-xl grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-app-border! bg-app-surface p-3 text-xs shadow-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-right text-app-text-muted">{label}:</dt>
                <dd className="min-w-0 break-words text-app-text">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          note && (
            <p className={`mt-1 flex items-start gap-1 text-[11px] leading-snug ${unknown ? "text-amber-700 dark:text-amber-400" : "text-app-text-faint"}`}>
              {unknown && <TriangleAlert className="mt-px size-3 shrink-0" />}
              {note}
            </p>
          )
        )}
        {extra}
      </div>
      <p className="hidden shrink-0 text-right text-xs text-app-text-muted sm:block">{mailFullDate(date)}</p>
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
    <>
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 text-[11px] text-app-text-faint">
          Your footer is the one saved now; the unsubscribe link is turned off here.
        </p>
        <DeviceSwitch phone={phone} onChange={setPhone} />
      </div>
      <MailBody html={html} phone={phone} className="overflow-hidden rounded-lg border border-app-border!" />
      {attachments.length > 0 && (
        <div className="border-t border-app-border! pt-4">
          <p className="mb-2 text-xs font-medium text-app-text-muted">
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
    </>
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
          subject={campaign.subject}
          by={sentBy(campaign)}
        />
      ) : (
        <Skeleton className="h-14 rounded-lg" />
      )}
      <p className="text-xs text-app-text-muted sm:hidden">{mailFullDate(campaign.createdAt)}</p>
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
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-app-text-muted hover:text-app-text"
      >
        <ArrowLeft className="size-4" /> All recipients
      </button>

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
            subject={campaign.subject}
            by={sentBy(campaign)}
            extra={
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge tone={RECIPIENT_TONE[r.status] || "gray"}>{r.status}</Badge>
                {r.sentAt && <span className={`${STEP} bg-app-surface-secondary text-app-text-muted`}>Sent {formatDate(r.sentAt, true)}</span>}
                {r.deliveredAt && (
                  <span className={`${STEP} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
                    Delivered {formatDate(r.deliveredAt, true)}
                  </span>
                )}
                {r.openedAt && (
                  <span className={`${STEP} bg-violet-500/10 text-violet-700 dark:text-violet-400`}>Opened {formatDate(r.openedAt, true)}</span>
                )}
                {r.clickedAt && (
                  <span className={`${STEP} bg-sky-500/10 text-sky-700 dark:text-sky-400`}>Clicked {formatDate(r.clickedAt, true)}</span>
                )}
              </div>
            }
          />
          {problem && (
            <div className="rounded-lg border border-red-200! bg-red-50 px-4 py-3 dark:border-red-500/30! dark:bg-red-500/10" title={r.error}>
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

/* ---------------- recipients & results ---------------- */

function RecipientsPane({ campaign, campaignId, onOpenPerson, onChanged }) {
  const [recipients, setRecipients] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const stats = { ...campaign?.stats, delivered: deliveredCount(campaign?.stats) };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCampaignRecipients({ campaignId, status: filter, page, limit: PAGE_SIZE });
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
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
        {STATS.map(({ key, label, showRate, danger }) => (
          <div key={key} className="rounded-lg border border-app-border! px-3 py-2">
            <p className="text-[11px] text-app-text-muted">{label}</p>
            <p className={`text-base font-semibold tabular-nums ${danger && stats[key] ? "text-red-500" : "text-app-text"}`}>
              {(stats[key] ?? 0).toLocaleString("en-IN")}
              {showRate && <span className="ml-1 text-[11px] font-normal text-app-text-muted">{rate(stats[key], stats.sent)}</span>}
            </p>
          </div>
        ))}
      </div>

      <CampaignDeliveryBar
        campaignId={campaignId}
        onChanged={() => {
          load();
          onChanged?.();
        }}
      />

      <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
        <Tabs
          tabs={FILTERS}
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
          className="w-max"
        />
      </div>

      <ul className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border! bg-app-surface">
        {loading &&
          [0, 1, 2, 3].map((i) => (
            <li key={i} className="px-4 py-3">
              <Skeleton className="h-8 rounded" />
            </li>
          ))}
        {!loading && !recipients.length && (
          <li className="px-4 py-8 text-center text-sm text-app-text-muted">
            {filter ? `No recipients are “${filter}”.` : "No recipients."}
          </li>
        )}
        {!loading &&
          recipients.map((r) => (
            <li key={r._id}>
              <button
                type="button"
                onClick={() => onOpenPerson(r._id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-app-surface-secondary sm:px-4"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase text-white ${avatarColor(r.email)}`}
                  aria-hidden
                >
                  {personName(r)[0] || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-app-text">
                    {r.name || r.email}
                    {r.name && <span className="text-app-text-muted"> &lt;{r.email}&gt;</span>}
                  </span>
                  <span className="block truncate text-xs text-app-text-muted">
                    {r.error
                      ? describeSendProblem(r.error).title
                      : [r.openedAt && `Opened ${formatDate(r.openedAt, true)}`, r.clickedAt && `clicked ${formatDate(r.clickedAt, true)}`]
                          .filter(Boolean)
                          .join(" · ") || (r.sentFrom ? `From ${r.sentFrom}` : " ")}
                  </span>
                </span>
                <Badge tone={RECIPIENT_TONE[r.status] || "gray"}>{r.status}</Badge>
                <span className="hidden w-16 shrink-0 text-right text-xs tabular-nums text-app-text-muted sm:block">
                  {mailDate(r.sentAt)}
                </span>
              </button>
            </li>
          ))}
      </ul>

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
export default function CampaignDetail({ campaignId, onClose, position, total, onPrev, onNext, onChanged }) {
  const [campaign, setCampaign] = useState(null);
  const [tab, setTab] = useState("message");
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
    setTab("message");
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
  const tabs = [
    { value: "message", label: "Message" },
    { value: "recipients", label: "Recipients", count: campaign?.recipientCount || 0 },
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

        <div className="mt-3 border-b border-app-border!">
          <Tabs
            tabs={tabs}
            value={tab}
            onChange={(value) => {
              setTab(value);
              setPersonId(null);
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
            <RecipientsPane campaign={campaign} campaignId={campaignId} onOpenPerson={setPersonId} onChanged={loadCampaign} />
          )}
        </div>
      </div>
    </section>
  );
}

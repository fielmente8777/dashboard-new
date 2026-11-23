import {
  AtSign,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  Clock,
  Loader2,
  MailOpen,
  MousePointerClick,
  Send,
  TriangleAlert,
  UserX,
} from "lucide-react";
import { describeSendProblem } from "../../pages/EmailMarketing/emailUtils.js";
import { Skeleton } from "../ui/States";
import { avatarColor, personName } from "./mailFormat";

// each status: its words, icon and colour (the same colours as the report's tiles)
const STATUS = {
  pending: { label: "Pending", icon: Clock, chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  held: { label: "Pending", icon: Clock, chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  sending: { label: "Sending", icon: Loader2, chip: "bg-blue-500/10 text-blue-700 dark:text-blue-300", spin: true },
  sent: { label: "Sent", icon: CircleCheck, chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  delivered: { label: "Delivered", icon: CheckCheck, chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  opened: { label: "Opened", icon: MailOpen, chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  clicked: { label: "Clicked", icon: MousePointerClick, chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  failed: { label: "Failed", icon: TriangleAlert, chip: "bg-red-500/10 text-red-700 dark:text-red-300" },
  unsubscribed: { label: "Unsubscribed", icon: UserX, chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
};

const GRID =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_8.5rem_8rem_8rem_8rem_1.25rem] lg:items-center lg:gap-4";

function StatusChip({ status }) {
  const s = STATUS[status] || { label: status || "—", icon: Clock, chip: "bg-slate-500/10 text-slate-600" };
  const StatusIcon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.chip}`}>
      <StatusIcon className={`size-3.5 ${s.spin ? "animate-spin" : ""}`} />
      {s.label}
    </span>
  );
}

const sameYear = (d) => d.getFullYear() === new Date().getFullYear();

// a date in a column: "20 Nov" over "6:28 pm"; "—" when it didn't happen
function When({ at, tone = "text-app-text" }) {
  if (!at) return <span className="text-sm text-app-text-faint">—</span>;
  const d = new Date(at);
  return (
    <span className="block leading-tight" title={d.toLocaleString("en-IN")}>
      <span className={`block text-sm tabular-nums ${tone}`}>
        {d.toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(!sameYear(d) && { year: "numeric" }) })}
      </span>
      <span className="block text-xs tabular-nums text-app-text-muted">
        {d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
      </span>
    </span>
  );
}

// on phones the columns become one short line under the address
const shortWhen = (label, at) =>
  at ? `${label} ${new Date(at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : "";

// The people one email went to, as a table on desktop (recipient · status ·
// sent · opened · clicked) and as rows on phones. A row opens that person's copy.
export default function RecipientsTable({ recipients, loading, emptyMessage, onOpen }) {
  return (
    <div className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div
        className={`hidden border-b border-app-border! bg-app-surface-secondary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted ${GRID}`}
      >
        <span className="flex items-center gap-1.5">
          <AtSign className="size-3.5" /> Recipient
        </span>
        <span className="flex items-center gap-1.5">
          <CircleCheck className="size-3.5" /> Status
        </span>
        <span className="flex items-center gap-1.5">
          <Send className="size-3.5" /> Sent
        </span>
        <span className="flex items-center gap-1.5">
          <MailOpen className="size-3.5" /> Opened
        </span>
        <span className="flex items-center gap-1.5">
          <MousePointerClick className="size-3.5" /> Clicked
        </span>
        <span />
      </div>

      <ul className="divide-y divide-app-border">
        {loading &&
          [0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="px-4 py-3">
              <Skeleton className="h-9 rounded" />
            </li>
          ))}
        {!loading && !recipients.length && <li className="px-4 py-10 text-center text-sm text-app-text-muted">{emptyMessage}</li>}
        {!loading &&
          recipients.map((r) => {
            const problem = r.error ? describeSendProblem(r.error) : null;
            const phoneLine = [shortWhen("Sent", r.sentAt), shortWhen("opened", r.openedAt), shortWhen("clicked", r.clickedAt)]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={r._id}>
                <button
                  type="button"
                  onClick={() => onOpen(r._id)}
                  className={`group w-full px-4 py-3 text-left transition hover:bg-app-surface-secondary/70 focus-visible:bg-app-surface-secondary focus-visible:outline-none ${GRID}`}
                >
                  {/* recipient */}
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase text-white ${avatarColor(r.email)}`}
                      aria-hidden
                    >
                      {personName(r)[0] || "?"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-app-text">{r.name || r.email}</span>
                      {r.name && <span className="block truncate text-xs text-app-text-muted">{r.email}</span>}
                      {problem && (
                        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-red-600 dark:text-red-400" title={r.error}>
                          <TriangleAlert className="size-3 shrink-0" />
                          {problem.title}
                        </span>
                      )}
                      {/* phones: status and times under the address */}
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 lg:hidden">
                        <StatusChip status={r.status} />
                        {phoneLine && <span className="text-xs text-app-text-muted">{phoneLine}</span>}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-app-text-faint lg:hidden" />
                  </span>

                  {/* desktop columns */}
                  <span className="hidden lg:block">
                    <StatusChip status={r.status} />
                  </span>
                  <span className="hidden lg:block">
                    <When at={r.sentAt} />
                  </span>
                  <span className="hidden lg:block">
                    <When at={r.openedAt} tone="text-violet-700 dark:text-violet-300" />
                  </span>
                  <span className="hidden lg:block">
                    <When at={r.clickedAt} tone="text-sky-700 dark:text-sky-300" />
                  </span>
                  <ChevronRight className="hidden size-4 text-app-text-faint transition group-hover:translate-x-0.5 group-hover:text-app-text lg:block" />
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

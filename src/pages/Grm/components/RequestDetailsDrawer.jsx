import { Loader2, MessageSquareQuote, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Badge from "../../../components/ui/Badge";
import Drawer from "../../../components/ui/Drawer";
import Icon from "../../../components/ui/Icon";
import { REQUEST_STATUSES, getStatus } from "../constants";
import { formatDateTime, phoneDigits, timeAgo } from "../requestFormat";

const sectionClassName =
  "rounded-xl border border-app-border! bg-app-surface p-4";
const sectionTitleClassName =
  "mb-3 text-[11px] font-semibold uppercase tracking-wider text-app-text-faint";

const contactClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-app-border! px-3 text-xs font-medium text-app-text transition-colors hover:bg-app-surface-secondary";

// Everything about one guest request, and changing its status.
const RequestDetailsDrawer = ({ request, updating, onClose, onChangeStatus }) => {
  if (!request) return null;

  const status = getStatus(request.status);
  const phone = phoneDigits(request.guestPhoneNumber);
  const items = request.requestedItems || [];
  const wasUpdated =
    request.updatedAt &&
    new Date(request.updatedAt) - new Date(request.createdAt) > 60_000;

  return (
    <Drawer
      open
      title={`Room ${request.roomNumber || "—"}`}
      description={[request.roomType, request.requestId && `#${request.requestId}`]
        .filter(Boolean)
        .join(" · ")}
      onClose={onClose}
      header={
        <div className="flex items-center gap-2 text-xs text-app-text-muted">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span>Requested {timeAgo(request.createdAt)}</span>
        </div>
      }
    >
      <div className="space-y-4">
        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>Status</h3>
          <div
            role="radiogroup"
            aria-label="Request status"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {REQUEST_STATUSES.map((option) => {
              const active = option.value === request.status;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={updating || active}
                  onClick={() => onChangeStatus(request, option.value)}
                  className={`flex h-9 items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-colors disabled:cursor-default ${
                    active
                      ? "border-primary! bg-primary/[0.06] text-app-text ring-1 ring-primary dark:border-blue-500! dark:bg-blue-500/10 dark:ring-blue-500"
                      : "border-app-border! text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text disabled:opacity-60"
                  }`}
                >
                  <span className={`size-2 rounded-full ${option.dot}`} />
                  {option.label}
                </button>
              );
            })}
          </div>
          {updating && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-app-text-muted">
              <Icon icon={Loader2} size="xs" className="animate-spin" />
              Updating…
            </p>
          )}
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>
            Requested items{items.length > 0 && ` · ${items.length}`}
          </h3>
          {items.length ? (
            <ul className="divide-y divide-app-border">
              {items.map((item, index) => (
                <li
                  key={item._id || index}
                  className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-app-text">{item.item}</span>
                  <span className="rounded-md bg-app-surface-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-app-text-muted">
                    × {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-app-text-muted">No items, see the note below.</p>
          )}

          {request.specialRequest && (
            <div className="mt-4 flex gap-2.5 rounded-lg bg-app-bg p-3">
              <Icon
                icon={MessageSquareQuote}
                size="md"
                className="mt-0.5 text-app-text-faint"
              />
              <p className="whitespace-pre-line text-sm leading-relaxed text-app-text">
                {request.specialRequest}
              </p>
            </div>
          )}
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>Guest</h3>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary dark:bg-white/10 dark:text-white">
              {String(request.guestName || "?").charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold capitalize text-app-text">
                {request.guestName || "Guest"}
              </p>
              <p className="text-xs text-app-text-muted">
                {phone ? `+${phone}` : "No phone number"}
              </p>
            </div>
          </div>
          {phone && (
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:+${phone}`} className={contactClassName}>
                <Icon icon={Phone} size="sm" /> Call
              </a>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={contactClassName}
              >
                <Icon icon={FaWhatsapp} size="sm" className="text-emerald-500" />
                WhatsApp
              </a>
            </div>
          )}
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>Activity</h3>
          <ol className="relative space-y-4 border-l border-app-border! pl-5">
            <li className="relative">
              <span className="absolute -left-[25px] top-1 size-2.5 rounded-full bg-app-text-faint ring-4 ring-app-surface" />
              <p className="text-sm font-medium text-app-text">Request raised</p>
              <p className="text-xs text-app-text-muted">
                {formatDateTime(request.createdAt)}
              </p>
            </li>
            {wasUpdated && (
              <li className="relative">
                <span
                  className={`absolute -left-[25px] top-1 size-2.5 rounded-full ring-4 ring-app-surface ${status.dot}`}
                />
                <p className="text-sm font-medium text-app-text">
                  Marked {status.label}
                </p>
                <p className="text-xs text-app-text-muted">
                  {formatDateTime(request.updatedAt)}
                </p>
              </li>
            )}
          </ol>
        </section>
      </div>
    </Drawer>
  );
};

export default RequestDetailsDrawer;

import { Mail, MailOpen, X } from "lucide-react";
import { timeAgo } from "../../utils/relativeTime";
import Icon from "../ui/Icon";
import { getNotificationKind } from "./notificationKinds";

const actionClassName =
  "flex size-7 items-center justify-center rounded-md text-app-text-faint transition hover:bg-app-surface hover:text-app-text";

// One notification row, in the navbar panel and on the Notifications page.
// `notification` is the shape useNotificationFeed gives. onOpen runs on
// click; onToggleRead and onRemove add the hover buttons (page only).
const NotificationItem = ({ notification, now, onOpen, onToggleRead, onRemove }) => {
  const kind = getNotificationKind(notification.category);
  const unread = !notification.isRead;
  const urgent = ["high", "urgent"].includes(notification.priority);
  const hasActions = Boolean(onToggleRead || onRemove);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-app-surface-secondary ${
          hasActions ? "pr-20" : ""
        } ${unread ? "bg-ternary/[0.03]" : ""}`}
      >
        <span className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ${kind.tile}`}>
          <Icon icon={kind.icon} />
          {notification.count > 1 && (
            <span className="absolute -bottom-1 -right-1.5 rounded-full bg-app-surface px-1 text-[10px] font-semibold tabular-nums text-app-text ring-1 ring-app-border">
              ×{notification.count > 99 ? "99+" : notification.count}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className={`block text-sm leading-snug ${unread ? "text-app-text" : "text-app-text-muted"}`}>
            <span className={unread ? "font-semibold" : "font-medium"}>{notification.title}</span>
            {notification.body && (
              <span className="mt-0.5 line-clamp-2 block text-[13px] text-app-text-muted">{notification.body}</span>
            )}
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs text-app-text-faint">
            {timeAgo(notification.at, now)}
            {urgent && (
              <span className="rounded bg-red-500/10 px-1.5 py-px text-[10px] font-semibold uppercase text-red-600 dark:text-red-400">
                Urgent
              </span>
            )}
          </span>
        </span>

        {unread && <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-ternary" />}
      </button>

      {hasActions && (
        <div className="absolute right-2 top-2.5 flex gap-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
          {onToggleRead && notification.source === "server" && (
            <button
              type="button"
              aria-label={unread ? "Mark as read" : "Mark as unread"}
              title={unread ? "Mark as read" : "Mark as unread"}
              onClick={() => onToggleRead(notification)}
              className={actionClassName}
            >
              <Icon icon={unread ? MailOpen : Mail} size="sm" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              aria-label="Remove notification"
              title="Remove"
              onClick={() => onRemove(notification)}
              className={actionClassName}
            >
              <Icon icon={X} size="sm" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationItem;

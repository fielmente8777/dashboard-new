import { X } from "lucide-react";
import { timeAgo } from "../../utils/relativeTime";
import Icon from "../ui/Icon";
import { getNotificationKind } from "./notificationKinds";

// One notification row, in the navbar panel and on the Notifications page.
// onOpen(notification) runs on click; onRemove adds a hover delete button.
const NotificationItem = ({ notification, now, onOpen, onRemove }) => {
  const kind = getNotificationKind(notification.kind);
  const unread = !notification.read;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-app-surface-secondary ${onRemove ? "pr-10" : ""}`}
      >
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${kind.tile}`}
        >
          <Icon icon={kind.icon} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm leading-snug ${unread ? "text-app-text" : "text-app-text-muted"}`}
          >
            <span className={`capitalize ${unread ? "font-semibold" : "font-medium"}`}>
              {notification.title}
            </span>{" "}
            {notification.message}
          </span>
          <span className="mt-1 block text-xs text-app-text-faint">
            {timeAgo(notification.receivedAt, now)}
          </span>
        </span>

        {unread && (
          <span
            aria-label="Unread"
            className="mt-1.5 size-2 shrink-0 rounded-full bg-ternary"
          />
        )}
      </button>

      {onRemove && (
        <button
          type="button"
          aria-label="Remove notification"
          title="Remove"
          onClick={() => onRemove(notification)}
          className="absolute right-2 top-2.5 flex size-7 items-center justify-center rounded-md text-app-text-faint opacity-0 transition hover:bg-app-surface hover:text-app-text focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
        >
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;

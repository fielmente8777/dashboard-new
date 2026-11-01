import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationItem from "../../components/Notifications/NotificationItem";
import { useOpenNotification } from "../../components/Notifications/useOpenNotification";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { useConfirm } from "../../context/ConfirmContext";
import {
  allNotificationsRead,
  notificationRemoved,
  notificationsCleared,
  selectNotifications,
  selectUnreadCount,
} from "../../redux/slice/notificationsSlice";
import { groupByDay } from "../../utils/relativeTime";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

const pillClassName = (active) =>
  `inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${
    active
      ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
      : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
  }`;

// Every notification this browser kept for the account (the navbar panel
// shows only the newest). On phones the bell opens this page.
const Notifications = () => {
  const dispatch = useDispatch();
  const { confirm } = useConfirm();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const [filter, setFilter] = useState("all");
  const openNotification = useOpenNotification();

  const shown = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filter],
  );
  const groups = groupByDay(shown, (n) => n.receivedAt);
  const now = Date.now();

  const clearAll = async () => {
    const confirmed = await confirm(
      `Remove all ${notifications.length} notifications? This only clears them from this browser.`,
      { title: "Clear all notifications", confirmText: "Clear all" },
    );
    if (confirmed) dispatch(notificationsCleared());
  };

  return (
    <PageShell
      title="Notifications"
      description="Activity from your website and channels, newest first."
      maxWidth="max-w-3xl"
      actions={
        <>
          <Button
            variant="secondary"
            icon={CheckCheck}
            disabled={unreadCount === 0}
            onClick={() => dispatch(allNotificationsRead())}
          >
            Mark all as read
          </Button>
          {notifications.length > 0 && (
            <Button variant="ghost" icon={Trash2} onClick={clearAll}>
              Clear all
            </Button>
          )}
        </>
      }
    >
      <div role="tablist" aria-label="Filter notifications" className="flex gap-1.5">
        {FILTERS.map((option) => {
          const active = option.value === filter;
          const count = option.value === "unread" ? unreadCount : notifications.length;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(option.value)}
              className={pillClassName(active)}
            >
              {option.label}
              <span className={`tabular-nums ${active ? "text-white/75" : "text-app-text-faint"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-app-border! bg-app-surface">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-app-surface-secondary text-app-text-faint">
              <Icon icon={BellOff} size="xl" />
            </span>
            <div>
              <p className="text-sm font-medium text-app-text">
                {filter === "unread" ? "You're all caught up" : "No notifications yet"}
              </p>
              <p className="mt-1 text-xs text-app-text-muted">
                {filter === "unread"
                  ? "There is nothing new to look at."
                  : "You'll see website visitors and other activity here as it happens."}
              </p>
            </div>
          </div>
        ) : (
          groups.map((group, index) => (
            <section
              key={group.label}
              className={`px-2 py-2 ${index > 0 ? "border-t border-app-border!" : ""}`}
            >
              <h2 className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-app-text-faint">
                {group.label}
              </h2>
              {group.items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  now={now}
                  onOpen={openNotification}
                  onRemove={(n) => dispatch(notificationRemoved(n.id))}
                />
              ))}
            </section>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <p className="text-center text-xs text-app-text-faint">
          Notifications are kept in this browser, up to the latest 200.
        </p>
      )}

      {/* room under the last row for the floating assistant button */}
      <div className="h-14" aria-hidden="true" />
    </PageShell>
  );
};

export default Notifications;

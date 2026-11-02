import { BellOff, CheckCheck, Settings2 } from "lucide-react";
import { useState } from "react";
import NotificationItem from "../../components/Notifications/NotificationItem";
import NotificationSettings from "../../components/Notifications/NotificationSettings";
import {
  NOTIFICATION_FILTERS,
  getNotificationKind,
} from "../../components/Notifications/notificationKinds";
import { useNotificationFeed } from "../../components/Notifications/useNotificationFeed";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import Segmented from "../../components/ui/Segmented";
import { ErrorState } from "../../components/ui/States";
import { groupByDay } from "../../utils/relativeTime";

const chipClassName = (active) =>
  `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors ${
    active
      ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
      : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
  }`;

const Feed = () => {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("");
  const feed = useNotificationFeed({ status, category });
  const groups = groupByDay(feed.items, (n) => n.at);
  const now = Date.now();

  const chips = [
    { value: "", label: "Everything", unread: feed.unreadTotal },
    ...NOTIFICATION_FILTERS.map((value) => ({
      value,
      label: getNotificationKind(value).label,
      unread: feed.unreadByCategory[value] || 0,
    })),
  ];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: `Unread${feed.unreadTotal ? ` (${feed.unreadTotal})` : ""}` },
          ]}
          value={status}
          onChange={setStatus}
        />
        <Button variant="secondary" size="sm" icon={CheckCheck} disabled={!feed.unreadTotal} onClick={feed.markAllRead}>
          Mark all as read
        </Button>
      </div>

      <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {chips.map((chip) => (
          <button
            key={chip.value || "all"}
            type="button"
            aria-pressed={category === chip.value}
            onClick={() => setCategory(chip.value)}
            className={chipClassName(category === chip.value)}
          >
            {chip.label}
            {chip.unread > 0 && (
              <span
                className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                  category === chip.value ? "bg-white/20" : "bg-ternary/15 text-ternary"
                }`}
              >
                {chip.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {feed.isError ? (
        <ErrorState message="Couldn't load notifications." onRetry={feed.retry} />
      ) : (
        <div className="rounded-xl border border-app-border! bg-app-surface">
          {feed.isLoading ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-app-surface-secondary" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-app-surface-secondary text-app-text-faint">
                <Icon icon={BellOff} size="xl" />
              </span>
              <div>
                <p className="text-sm font-medium text-app-text">
                  {status === "unread" ? "You're all caught up" : "Nothing here yet"}
                </p>
                <p className="mt-1 text-xs text-app-text-muted">
                  {status === "unread"
                    ? "There is nothing new to look at."
                    : "New leads, WhatsApp chats and website visitors show up here as they happen."}
                </p>
              </div>
            </div>
          ) : (
            groups.map((group, index) => (
              <section key={group.label} className={`px-2 py-2 ${index > 0 ? "border-t border-app-border!" : ""}`}>
                <h2 className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-app-text-faint">
                  {group.label}
                </h2>
                {group.items.map((notification) => (
                  <NotificationItem
                    key={`${notification.source}-${notification.id}`}
                    notification={notification}
                    now={now}
                    onOpen={feed.open}
                    onToggleRead={(n) => feed.setRead(n, !n.isRead)}
                    onRemove={feed.remove}
                  />
                ))}
              </section>
            ))
          )}

          {feed.hasMore && (
            <div className="border-t border-app-border! p-2">
              <Button variant="ghost" className="w-full" loading={feed.loadingMore} onClick={feed.loadMore}>
                Show older notifications
              </Button>
            </div>
          )}
        </div>
      )}

      {!feed.serverReady && (
        <p className="text-center text-xs text-app-text-faint">
          Showing the notifications kept in this browser. Leads and WhatsApp alerts from the server
          appear after the next server update.
        </p>
      )}
    </>
  );
};

// Every notification for this hotel: leads, WhatsApp, website visitors and
// more, from the server (all devices) plus what this browser kept. On
// phones the bell opens this page.
const Notifications = () => {
  const [view, setView] = useState("feed");

  return (
    <PageShell
      title="Notifications"
      description="Activity across your channels, newest first."
      maxWidth="max-w-3xl"
      actions={
        <Button
          variant={view === "settings" ? "primary" : "secondary"}
          icon={Settings2}
          onClick={() => setView(view === "settings" ? "feed" : "settings")}
        >
          {view === "settings" ? "Back to notifications" : "Settings"}
        </Button>
      }
    >
      {view === "settings" ? <NotificationSettings /> : <Feed />}

      {/* room under the last row for the floating assistant button */}
      <div className="h-14" aria-hidden="true" />
    </PageShell>
  );
};

export default Notifications;

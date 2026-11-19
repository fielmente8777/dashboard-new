import { ArrowRight, BellOff, CheckCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PAGES, dashboardPath } from "../../routes/paths";
import { groupByDay } from "../../utils/relativeTime";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";
import NotificationItem from "./NotificationItem";
import { useNotificationFeed } from "./useNotificationFeed";

// the panel shows the newest few; the Notifications page has them all
const PANEL_LIMIT = 30;

const tabClassName = (active) =>
  `rounded-md px-3 py-1 text-xs font-medium transition-colors ${
    active
      ? "bg-app-surface text-app-text shadow-sm"
      : "text-app-text-muted hover:text-app-text"
  }`;

// The bell's slide-over: newest notifications, grouped by day, with a link
// to the full Notifications page at the bottom.
const NotificationPanel = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const feed = useNotificationFeed({ status: tab, afterOpen: onClose });
  const unreadCount = feed.unreadTotal;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const groups = groupByDay(feed.items.slice(0, PANEL_LIMIT), (n) => n.at);

  if (!open) return null;

  const now = Date.now();

  return createPortal(
    <div
      onMouseDown={onClose}
      className="anim-fade fixed inset-0 z-[9995] flex justify-end bg-slate-950/30"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        onMouseDown={(e) => e.stopPropagation()}
        className="anim-slide-in flex h-full w-full max-w-[400px] flex-col border-l border-app-border! bg-app-surface text-app-text shadow-2xl"
      >
        <header className="shrink-0 border-b border-app-border! px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-ternary px-1.5 py-px text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-0.5">
              <IconButton
                icon={CheckCheck}
                label="Mark all as read"
                disabled={unreadCount === 0}
                onClick={feed.markAllRead}
              />
              <IconButton icon={X} label="Close" onClick={onClose} />
            </div>
          </div>

          <div
            role="tablist"
            className="mt-3 inline-flex rounded-lg bg-app-surface-secondary p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              onClick={() => setTab("all")}
              className={tabClassName(tab === "all")}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "unread"}
              onClick={() => setTab("unread")}
              className={tabClassName(tab === "unread")}
            >
              Unread{unreadCount > 0 && ` (${unreadCount})`}
            </button>
          </div>
        </header>

        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {feed.isLoading ? (
            <div className="space-y-2 p-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-app-surface-secondary" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-app-surface-secondary text-app-text-faint">
                <Icon icon={BellOff} size="xl" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  {tab === "unread" ? "You're all caught up" : "No notifications yet"}
                </p>
                <p className="mt-1 text-xs text-app-text-muted">
                  {tab === "unread"
                    ? "There is nothing new to look at."
                    : "New leads, WhatsApp chats and website visitors show up here as they happen."}
                </p>
              </div>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.label} className="mb-1">
                <h3 className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-app-text-faint">
                  {group.label}
                </h3>
                {group.items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    now={now}
                    onOpen={feed.open}
                  />
                ))}
              </section>
            ))
          )}
        </div>

        <footer className="shrink-0 border-t border-app-border! p-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(dashboardPath(PAGES.NOTIFICATIONS));
            }}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-app-text transition-colors hover:bg-app-surface-secondary"
          >
            View all notifications
            <Icon icon={ArrowRight} size="sm" />
          </button>
        </footer>
      </aside>
    </div>,
    document.body,
  );
};

export default NotificationPanel;

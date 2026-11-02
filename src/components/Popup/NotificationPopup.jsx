import { useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineUserAdd } from "react-icons/hi";
import { IoIosNotifications } from "react-icons/io";
import { MdClose, MdDoneAll, MdPhone } from "react-icons/md";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "lead", label: "Leads" },
  { key: "whatsapp", label: "WhatsApp" },
];

const CATEGORY_STYLE = {
  lead: {
    icon: <HiOutlineUserAdd size={18} />,
    className: "bg-orange-100 text-orange-600",
  },
  whatsapp: {
    icon: <FaWhatsapp size={18} />,
    className: "bg-green-100 text-green-600",
  },
  call: {
    icon: <MdPhone size={18} />,
    className: "bg-blue-100 text-blue-600",
  },
};

const DEFAULT_STYLE = {
  icon: <IoIosNotifications size={18} />,
  className: "bg-gray-100 text-gray-600",
};

const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function NotificationPopup({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  hasMore = false,
  loading = false,
  onLoadMore,
  onItemClick,
  onMarkAllRead,
  pushPermission,
  onEnablePush,
}) {
  const [tab, setTab] = useState("all");

  const visible = useMemo(() => {
    if (tab === "all") return notifications;
    if (tab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.category === tab);
  }, [notifications, tab]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed z-[99999] inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] max-w-full flex flex-col bg-app-surface-secondary shadow-xl transform transition-transform duration-300 z-[99999] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-app-border bg-app-surface">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-app-text">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  <MdDoneAll size={16} />
                  Mark all read
                </button>
              )}
              <button onClick={onClose} className="text-app-text">
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "border-transparent text-app-text-muted hover:text-app-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop (Chrome) notifications */}
        {pushPermission === "default" && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 dark:bg-white/5 border-b border-app-border">
            <p className="text-xs text-app-text">
              Get a desktop alert for new leads and WhatsApp messages, even
              when this tab is closed.
            </p>
            <button
              onClick={onEnablePush}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Enable
            </button>
          </div>
        )}
        {pushPermission === "denied" && (
          <div className="px-4 py-3 bg-amber-50 dark:bg-white/5 border-b border-app-border text-xs text-app-text">
            Desktop notifications are blocked. Click the lock icon next to the
            address bar → Notifications → Allow, then reload.
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 && (
            <div className="p-6 text-center text-sm text-app-text-muted">
              Loading…
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-app-text-muted">
              <IoIosNotifications size={40} className="opacity-40" />
              <p className="text-sm">
                {tab === "unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
              </p>
            </div>
          )}

          {visible.map((item) => {
            const style = CATEGORY_STYLE[item.category] || DEFAULT_STYLE;
            return (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className={`relative flex gap-3 px-4 py-3 border-b border-app-border cursor-pointer transition-colors hover:bg-app-surface ${
                  item.isRead ? "" : "bg-blue-50/60 dark:bg-white/5"
                }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${style.className}`}
                >
                  {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm text-app-text ${
                      item.isRead ? "font-normal" : "font-semibold"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.body && (
                    <p className="text-xs text-app-text-muted mt-0.5 line-clamp-2 break-words">
                      {item.body}
                    </p>
                  )}
                  <p className="text-[11px] text-app-text-faint mt-1">
                    {timeAgo(item.lastOccurredAt || item.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!item.isRead && (
                  <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
            );
          })}

          {hasMore && (
            <div className="p-3 text-center">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="text-sm text-blue-600 font-medium hover:underline disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

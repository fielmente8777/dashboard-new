import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../hooks/useTenant";
import {
  useArchiveNotificationsMutation,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkNotificationsReadMutation,
} from "../../redux/api/notificationsApi";
import {
  allNotificationsRead,
  notificationRead,
  notificationRemoved,
  selectNotifications,
} from "../../redux/slice/notificationsSlice";
import { dashboardPath } from "../../routes/paths";

// Two sources, one list:
//   server - leads, WhatsApp, calls, ... kept by gian for every device
//   local  - website-visitor alerts; the server does not store those, so
//            this browser keeps them (redux notificationsSlice)
// Both become { id, source, category, type, title, body, link, count,
// isRead, priority, at }.

const fromServer = (n) => ({
  ...n,
  source: "server",
  at: n.lastOccurredAt || n.createdAt,
});

const fromLocal = (n) => ({
  id: n.id,
  source: "local",
  category: "visitor",
  type: n.kind || "visitor",
  title: n.title,
  body: n.message,
  link: n.link,
  count: 1,
  isRead: Boolean(n.read),
  priority: "normal",
  at: n.receivedAt,
});

const byNewest = (a, b) => new Date(b.at) - new Date(a.at);

// Where a notification's link goes. Server links are full dashboard paths; account-wide
// ones (e.g. the calling balance) carry ":hid", filled with the property being viewed.
// Local (browser-kept) links are PAGES.* paths.
export const resolveNotificationLink = (n, hid) => {
  if (!n?.link) return null;
  if (n.source === "local" || !n.link.startsWith("/")) return dashboardPath(n.link);
  return hid ? n.link.replace("/:hid/", `/${hid}/`) : n.link;
};

// The server answers 404 until gian with the notification center is deployed;
// then only the browser-kept notifications are shown.
const isMissing = (error) => error?.status === 404;

// Unread total for the bell, both sources.
export const useUnreadNotificationTotal = () => {
  const { hid } = useTenant();
  const local = useSelector(selectNotifications);
  const count = useGetUnreadNotificationCountQuery(hid, { skip: !hid });
  const localUnread = local.filter((n) => !n.read).length;
  return (count.data?.total ?? 0) + localUnread;
};

// The notification list for the panel and the Notifications page.
//   status   - "all" | "unread"
//   category - "" for everything, a server category, or "visitor"
export const useNotificationFeed = ({ status = "all", category = "", afterOpen } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hid } = useTenant();
  // the page cursor belongs to one filter; another filter starts at page one
  const filterKey = `${status}|${category}`;
  const [page, setPage] = useState({ filterKey, cursor: null });
  const cursor = page.filterKey === filterKey ? page.cursor : null;
  const setCursor = (next) => setPage({ filterKey, cursor: next });
  const localItems = useSelector(selectNotifications);

  // "visitor" lives only in this browser: nothing to ask the server for
  const serverCategory = category === "visitor" ? null : category;
  const list = useGetNotificationsQuery(
    { hid, status, category: serverCategory || undefined, cursor },
    { skip: !hid || category === "visitor" },
  );
  const counts = useGetUnreadNotificationCountQuery(hid, { skip: !hid });

  const [markRead] = useMarkNotificationsReadMutation();
  const [markUnread] = useMarkNotificationUnreadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();
  const [archive] = useArchiveNotificationsMutation();

  const serverReady = !isMissing(list.error) && !isMissing(counts.error);

  const items = useMemo(() => {
    const server = category === "visitor" ? [] : (list.data?.items || []).map(fromServer);
    const local =
      !category || category === "visitor"
        ? localItems.map(fromLocal).filter((n) => status !== "unread" || !n.isRead)
        : [];
    return [...server, ...local].sort(byNewest);
  }, [list.data, localItems, category, status]);

  const localUnread = localItems.filter((n) => !n.read).length;
  const unreadByCategory = { ...(counts.data?.byCategory || {}), visitor: localUnread };
  const unreadTotal = (counts.data?.total ?? 0) + localUnread;

  const setRead = (n, read) => {
    if (n.source === "local") {
      if (read) dispatch(notificationRead(n.id));
      return;
    }
    if (read) markRead({ hid, ids: [n.id] });
    else markUnread({ hid, id: n.id });
  };

  const open = (n) => {
    if (!n.isRead) setRead(n, true);
    afterOpen?.();
    const link = resolveNotificationLink(n, hid);
    if (link) navigate(link);
  };

  const remove = (n) => {
    if (n.source === "local") dispatch(notificationRemoved(n.id));
    else archive({ hid, ids: [n.id] });
  };

  const markAllRead = () => {
    if (!category || category === "visitor") dispatch(allNotificationsRead());
    if (category !== "visitor" && serverReady) markAll({ hid, category: serverCategory || undefined });
  };

  return {
    items,
    unreadTotal,
    unreadByCategory,
    serverReady,
    isLoading: list.isLoading,
    isError: list.isError && serverReady,
    retry: list.refetch,
    hasMore: Boolean(list.data?.hasMore),
    loadingMore: list.isFetching && Boolean(cursor),
    loadMore: () => list.data?.nextCursor && setCursor(list.data.nextCursor),
    open,
    setRead,
    remove,
    markAllRead,
  };
};

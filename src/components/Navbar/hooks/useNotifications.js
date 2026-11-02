import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebSocketClient from "../../../config/websocketClient";
import { WS_BASE_URL } from "../../../data/constant";
import { useTenant } from "../../../hooks/useTenant";
import {
  notificationsApi,
  receiveNotification,
  receiveNotificationsRead,
  useGetNotificationPreferencesQuery,
} from "../../../redux/api/notificationsApi";
import { alertNewNotification } from "../../Notifications/notificationAlert";
import {
  MAX_NOTIFICATIONS,
  notificationReceived,
  notificationsLoaded,
  selectNotifications,
  selectNotificationsOwner,
} from "../../../redux/slice/notificationsSlice";
import { getUserNdid } from "../../../redux/slice/UserSlice";
import { PAGES } from "../../../routes/paths";
import { getAccountToken } from "../../../utils/session";

const storageKey = (ndid) => `notifications:${ndid}`;

const readSaved = (ndid) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(ndid)) || "[]");
    return Array.isArray(saved) ? saved.slice(0, MAX_NOTIFICATIONS) : [];
  } catch {
    return [];
  }
};

// A websocket NOTIFICATION as a list entry. Today the only sender is the
// website chatbot, when a visitor opens it (VISITOR_INIT in the Node API).
const toNotification = (data) => ({
  kind: data?.kind || "visitor",
  title: data?.title || data?.name || data?.visitorName || "New website visitor",
  message: data?.message || "started a chat with your website assistant",
  link: data?.link || PAGES.LEADS_VISITORS,
});

// Keeps the signed-in account's notifications live. Mount it once (the navbar does).
//  - server notifications (leads, WhatsApp, ...): subscribes over the
//    websocket and puts new ones straight into the cached lists and the
//    unread count, so the bell updates without polling
//  - website-visitor alerts: kept in this browser, as before
export const useNotifications = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectNotifications);
  const owner = useSelector(selectNotificationsOwner);
  const { hid } = useTenant();
  const ndid =
    useSelector((state) => getUserNdid(state.userProfile.user)) ||
    localStorage.getItem("ndid");

  // types switched off for the dashboard (Notifications → Settings) arrive
  // quietly: no ring, no sound. A ref, so a change doesn't reconnect the socket.
  const prefs = useGetNotificationPreferencesQuery(hid, { skip: !hid });
  const mutedRef = useRef([]);
  mutedRef.current = prefs.data?.preferences?.inApp?.mutedTypes || [];

  useEffect(() => {
    if (ndid) dispatch(notificationsLoaded({ ndid, items: readSaved(ndid) }));
  }, [ndid, dispatch]);

  // saved only once the store holds this account's list, so switching
  // accounts never writes one account's notifications under another
  useEffect(() => {
    if (!ndid || owner !== ndid) return;
    try {
      localStorage.setItem(storageKey(ndid), JSON.stringify(items));
    } catch {
      // storage full or blocked: the list still works for this session
    }
  }, [items, ndid, owner]);

  useEffect(() => {
    if (!ndid) return;
    const client = new WebSocketClient(WS_BASE_URL);

    // the unread total the server just sent, then a refetch for the per-category split
    const setUnread = (unreadCount) => {
      if (typeof unreadCount !== "number" || !hid) return;
      dispatch(
        notificationsApi.util.updateQueryData("getUnreadNotificationCount", hid, (draft) => {
          draft.total = unreadCount;
        }),
      );
      dispatch(notificationsApi.util.invalidateTags(["NotificationCount"]));
    };

    client.connect(
      ({ data, event }) => {
        if (event === "NOTIFICATION" && data?.ndid === ndid) {
          dispatch(notificationReceived(toNotification(data)));
          alertNewNotification();
        } else if (event === "NOTIFICATION_NEW" && data?.notification) {
          dispatch(receiveNotification({ ...data.notification, hid: data.notification.hid ?? hid }));
          setUnread(data.unreadCount);
          if (!mutedRef.current.includes(data.notification.type)) alertNewNotification();
        } else if (event === "NOTIFICATION_READ" && Array.isArray(data?.ids)) {
          dispatch(receiveNotificationsRead(hid, data.ids));
          setUnread(data.unreadCount);
        }
      },
      // (re)subscribe on every connect; a new hid re-runs this effect
      () => {
        const token = getAccountToken();
        if (token && hid) client.send({ event: "NOTIFICATION_SUBSCRIBE", data: { token, hid } });
      },
    );

    return () => client.close();
  }, [ndid, hid, dispatch]);
};

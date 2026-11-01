import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebSocketClient from "../../../config/websocketClient";
import { WS_BASE_URL } from "../../../data/constant";
import {
  MAX_NOTIFICATIONS,
  notificationReceived,
  notificationsLoaded,
  selectNotifications,
  selectNotificationsOwner,
} from "../../../redux/slice/notificationsSlice";
import { getUserNdid } from "../../../redux/slice/UserSlice";
import { PAGES } from "../../../routes/paths";

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

// Keeps the notifications list of the signed-in account: loads what this
// browser saved, adds what the websocket pushes, and saves every change.
// Mount it once (the navbar does).
export const useNotifications = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectNotifications);
  const owner = useSelector(selectNotificationsOwner);
  const ndid =
    useSelector((state) => getUserNdid(state.userProfile.user)) ||
    localStorage.getItem("ndid");

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

    client.connect(({ data, event }) => {
      if (event === "NOTIFICATION" && data?.ndid === ndid) {
        dispatch(notificationReceived(toNotification(data)));
      }
    });

    return () => client.close();
  }, [ndid, dispatch]);
};

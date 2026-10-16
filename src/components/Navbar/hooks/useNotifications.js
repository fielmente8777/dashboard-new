import { useEffect, useState } from "react";
import WebSocketClient from "../../../config/websocketClient";
import { WS_BASE_URL } from "../../../data/constant";

// Live notifications for the signed-in account, pushed over the websocket.
// They are kept for this browser session only.
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [seenCount, setSeenCount] = useState(0);

  useEffect(() => {
    const client = new WebSocketClient(WS_BASE_URL);

    client.connect(({ data, event }) => {
      if (
        event === "NOTIFICATION" &&
        data?.ndid === localStorage.getItem("ndid")
      ) {
        setNotifications((prev) => [...prev, data]);
      }
    });

    return () => client.close();
  }, []);

  const markAllSeen = () => setSeenCount(notifications.length);

  return {
    notifications,
    unreadCount: notifications.length - seenCount,
    markAllSeen,
  };
};

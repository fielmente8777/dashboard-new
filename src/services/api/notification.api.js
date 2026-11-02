import { NEW_BASE_URL } from "../../data/constant";

export const getNotificationData = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/setting/get-config?hid=${localStorage.getItem("hid")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  return await response.json();
};
export const editNotificationData = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/setting/update-config?hid=${localStorage.getItem("hid")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
       body: JSON.stringify(payload),
    },
  );

  return await response.json();
};

// ---------------------------------------------------------------------------
// In-app notification center (/api/v1/notifications)
// ---------------------------------------------------------------------------

const notificationRequest = async (path, { method = "GET", body } = {}) => {
  const response = await fetch(`${NEW_BASE_URL}/api/v1/notifications${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  return await response.json();
};

// params: { category, type, status: "all" | "unread" | "read", cursor, limit }
export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams({
    hid: localStorage.getItem("hid") || "",
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
    ),
  });
  return notificationRequest(`?${query.toString()}`);
};

export const getNotificationUnreadCount = async () =>
  notificationRequest(`/unread-count?hid=${localStorage.getItem("hid") || ""}`);

export const markNotificationRead = async (id) =>
  notificationRequest(`/${id}/read`, { method: "PATCH" });

export const markNotificationUnread = async (id) =>
  notificationRequest(`/${id}/unread`, { method: "PATCH" });

export const markAllNotificationsRead = async (category) =>
  notificationRequest(
    `/read-all?hid=${localStorage.getItem("hid") || ""}${category ? `&category=${category}` : ""}`,
    { method: "PATCH" },
  );

export const deleteNotification = async (id) =>
  notificationRequest(`/${id}`, { method: "DELETE" });

export const getNotificationPreferences = async () =>
  notificationRequest(`/preferences`);

export const updateNotificationPreferences = async (payload) =>
  notificationRequest(`/preferences`, { method: "PUT", body: payload });

export const getPushPublicKey = async () =>
  notificationRequest(`/push/public-key`);

export const subscribePush = async (subscription) =>
  notificationRequest(`/push/subscribe`, {
    method: "POST",
    body: { subscription },
  });

export const unsubscribePush = async (endpoint) =>
  notificationRequest(`/push/unsubscribe`, {
    method: "POST",
    body: { endpoint },
  });

export const sendTestPush = async () =>
  notificationRequest(`/push/test`, { method: "POST" });

import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/notifications";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Notification", "NotificationCount", "NotificationPrefs"] });

// Every notification list in the cache (any filter), so a change can be
// applied to all of them at once instead of refetching each.
const eachCachedList = (state, run) => {
  notificationsApi.util
    .selectCachedArgsForQuery(state, "getNotifications")
    .forEach((originalArgs) => run({ originalArgs }));
};

// The dashboard notification center, kept on the server (gian).
//   n = { id, type, category, priority, title, body, link, actor, count,
//         isRead, createdAt, lastOccurredAt }
// Every call carries hid: the server lists that location's notifications
// plus the account-wide ones.
export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // { hid, status: "all" | "unread", category?, cursor? } -> { items, nextCursor, hasMore }
    // One cache entry per filter; pages loaded with `cursor` are appended to it.
    getNotifications: build.query({
      query: ({ hid, status = "all", category, cursor, limit = 20 }) => ({
        url: BASE,
        params: { hid, status, category: category || undefined, cursor: cursor || undefined, limit },
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.hid}|${queryArgs.status || "all"}|${queryArgs.category || ""}`,
      merge: (current, incoming, { arg }) => {
        if (!arg.cursor) return incoming;
        const seen = new Set(current.items.map((n) => n.id));
        current.items.push(...incoming.items.filter((n) => !seen.has(n.id)));
        current.nextCursor = incoming.nextCursor;
        current.hasMore = incoming.hasMore;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      transformResponse: (response) => ({
        items: response?.result?.docs || [],
        nextCursor: response?.result?.nextCursor ?? null,
        hasMore: Boolean(response?.result?.hasMore),
      }),
      providesTags: ["Notification"],
      extraOptions: NODE,
    }),

    // hid -> { total, byCategory: { lead: 3, whatsapp: 1, ... } }
    getUnreadNotificationCount: build.query({
      query: (hid) => ({ url: `${BASE}/unread-count`, params: { hid } }),
      transformResponse: (response) => ({
        total: response?.result?.total ?? 0,
        byCategory: response?.result?.byCategory ?? {},
      }),
      providesTags: ["NotificationCount"],
      extraOptions: NODE,
    }),

    // { hid, ids }
    markNotificationsRead: build.mutation({
      query: ({ hid, ids }) => ({ url: `${BASE}/read`, method: "PATCH", params: { hid }, body: { ids } }),
      async onQueryStarted({ hid, ids }, { dispatch, getState, queryFulfilled }) {
        const undo = setRead(dispatch, getState, hid, ids, true);
        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: ["NotificationCount"],
      extraOptions: NODE,
    }),

    // { hid, id }
    markNotificationUnread: build.mutation({
      query: ({ hid, id }) => ({ url: `${BASE}/${id}/unread`, method: "PATCH", params: { hid } }),
      async onQueryStarted({ hid, id }, { dispatch, getState, queryFulfilled }) {
        const undo = setRead(dispatch, getState, hid, [id], false);
        try {
          await queryFulfilled;
        } catch {
          undo();
        }
      },
      invalidatesTags: ["NotificationCount"],
      extraOptions: NODE,
    }),

    // { hid, category? }
    markAllNotificationsRead: build.mutation({
      query: ({ hid, category }) => ({
        url: `${BASE}/read-all`,
        method: "PATCH",
        params: { hid, category: category || undefined },
      }),
      async onQueryStarted({ hid, category }, { dispatch, getState, queryFulfilled }) {
        const patches = [];
        eachCachedList(getState(), ({ originalArgs }) => {
          if (originalArgs?.hid !== hid) return;
          patches.push(
            dispatch(
              notificationsApi.util.updateQueryData("getNotifications", originalArgs, (draft) => {
                draft.items.forEach((n) => {
                  if (!category || n.category === category) n.isRead = true;
                });
              }),
            ),
          );
        });
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ["NotificationCount"],
      extraOptions: NODE,
    }),

    // { hid, ids } - removes them for this user only
    archiveNotifications: build.mutation({
      query: ({ hid, ids }) => ({ url: BASE, method: "DELETE", params: { hid }, body: { ids } }),
      async onQueryStarted({ hid, ids }, { dispatch, getState, queryFulfilled }) {
        const patches = [];
        eachCachedList(getState(), ({ originalArgs }) => {
          if (originalArgs?.hid !== hid) return;
          patches.push(
            dispatch(
              notificationsApi.util.updateQueryData("getNotifications", originalArgs, (draft) => {
                draft.items = draft.items.filter((n) => !ids.includes(n.id));
              }),
            ),
          );
        });
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ["NotificationCount"],
      extraOptions: NODE,
    }),

    // -> { preferences: { inApp: { mutedTypes }, push: { enabled, mutedTypes } }, availableTypes }
    getNotificationPreferences: build.query({
      query: (hid) => ({ url: `${BASE}/preferences`, params: { hid } }),
      transformResponse: (response) => response?.result || null,
      providesTags: ["NotificationPrefs"],
      extraOptions: NODE,
    }),

    // { hid, inApp?: { mutedTypes }, push?: { enabled?, mutedTypes? } }
    updateNotificationPreferences: build.mutation({
      query: ({ hid, ...body }) => ({ url: `${BASE}/preferences`, method: "PUT", params: { hid }, body }),
      invalidatesTags: ["NotificationPrefs", "NotificationCount", "Notification"],
      extraOptions: NODE,
    }),

    // -> { enabled, publicKey } - enabled is false until the server has VAPID keys
    getPushConfig: build.query({
      query: () => `${BASE}/push/public-key`,
      transformResponse: (response) => ({
        enabled: Boolean(response?.result?.enabled),
        publicKey: response?.result?.publicKey || null,
      }),
      extraOptions: NODE,
    }),

    // PushSubscriptionJSON from the browser
    subscribePush: build.mutation({
      query: (subscription) => ({ url: `${BASE}/push/subscribe`, method: "POST", body: { subscription } }),
      extraOptions: NODE,
    }),

    // endpoint of this browser's subscription
    unsubscribePush: build.mutation({
      query: (endpoint) => ({ url: `${BASE}/push/unsubscribe`, method: "POST", body: { endpoint } }),
      extraOptions: NODE,
    }),

    // -> { sent, failed, subscriptions }
    sendTestPush: build.mutation({
      query: () => ({ url: `${BASE}/push/test`, method: "POST" }),
      transformResponse: (response) => response?.result || {},
      extraOptions: NODE,
    }),
  }),
});

// marks `ids` read (or unread) in every cached list; returns an undo
function setRead(dispatch, getState, hid, ids, isRead) {
  const patches = [];
  eachCachedList(getState(), ({ originalArgs }) => {
    if (originalArgs?.hid !== hid) return;
    patches.push(
      dispatch(
        notificationsApi.util.updateQueryData("getNotifications", originalArgs, (draft) => {
          draft.items.forEach((n) => {
            if (ids.includes(n.id)) n.isRead = isRead;
          });
        }),
      ),
    );
  });
  return () => patches.forEach((p) => p.undo());
}

// A notification that arrived over the websocket: put it at the top of
// every cached list it belongs in (a grouped one moves up with its new count).
export const receiveNotification = (notification) => (dispatch, getState) => {
  eachCachedList(getState(), ({ originalArgs }) => {
    if (!originalArgs || originalArgs.hid !== String(notification.hid ?? originalArgs.hid)) return;
    if (originalArgs.status === "read") return;
    if (originalArgs.category && originalArgs.category !== notification.category) return;
    dispatch(
      notificationsApi.util.updateQueryData("getNotifications", originalArgs, (draft) => {
        draft.items = [notification, ...draft.items.filter((n) => n.id !== notification.id)];
      }),
    );
  });
};

// Read on another tab or device: mark them read here too.
export const receiveNotificationsRead = (hid, ids) => (dispatch, getState) => {
  setRead(dispatch, getState, hid, ids, true);
};

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationsReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkAllNotificationsReadMutation,
  useArchiveNotificationsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetPushConfigQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  useSendTestPushMutation,
} = notificationsApi;

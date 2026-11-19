import { createSlice, nanoid } from "@reduxjs/toolkit";

// Notifications pushed over the websocket. The server keeps no history, so
// the list is saved in this browser, per account (see useNotifications),
// and capped at the newest MAX_NOTIFICATIONS.
export const MAX_NOTIFICATIONS = 200;

// { id, kind, title, message, link, receivedAt, read }
//   kind - picks the icon (see components/Notifications/notificationKinds)
//   link - page inside the dashboard to open on click, relative like PAGES.*
const notificationsSlice = createSlice({
  name: "notifications",
  // ndid - the account `items` belong to (null until loaded)
  initialState: { ndid: null, items: [] },
  reducers: {
    // { ndid, items }
    notificationsLoaded: (state, action) => {
      state.ndid = action.payload.ndid;
      state.items = action.payload.items;
    },
    notificationReceived: {
      reducer: (state, action) => {
        state.items.unshift(action.payload);
        state.items.length = Math.min(state.items.length, MAX_NOTIFICATIONS);
      },
      prepare: (notification) => ({
        payload: {
          id: nanoid(),
          receivedAt: new Date().toISOString(),
          read: false,
          ...notification,
        },
      }),
    },
    notificationRead: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    allNotificationsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    notificationRemoved: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    notificationsCleared: (state) => {
      state.items = [];
    },
  },
});

export const {
  notificationsLoaded,
  notificationReceived,
  notificationRead,
  allNotificationsRead,
  notificationRemoved,
  notificationsCleared,
} = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectNotificationsOwner = (state) => state.notifications.ndid;
export const selectUnreadCount = (state) =>
  state.notifications.items.filter((n) => !n.read).length;

export default notificationsSlice.reducer;

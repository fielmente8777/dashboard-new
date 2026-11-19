import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slice/LoginSlice";
import userProfileReducer from "./slice/UserSlice.js";
import applicantsReducer from "./slice/TalentSlice.js";
import websiteDataReducer from "./slice/websiteDataSlice.js";
import toggleReducer from "./slice/SidebarToggle.js";
import subscriptionReducer from "./slice/subscriptionDataSlice.js";
import themeReducer from "./slice/themeSlice.js";
import notificationsReducer from "./slice/notificationsSlice.js";
import { baseApi } from "./api/baseApi.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer, // Add user slice to the store
    subscription: subscriptionReducer,
    applicants: applicantsReducer, // Add applicants slice to the store
    hotelsWebsiteData: websiteDataReducer,
    toggle: toggleReducer,
    theme: themeReducer,
    notifications: notificationsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // upload mutations keep the File they were called with in this slice
      serializableCheck: { ignoredPaths: [`${baseApi.reducerPath}.mutations`] },
    }).concat(baseApi.middleware),
});

// lets queries that opt in (refetchOnFocus / refetchOnReconnect) refresh,
// e.g. the AI credit status after a recharge in another tab
setupListeners(store.dispatch);

export default store;

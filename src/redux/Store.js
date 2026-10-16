import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/LoginSlice";
import userProfileReducer from "./slice/UserSlice.js";
import applicantsReducer from "./slice/TalentSlice.js";
import websiteDataReducer from "./slice/websiteDataSlice.js";
import toggleReducer from "./slice/SidebarToggle.js";
import bookingEngineReducer from "./slice/bookingEngine.js";
import engineDetailsReducer from "./slice/bookingEngineDetails.js";
import subscriptionReducer from "./slice/subscriptionDataSlice.js";
import { baseApi } from "./api/baseApi.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer, // Add user slice to the store
    subscription: subscriptionReducer,
    applicants: applicantsReducer, // Add applicants slice to the store
    hotelsWebsiteData: websiteDataReducer,
    toggle: toggleReducer,
    bookingEngine: bookingEngineReducer,
    engineDetails: engineDetailsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // upload mutations keep the File they were called with in this slice
      serializableCheck: { ignoredPaths: [`${baseApi.reducerPath}.mutations`] },
    }).concat(baseApi.middleware),
});

export default store;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/LoginSlice";
import userProfileReducer from "./slice/UserSlice.js";
import applicantsReducer from "./slice/TalentSlice.js";
import websiteDataReducer from "./slice/websiteDataSlice.js";
import leadGenFormReduces from "./slice/MetaLeads.js";
import toggleReducer from "./slice/SidebarToggle.js";
import bookingEngineReducer from "./slice/bookingEngine.js";
import engineDetailsReducer from "./slice/bookingEngineDetails.js";
import subscriptionReducer from "./slice/subscriptionDataSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer, // Add user slice to the store
    subscription: subscriptionReducer,
    applicants: applicantsReducer, // Add applicants slice to the store
    hotelsWebsiteData: websiteDataReducer,
    metaLeads: leadGenFormReduces, // Add website data slice to the store
    toggle: toggleReducer,
    bookingEngine: bookingEngineReducer,
    engineDetails: engineDetailsReducer,
  },
});

export default store;

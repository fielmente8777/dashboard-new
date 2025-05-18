import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/LoginSlice";
import userProfileReducer from "./slice/UserSlice.js";
import applicantsReducer from "./slice/TalentSlice.js";
import websiteDataReducer from "./slice/websiteDataSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer, // Add user slice to the store
    applicants: applicantsReducer, // Add applicants slice to the store
    hotelsWebsiteData: websiteDataReducer, // Add website data slice to the store
  },
});

export default store;

import { createSlice } from "@reduxjs/toolkit";
import { sessionApi } from "../api/sessionApi";

const initialState = {
  hotels: null,
  currentLoactionWebsiteData: null,
  newsletterData: null,
  loading: false,
  error: null,
};

const { getWebsiteData } = sessionApi.endpoints;

// Filled by the getWebsiteData query (loadWebsiteData / refreshWebsiteData in
// redux/session.js); a request skipped because the answer is cached comes
// back as a "condition" rejection.
const websiteDataSlice = createSlice({
  name: "websiteData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(getWebsiteData.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(getWebsiteData.matchFulfilled, (state, action) => {
        const data = action.payload?.WebsiteData || action.payload?.Hotels;
        const { hid } = action.meta.arg.originalArgs;
        state.loading = false;
        state.hotels = data;
        state.currentLoactionWebsiteData = data?.[String(hid)];
        state.newsletterData = action.payload?.Newsletter || [];
      })
      .addMatcher(getWebsiteData.matchRejected, (state, action) => {
        if (action.meta.condition) return;
        state.loading = false;
        state.error = action.error?.message ?? "Could not load the website data";
      });
  },
});

export default websiteDataSlice.reducer;

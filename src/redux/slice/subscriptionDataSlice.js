import { createSlice } from "@reduxjs/toolkit";
import { sessionApi } from "../api/sessionApi";

const initialState = {
  loading: false,
  subscription: null,
  error: null,
};

const { getSubscription } = sessionApi.endpoints;

// Filled by the getSubscription query (loadSession / refreshSubscription in
// redux/session.js); a request skipped because the answer is cached comes
// back as a "condition" rejection.
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscription: (state) => {
      state.subscription = null;
      state.error = null;
      state.loading = false;
    },

    clearSubscriptionApps: (state) => {
      state.subscription = {
        ...state.subscription,
        apps: [],
      };
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(getSubscription.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(getSubscription.matchFulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addMatcher(getSubscription.matchRejected, (state, action) => {
        if (action.meta.condition) return;
        // pages treat a failed load as "no plan yet", as before
        state.loading = false;
        state.subscription = [];
        state.error = action.error?.message ?? "Failed to fetch subscription";
      });
  },
});

export const { clearSubscription, clearSubscriptionApps } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;

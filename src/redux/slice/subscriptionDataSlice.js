import { createSlice } from "@reduxjs/toolkit";
import { getMySubscription } from "../../services/api/subscription";

const initialState = {
  loading: false,
  subscription: null,
  error: null,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    getSubscriptionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    getSubscriptionSuccess: (state, action) => {
      state.loading = false;
      state.subscription = action.payload;
    },

    getSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearSubscription: (state) => {
      state.subscription = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  getSubscriptionRequest,
  getSubscriptionSuccess,
  getSubscriptionFailure,
  clearSubscription,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

// THUNK
export const fetchSubscriptionData = (token) => async (dispatch) => {
  dispatch(getSubscriptionRequest());

  try {
    const data = await getMySubscription(token);

    dispatch(getSubscriptionSuccess(data?.result?.docs || []));

    return {
      success: true,
      data,
    };
  } catch (error) {
    dispatch(
      getSubscriptionFailure(error?.message || "Failed to fetch subscription"),
    );

    return {
      success: false,
      error: error?.message,
    };
  }
};

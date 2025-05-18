import { createSlice } from "@reduxjs/toolkit";
import { GetwebsiteDetails } from "../../services/api/websiteDetails.api";
import { act } from "react";

const initialState = {
  hotels: null,
  currentLoactionWebsiteData: null,
  loading: false,
  error: null,
};

const websiteDataSlice = createSlice({
  name: "websiteData",
  initialState,
  reducers: {
    getWebsiteDataRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    getWebsiteDataSucccess: (state, action) => {
      state.loading = false;
      state.hotels = action.payload;
    },
    getWebsiteDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCurrentLocationWebsiteData: (state, action) => {
      const { data, hid } = action.payload;

      const currentLocationWebsiteData = data?.find(
        (item) => item?.hId === String(hid)
      );

      state.loading = false;
      state.currentLoactionWebsiteData = currentLocationWebsiteData;
    },
  },
});

export const {
  getWebsiteDataRequest,
  getWebsiteDataSucccess,
  getWebsiteDataFailure,
  fetchCurrentLocationWebsiteData,
} = websiteDataSlice.actions;

export default websiteDataSlice.reducer;

// Thunk function to fetch user profile
export const fetchWebsiteData = (token, hid) => async (dispatch) => {
  dispatch(getWebsiteDataRequest());
  try {
    const data = await GetwebsiteDetails(token);
    dispatch(getWebsiteDataSucccess(data));
    dispatch(
      fetchCurrentLocationWebsiteData({
        data,
        hid,
      })
    );
    // return { success: true, response: data };
  } catch (error) {
    dispatch(getWebsiteDataFailure(error.message));
    return { success: false, error: error.message };
  }
};

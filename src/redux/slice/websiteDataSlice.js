import { createSlice } from "@reduxjs/toolkit";
import { GetwebsiteDetails } from "../../services/api/websiteDetails.api";
import { act } from "react";

const initialState = {
  hotels: null,
  currentLoactionWebsiteData: null,
  newsletterData: null,
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
      const currentLocationWebsiteData = data[hid];
      state.loading = false;
      state.currentLoactionWebsiteData = currentLocationWebsiteData;
    },
    newsletterData: (state, action) => {
      state.loading = false;
      state.newsletterData = action.payload || [];
    }
  },
});

export const {
  getWebsiteDataRequest,
  getWebsiteDataSucccess,
  getWebsiteDataFailure,
  fetchCurrentLocationWebsiteData,
  newsletterData
} = websiteDataSlice.actions;

export default websiteDataSlice.reducer;

// Thunk function to fetch user profile
export const fetchWebsiteData = (token, hid) => async (dispatch) => {
  dispatch(getWebsiteDataRequest());
  try {
    const data = await GetwebsiteDetails(token);

    dispatch(getWebsiteDataSucccess(data?.WebsiteData || data.Hotels));
    dispatch(
      fetchCurrentLocationWebsiteData({
        data: data?.WebsiteData || data.Hotels,
        hid,
      })
    );
    dispatch(newsletterData(data?.Newsletter));
    // return { success: true, response: data };
  } catch (error) {
    dispatch(getWebsiteDataFailure(error.message));
    return { success: false, error: error.message };
  }
};

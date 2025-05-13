import { createSlice } from "@reduxjs/toolkit";
import { GetwebsiteDetails } from "../../services/api";

const initialState = {
  websiteData: null,
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
      state.user = action.payload;
    },
    getWebsiteDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getWebsiteDataRequest,
  getWebsiteDataSucccess,
  getWebsiteDataFailure,
} = websiteDataSlice.actions;

export default websiteDataSlice.reducer;

// Thunk function to fetch user profile
export const fetchWebsiteData = (token) => async (dispatch) => {
  dispatch(getWebsiteDataRequest());
  try {
    const data = await GetwebsiteDetails(token);
    dispatch(getWebsiteDataSucccess(data));
    return { success: true, response: data };
  } catch (error) {
    dispatch(getWebsiteDataFailure(error.message));
    return { success: false, error: error.message };
  }
};

import { createSlice } from "@reduxjs/toolkit";
import handleLocalStorage from "../../utils/handleLocalStorage";
import {
  getAuthUserProfile,
  getUserProfile,
} from "../../services/api/profile.api";

const initialState = {
  user: null,
  authUser: null,
  hid: handleLocalStorage("hid") || null,
  loading: false,
  isAuthLoading: false,
  error: null,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    getUserProfileRequest: (state) => {
      state.isAuthLoading = true;
      state.loading = true;
      state.error = null;
    },
    setAuthUserProfile: (state, action) => {
      state.isAuthLoading = false;
      state.authUser = action.payload?.User;
    },
    getUserProfileSuccess: (state, action) => {
      state.loading = false;
      state.user = {
        ...action.payload,
      };
    },
    getUserProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setHid: (state, action) => {
      state.loading = false;
      state.hid = action.payload;
      if (action?.payload) {
        handleLocalStorage("hid", action?.payload);
      }
    },
  },
});

export const {
  getUserProfileRequest,
  getUserProfileSuccess,
  getUserProfileFailure,
  setCurrentLocation,
  setAuthUserProfile,
  setHid,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;

// Thunk function to fetch user profile
export const fetchUserProfile = (token) => async (dispatch) => {
  dispatch(getUserProfileRequest());
  try {
    const data = await getUserProfile(token);

    dispatch(getUserProfileSuccess(data));
    return { success: true, response: data };
  } catch (error) {
    dispatch(getUserProfileFailure(error.message));
    return { success: false, error: error.message };
  }
};

export const fetchAuthUserProfile = (token) => async (dispatch) => {
  dispatch(getUserProfileRequest());
  if (token) {
    try {
      if (token) {
        const data = await getAuthUserProfile(token);
        dispatch(setAuthUserProfile(data));
        // console.log(data);
        return { success: true, response: data };
      }
    } catch (error) {
      dispatch(getUserProfileFailure(error.message));
      return { success: false, error: error.message };
    }
  }
};

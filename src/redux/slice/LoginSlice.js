import { createSlice } from "@reduxjs/toolkit";
import { UserLogin } from "../../services/api/auth.api";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    loginUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { loginUserRequest, loginUserSuccess, loginUserFailure } =
  authSlice.actions;

export default authSlice.reducer;

// Thunk function to create a user
export const loginUser = (userData) => async (dispatch) => {
  dispatch(loginUserRequest());
  try {
    const response = await UserLogin(userData);
    dispatch(loginUserSuccess(response));
    return { success: true, data: response };
  } catch (error) {
    const errorMessage = error.response?.data?.msg || "User Login failed.";
    console.error("User Login API Error:", errorMessage);
    dispatch(loginUserFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

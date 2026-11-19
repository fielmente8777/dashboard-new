import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

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
    const login = dispatch(
      authApi.endpoints.login.initiate({ email: userData.email, password: userData.password }),
    );
    let response;
    try {
      response = await login.unwrap();
    } finally {
      login.reset();
    }
    dispatch(loginUserSuccess(response));
    return { success: true, data: response };
  } catch (error) {
    const errorMessage = error?.data?.msg || "User Login failed.";
    console.error("User Login API Error:", errorMessage);
    dispatch(loginUserFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

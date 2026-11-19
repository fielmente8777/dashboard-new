import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: ({ email, password }) => ({
        url: "/eazotel/ceateuser",
        method: "POST",
        body: {
          register: "false",
          emailId: email,
          userName: "",
          accesskey: password,
        },
      }),
      extraOptions: { skipAuth: true },
    }),

    // `credential` is the ID token returned by Google Sign-In
    googleLogin: build.mutation({
      query: (credential) => ({
        url: "/user/googleauth",
        method: "POST",
        body: {},
        headers: { Authorization: `Bearer ${credential}` },
      }),
      extraOptions: { skipAuth: true },
    }),

    // Emails a 6-digit reset code (gian backend)
    forgotPassword: build.mutation({
      query: ({ email }) => ({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
      extraOptions: { service: "node", skipAuth: true },
    }),

    resetPassword: build.mutation({
      query: ({ email, otp, password }) => ({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        body: { email, otp, password },
      }),
      extraOptions: { service: "node", skipAuth: true },
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

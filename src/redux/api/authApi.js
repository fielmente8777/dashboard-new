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

    forgotPassword: build.mutation({
      query: ({ email }) => ({
        url: "/eazotel/forgot/password",
        method: "POST",
        body: { email },
      }),
      extraOptions: { skipAuth: true },
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
} = authApi;

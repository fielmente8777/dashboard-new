import { baseApi } from "./baseApi";

// Kept for the whole session. The slices (userProfile, subscription,
// hotelsWebsiteData) copy each answer, and pages read it from there.
// Load and refresh them with the thunks in redux/session.js.
const SESSION_SECONDS = 24 * 60 * 60;

// Every endpoint takes the token, even where the request does not use it, so a
// new sign-in never reads the previous account's answer from the cache.
export const sessionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // token -> the account: { Status, Data: { ndid }, Profile: { hotels },
    // SubscriptionDetails, ... }
    getUserProfile: build.query({
      query: (token) => `/eazotel/getuser/${token}`,
      keepUnusedDataFor: SESSION_SECONDS,
      // the token is in the url; this endpoint has never been sent the header
      extraOptions: { skipAuth: true },
    }),

    // token -> the signed-in user: { role, isAdmin, assigned_location, ... }
    // Sent with the signed-in token, not the switched-into account's one, so
    // an owner stays the owner after switching accounts.
    getAuthUser: build.query({
      query: (token) => ({
        url: "/user/user-details",
        headers: { Authorization: `Bearer ${token}` },
      }),
      transformResponse: (response) => response?.User ?? null,
      keepUnusedDataFor: SESSION_SECONDS,
    }),

    // { token, hid } -> { WebsiteData | Hotels, Newsletter }
    // hid picks the selected location's website out of the answer.
    getWebsiteData: build.query({
      query: ({ token }) => `/cms/get/navbar?id=${token}`,
      keepUnusedDataFor: SESSION_SECONDS,
      extraOptions: { skipAuth: true },
    }),

    // token -> the account's plan and apps
    getSubscription: build.query({
      query: () => "/api/v1/subscription/my",
      transformResponse: (response) => response?.result?.docs || [],
      keepUnusedDataFor: SESSION_SECONDS,
      extraOptions: { service: "node" },
    }),
  }),
});

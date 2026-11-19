import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/seo";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["GbpLocation", "GbpReview", "GbpAutopilot"] });

// Google Business Profile (gian: /api/v1/seo, controllers/seoController).
// The account is resolved from the token; locationId picks one listing.
//   location = { locationId, locationName, address, averageRating,
//                totalReviewCount, isVerified, lastSyncTime, googleAccountId, ... }
//   review   = { reviewId, reviewerDisplayName, reviewerPhotoUrl, starRating
//                ("ONE".."FIVE"), comment, createTime, hasReply, replyComment,
//                aiReplyDraft, replyStatus, isAutoReplied }
export const gbpApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ndid -> { googleAuthUrl } (sign-in page; no login header needed)
    startGbpAuth: build.mutation({
      query: (ndid) => ({ url: `${BASE}/oauth/start`, params: { ndid } }),
      extraOptions: { service: "node", skipAuth: true },
    }),

    // pulls the Google accounts' listings into gian
    syncGbpLocations: build.mutation({
      query: () => ({ url: `${BASE}/sync/accounts`, method: "POST" }),
      invalidatesTags: ["GbpLocation"],
      extraOptions: NODE,
    }),

    // -> locations[] of every Google account this login connected
    getGbpLocations: build.query({
      query: () => `${BASE}/locations`,
      transformResponse: (response) => response?.data || [],
      providesTags: ["GbpLocation"],
      extraOptions: NODE,
    }),

    // { locationId, filter: all | unreplied | replied | positive | negative, page }
    // -> { reviews, total, totalPages }
    getGbpReviews: build.query({
      query: ({ locationId, filter = "all", page = 1, limit = 20 }) => ({
        url: `${BASE}/locations/${encodeURIComponent(locationId)}/reviews`,
        params: { filter, page, limit },
      }),
      transformResponse: (response) => ({
        reviews: response?.data || [],
        total: response?.pagination?.total ?? 0,
        totalPages: response?.pagination?.totalPages ?? 1,
      }),
      providesTags: ["GbpReview"],
      extraOptions: NODE,
    }),

    // locationId -> fetches the newest reviews from Google
    syncGbpReviews: build.mutation({
      query: (locationId) => ({
        url: `${BASE}/locations/${encodeURIComponent(locationId)}/reviews/sync`,
        method: "POST",
      }),
      invalidatesTags: ["GbpReview", "GbpLocation"],
      extraOptions: NODE,
    }),

    // reviewId -> { aiReply } written in the location's autopilot tone
    generateGbpReply: build.mutation({
      query: (reviewId) => ({
        url: `${BASE}/reviews/${encodeURIComponent(reviewId)}/generate-reply`,
        method: "POST",
      }),
      transformResponse: (response) => response?.data?.aiReply || "",
      extraOptions: NODE,
    }),

    // { reviewId, replyText } - posts the reply on Google
    postGbpReply: build.mutation({
      query: ({ reviewId, replyText }) => ({
        url: `${BASE}/reviews/${encodeURIComponent(reviewId)}/approve-reply`,
        method: "POST",
        body: { replyText },
      }),
      invalidatesTags: ["GbpReview"],
      extraOptions: NODE,
    }),

    // locationId -> { autoReplyEnabled, autoReplyMinStars, autoReplyTone,
    //   autoReplySignature, reviewAlertEnabled, reviewAlertMinStars, weeklyReportEnabled }
    getGbpAutopilot: build.query({
      query: (locationId) => `${BASE}/locations/${encodeURIComponent(locationId)}/autopilot`,
      transformResponse: (response) => response?.data || null,
      providesTags: ["GbpAutopilot"],
      extraOptions: NODE,
    }),

    // { locationId, ...fields to change }
    updateGbpAutopilot: build.mutation({
      query: ({ locationId, ...body }) => ({
        url: `${BASE}/locations/${encodeURIComponent(locationId)}/autopilot`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["GbpAutopilot"],
      extraOptions: NODE,
    }),

    disconnectGbp: build.mutation({
      query: (googleAccountId) => ({
        url: `${BASE}/disconnect/${encodeURIComponent(googleAccountId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GbpLocation"],
      extraOptions: NODE,
    }),
  }),
});

export const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export const {
  useStartGbpAuthMutation,
  useSyncGbpLocationsMutation,
  useGetGbpLocationsQuery,
  useGetGbpReviewsQuery,
  useSyncGbpReviewsMutation,
  useGenerateGbpReplyMutation,
  usePostGbpReplyMutation,
  useGetGbpAutopilotQuery,
  useUpdateGbpAutopilotMutation,
  useDisconnectGbpMutation,
} = gbpApi;

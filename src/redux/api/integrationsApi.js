import { baseApi } from "./baseApi";

const NODE = { service: "node" };
// these endpoints have never been sent the Authorization header
const NODE_OPEN = { service: "node", skipAuth: true };
const CORE_OPEN = { skipAuth: true };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Integration", "ExotelAccount"] });

// Connecting and disconnecting apps on the Integrations page.
// Each answer is passed through as the API sends it.
export const integrationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // hid -> which apps are connected: { meta, exotel, metaWhatsapp,
    // googleAdsInsight: { status, lastSyncTime }, ... }
    // Read it with hooks/useIntegrationStatus.
    getIntegrationStatus: build.query({
      query: (hid) => ({
        url: "/api/v1/integration/get",
        params: { hid },
        headers: { "ngrok-skip-browser-warning": "true" },
      }),
      transformResponse: (response) => response?.result?.docs,
      providesTags: ["Integration"],
      extraOptions: NODE,
    }),

    // { ndid, hid } -> { result: { docs: { authUrl } } }
    connectMetaLead: build.mutation({
      query: ({ ndid, hid }) => ({
        url: "/api/v1/auth/meta/start",
        params: { ndid, hid },
        headers: { "x-ndid": ndid, "ngrok-skip-browser-warning": "true" },
      }),
      extraOptions: NODE_OPEN,
    }),

    // ndid -> { googleAuthUrl }
    startGoogleAdsAuth: build.mutation({
      query: (ndid) => ({
        url: "/api/v1/google-ads/auth/google/start",
        params: { ndid },
      }),
      extraOptions: NODE_OPEN,
    }),

    // hid -> { url } - Google's consent page; afterwards gian sends the user
    // back to /integrations?gmail=connected|cancelled
    startGmailAuth: build.mutation({
      query: (hid) => ({ url: "/api/v1/gmail-leads/connect", params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, id } - id is the app's status key -> { success, responseMessage }
    disconnectIntegration: build.mutation({
      query: ({ hid, id }) => ({
        url: "/api/v1/integration/update",
        method: "PUT",
        params: { hid },
        body: { id },
      }),
      extraOptions: NODE,
    }),

    // { hid, apiKey, authToken, accountSID, subDomain, virtualNumber } -> { success, responseMessage }
    connectExotel: build.mutation({
      query: ({ hid, ...body }) => ({
        url: "/api/v1/call/auth/connect",
        method: "POST",
        params: { hid },
        body,
      }),
      invalidatesTags: ["Integration", "ExotelAccount"],
      extraOptions: NODE,
    }),

    // hid -> { connected, connectedAt, config: { accountSID, subDomain,
    // virtualNumber, apiKey (masked) }, balance: { amount, currency, pricingPlan,
    // updatedAt, isLow, isEmpty, lowThreshold } | null, balanceError, checkedAt }
    // The keys are per account; hid only keeps one cache entry per hotel.
    // gian asks Exotel for the balance at most once a minute.
    getExotelOverview: build.query({
      query: () => "/api/v1/call/account/overview",
      transformResponse: (response) => response?.result?.doc || null,
      providesTags: ["ExotelAccount"],
      extraOptions: NODE,
    }),

    // hid -> asks Exotel again now (skips that minute) and updates the overview
    refreshExotelOverview: build.mutation({
      query: () => ({ url: "/api/v1/call/account/overview", params: { fresh: true } }),
      transformResponse: (response) => response?.result?.doc || null,
      async onQueryStarted(hid, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(integrationsApi.util.upsertQueryData("getExotelOverview", hid, data));
        } catch {
          // the page keeps the last answer and shows the error toast
        }
      },
      extraOptions: NODE,
    }),

    // { client_id, client_secret } -> { Status, Message }
    connectOtpLess: build.mutation({
      query: (body) => ({ url: "/otp/connect", method: "POST", body }),
    }),

    // Google Analytics: hid -> { connected }
    getAnalyticsStatus: build.mutation({
      query: (hid) => ({ url: `/google/status/${hid}` }),
      extraOptions: CORE_OPEN,
    }),

    disconnectAnalytics: build.mutation({
      query: (hid) => ({ url: "/google/disconnect", method: "POST", body: { hid } }),
      extraOptions: CORE_OPEN,
    }),
  }),
});

export const {
  useGetIntegrationStatusQuery,
  useConnectMetaLeadMutation,
  useStartGoogleAdsAuthMutation,
  useStartGmailAuthMutation,
  useDisconnectIntegrationMutation,
  useConnectExotelMutation,
  useGetExotelOverviewQuery,
  useRefreshExotelOverviewMutation,
  useConnectOtpLessMutation,
  useGetAnalyticsStatusMutation,
  useDisconnectAnalyticsMutation,
} = integrationsApi;

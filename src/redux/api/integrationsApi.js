import { baseApi } from "./baseApi";

const NODE = { service: "node" };
// these endpoints have never been sent the Authorization header
const NODE_OPEN = { service: "node", skipAuth: true };
const CORE_OPEN = { skipAuth: true };

// Connecting and disconnecting apps on the Integrations page.
// Each answer is passed through as the API sends it.
export const integrationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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

    // ndid -> { auth_url }
    startGmailAuth: build.mutation({
      query: (ndid) => ({
        url: "/api/v1/emails/google/login",
        params: { ndid },
      }),
      extraOptions: NODE_OPEN,
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

    // { apiKey, authToken, accountSID, subDomain, virtualNumber } -> { success, responseMessage }
    connectExotel: build.mutation({
      query: (body) => ({ url: "/api/v1/call/auth/connect", method: "POST", body }),
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
  useConnectMetaLeadMutation,
  useStartGoogleAdsAuthMutation,
  useStartGmailAuthMutation,
  useDisconnectIntegrationMutation,
  useConnectExotelMutation,
  useConnectOtpLessMutation,
  useGetAnalyticsStatusMutation,
  useDisconnectAnalyticsMutation,
} = integrationsApi;

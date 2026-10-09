import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Call"] });

export const callsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // true when the calling provider (Exotel) is connected for this account
    getCallConnection: build.query({
      query: () => "/api/v1/call/connection/status",
      transformResponse: (response) => Boolean(response?.result?.status),
      extraOptions: NODE,
    }),

    // { hid, page, limit, search? } -> { calls, total }
    getCalls: build.query({
      query: ({ hid, page, limit, search }) => ({
        url: "/api/v1/call/getall",
        params: { hid, page, limit, search: search || undefined },
      }),
      transformResponse: (response) => ({
        calls: response?.result?.docs?.calls || [],
        total: response?.result?.pagination?.total || 0,
      }),
      providesTags: ["Call"],
      extraOptions: NODE,
    }),

    // pulls the latest calls from the provider into our list
    importCalls: build.mutation({
      query: (hid) => ({ url: "/api/v1/call/import", params: { hid } }),
      invalidatesTags: ["Call"],
      extraOptions: NODE,
    }),

    // { hid, fromNumber, toNumber } - rings `fromNumber` first, then connects it to `toNumber`
    makeCall: build.mutation({
      query: ({ hid, ...body }) => ({
        url: "/api/v1/call/auth/make-call",
        method: "POST",
        params: { hid },
        body,
      }),
      extraOptions: NODE,
    }),

    // { hid, sid, ...fields to change } e.g. stage, priority, followUpDate
    updateCall: build.mutation({
      query: ({ hid, ...body }) => ({
        url: `/api/v1/call/update-call/${body.sid}`,
        method: "PUT",
        params: { hid },
        body,
      }),
      invalidatesTags: ["Call"],
      extraOptions: NODE,
    }),

    // { hid, from, to } (ISO dates) -> { summary, trend, statusDistribution, directionDistribution }
    getCallAnalytics: build.query({
      query: ({ hid, from, to }) => ({
        url: "/api/v1/call/analytics",
        params: { hid, from, to },
      }),
      transformResponse: (response) => response?.result?.doc || null,
      extraOptions: NODE,
    }),

    // --- shared look-ups the calls pages need ---
    // team members of the account (the core API takes the token in the URL)
    getTeamUsers: build.query({
      query: () => `/user/${getToken()}`,
      transformResponse: (response) => response?.data || [],
      extraOptions: { skipAuth: true },
    }),

    getWhatsAppTemplates: build.query({
      query: (hid) => ({
        url: "/api/v1/whatsapp/message/template/get",
        params: { hid },
      }),
      transformResponse: (response) => response?.result?.docs?.data || [],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetCallConnectionQuery,
  useGetCallsQuery,
  useImportCallsMutation,
  useMakeCallMutation,
  useUpdateCallMutation,
  useGetCallAnalyticsQuery,
  useGetTeamUsersQuery,
  useGetWhatsAppTemplatesQuery,
} = callsApi;

import { baseApi } from "./baseApi";

const SALES_AGENT = { service: "salesAgent" };

// Website tracking: who visited the hotel's website (recorded by the Eazbot
// widget) and what they did there. Both take { skip, limit }.
export const websiteTrackerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVisitors: build.query({
      query: ({ skip, limit }) => ({ url: "/api/v1/webtrack/visitors", params: { skip, limit } }),
      transformResponse: (response) => response?.data || [],
      extraOptions: SALES_AGENT,
    }),

    getVisitorSessions: build.query({
      query: ({ skip, limit }) => ({ url: "/api/v1/webtrack/sessions", params: { skip, limit } }),
      transformResponse: (response) => response?.data || [],
      extraOptions: SALES_AGENT,
    }),
  }),
});

export const { useGetVisitorsQuery, useGetVisitorSessionsQuery } = websiteTrackerApi;

import { baseApi } from "./baseApi";

export const metaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { hid, period } - period: "day" | "week" | "28_days" | "90_days"
    // Resolves with { cards, performanceOverview, topPosts }.
    getMetaPageOverview: build.query({
      query: ({ hid, period }) => ({
        url: "/api/v1/meta/page/overview",
        params: { hid, period },
      }),
      transformResponse: (response) => response?.result?.doc || null,
      extraOptions: { service: "node" },
    }),

    // hid -> how many Meta leads are saved for the account's connected page.
    // The API finds the page from the token; hid only keeps one cache entry
    // per hotel. Fails with 404 when no page is connected.
    getMetaLeadsTotal: build.query({
      query: () => ({ url: "/api/v1/meta/leads", params: { page: 1, limit: 1 } }),
      transformResponse: (response) => response?.result?.pagination?.total ?? 0,
      extraOptions: { service: "node" },
    }),
  }),
});

export const { useGetMetaPageOverviewQuery, useGetMetaLeadsTotalQuery } = metaApi;

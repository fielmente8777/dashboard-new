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
  }),
});

export const { useGetMetaPageOverviewQuery } = metaApi;

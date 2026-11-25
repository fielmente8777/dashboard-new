import { baseApi } from "./baseApi";

// Email / phone suggestions while typing (gian /api/v1/suggestions): the client's own addresses
// (profile's marketing and hotel email or phones, team members, sender mailboxes) first, then
// saved contacts and leads that match what is typed.
export const suggestionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { type: "email" | "phone", q, hid } -> [{ value, label, source }]
    getSuggestions: build.query({
      query: ({ type, q, hid }) => ({ url: "/api/v1/suggestions", params: { type, q: q || undefined, hid: hid || undefined } }),
      transformResponse: (response) => response?.result?.docs ?? [],
      keepUnusedDataFor: 60,
      extraOptions: { service: "node" },
    }),
  }),
});

export const { useGetSuggestionsQuery } = suggestionsApi;

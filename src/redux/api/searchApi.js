import store from "../Store";
import { baseApi } from "./baseApi";

// The search box in the navbar (gian: /api/v1/search).
export const searchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { q, hid?, modules?, limit } - with hid: inside one hotel, without: all
    // hotels of this user -> { result: { data: { results } } }
    globalSearch: build.query({
      query: ({ q, hid, modules, limit }) => ({
        url: hid ? `/api/v1/search/${hid}` : "/api/v1/search",
        params: { q, limit: String(limit), ...(modules?.length && { modules: modules.join(",") }) },
      }),
      keepUnusedDataFor: 0,
      extraOptions: { service: "node" },
    }),
  }),
});

// For plain code, as the old services/api/globalSearch.api.js: resolves with
// the answer, with null when `signal` cancelled it (a newer search started),
// and throws with the server's message when the search failed.
export const getGlobalSearch = async ({ q, hid, modules, limit = 10, signal }) => {
  const search = store.dispatch(
    searchApi.endpoints.globalSearch.initiate(
      { q, hid, modules, limit },
      { subscribe: false, forceRefetch: true },
    ),
  );
  const cancel = () => search.abort();
  signal?.addEventListener("abort", cancel);
  try {
    const result = await search;
    if (signal?.aborted) return null;
    if (!result.error) return result.data;
    throw new Error(result.error.data?.message || "Search failed");
  } finally {
    signal?.removeEventListener("abort", cancel);
  }
};

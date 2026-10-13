import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/seo/seo-intelligence";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["LocalSeo", "SeoTokens"] });

const post = (path) => (body) => ({
  url: `${BASE}${path}`,
  method: "POST",
  body,
});

// Local SEO and Website SEO: both live under /seo/seo-intelligence.
export const seoApi = api.injectEndpoints({
  endpoints: (build) => ({
    // everything both dashboards show: keywords, summary, trend, geo-grid, setup
    getLocalSeo: build.query({
      // `t` keeps the browser from serving a cached answer while a scan runs
      query: () => ({ url: BASE, params: { t: Date.now() } }),
      transformResponse: (response) => {
        const d = response?.result || response || {};
        return {
          summary: d.summary || null,
          trend: d.trend || [],
          keywords: d.keywords || [],
          provider: d.provider || "dataforseo",
          geoGrid: d.geoGrid || [],
          gridMeta: d.gridMeta || null,
          localConfig: d.localConfig || null,
          staleKeywords: d.staleKeywords ?? 0,
        };
      },
      providesTags: ["LocalSeo"],
      extraOptions: NODE,
    }),

    // -> { balance, pricing: { localPerKeyword, websitePerKeyword, geoGridScan } }
    getSeoTokens: build.query({
      query: () => `${BASE}/tokens`,
      transformResponse: (response) => response?.result || response || {},
      providesTags: ["SeoTokens"],
      extraOptions: NODE,
    }),

    // { keywords: string[], selfDomain, selfHotelName }
    trackKeywords: build.mutation({
      query: post("/track"),
      invalidatesTags: ["LocalSeo", "SeoTokens"],
      extraOptions: NODE,
    }),

    // keyword -> fetches its live rank again
    refreshKeyword: build.mutation({
      query: (keyword) => post("/refresh-keyword")({ keyword }),
      invalidatesTags: ["LocalSeo", "SeoTokens"],
      extraOptions: NODE,
    }),

    untrackKeyword: build.mutation({
      query: (keyword) => ({
        url: `${BASE}/${encodeURIComponent(keyword)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LocalSeo"],
      extraOptions: NODE,
    }),

    triggerGridScan: build.mutation({
      query: () => post("/trigger-grid-scan")({}),
      invalidatesTags: ["LocalSeo", "SeoTokens"],
      extraOptions: NODE,
    }),

    // radiusKm -> area covered by the geo-grid
    updateRadius: build.mutation({
      query: (radiusKm) => post("/update-radius")({ radiusKm }),
      invalidatesTags: ["LocalSeo"],
      extraOptions: NODE,
    }),

    // keyword -> the one the geo-grid scans
    updateGridKeyword: build.mutation({
      query: (keyword) => post("/update-grid-keyword")({ keyword }),
      invalidatesTags: ["LocalSeo"],
      extraOptions: NODE,
    }),

    // { businessType, city, district, state } -> string[]
    suggestKeywords: build.mutation({
      query: post("/suggest-keywords"),
      transformResponse: (response) =>
        response?.result?.suggestions || response?.suggestions || [],
      extraOptions: NODE,
    }),

    // one-time setup: property, location and primary keyword
    completeOnboarding: build.mutation({
      query: post("/onboarding"),
      extraOptions: NODE,
    }),

    // --- Website SEO ---
    // websiteUrl -> the site whose Google rankings are tracked (can't be changed later)
    setWebsite: build.mutation({
      query: (websiteUrl) => post("/set-website")({ websiteUrl }),
      invalidatesTags: ["LocalSeo"],
      extraOptions: NODE,
    }),

    // country code ("IN", "US", ..., "WORLD") the website rankings are checked in
    updateWebsiteCountry: build.mutation({
      query: (country) => post("/update-website-country")({ country }),
      invalidatesTags: ["LocalSeo", "SeoTokens"],
      extraOptions: NODE,
    }),

    // keywords: string[] -> tracked against the website
    trackWebsiteKeywords: build.mutation({
      query: (keywords) => post("/track-link")({ keywords }),
      invalidatesTags: ["LocalSeo", "SeoTokens"],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetLocalSeoQuery,
  useGetSeoTokensQuery,
  useTrackKeywordsMutation,
  useRefreshKeywordMutation,
  useUntrackKeywordMutation,
  useTriggerGridScanMutation,
  useUpdateRadiusMutation,
  useUpdateGridKeywordMutation,
  useSuggestKeywordsMutation,
  useCompleteOnboardingMutation,
  useSetWebsiteMutation,
  useUpdateWebsiteCountryMutation,
  useTrackWebsiteKeywordsMutation,
} = seoApi;

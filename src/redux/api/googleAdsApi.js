import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/google-ads";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["GoogleAds"] });

// Google's status, saved as its name or its number (2 enabled, 3 paused,
// 4 removed).
const statusOf = (item) => {
  const status = String(item.status ?? "").toUpperCase();
  if (status === "ENABLED" || status === "2") return "enabled";
  if (status === "PAUSED" || status === "3") return "paused";
  if (status === "REMOVED" || status === "4") return "removed";
  return "unknown";
};

// The API sometimes returns the same item twice, and removed ones too: keep
// each item once, without the removed ones. Paused items stay (marked
// `paused`), so a hotel whose ads are paused still sees them and their
// history; enabled ones come first.
const visibleItems = (items, idKey) => {
  const kept = items
    .map((item) => ({ ...item, paused: statusOf(item) === "paused" }))
    .filter((item) => statusOf(item) !== "removed");
  const unique = [...new Map(kept.map((item) => [item[idKey], item])).values()];
  return unique.sort((a, b) => Number(a.paused) - Number(b.paused));
};

const list = (path, resultKey, idKey) => ({
  query: (id) => `${BASE}/${path}/${id}`,
  transformResponse: (response) =>
    visibleItems(response?.data || response?.result?.[resultKey] || [], idKey),
  providesTags: ["GoogleAds"],
  extraOptions: NODE,
});

// { entityId, level: "account" | "campaign" | "adgroup" | "ad", range: { start, end } }
const summaryArgs = ({ entityId, level, range }) => ({
  url: `${BASE}/metrics/summary/${entityId}`,
  params: { level, startDate: range.start, endDate: range.end },
});

export const googleAdsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdsAccounts: build.query({
      query: () => `${BASE}/accounts`,
      transformResponse: (response) => response?.data || response?.result?.accounts || [],
      providesTags: ["GoogleAds"],
      extraOptions: NODE,
    }),

    getAdsCampaigns: build.query(list("campaigns", "campaigns", "campaignId")),
    getAdsAdGroups: build.query(list("adgroups", "adGroups", "adGroupId")),
    getAdsAds: build.query(list("ads", "ads", "adId")),

    // -> { series: [{ date, impressions, clicks, cost, conversions, conversionsValue }], totals, derived }
    getAdsSummary: build.query({
      query: summaryArgs,
      transformResponse: (response) => response?.result || {},
      providesTags: ["GoogleAds"],
      extraOptions: NODE,
    }),

    // clicks per device type: [{ device: "2" | "3" | ..., clicks }]
    getAdsDevices: build.query({
      query: ({ entityId, level, range }) => ({
        url: `${BASE}/metrics/devices/${entityId}`,
        params: { level, startDate: range.start, endDate: range.end },
      }),
      transformResponse: (response) => response?.result?.devices || [],
      providesTags: ["GoogleAds"],
      extraOptions: NODE,
    }),

    // Totals per child of one parent, in one request:
    // { level: "campaign" | "adgroup" | "ad", parentId, range }
    //   -> { rows: [{ id, lastActivity, impressions, clicks, cost, conversions, conversionsValue, ctr, averageCpc, costPerConversion, roas }],
    //        levelSynced } (false: this level was never synced for this parent)
    getAdsBreakdown: build.query({
      query: ({ level, parentId, range }) => ({
        url: `${BASE}/metrics/breakdown`,
        params: { level, parentId, startDate: range.start, endDate: range.end },
      }),
      transformResponse: (response) => ({
        rows: response?.result?.rows || [],
        levelSynced: response?.result?.levelSynced !== false,
      }),
      providesTags: ["GoogleAds"],
      extraOptions: NODE,
    }),

    // Pulls the last 90 days from Google into our database (slow).
    // { accountId?, campaignId?, range }
    syncGoogleAds: build.mutation({
      query: ({ accountId, campaignId, range }) => ({
        url: `${BASE}/sync`,
        params: {
          startDate: range.start,
          endDate: range.end,
          targetAccountId: accountId || undefined,
          targetCampaignId: campaignId || undefined,
        },
      }),
      invalidatesTags: ["GoogleAds"],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetAdsAccountsQuery,
  useGetAdsCampaignsQuery,
  useGetAdsAdGroupsQuery,
  useGetAdsAdsQuery,
  useGetAdsSummaryQuery,
  useGetAdsDevicesQuery,
  useGetAdsBreakdownQuery,
  useSyncGoogleAdsMutation,
} = googleAdsApi;

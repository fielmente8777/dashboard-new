import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/google-ads";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["GoogleAds"] });

// The API also returns paused / removed items, and sometimes the same one
// twice: keep the enabled ones, once each.
const enabledOnly = (items, idKey) => {
  const enabled = items.filter((item) => {
    const status = String(item.status ?? "").toUpperCase();
    return status === "ENABLED" || status === "2";
  });
  return [...new Map(enabled.map((item) => [item[idKey], item])).values()];
};

const list = (path, resultKey, idKey) => ({
  query: (id) => `${BASE}/${path}/${id}`,
  transformResponse: (response) =>
    enabledOnly(response?.data || response?.result?.[resultKey] || [], idKey),
  providesTags: ["GoogleAds"],
  extraOptions: NODE,
});

// { entityId, level: "account" | "campaign" | "ad", range: { start, end } }
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

    // { campaigns: [{ campaignId, name }], range } -> one summary row per campaign
    getAdsCampaignComparison: build.query({
      async queryFn({ campaigns, range }, _api, _extra, baseQuery) {
        const rows = await Promise.all(
          campaigns.map(async (campaign) => {
            const { data } = await baseQuery(
              summaryArgs({ entityId: campaign.campaignId, level: "campaign", range }),
              _api,
              NODE,
            );
            const totals = data?.result?.totals || {};
            const derived = data?.result?.derived || {};
            return {
              campaignId: campaign.campaignId,
              name: campaign.name || campaign.campaignId,
              impressions: totals.impressions || 0,
              clicks: totals.clicks || 0,
              cost: totals.cost || 0,
              conversions: totals.conversions || 0,
              ctr: derived.ctr || 0,
              roas: derived.roas || 0,
            };
          }),
        );
        return { data: rows.sort((a, b) => b.cost - a.cost) };
      },
      providesTags: ["GoogleAds"],
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
  useGetAdsCampaignComparisonQuery,
  useSyncGoogleAdsMutation,
} = googleAdsApi;

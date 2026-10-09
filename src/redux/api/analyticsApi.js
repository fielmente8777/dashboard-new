import { baseApi } from "./baseApi";

// The Google Analytics endpoints are open (the hotel id is in the URL), so
// no Authorization header is sent.
const OPEN = { skipAuth: true };

// A report for one hotel and date range. `range` is { start, end } in the
// Google Analytics format ("7daysAgo", "today", ...).
const report = (build, path, transformResponse) =>
  build.query({
    query: ({ hid, range }) => ({
      url: `/google/${path}/${hid}`,
      params: { startDate: range.start, endDate: range.end },
    }),
    transformResponse,
    providesTags: ["Analytics"],
    extraOptions: OPEN,
  });

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Analytics"] });

export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // { chartData, activePropertyId, email } - or { error } when not connected
    getAnalyticsOverview: report(build, "analytics-data"),
    getTrafficSources: report(build, "analytics-traffic-sources", (r) => ({
      channels: r?.channels || [],
      sources: r?.sources || [],
    })),
    getTopPages: report(build, "analytics-pages", (r) => r?.topPages || []),
    getConversions: report(build, "analytics-conversions", (r) => ({
      events: r?.events || [],
      conversions: r?.conversions || [],
    })),
    getDeviceAnalytics: report(build, "analytics-devices", (r) => ({
      devices: r?.devices || [],
      browsers: r?.browsers || [],
      operatingSystems: r?.operatingSystems || [],
    })),
    getGeoAnalytics: report(build, "analytics-geo", (r) => ({
      countries: r?.countries || [],
      cities: r?.cities || [],
    })),
    getAudience: report(build, "analytics-audience", (r) => ({
      devices: r?.devices || [],
      countries: r?.countries || [],
    })),

    // the Google Analytics properties the connected Google account can read
    getAnalyticsProperties: build.query({
      query: (email) => ({ url: "/google/properties", params: { email } }),
      transformResponse: (response) => response?.properties || [],
      extraOptions: OPEN,
    }),

    // { hid, email, property_id } - every report reloads for the new property
    saveAnalyticsProperty: build.mutation({
      query: (body) => ({
        url: "/google/save-property",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Analytics"],
      extraOptions: OPEN,
    }),
  }),
});

export const {
  useGetAnalyticsOverviewQuery,
  useGetTrafficSourcesQuery,
  useGetTopPagesQuery,
  useGetConversionsQuery,
  useGetDeviceAnalyticsQuery,
  useGetGeoAnalyticsQuery,
  useGetAudienceQuery,
  useGetAnalyticsPropertiesQuery,
  useSaveAnalyticsPropertyMutation,
} = analyticsApi;

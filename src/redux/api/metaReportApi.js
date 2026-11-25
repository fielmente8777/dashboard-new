import { API_URLS } from "../../config/env";
import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// Meta reports: the PDF report of a property's Facebook + Instagram ads and content, made on
// demand ("Create report") or sent by email + WhatsApp on the first days of each month.
// Served by gian ("node"): /api/v1/meta-report (gian/src/services/metaReport).
const SERVICE = "node";
const BASE = "/api/v1/meta-report";
const doc = (response) => response?.result?.doc ?? null;
const docs = (response) => response?.result?.docs ?? [];

export const metaReportApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["MetaReports", "MetaReportSettings"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // { hid, since, until, refresh? } -> { snapshot, alerts, builtAt, cached, stale, error }:
      // the live Meta pages (Overview, Ads, Content, Leads). gian keeps a copy for 30 minutes;
      // the first read of a period goes to Meta and can take 10–40 seconds.
      getMetaLive: build.query({
        query: ({ hid, since, until, refresh }) => ({
          url: `${BASE}/live`,
          params: { hid, since, until, ...(refresh && { refresh: 1 }) },
        }),
        // `refresh` is a one-off: the same dates share one cache entry
        serializeQueryArgs: ({ queryArgs }) => `${queryArgs.hid}:${queryArgs.since}:${queryArgs.until}`,
        transformResponse: doc,
        extraOptions: { service: SERVICE },
      }),

      // { hid, platform: "facebook" | "instagram", after } -> { items, next, note }: 12 posts a page,
      // newest first, with pictures / video files and the numbers Meta gives (null = not given)
      getMetaPosts: build.query({
        query: ({ hid, platform, after }) => ({ url: `${BASE}/posts`, params: { hid, platform, ...(after && { after }) } }),
        transformResponse: doc,
        keepUnusedDataFor: 120,
        extraOptions: { service: SERVICE },
      }),

      // { hid, since, until, after } -> { items, next, note }: ads that spent, most spend first
      getMetaCreatives: build.query({
        query: ({ hid, since, until, after }) => ({ url: `${BASE}/creatives`, params: { hid, since, until, ...(after && { after }) } }),
        transformResponse: doc,
        keepUnusedDataFor: 120,
        extraOptions: { service: SERVICE },
      }),

      // { hid, adId } -> { kind: "video" | "iframe" | "image" | "none", src, poster, previewLink }
      getCreativePreview: build.query({
        query: ({ hid, adId }) => ({ url: `${BASE}/creatives/${adId}/preview`, params: { hid } }),
        transformResponse: doc,
        keepUnusedDataFor: 300,
        extraOptions: { service: SERVICE },
      }),

      // hid -> the property's reports, newest first (without their data)
      getMetaReports: build.query({
        query: (hid) => ({ url: `${BASE}/reports`, params: { hid } }),
        transformResponse: docs,
        providesTags: ["MetaReports"],
        extraOptions: { service: SERVICE },
      }),

      // { hid, preset } or { hid, since, until } (+ notes) -> the new report.
      // Building reads Meta live, so it can take 10–40 seconds.
      createMetaReport: build.mutation({
        query: (body) => ({ url: `${BASE}/reports`, method: "POST", body }),
        transformResponse: doc,
        invalidatesTags: ["MetaReports"],
        extraOptions: { service: SERVICE },
      }),

      // { id, email, whatsapp } -> where it went
      sendMetaReport: build.mutation({
        query: ({ id, email = true, whatsapp = true }) => ({
          url: `${BASE}/reports/${id}/send`,
          method: "POST",
          body: { email, whatsapp },
        }),
        transformResponse: doc,
        invalidatesTags: ["MetaReports"],
        extraOptions: { service: SERVICE },
      }),

      deleteMetaReport: build.mutation({
        query: (id) => ({ url: `${BASE}/reports/${id}`, method: "DELETE" }),
        invalidatesTags: ["MetaReports"],
        extraOptions: { service: SERVICE },
      }),

      // hid -> { settings, recipients, defaults }
      getMetaReportSettings: build.query({
        query: (hid) => ({ url: `${BASE}/settings`, params: { hid } }),
        transformResponse: doc,
        providesTags: ["MetaReportSettings"],
        extraOptions: { service: SERVICE },
      }),

      // { hid, monthly, whatsapp, emails|null, phones|null, adAccountIds|null }
      saveMetaReportSettings: build.mutation({
        query: (body) => ({ url: `${BASE}/settings`, method: "PUT", body }),
        transformResponse: doc,
        invalidatesTags: ["MetaReportSettings"],
        extraOptions: { service: SERVICE },
      }),

      // hid -> { accounts, problem }: only ad accounts that advertised this property's page
      getMetaReportAdAccounts: build.query({
        query: (hid) => ({ url: `${BASE}/ad-accounts`, params: { hid } }),
        transformResponse: (response) => ({
          accounts: response?.result?.docs ?? [],
          problem: response?.result?.problem ?? null,
        }),
        extraOptions: { service: SERVICE },
      }),
    }),
  });

export const {
  useLazyGetMetaPostsQuery,
  useLazyGetMetaCreativesQuery,
  useGetCreativePreviewQuery,
  useGetMetaLiveQuery,
  useLazyGetMetaLiveQuery,
  useGetMetaReportsQuery,
  useCreateMetaReportMutation,
  useSendMetaReportMutation,
  useDeleteMetaReportMutation,
  useGetMetaReportSettingsQuery,
  useSaveMetaReportSettingsMutation,
  useGetMetaReportAdAccountsQuery,
} = metaReportApi;

// The report's PDF, saved to the browser's downloads.
export async function downloadMetaReportPdf(id) {
  const response = await fetch(`${API_URLS[SERVICE]}${BASE}/reports/${id}/pdf`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // gian answers errors as { responseMessage }
    throw new Error(body?.responseMessage || body?.message || body?.error || "Could not download the report.");
  }
  const filename =
    /filename="([^"]+)"/.exec(response.headers.get("content-disposition") || "")?.[1] || "Meta-report.pdf";
  const url = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

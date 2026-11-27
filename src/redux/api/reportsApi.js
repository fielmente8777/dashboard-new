import { API_URLS } from "../../config/env";
import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// The dashboard report: leads, calls, Meta, Google Ads, Google Analytics and Search Console
// for any dates, as one PDF or one part at a time, by email, and every month by email.
// Served by gian ("node"): /api/v1/reports (gian/src/services/dashboardReport).
const SERVICE = "node";
const BASE = "/api/v1/reports";
const doc = (response) => response?.result?.doc ?? null;
const docs = (response) => response?.result?.docs ?? [];

// the parts a report can hold, in the order the PDF draws them
export const REPORT_PARTS = [
  { key: "leads", label: "Leads & conversions", hint: "Enquiries by source, stage and month; WhatsApp chats" },
  { key: "calls", label: "Calls", hint: "Answered and missed calls on the tracked number" },
  { key: "emailMarketing", label: "Email marketing", hint: "Campaigns, opens, clicks, bounces and the email list" },
  { key: "whatsappMarketing", label: "WhatsApp marketing", hint: "Campaigns, delivered, read, failures and cost" },
  { key: "meta", label: "Meta (Facebook & Instagram)", hint: "Ads, the page, Instagram and Meta leads" },
  { key: "googleAds", label: "Google Ads", hint: "Campaigns, cost, clicks and conversions" },
  { key: "analytics", label: "Google Analytics", hint: "Website visits, channels, pages and visitors" },
  { key: "searchConsole", label: "Search Console", hint: "Organic clicks and the searches that bring them" },
];
export const partLabel = (key) => REPORT_PARTS.find((p) => p.key === key)?.label ?? key;

export const reportsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["DashboardReports", "DashboardReportSettings"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // hid -> [{ key, label, connected, note }]: what this property can report on (no build)
      getReportParts: build.query({
        query: (hid) => ({ url: `${BASE}/parts`, params: { hid } }),
        transformResponse: docs,
        extraOptions: { service: SERVICE },
      }),

      // hid -> the property's reports, newest first (without their data)
      getDashboardReports: build.query({
        query: (hid) => ({ url: `${BASE}/reports`, params: { hid } }),
        transformResponse: docs,
        providesTags: ["DashboardReports"],
        extraOptions: { service: SERVICE },
      }),

      // { hid, sections, since, until } -> the new report. Reading every part can take a minute.
      createDashboardReport: build.mutation({
        query: (body) => ({ url: `${BASE}/reports`, method: "POST", body }),
        transformResponse: doc,
        invalidatesTags: ["DashboardReports"],
        extraOptions: { service: SERVICE },
      }),

      // { id, emails?, parts? } -> { status, to, failed }
      sendDashboardReport: build.mutation({
        query: ({ id, emails, parts }) => ({
          url: `${BASE}/reports/${id}/send`,
          method: "POST",
          body: { ...(emails?.length && { emails }), ...(parts?.length && { parts }) },
        }),
        transformResponse: doc,
        invalidatesTags: ["DashboardReports"],
        extraOptions: { service: SERVICE },
      }),

      deleteDashboardReport: build.mutation({
        query: (id) => ({ url: `${BASE}/reports/${id}`, method: "DELETE" }),
        invalidatesTags: ["DashboardReports"],
        extraOptions: { service: SERVICE },
      }),

      // hid -> { settings: { monthly, emails, sections }, recipients, defaults }
      getDashboardReportSettings: build.query({
        query: (hid) => ({ url: `${BASE}/settings`, params: { hid } }),
        transformResponse: doc,
        providesTags: ["DashboardReportSettings"],
        extraOptions: { service: SERVICE },
      }),

      // { hid, monthly, emails|null, sections|null }
      saveDashboardReportSettings: build.mutation({
        query: (body) => ({ url: `${BASE}/settings`, method: "PUT", body }),
        transformResponse: doc,
        invalidatesTags: ["DashboardReportSettings"],
        extraOptions: { service: SERVICE },
      }),
    }),
  });

export const {
  useGetReportPartsQuery,
  useGetDashboardReportsQuery,
  useCreateDashboardReportMutation,
  useSendDashboardReportMutation,
  useDeleteDashboardReportMutation,
  useGetDashboardReportSettingsQuery,
  useSaveDashboardReportSettingsMutation,
} = reportsApi;

// The report's PDF (all of it, or only `parts`), saved to the browser's downloads.
export async function downloadDashboardReportPdf(id, parts) {
  const query = parts?.length ? `?parts=${encodeURIComponent(parts.join(","))}` : "";
  const response = await fetch(`${API_URLS[SERVICE]}${BASE}/reports/${id}/pdf${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // gian answers errors as { responseMessage }
    throw new Error(body?.responseMessage || body?.message || body?.error || "Could not download the report.");
  }
  const filename = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") || "")?.[1] || "Report.pdf";
  const url = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

import { API_URLS } from "../../config/env";
import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// The newsletter list: /api/v1/newsletter, answered as { success, data } or
// { success: false, error: { code, message } }; `data` is unwrapped here. The list is per
// account (all properties), because the website box only knows the website's domain.
//
// Served by gian ("node") for now, because gian-new sleeps on its free plan. gian-new has the
// same routes and answers (src/modules/newsletter); to move, set SERVICE to "app".
const SERVICE = "node";
const APP = { service: SERVICE };
const BASE = "/api/v1/newsletter";
const data = (response) => response?.data ?? response;

export const newsletterApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["NewsletterList", "NewsletterStats", "NewsletterTags", "NewsletterSettings"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // { status, source, tag, search, page, limit } -> { items, total, page, limit }
      getSubscribers: build.query({
        query: (params) => ({ url: `${BASE}/subscribers`, params }),
        transformResponse: data,
        providesTags: ["NewsletterList"],
        extraOptions: APP,
      }),

      // totals, last 30 days, 12 months, by source
      getNewsletterStats: build.query({
        query: () => `${BASE}/stats`,
        transformResponse: data,
        providesTags: ["NewsletterStats"],
        extraOptions: APP,
      }),

      getNewsletterTags: build.query({
        query: () => `${BASE}/tags`,
        transformResponse: data,
        providesTags: ["NewsletterTags"],
        extraOptions: APP,
      }),

      // groups (stored as tags) -> [{ name, subscribed, total }]
      getNewsletterGroups: build.query({
        query: () => `${BASE}/groups`,
        transformResponse: data,
        providesTags: ["NewsletterTags"],
        extraOptions: APP,
      }),

      // -> { leads: [{ source, total, withEmail }], contacts: [...] }: where a group can be filled from
      getGroupPeopleSources: build.query({
        query: () => `${BASE}/groups/sources`,
        transformResponse: data,
        extraOptions: APP,
      }),

      // { group, from: "leads" | "contacts", sources: [] (all when empty) } -> import result
      addPeopleToGroup: build.mutation({
        query: (body) => ({ url: `${BASE}/groups/add`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterStats", "NewsletterTags"],
        extraOptions: APP,
      }),

      // { name, to } -> { changed }; when `to` exists the two groups become one
      renameNewsletterGroup: build.mutation({
        query: ({ name, to }) => ({ url: `${BASE}/groups/${encodeURIComponent(name)}`, method: "PATCH", body: { to } }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterTags"],
        extraOptions: APP,
      }),

      // name -> { changed }: takes the group off everyone, the people stay
      deleteNewsletterGroup: build.mutation({
        query: (name) => ({ url: `${BASE}/groups/${encodeURIComponent(name)}`, method: "DELETE" }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterTags"],
        extraOptions: APP,
      }),

      // { email, name, tags }
      addSubscriber: build.mutation({
        query: (body) => ({ url: `${BASE}/subscribers`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterStats", "NewsletterTags"],
        extraOptions: APP,
      }),

      // { id, name?, tags?, status? }
      editSubscriber: build.mutation({
        query: ({ id, ...body }) => ({ url: `${BASE}/subscribers/${id}`, method: "PATCH", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterStats", "NewsletterTags"],
        extraOptions: APP,
      }),

      // { ids, action: delete | unsubscribe | resubscribe | addTags | removeTags, tags? } -> { changed, skipped }
      bulkSubscribers: build.mutation({
        query: (body) => ({ url: `${BASE}/subscribers/bulk`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterStats", "NewsletterTags"],
        extraOptions: APP,
      }),

      // { rows: [{ email, name, fields }], tags } -> { added, updated, skippedUnsubscribed, invalid, duplicatesInFile }
      // fields: every other column of the file, e.g. { Country: "Spain" }
      importSubscribers: build.mutation({
        query: (body) => ({ url: `${BASE}/subscribers/import`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterStats", "NewsletterTags"],
        extraOptions: APP,
      }),

      // { groups: [names] } -> { total, counts: { good, unsubscribed, bounced, cant_receive, risky },
      //   rows: [{ email, name, groups, state, reason, suggestion }], partial }
      checkNewsletterGroups: build.mutation({
        query: (body) => ({ url: `${BASE}/groups/check`, method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),
      // { groups, states? } -> { removed }: bounced / can't-receive members go on the do-not-email list
      cleanNewsletterGroups: build.mutation({
        query: (body) => ({ url: `${BASE}/groups/clean`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterList", "NewsletterStats", "NewsletterTags"],
        extraOptions: APP,
      }),
      // { groups } ([] = whole list) -> { job, plan }: Amazon's paid "does this mailbox still
      // exist" check of the good addresses not proven lately (US$0.01 each), in the background
      startMailboxCheck: build.mutation({
        query: (body) => ({ url: `${BASE}/groups/mailbox-check`, method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),
      // -> { job }: the latest run, polled while it runs
      getMailboxCheck: build.query({
        query: () => `${BASE}/groups/mailbox-check`,
        transformResponse: data,
        keepUnusedDataFor: 0,
        extraOptions: APP,
      }),

      // { url } -> { fileName, base64, size }: a CSV / Excel / Google Sheet from a link, downloaded by
      // the server and then read here exactly like an uploaded file
      fetchSheetLink: build.mutation({
        query: (body) => ({ url: `${BASE}/subscribers/sheet-link`, method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),

      // { tag? } -> { emails, count }: who a newsletter goes to
      getNewsletterAudience: build.query({
        query: (params) => ({ url: `${BASE}/audience`, params }),
        transformResponse: data,
        extraOptions: APP,
      }),

      getNewsletterSettings: build.query({
        query: () => `${BASE}/settings`,
        transformResponse: data,
        providesTags: ["NewsletterSettings"],
        extraOptions: APP,
      }),

      // { welcome: { enabled, subject, message }, notifyOnSignup }
      saveNewsletterSettings: build.mutation({
        query: (body) => ({ url: `${BASE}/settings`, method: "PUT", body }),
        transformResponse: data,
        invalidatesTags: ["NewsletterSettings"],
        extraOptions: APP,
      }),
    }),
  });

export const {
  useGetSubscribersQuery,
  useLazyGetSubscribersQuery,
  useGetNewsletterStatsQuery,
  useGetNewsletterTagsQuery,
  useGetNewsletterGroupsQuery,
  useGetGroupPeopleSourcesQuery,
  useAddPeopleToGroupMutation,
  useRenameNewsletterGroupMutation,
  useDeleteNewsletterGroupMutation,
  useAddSubscriberMutation,
  useEditSubscriberMutation,
  useBulkSubscribersMutation,
  useImportSubscribersMutation,
  useCheckNewsletterGroupsMutation,
  useCleanNewsletterGroupsMutation,
  useStartMailboxCheckMutation,
  useGetMailboxCheckQuery,
  useFetchSheetLinkMutation,
  useLazyGetNewsletterAudienceQuery,
  useGetNewsletterSettingsQuery,
  useSaveNewsletterSettingsMutation,
} = newsletterApi;

// The list (with the filters on screen) as a CSV, saved to the browser's downloads.
export async function downloadSubscribersCsv(filter = {}) {
  const params = new URLSearchParams(Object.entries(filter).filter(([, v]) => v));
  const response = await fetch(`${API_URLS[SERVICE]}${BASE}/subscribers/export?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || "Could not export the list.");
  }
  const filename =
    /filename="([^"]+)"/.exec(response.headers.get("content-disposition") || "")?.[1] || "newsletter-subscribers.csv";
  const url = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// The server's message (gian-new's `error.message`), for toasts.
// The server's own words when it gave any: a newsletter error ({ error: { message } }), else the
// text of an unexpected failure (gian's error handler answers { responseMessage }), so a failure
// can be traced instead of every one reading "Something went wrong".
export const newsletterError = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.data;
  if (data?.error?.message) return data.error.message;
  if (error?.status === "FETCH_ERROR") return "Couldn't reach the server, or it stopped answering. Please try again.";
  // a gateway page (HTML) instead of an answer: RTK keeps the real status in originalStatus
  const status = error?.originalStatus ?? error?.status;
  if ([502, 503, 504, 524].includes(status)) return "The server took too long to answer. Please try again in a minute.";
  const detail = typeof data?.responseMessage === "string" ? data.responseMessage.trim().slice(0, 160) : "";
  return detail ? `${fallback} (${detail})` : fallback;
};

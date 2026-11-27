import { baseApi } from "./baseApi";

// The Trade Directory: /api/v1/trade-directory on gian-new ("app"), answered as
// { success, data } or { success: false, error: { code, message } }; `data` is unwrapped here.
//   pool=directory : Eazotel's list of travel agents, MICE, wedding planners… (contacts masked,
//                    needs approved access)
//   pool=mine      : the hotel's own contacts (shown in full)
// Contacts of Eazotel's list never reach the browser: outreach is sent by the server.
const APP = { service: "app" };
const BASE = "/api/v1/trade-directory";
const data = (response) => response?.data ?? response;

export const tradeDirectoryApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["TradeAccess", "TradePartners", "TradeFacets", "TradeImports", "TradeOutreach", "TradeCategories"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // -> { status: none | pending | approved | rejected | revoked, requestedAt, … }
      getTradeAccess: build.query({
        query: () => `${BASE}/access`,
        transformResponse: data,
        providesTags: ["TradeAccess"],
        extraOptions: APP,
      }),
      requestTradeAccess: build.mutation({
        query: (body) => ({ url: `${BASE}/access/request`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["TradeAccess", "TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),

      // -> [{ key, label, color, icon, sortOrder }]: the categories (built-in, staff- and AI-made)
      getTradeCategories: build.query({
        query: () => `${BASE}/categories`,
        transformResponse: data,
        providesTags: ["TradeCategories"],
        keepUnusedDataFor: 300,
        extraOptions: APP,
      }),

      // { pool, segment, state, city, reach, search, limit, after } -> { items, nextCursor, total }
      getTradePartners: build.query({
        query: (params) => ({ url: `${BASE}/partners`, params }),
        transformResponse: data,
        providesTags: ["TradePartners"],
        extraOptions: APP,
      }),
      // { pool } -> { total, segments, states, cities, reach }
      getTradeFacets: build.query({
        query: (pool) => ({ url: `${BASE}/facets`, params: { pool } }),
        transformResponse: data,
        providesTags: ["TradeFacets"],
        extraOptions: APP,
      }),

      addTradeContact: build.mutation({
        query: (body) => ({ url: `${BASE}/partners`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),
      editTradeContact: build.mutation({
        query: ({ id, ...body }) => ({ url: `${BASE}/partners/${id}`, method: "PATCH", body }),
        transformResponse: data,
        invalidatesTags: ["TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),
      // a correction to a contact of Eazotel's directory: live at once, Eazotel's team reviews it
      // { id, company, person, designation, city, state, segment, niche, addPhones, addEmails }
      editDirectoryContact: build.mutation({
        query: ({ id, ...body }) => ({ url: `${BASE}/directory/${id}`, method: "PATCH", body }),
        transformResponse: data,
        invalidatesTags: ["TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),
      // ids -> { hidden }: hide from this hotel's lists only (other hotels still see them)
      hideTradeContacts: build.mutation({
        query: (ids) => ({ url: `${BASE}/partners/hide`, method: "POST", body: { ids } }),
        transformResponse: data,
        invalidatesTags: ["TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),
      // ids -> { shown }: show directory contacts this hotel hid again
      unhideTradeContacts: build.mutation({
        query: (ids) => ({ url: `${BASE}/partners/unhide`, method: "POST", body: { ids } }),
        transformResponse: data,
        invalidatesTags: ["TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),
      // ids -> { deleted }: the hotel's own contacts leave its list (Eazotel keeps the row)
      deleteTradeContacts: build.mutation({
        query: (ids) => ({ url: `${BASE}/partners/bulk-delete`, method: "POST", body: { ids } }),
        transformResponse: data,
        invalidatesTags: ["TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),

      // segments[] -> { count, contacts: [{ name, phone }] }: the hotel's OWN trade contacts with a
      // mobile number, for its WhatsApp campaign (never Eazotel's directory)
      getTradeWhatsappContacts: build.query({
        query: (segments) => ({ url: `${BASE}/whatsapp-contacts`, params: segments?.length ? { segments: segments.join(",") } : {} }),
        transformResponse: data,
        providesTags: ["TradePartners"],
        extraOptions: APP,
      }),

      getTradeImports: build.query({
        query: () => `${BASE}/imports`,
        transformResponse: data,
        providesTags: ["TradeImports"],
        extraOptions: APP,
      }),
      // { kind: file | link, fileName, url, expectedRows, segment } -> import job
      startTradeImport: build.mutation({
        query: (body) => ({ url: `${BASE}/imports`, method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),
      // { importId, headers, rows, last } -> import job (live counts)
      sendTradeImportRows: build.mutation({
        query: ({ importId, ...body }) => ({ url: `${BASE}/imports/${importId}/rows`, method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),
      getTradeImport: build.query({
        query: (importId) => `${BASE}/imports/${importId}`,
        transformResponse: data,
        extraOptions: APP,
      }),
      cancelTradeImport: build.mutation({
        query: (importId) => ({ url: `${BASE}/imports/${importId}/cancel`, method: "POST" }),
        transformResponse: data,
        invalidatesTags: ["TradeImports", "TradePartners", "TradeFacets"],
        extraOptions: APP,
      }),

      // -> { channels: [{ channel, ready, credits, reason }], templates, weeklyCap }
      getOutreachOptions: build.query({
        query: () => `${BASE}/outreach/options`,
        transformResponse: data,
        extraOptions: APP,
      }),
      // { channel, pool, ids | filter } -> { selected, reachable, credits, capped }
      previewOutreach: build.mutation({
        query: (body) => ({ url: `${BASE}/outreach/preview`, method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),
      createOutreach: build.mutation({
        query: (body) => ({ url: `${BASE}/outreach`, method: "POST", body }),
        transformResponse: data,
        invalidatesTags: ["TradeOutreach", "AiWallet"],
        extraOptions: APP,
      }),
      getOutreach: build.query({
        query: () => `${BASE}/outreach`,
        transformResponse: data,
        providesTags: ["TradeOutreach"],
        extraOptions: APP,
      }),
      cancelOutreach: build.mutation({
        query: (id) => ({ url: `${BASE}/outreach/${id}/cancel`, method: "POST" }),
        transformResponse: data,
        invalidatesTags: ["TradeOutreach", "AiWallet"],
        extraOptions: APP,
      }),
    }),
  });

export const {
  useGetTradeAccessQuery,
  useGetTradeCategoriesQuery,
  useRequestTradeAccessMutation,
  useGetTradePartnersQuery,
  useLazyGetTradePartnersQuery,
  useGetTradeFacetsQuery,
  useAddTradeContactMutation,
  useEditTradeContactMutation,
  useDeleteTradeContactsMutation,
  useEditDirectoryContactMutation,
  useHideTradeContactsMutation,
  useUnhideTradeContactsMutation,
  useGetTradeImportsQuery,
  useGetTradeWhatsappContactsQuery,
  useStartTradeImportMutation,
  useSendTradeImportRowsMutation,
  useLazyGetTradeImportQuery,
  useCancelTradeImportMutation,
  useGetOutreachOptionsQuery,
  usePreviewOutreachMutation,
  useCreateOutreachMutation,
  useGetOutreachQuery,
  useCancelOutreachMutation,
} = tradeDirectoryApi;

/** The server's message for a failed call, or `fallback`. */
export const tradeError = (error, fallback = "Something went wrong. Please try again.") =>
  error?.data?.error?.message || error?.data?.message || (error?.status === "FETCH_ERROR" ? "Can't reach the server. Check your connection." : fallback);

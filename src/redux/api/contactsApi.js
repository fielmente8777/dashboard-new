import { baseApi } from "./baseApi";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Contact"] });

// Reading is gian's (a page at a time, so lakhs of contacts load at once):
// /api/v1/contacts. Adding, editing and deleting are still nexon's /contact
// (the same collection), so a change shows at the next page.
const NODE = { service: "node" };

export const contactsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // { page, limit, search, source } -> { docs, pagination: { page, limit, total, pages, capped } }
    getContacts: build.query({
      query: ({ page = 1, limit = 25, search = "", source = "" } = {}) => ({
        url: "/api/v1/contacts",
        params: { page, limit, ...(search && { search }), ...(source && { source }) },
      }),
      transformResponse: (response) => ({
        docs: response?.result?.docs || [],
        pagination: response?.result?.pagination || { page: 1, limit: 25, total: 0, pages: 1 },
      }),
      providesTags: ["Contact"],
      extraOptions: NODE,
    }),

    // -> { total, withPhone, withEmail, recent, sources: [{ source, count }] }
    getContactStats: build.query({
      query: (fresh = false) => ({ url: "/api/v1/contacts/stats", params: fresh ? { fresh: true } : {} }),
      transformResponse: (response) => response?.result?.doc || null,
      providesTags: ["Contact"],
      extraOptions: NODE,
    }),

    // Creates the contact, or updates it when `id` is given (nexon).
    // { id?, name, email, phone, added_from }
    saveContact: build.mutation({
      query: ({ id, ...body }) => ({
        url: id ? `/contact/${id}` : "/contact",
        method: id ? "PUT" : "POST",
        body,
      }),
      invalidatesTags: ["Contact"],
    }),

    deleteContact: build.mutation({
      query: (id) => ({ url: `/contact/${id}`, method: "DELETE" }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactStatsQuery,
  useSaveContactMutation,
  useDeleteContactMutation,
} = contactsApi;

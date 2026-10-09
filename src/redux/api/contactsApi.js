import { baseApi } from "./baseApi";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Contact"] });

export const contactsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getContacts: build.query({
      query: () => "/contact",
      transformResponse: (response) => response?.Data || [],
      providesTags: ["Contact"],
    }),

    // Creates the contact, or updates it when `id` is given.
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
  useSaveContactMutation,
  useDeleteContactMutation,
} = contactsApi;

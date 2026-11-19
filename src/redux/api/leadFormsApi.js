import { baseApi } from "./baseApi";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["LeadForm"] });

// The public lead capture forms of a location ("lead gen forms").
export const leadFormsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // every form of the location, each with its fields and look
    getLeadForms: build.query({
      query: (hid) => ({
        url: "/leadgen/get-lead-gen-form",
        params: { hId: hid },
      }),
      transformResponse: (response) => response?.Data || [],
      providesTags: ["LeadForm"],
    }),

    // the kinds of field a form can be built from (text, email, date, ...)
    getLeadFormFieldTypes: build.query({
      query: () => "/leadgen/get-global-form-fields",
      transformResponse: (response) => response?.Data || [],
    }),

    // { hid, title }
    createLeadForm: build.mutation({
      query: ({ hid, title }) => ({
        url: "/leadgen/create-lead-gen-form",
        method: "POST",
        body: { hId: String(hid), title },
      }),
      invalidatesTags: ["LeadForm"],
    }),

    // takes the whole form, as getLeadForms returned it, with the changes made
    updateLeadForm: build.mutation({
      query: (form) => ({
        url: "/leadgen/edit-lead-gen-form",
        method: "POST",
        params: { form_id: form.form_id },
        body: form,
      }),
      invalidatesTags: ["LeadForm"],
    }),

    deleteLeadForm: build.mutation({
      query: (formId) => ({
        url: "/leadgen/delete-lead-gen-form",
        method: "POST",
        params: { form_id: formId },
      }),
      invalidatesTags: ["LeadForm"],
    }),
  }),
});

export const {
  useGetLeadFormsQuery,
  useGetLeadFormFieldTypesQuery,
  useCreateLeadFormMutation,
  useUpdateLeadFormMutation,
  useDeleteLeadFormMutation,
} = leadFormsApi;

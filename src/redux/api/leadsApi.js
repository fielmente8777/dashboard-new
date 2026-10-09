import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Lead"] });

// The filters every leads request understands. `source` is a list of
// sources (All Leads page), `createdFrom` a single one (the per-source pages).
const toLeadParams = ({
  hid,
  page,
  limit,
  search,
  stage,
  source,
  notes,
  createdFrom,
  from,
  to,
}) => ({
  hid,
  page,
  limit,
  search: search || undefined,
  stage: stage || undefined,
  source: source?.length ? source.join(",") : undefined,
  notes: notes || undefined,
  created_from: createdFrom || undefined,
  // the range only applies when both ends are set
  from: from && to ? from : undefined,
  to: from && to ? to : undefined,
});

export const leadsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // { hid, page, limit, search?, stage?, source?, notes?, createdFrom?, from?, to? }
    //   -> { leads, total, campaigns }
    getLeads: build.query({
      query: (filters) => ({
        url: "/api/v1/leads/get",
        params: toLeadParams(filters),
      }),
      transformResponse: (response) => ({
        leads: response?.result?.docs?.leads || [],
        total: response?.result?.pagination?.total || 0,
        campaigns: response?.result?.docs?.allCampaigns || [],
      }),
      providesTags: ["Lead"],
      extraOptions: NODE,
    }),

    // Every enquiry of a location, unpaged; the analytics page counts them.
    getAllEnquiries: build.query({
      query: (hid) => ({
        url: "/eazotel/get-all-contact-queries",
        params: { hId: hid },
      }),
      transformResponse: (response) => response?.Data || [],
      providesTags: ["Lead"],
    }),

    // { hid, leadId } -> the lead, or null. `hid` is the lead's own location.
    getLead: build.query({
      query: ({ hid, leadId }) => ({
        url: `/api/v1/leads/get/${leadId}`,
        params: { hid },
      }),
      transformResponse: (response) => {
        const docs = response?.result?.docs;
        // the answer has not always had the same shape
        return (
          docs?.lead ||
          docs?.leads?.[0] ||
          response?.result?.lead ||
          (docs && !Array.isArray(docs) ? docs : null)
        );
      },
      providesTags: ["Lead"],
      extraOptions: NODE,
    }),

    // One lead of a filtered list, by its position in it:
    // { hid, position, ...the list's filters } -> { lead, total }.
    // Deliberately not tagged: editing the lead on screen can move it out of
    // the filter, and the page must keep showing that lead, not the next one.
    getLeadAtPosition: build.query({
      query: ({ position, ...filters }) => ({
        url: "/api/v1/leads/get",
        params: toLeadParams({ ...filters, page: position, limit: 1 }),
      }),
      transformResponse: (response) => ({
        lead: response?.result?.docs?.leads?.[0] || null,
        total: response?.result?.pagination?.total || 0,
      }),
      extraOptions: NODE,
    }),

    // Same filters without paging; resolves with every matching lead.
    // A mutation so the (large) answer is never cached.
    exportLeads: build.mutation({
      query: (filters) => ({
        url: "/api/v1/leads/get",
        params: { ...toLeadParams(filters), is_export: "excel" },
      }),
      transformResponse: (response) => response?.result?.docs?.leads || [],
      extraOptions: NODE,
    }),

    // { hid, leadId, ...fields to change } e.g. status, followUpDate,
    // turnAwayCode, assignee. WhatsApp leads are addressed by conversationId.
    updateLead: build.mutation({
      query: ({ hid, ...body }) => ({
        url: `/api/v1/leads/${body.leadId || body.conversationId}/update`,
        method: "PUT",
        params: { hid },
        body,
      }),
      invalidatesTags: ["Lead"],
      extraOptions: NODE,
    }),

    // Adds one lead by hand. Body: { Name, Contact, Email, hId, ndid, Domain,
    // status, created_from, campaign_name, notes, check_in, check_out, numberOfGuest }
    createLead: build.mutation({
      query: (body) => ({ url: "/eazotel/addcontacts", method: "POST", body }),
      invalidatesTags: ["Lead"],
    }),

    // up to 10 lead ids at a time
    deleteLeads: build.mutation({
      query: (ids) => ({
        url: "/eazotel/delete-multiple-contact-queries",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["Lead"],
    }),

    // { hid, leads } - one batch of leads read from a CSV file
    importLeads: build.mutation({
      query: ({ hid, leads }) => ({
        url: "/api/v1/leads/import",
        method: "POST",
        params: { hid },
        body: leads,
      }),
      extraOptions: NODE,
    }),

    // pulls the latest leads from the connected Meta lead forms
    syncMetaLeads: build.mutation({
      query: (hid) => ({
        url: "/api/v1/meta/leads/bulk-import",
        method: "POST",
        params: { hid },
        body: {},
      }),
      invalidatesTags: ["Lead"],
      extraOptions: NODE,
    }),

    // --- one-time password that guards the export ---
    // sends the code to the account's WhatsApp number
    sendExportOtp: build.mutation({
      query: (hid) => ({
        url: "/api/v1/otp/send-otp",
        method: "POST",
        params: { hid },
      }),
      extraOptions: NODE,
    }),

    // { ndid, otp } -> true when the code is right
    verifyExportOtp: build.mutation({
      query: (body) => ({
        url: "/api/v1/otp/verify-otp",
        method: "POST",
        body,
      }),
      transformResponse: (response) => ({
        verified: Boolean(
          response?.result?.success && response?.result?.docs?.response,
        ),
        message: response?.result?.responseMessage || response?.responseMessage,
      }),
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetAllEnquiriesQuery,
  useGetLeadQuery,
  useGetLeadAtPositionQuery,
  useExportLeadsMutation,
  useUpdateLeadMutation,
  useCreateLeadMutation,
  useDeleteLeadsMutation,
  useImportLeadsMutation,
  useSyncMetaLeadsMutation,
  useSendExportOtpMutation,
  useVerifyExportOtpMutation,
} = leadsApi;

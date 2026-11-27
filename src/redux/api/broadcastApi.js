import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["WhatsAppCampaign"] });

// WhatsApp broadcast campaigns. The audience count and the templates come
// from whatsappApi (getCampaignAudience) and callsApi (getWhatsAppTemplates).
export const broadcastApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCampaigns: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/campaign", params: { hid } }),
      transformResponse: (response) => response?.result?.docs?.campaigns || [],
      providesTags: ["WhatsAppCampaign"],
      extraOptions: NODE,
    }),

    // { id, page, limit, status?, search? } -> { campaign, recipients, total }
    getCampaignDetails: build.query({
      query: ({ id, ...params }) => ({
        url: `/api/v1/whatsapp/campaign/broadcast/${id}`,
        params,
      }),
      transformResponse: (response) => {
        const doc = response?.result?.doc || {};
        return {
          campaign: doc.campaign || null,
          recipients: doc.recipients || [],
          total: doc.pagination?.total ?? 0,
        };
      },
      providesTags: (result, error, { id }) => [
        { type: "WhatsAppCampaign", id },
      ],
      extraOptions: NODE,
    }),

    // hid -> { dailyLimit (-1 = unlimited), usedToday, perMinute, maxRecipients, activeCampaigns,
    // maxActiveCampaigns }: Meta's 24-hour limit for this number and the pace gian sends at
    getCampaignLimits: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/campaign/limits", params: { hid } }),
      transformResponse: (response) => response?.result || null,
      providesTags: ["WhatsAppCampaign"],
      extraOptions: NODE,
    }),

    // { hid, campaignName, template: {...}, source? }
    createCampaign: build.mutation({
      query: ({ hid, ...body }) => ({
        url: "/api/v1/whatsapp/campaign/create",
        method: "POST",
        params: { hid },
        body,
      }),
      invalidatesTags: ["WhatsAppCampaign"],
      extraOptions: NODE,
    }),

    // sends the campaign's template again to one recipient whose message failed
    // { hid, campaignId, recipientId }
    resendCampaignRecipient: build.mutation({
      query: ({ hid, campaignId, recipientId }) => ({
        url: `/api/v1/whatsapp/campaign/broadcast/${campaignId}/recipients/${recipientId}/resend`,
        method: "POST",
        params: { hid },
      }),
      invalidatesTags: (result, error, { campaignId }) => [
        { type: "WhatsAppCampaign", id: campaignId },
      ],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignDetailsQuery,
  useCreateCampaignMutation,
  useGetCampaignLimitsQuery,
  useResendCampaignRecipientMutation,
} = broadcastApi;

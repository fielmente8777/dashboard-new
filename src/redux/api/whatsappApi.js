import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({
  addTagTypes: ["WhatsAppConversation", "WhatsAppMessage"],
});

// The WhatsApp live chat. The conversation and message lists are also
// changed in place (new messages from the websocket, messages being sent):
// see useChatCache.
export const whatsappApi = api.injectEndpoints({
  endpoints: (build) => ({
    // which integrations are connected, e.g. { metaWhatsapp, exotel, ... }
    getIntegrationStatus: build.query({
      query: (hid) => ({ url: "/api/v1/integration/get", params: { hid } }),
      transformResponse: (response) => response?.result?.docs || {},
      extraOptions: NODE,
    }),

    // starts the Meta signup; resolves with the URL to open
    connectWhatsApp: build.mutation({
      query: ({ hid, ndid }) => ({
        url: "/api/v1/whatsapp/meta/connect",
        method: "POST",
        params: { ndid, hid },
        headers: { "x-ndid": ndid },
      }),
      transformResponse: (response) => response?.result?.docs?.signupUrl || "",
      extraOptions: { ...NODE, skipAuth: true },
    }),

    // the connected account, including whether the AI replies ({ ai: { enabled } })
    getWhatsAppAccount: build.query({
      query: (hid) => ({
        url: "/api/v1/whatsapp/account/connection/details",
        params: { hid },
      }),
      transformResponse: (response) => response?.result?.docs || null,
      extraOptions: NODE,
    }),

    getConversations: build.query({
      query: (hid) => ({
        url: "/api/v1/whatsapp/conversations/all",
        params: { hid },
      }),
      transformResponse: (response) => response?.result?.conversations || [],
      providesTags: ["WhatsAppConversation"],
      extraOptions: NODE,
    }),

    getMessages: build.query({
      query: (conversationId) =>
        `/api/v1/whatsapp/conversations/${conversationId}/messages`,
      transformResponse: (response) => response?.result?.messages || [],
      providesTags: (result, error, conversationId) => [
        { type: "WhatsAppMessage", id: conversationId },
      ],
      extraOptions: NODE,
    }),

    // { hid, payload } - payload is a FormData (text and / or a file) or a
    // plain object (template, interactive, media by id or url).
    // Resolves with the server's answer whatever its status, so the caller
    // can tell "no credits" (402) from other failures.
    sendMessage: build.mutation({
      queryFn: async ({ hid, payload }, api, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: "/api/v1/whatsapp/messages/send",
          method: "POST",
          params: { hid },
          body: payload,
        });
        if (result.error && typeof result.error.status !== "number") {
          return { error: result.error };
        }
        return { data: result.data ?? result.error?.data ?? {} };
      },
      extraOptions: NODE,
    }),

    // message ids (the WhatsApp ones, `messageId`)
    deleteMessages: build.mutation({
      query: (ids) => ({
        url: "/api/v1/whatsapp/messages/delete",
        method: "DELETE",
        body: { ids },
      }),
      extraOptions: NODE,
    }),

    markConversationRead: build.mutation({
      query: (conversationId) => ({
        url: `/api/v1/whatsapp/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      extraOptions: NODE,
    }),

    // { hid, conversationId, phone }
    deleteConversation: build.mutation({
      query: ({ hid, conversationId, phone }) => ({
        url: `/api/v1/whatsapp/conversations/${conversationId}/delete`,
        method: "DELETE",
        params: { hid, phone },
      }),
      extraOptions: NODE,
    }),

    // { hid, conversationIds }
    deleteConversations: build.mutation({
      query: ({ hid, conversationIds }) => ({
        url: "/api/v1/whatsapp/conversations",
        method: "DELETE",
        params: { hid },
        body: { conversationIds },
      }),
      extraOptions: NODE,
    }),

    // --- who answers: the AI or a team member ---
    // { conversationId, userEmail, release? } -> the new { mode, assignedTo }.
    // Take over makes the signed-in user the one replying; release hands the
    // conversation back to the AI.
    setConversationHandling: build.mutation({
      query: ({ conversationId, userEmail, release = false }) => ({
        url: `/api/v1/whatsapp/conversations/${conversationId}/${release ? "release" : "takeover"}`,
        method: "PUT",
        body: { userEmail },
      }),
      transformResponse: (response) => ({
        success: response?.success,
        message: response?.responseMessage || response?.message,
        handling: response?.result?.handling,
      }),
      extraOptions: NODE,
    }),

    // --- automated flows (forms) ---
    getWhatsAppFlows: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/flow/get", params: { hid } }),
      transformResponse: (response) => response?.result?.docs?.flows || [],
      extraOptions: NODE,
    }),

    // { hid, ndid, phone } -> true while an automated flow is talking to this number
    getFlowSession: build.query({
      query: (params) => ({ url: "/api/v1/whatsapp/flow-session", params }),
      transformResponse: (response) =>
        Boolean(response?.result?.docs?.flowSession?.isActive),
      extraOptions: NODE,
    }),

    // { hid, ndid, phone, isActive }
    updateFlowSession: build.mutation({
      query: ({ hid, ndid, ...body }) => ({
        url: "/api/v1/whatsapp/flow-session",
        method: "PUT",
        params: { hid, ndid },
        body,
      }),
      extraOptions: NODE,
    }),

    getQuickReplies: build.query({
      query: (hid) => ({ url: "/api/v1/quick-reply", params: { hid } }),
      transformResponse: (response) => response?.result?.docs || [],
      extraOptions: NODE,
    }),

    // { hid, source? } -> how many contacts a campaign would reach
    getCampaignAudience: build.query({
      query: ({ hid, source }) => ({
        url: "/api/v1/whatsapp/campaign/users",
        params: { hid, source: source || undefined },
      }),
      transformResponse: (response) => response?.result?.totalUsers || 0,
      extraOptions: NODE,
    }),

    // Turns a conversation into a lead (stage, notes, assignee).
    // { hid, ...lead fields }
    createWhatsAppLead: build.mutation({
      query: ({ hid, ...body }) => ({
        url: "/api/v1/whatsapp/lead/create",
        method: "POST",
        params: { hid },
        body,
      }),
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetIntegrationStatusQuery,
  useConnectWhatsAppMutation,
  useGetWhatsAppAccountQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessagesMutation,
  useMarkConversationReadMutation,
  useDeleteConversationMutation,
  useDeleteConversationsMutation,
  useSetConversationHandlingMutation,
  useGetWhatsAppFlowsQuery,
  useGetFlowSessionQuery,
  useUpdateFlowSessionMutation,
  useGetQuickRepliesQuery,
  useGetCampaignAudienceQuery,
  useCreateWhatsAppLeadMutation,
} = whatsappApi;

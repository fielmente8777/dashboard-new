import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({
  addTagTypes: ["InstagramConversation", "InstagramMessage", "InstagramAccount"],
});

// Instagram DMs live chat (gian: /api/v1/instagram). The conversation and
// message lists are also changed in place (websocket, sending): see
// useInstagramCache.
export const instagramApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Instagram business accounts connected for this location (saved by the
    // Facebook / Meta connect flow)
    getInstagramAccounts: build.query({
      query: (hid) => ({ url: "/api/v1/instagram/accounts", params: { hid } }),
      transformResponse: (response) => response?.result?.accounts || [],
      providesTags: ["InstagramAccount"],
      extraOptions: NODE,
    }),

    getInstagramConversations: build.query({
      query: (hid) => ({
        url: "/api/v1/instagram/conversations",
        params: { hid },
      }),
      transformResponse: (response) => response?.result?.conversations || [],
      providesTags: ["InstagramConversation"],
      extraOptions: NODE,
    }),

    getInstagramMessages: build.query({
      query: (conversationId) =>
        `/api/v1/instagram/conversations/${conversationId}/messages`,
      transformResponse: (response) => response?.result?.messages || [],
      providesTags: (result, error, conversationId) => [
        { type: "InstagramMessage", id: conversationId },
      ],
      extraOptions: NODE,
    }),

    // { conversationId, text } -> { message, canReply }
    sendInstagramMessage: build.mutation({
      query: ({ conversationId, text }) => ({
        url: `/api/v1/instagram/conversations/${conversationId}/messages`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (response) => response?.result || {},
      extraOptions: NODE,
    }),

    markInstagramConversationRead: build.mutation({
      query: (conversationId) => ({
        url: `/api/v1/instagram/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      extraOptions: NODE,
    }),

    // deletes the conversation, all its messages and its lead
    deleteInstagramConversation: build.mutation({
      query: (conversationId) => ({
        url: `/api/v1/instagram/conversations/${conversationId}`,
        method: "DELETE",
      }),
      extraOptions: NODE,
    }),

    deleteInstagramConversations: build.mutation({
      query: (conversationIds) => ({
        url: "/api/v1/instagram/conversations",
        method: "DELETE",
        body: { conversationIds },
      }),
      extraOptions: NODE,
    }),

    // message _ids -> { deleted, conversations: [{ _id, last_message }] }
    deleteInstagramMessages: build.mutation({
      query: (ids) => ({
        url: "/api/v1/instagram/messages",
        method: "DELETE",
        body: { ids },
      }),
      transformResponse: (response) => response?.result || {},
      extraOptions: NODE,
    }),

    // creates the conversation's lead if it has none -> conversation
    createInstagramLead: build.mutation({
      query: (conversationId) => ({
        url: `/api/v1/instagram/conversations/${conversationId}/lead`,
        method: "POST",
      }),
      transformResponse: (response) => response?.result?.conversation || null,
      extraOptions: NODE,
    }),

    // { conversationId, status?, notes?, assignee? } -> conversation
    updateInstagramLead: build.mutation({
      query: ({ conversationId, ...changes }) => ({
        url: `/api/v1/instagram/conversations/${conversationId}/lead`,
        method: "PATCH",
        body: changes,
      }),
      transformResponse: (response) => response?.result?.conversation || null,
      extraOptions: NODE,
    }),

    // subscribes the connected Pages to DM webhooks (keeps leadgen)
    subscribeInstagram: build.mutation({
      query: (hid) => ({
        url: "/api/v1/instagram/subscribe",
        method: "POST",
        params: { hid },
      }),
      transformResponse: (response) => response?.result?.results || [],
      extraOptions: NODE,
    }),

    // what is connected, subscribed fields, permissions, counts
    getInstagramDebug: build.query({
      query: (hid) => ({ url: "/api/v1/instagram/debug", params: { hid } }),
      transformResponse: (response) => response?.result || null,
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetInstagramAccountsQuery,
  useGetInstagramConversationsQuery,
  useGetInstagramMessagesQuery,
  useSendInstagramMessageMutation,
  useMarkInstagramConversationReadMutation,
  useDeleteInstagramConversationMutation,
  useDeleteInstagramConversationsMutation,
  useDeleteInstagramMessagesMutation,
  useCreateInstagramLeadMutation,
  useUpdateInstagramLeadMutation,
  useSubscribeInstagramMutation,
  useLazyGetInstagramDebugQuery,
} = instagramApi;

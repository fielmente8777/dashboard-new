import { baseApi } from "./baseApi";

const RULES_URL = "/api/v1/ai-instructions";
const FEEDBACK_URL = "/api/v1/ai-feedback";
const VOICE_URL = "/api/v1/voice-instructions";
const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["AiRule", "AiFeedback", "VoiceRule", "VoiceSettings"] });

// Every call takes the tenant ({ hid, ndid }) alongside its own fields.
export const aiTrainingApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAiRules: build.query({
      query: ({ hid, ndid }) => ({ url: RULES_URL, params: { hid, ndid } }),
      transformResponse: (response) => response?.items || [],
      providesTags: ["AiRule"],
      extraOptions: NODE,
    }),

    // { hid, ndid, ruleText, category, enabled }
    addAiRule: build.mutation({
      query: (body) => ({ url: RULES_URL, method: "POST", body }),
      invalidatesTags: ["AiRule"],
      extraOptions: NODE,
    }),

    // { id, hid, ndid, ...fields to change }
    updateAiRule: build.mutation({
      query: ({ id, ...body }) => ({
        url: `${RULES_URL}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AiRule"],
      extraOptions: NODE,
    }),

    deleteAiRule: build.mutation({
      query: ({ id, hid, ndid }) => ({
        url: `${RULES_URL}/${id}`,
        method: "DELETE",
        params: { hid, ndid },
      }),
      invalidatesTags: ["AiRule"],
      extraOptions: NODE,
    }),

    // replies flagged in real conversations that are still waiting for review
    getFlaggedReplies: build.query({
      query: ({ hid, ndid }) => ({
        url: FEEDBACK_URL,
        params: { hid, ndid, status: "pending" },
      }),
      transformResponse: (response) => response?.items || [],
      providesTags: ["AiFeedback"],
      extraOptions: NODE,
    }),

    // { id, hid, ndid, ruleText, category } - turns the correction into a rule
    approveFlaggedReply: build.mutation({
      query: ({ id, ...body }) => ({
        url: `${FEEDBACK_URL}/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AiFeedback", "AiRule"],
      extraOptions: NODE,
    }),

    rejectFlaggedReply: build.mutation({
      query: ({ id, ...body }) => ({
        url: `${FEEDBACK_URL}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AiFeedback"],
      extraOptions: NODE,
    }),
    // --- Voice AI: what the phone assistant follows, and its switches ---

    getVoiceRules: build.query({
      query: ({ hid, ndid }) => ({ url: VOICE_URL, params: { hid, ndid } }),
      transformResponse: (response) => response?.items || [],
      providesTags: ["VoiceRule"],
      extraOptions: NODE,
    }),

    // { hid, ndid, ruleText, category, enabled }
    addVoiceRule: build.mutation({
      query: ({ hid, ...body }) => ({ url: VOICE_URL, method: "POST", params: { hid }, body: { hid, ...body } }),
      invalidatesTags: ["VoiceRule"],
      extraOptions: NODE,
    }),

    // { id, hid, ndid, ...fields to change }
    updateVoiceRule: build.mutation({
      query: ({ id, hid, ...body }) => ({ url: `${VOICE_URL}/${id}`, method: "PUT", params: { hid }, body }),
      invalidatesTags: ["VoiceRule"],
      extraOptions: NODE,
    }),

    deleteVoiceRule: build.mutation({
      query: ({ id, hid, ndid }) => ({ url: `${VOICE_URL}/${id}`, method: "DELETE", params: { hid, ndid } }),
      invalidatesTags: ["VoiceRule"],
      extraOptions: NODE,
    }),

    // -> { voiceEnabled, whatsappIntegrationEnabled, defaultMessage }
    getVoiceSettings: build.query({
      query: ({ hid, ndid }) => ({ url: `${VOICE_URL}/settings`, params: { hid, ndid } }),
      transformResponse: (response) => response?.settings || null,
      providesTags: ["VoiceSettings"],
      extraOptions: NODE,
    }),

    // { hid, ...settings to change }
    updateVoiceSettings: build.mutation({
      query: ({ hid, ndid: _ndid, ...body }) => ({ url: `${VOICE_URL}/settings`, method: "PATCH", params: { hid }, body }),
      invalidatesTags: ["VoiceSettings"],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetAiRulesQuery,
  useAddAiRuleMutation,
  useUpdateAiRuleMutation,
  useDeleteAiRuleMutation,
  useGetFlaggedRepliesQuery,
  useApproveFlaggedReplyMutation,
  useRejectFlaggedReplyMutation,
  useGetVoiceRulesQuery,
  useAddVoiceRuleMutation,
  useUpdateVoiceRuleMutation,
  useDeleteVoiceRuleMutation,
  useGetVoiceSettingsQuery,
  useUpdateVoiceSettingsMutation,
} = aiTrainingApi;

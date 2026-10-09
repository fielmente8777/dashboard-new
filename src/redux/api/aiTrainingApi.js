import { baseApi } from "./baseApi";

const RULES_URL = "/api/v1/ai-instructions";
const FEEDBACK_URL = "/api/v1/ai-feedback";
const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["AiRule", "AiFeedback"] });

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
} = aiTrainingApi;

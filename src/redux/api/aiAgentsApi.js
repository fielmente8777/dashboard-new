import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["AiAgent", "AiAgentActivity"] });

// AI agents per channel (gian: /api/v1/ai-agents/:channel). Instagram today.
export const aiAgentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAiAgent: build.query({
      query: ({ channel, hid }) => ({ url: `/api/v1/ai-agents/${channel}`, params: { hid } }),
      transformResponse: (response) => response?.result || null,
      providesTags: (result, error, { channel, hid }) => [{ type: "AiAgent", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),

    writeAiAgent: build.mutation({
      query: ({ channel, hid, action, config, revision }) => ({
        url: `/api/v1/ai-agents/${channel}${["save", "create"].includes(action) ? "" : `/${action}`}`,
        method: action === "save" ? "PUT" : "POST",
        params: { hid },
        body: { config, revision },
      }),
      transformResponse: (response) => response?.result || null,
      invalidatesTags: (result, error, { channel, hid }) =>
        result || error?.status === 409 ? [{ type: "AiAgent", id: `${hid}:${channel}` }] : [],
      extraOptions: NODE,
    }),

    // { channel, hid, message, history, config } -> { reply, handoff, toolsUsed, ... }
    testAiAgent: build.mutation({
      query: ({ channel, hid, ...body }) => ({
        url: `/api/v1/ai-agents/${channel}/test`,
        method: "POST",
        params: { hid },
        body,
      }),
      transformResponse: (response) => response?.result || null,
      extraOptions: NODE,
    }),

    getAiAgentActivity: build.query({
      query: ({ channel, hid, limit = 50, outcome }) => ({
        url: `/api/v1/ai-agents/${channel}/activity`,
        params: { hid, limit, ...(outcome && outcome !== "all" ? { outcome } : {}) },
      }),
      transformResponse: (response) => response?.result || { runs: [], last7Days: {} },
      providesTags: (result, error, { channel, hid }) => [{ type: "AiAgentActivity", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetAiAgentQuery,
  useWriteAiAgentMutation,
  useTestAiAgentMutation,
  useGetAiAgentActivityQuery,
} = aiAgentsApi;

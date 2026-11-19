import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["AiAgent", "AiAgentActivity"] });

// AI agents per channel (gian: /api/v1/ai-agents/:channel). Instagram today.
export const aiAgentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // { channel, hid } -> { config, status, defaults, model }
    getAiAgent: build.query({
      query: ({ channel, hid }) => ({ url: `/api/v1/ai-agents/${channel}`, params: { hid } }),
      transformResponse: (response) => response?.result || null,
      providesTags: (result, error, { channel }) => [{ type: "AiAgent", id: channel }],
      extraOptions: NODE,
    }),

    // { channel, hid, config } -> { config, status }
    saveAiAgent: build.mutation({
      query: ({ channel, hid, config }) => ({
        url: `/api/v1/ai-agents/${channel}`,
        method: "PUT",
        params: { hid },
        body: config,
      }),
      transformResponse: (response) => response?.result || null,
      invalidatesTags: (result, error, { channel }) => [{ type: "AiAgent", id: channel }],
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

    // { channel, hid } -> { runs, last7Days }
    getAiAgentActivity: build.query({
      query: ({ channel, hid, limit = 50 }) => ({
        url: `/api/v1/ai-agents/${channel}/activity`,
        params: { hid, limit },
      }),
      transformResponse: (response) => response?.result || { runs: [], last7Days: {} },
      providesTags: (result, error, { channel }) => [{ type: "AiAgentActivity", id: channel }],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetAiAgentQuery,
  useSaveAiAgentMutation,
  useTestAiAgentMutation,
  useGetAiAgentActivityQuery,
} = aiAgentsApi;

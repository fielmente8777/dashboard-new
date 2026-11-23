import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["AiAgent", "AiAgentActivity", "AiAgentActions", "AiAgentAvailability"] });

const result = (response) => response?.result ?? null;
const actionsUrl = (channel, path = "") => `/api/v1/ai-agents/${channel}/actions${path}`;
// an action change also changes the agent's "unpublished changes" state
const actionTags = (channel, hid) => [
  { type: "AiAgentActions", id: `${hid}:${channel}` },
  { type: "AiAgentAvailability", id: `${hid}:${channel}` },
  { type: "AiAgent", id: `${hid}:${channel}` },
];

// AI agents per channel (gian: /api/v1/ai-agents/:channel): instagram, whatsapp.
export const aiAgentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAiAgent: build.query({
      query: ({ channel, hid }) => ({ url: `/api/v1/ai-agents/${channel}`, params: { hid } }),
      transformResponse: (response) => response?.result || null,
      providesTags: (result, error, { channel, hid }) => [{ type: "AiAgent", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),

    writeAiAgent: build.mutation({
      query: ({ channel, hid, action, config, revision, template }) => ({
        url: `/api/v1/ai-agents/${channel}${["save", "create"].includes(action) ? "" : `/${action}`}`,
        method: action === "save" ? "PUT" : "POST",
        params: { hid },
        body: { config, revision, ...(action === "create" && template ? { template } : {}) },
      }),
      transformResponse: (response) => response?.result || null,
      // publishing the agent also publishes its actions; working hours change availability
      invalidatesTags: (result, error, { channel, hid }) =>
        result || error?.status === 409 ? actionTags(channel, hid) : [],
      extraOptions: NODE,
    }),

    // starter templates for a new agent (same for every channel)
    getAiAgentTemplates: build.query({
      query: () => ({ url: "/api/v1/ai-agents/templates" }),
      transformResponse: (response) => response?.result?.templates || [],
      keepUnusedDataFor: 3600,
      extraOptions: NODE,
    }),

    // { channel, hid, url } -> { url, pages, propertyName, summary, welcomeMessage, facts, template }
    // A draft only: nothing is saved. Uses AI credits.
    trainAiAgentFromWebsite: build.mutation({
      query: ({ channel, hid, url }) => ({ url: `/api/v1/ai-agents/${channel}/setup/website`, method: "POST", params: { hid }, body: { url } }),
      transformResponse: result,
      extraOptions: NODE,
    }),

    // { channel, hid, message, history, config } -> { reply, handoff, toolsUsed, buttons, ... }
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

    // --- actions (gian: /api/v1/ai-agents/:channel/actions) ---

    // -> { actions: [view], counts: { all, enabled, custom, unpublished }, builtInHandlers, customCodeEnabled }
    getAiAgentActions: build.query({
      query: ({ channel, hid }) => ({ url: actionsUrl(channel), params: { hid } }),
      transformResponse: result,
      providesTags: (r, e, { channel, hid }) => [{ type: "AiAgentActions", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),

    // create (no id) or update; { action, updatedAt?, aiGenerated? } -> view
    saveAiAgentAction: build.mutation({
      query: ({ channel, hid, id, action, updatedAt, aiGenerated }) => ({
        url: actionsUrl(channel, id ? `/${id}` : ""),
        method: id ? "PUT" : "POST",
        params: { hid },
        body: id ? { action, updatedAt } : { action, aiGenerated },
      }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? actionTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    // optimistic: the switch moves at once and moves back if the save fails
    toggleAiAgentAction: build.mutation({
      query: ({ channel, hid, id, enabled }) => ({ url: actionsUrl(channel, `/${id}/toggle`), method: "POST", params: { hid }, body: { enabled } }),
      transformResponse: result,
      async onQueryStarted({ channel, hid, id, enabled }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          aiAgentsApi.util.updateQueryData("getAiAgentActions", { channel, hid }, (draft) => {
            const action = draft?.actions?.find((a) => a.id === id);
            if (!action) return;
            action.draft.enabled = enabled;
            draft.counts.enabled += enabled ? 1 : -1;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (r, e, { channel, hid }) => (r ? actionTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    deleteAiAgentAction: build.mutation({
      query: ({ channel, hid, id }) => ({ url: actionsUrl(channel, `/${id}`), method: "DELETE", params: { hid } }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? actionTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    duplicateAiAgentAction: build.mutation({
      query: ({ channel, hid, id }) => ({ url: actionsUrl(channel, `/${id}/duplicate`), method: "POST", params: { hid } }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? actionTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    bulkScheduleAiAgentActions: build.mutation({
      query: ({ channel, hid, ids, schedule }) => ({ url: actionsUrl(channel, "/bulk-schedule"), method: "POST", params: { hid }, body: { ids, schedule } }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? actionTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    // { input, live, action } -> { dryRun, request, response, error, latencyMs }
    testAiAgentAction: build.mutation({
      // no id: an action that is not saved yet ("Try it"; always a practice run)
      query: ({ channel, hid, id, ...body }) => ({ url: actionsUrl(channel, id ? `/${id}/test` : "/try"), method: "POST", params: { hid }, body }),
      transformResponse: result,
      // a saved action's test updates its "Connected" badge in the list
      invalidatesTags: (r, e, { channel, hid, id }) => (r && id ? [{ type: "AiAgentActions", id: `${hid}:${channel}` }] : []),
      extraOptions: NODE,
    }),

    // { description, paste } -> { draft, scheduleReason, chargedCredits }
    generateAiAgentAction: build.mutation({
      query: ({ channel, hid, ...body }) => ({ url: actionsUrl(channel, "/generate"), method: "POST", params: { hid }, body }),
      transformResponse: result,
      extraOptions: NODE,
    }),

    getAiAgentActionEstimate: build.query({
      query: ({ channel, hid }) => ({ url: actionsUrl(channel, "/generate/estimate"), params: { hid } }),
      transformResponse: result,
      extraOptions: NODE,
    }),

    exportAiAgentActions: build.mutation({
      query: ({ channel, hid, ids }) => ({ url: actionsUrl(channel, "/export"), params: { hid, ...(ids?.length ? { ids: ids.join(",") } : {}) } }),
      transformResponse: result,
      extraOptions: NODE,
    }),

    importAiAgentActions: build.mutation({
      query: ({ channel, hid, file }) => ({ url: actionsUrl(channel, "/import"), method: "POST", params: { hid }, body: file }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? actionTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    // open now / next opening per action, in the hotel's time zone
    getAiAgentActionsAvailability: build.query({
      query: ({ channel, hid }) => ({ url: actionsUrl(channel, "/availability"), params: { hid } }),
      transformResponse: result,
      providesTags: (r, e, { channel, hid }) => [{ type: "AiAgentAvailability", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetAiAgentQuery,
  useWriteAiAgentMutation,
  useTestAiAgentMutation,
  useGetAiAgentActivityQuery,
  useGetAiAgentActionsQuery,
  useSaveAiAgentActionMutation,
  useToggleAiAgentActionMutation,
  useDeleteAiAgentActionMutation,
  useDuplicateAiAgentActionMutation,
  useBulkScheduleAiAgentActionsMutation,
  useTestAiAgentActionMutation,
  useGenerateAiAgentActionMutation,
  useGetAiAgentActionEstimateQuery,
  useExportAiAgentActionsMutation,
  useImportAiAgentActionsMutation,
  useGetAiAgentActionsAvailabilityQuery,
  useGetAiAgentTemplatesQuery,
  useTrainAiAgentFromWebsiteMutation,
} = aiAgentsApi;

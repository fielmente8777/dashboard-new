import { baseApi } from "./baseApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["AiAgent", "AiAgentActivity", "AiAgentActions", "AiAgentAvailability", "AiAgentSkills"] });

const result = (response) => response?.result ?? null;
const actionsUrl = (channel, path = "") => `/api/v1/ai-agents/${channel}/actions${path}`;
// an action change also changes the agent's "unpublished changes" state
const actionTags = (channel, hid) => [
  { type: "AiAgentActions", id: `${hid}:${channel}` },
  { type: "AiAgentAvailability", id: `${hid}:${channel}` },
  { type: "AiAgent", id: `${hid}:${channel}` },
  { type: "AiAgentSkills", id: `${hid}:${channel}` },
];
const skillsUrl = (channel, path = "") => `/api/v1/ai-agents/${channel}/skills${path}`;
// a skill change also changes "unpublished changes" and the Actions tab's "Used by skills"
const skillTags = (channel, hid) => [
  { type: "AiAgentSkills", id: `${hid}:${channel}` },
  { type: "AiAgentActions", id: `${hid}:${channel}` },
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
      query: ({ channel, hid, limit = 50, outcome, intent }) => ({
        url: `/api/v1/ai-agents/${channel}/activity`,
        params: { hid, limit, ...(outcome && outcome !== "all" ? { outcome } : {}), ...(intent && intent !== "all" ? { intent } : {}) },
      }),
      transformResponse: (response) => response?.result || { runs: [], last7Days: {} },
      providesTags: (result, error, { channel, hid }) => [{ type: "AiAgentActivity", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),

    // intent catalogue + 7-day detection stats (gian: GET /ai-agents/:channel/intents)
    // -> { groups, intents: [{ key, group, description, workflow, workflowLabel, canDisable }], workflows, stats, model }
    getAiAgentIntents: build.query({
      query: ({ channel, hid }) => ({ url: `/api/v1/ai-agents/${channel}/intents`, params: { hid } }),
      transformResponse: result,
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

    // --- skills (gian: /api/v1/ai-agents/:channel/skills) ---

    // -> { skills: [view], counts, size: { used, budget }, limits }
    getAiAgentSkills: build.query({
      query: ({ channel, hid }) => ({ url: skillsUrl(channel), params: { hid } }),
      transformResponse: result,
      providesTags: (r, e, { channel, hid }) => [{ type: "AiAgentSkills", id: `${hid}:${channel}` }],
      extraOptions: NODE,
    }),

    // create (no id) or update; { skill, updatedAt?, aiGenerated? } -> view
    saveAiAgentSkill: build.mutation({
      query: ({ channel, hid, id, skill, updatedAt, aiGenerated }) => ({
        url: skillsUrl(channel, id ? `/${id}` : ""),
        method: id ? "PUT" : "POST",
        params: { hid },
        body: id ? { skill, updatedAt } : { skill, aiGenerated },
      }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? skillTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    // optimistic, like actions
    toggleAiAgentSkill: build.mutation({
      query: ({ channel, hid, id, enabled }) => ({ url: skillsUrl(channel, `/${id}/toggle`), method: "POST", params: { hid }, body: { enabled } }),
      transformResponse: result,
      async onQueryStarted({ channel, hid, id, enabled }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          aiAgentsApi.util.updateQueryData("getAiAgentSkills", { channel, hid }, (draft) => {
            const skill = draft?.skills?.find((s) => s.id === id);
            if (!skill || skill.draft.enabled === enabled) return;
            skill.draft.enabled = enabled;
            draft.counts.enabled += enabled ? 1 : -1;
            draft.size.used += enabled ? skill.size : -skill.size;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (r, e, { channel, hid }) => (r ? skillTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    resetAiAgentSkill: build.mutation({
      query: ({ channel, hid, id }) => ({ url: skillsUrl(channel, `/${id}/reset`), method: "POST", params: { hid } }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? skillTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    deleteAiAgentSkill: build.mutation({
      query: ({ channel, hid, id }) => ({ url: skillsUrl(channel, `/${id}`), method: "DELETE", params: { hid } }),
      transformResponse: result,
      invalidatesTags: (r, e, { channel, hid }) => (r ? skillTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    // optimistic: the list shows the new order at once
    reorderAiAgentSkills: build.mutation({
      query: ({ channel, hid, ids }) => ({ url: skillsUrl(channel, "/reorder"), method: "POST", params: { hid }, body: { ids } }),
      transformResponse: result,
      async onQueryStarted({ channel, hid, ids }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          aiAgentsApi.util.updateQueryData("getAiAgentSkills", { channel, hid }, (draft) => {
            if (!draft?.skills) return;
            const byId = new Map(draft.skills.map((s) => [s.id, s]));
            draft.skills = ids.map((id) => byId.get(id)).filter(Boolean);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (r, e, { channel, hid }) => (r ? skillTags(channel, hid) : []),
      extraOptions: NODE,
    }),

    // { description } -> { draft, chargedCredits }. A draft only: nothing is saved.
    generateAiAgentSkill: build.mutation({
      query: ({ channel, hid, description }) => ({ url: skillsUrl(channel, "/generate"), method: "POST", params: { hid }, body: { description } }),
      transformResponse: result,
      extraOptions: NODE,
    }),

    // { config? } -> { parts: [{ id, type, title, chars, tokens, text }], totalChars, totalTokens, tools, skills }
    previewAiAgentPrompt: build.mutation({
      query: ({ channel, hid, config }) => ({ url: `/api/v1/ai-agents/${channel}/prompt-preview`, method: "POST", params: { hid }, body: { config } }),
      transformResponse: result,
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
  useGetAiAgentIntentsQuery,
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
  useGetAiAgentSkillsQuery,
  useSaveAiAgentSkillMutation,
  useToggleAiAgentSkillMutation,
  useResetAiAgentSkillMutation,
  useDeleteAiAgentSkillMutation,
  useReorderAiAgentSkillsMutation,
  useGenerateAiAgentSkillMutation,
  usePreviewAiAgentPromptMutation,
  useTrainAiAgentFromWebsiteMutation,
} = aiAgentsApi;

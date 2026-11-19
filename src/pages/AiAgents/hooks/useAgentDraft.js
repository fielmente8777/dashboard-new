import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiAction } from "../../../hooks/useApiAction";
import { useGetAiAgentQuery, useSaveAiAgentMutation } from "../../../redux/api/aiAgentsApi";

// set a value at "a.b.c" in a copy of `obj`
const setIn = (obj, path, value) => {
  const keys = path.split(".");
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = copy;
  keys.slice(0, -1).forEach((key) => {
    cursor[key] = Array.isArray(cursor[key]) ? [...cursor[key]] : { ...cursor[key] };
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  return copy;
};

// The agent's settings as edited on screen: loads them, keeps the unsaved
// draft, and saves / discards it.
//   draft, set("persona.tone", "luxury"), dirty, save(), discard()
export const useAgentDraft = ({ channel, hid }) => {
  const run = useApiAction();
  const query = useGetAiAgentQuery({ channel, hid }, { skip: !hid });
  const [saveAgent, { isLoading: saving }] = useSaveAiAgentMutation();
  const [draft, setDraft] = useState(null);

  const saved = query.data?.config || null;
  useEffect(() => {
    if (saved) setDraft(saved);
  }, [saved]);

  const dirty = useMemo(
    () => Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved)),
    [draft, saved],
  );

  const set = useCallback((path, value) => setDraft((current) => setIn(current, path, value)), []);

  const save = useCallback(
    async (overrides) => {
      const config = overrides ? { ...draft, ...overrides } : draft;
      const result = await run(saveAgent({ channel, hid, config }), {
        success: "AI agent saved",
        error: "Could not save the AI agent.",
      });
      if (result?.config) setDraft(result.config);
      return Boolean(result);
    },
    [channel, draft, hid, run, saveAgent],
  );

  return {
    query,
    draft,
    saved,
    status: query.data?.status,
    defaults: query.data?.defaults,
    model: query.data?.model,
    dirty,
    saving,
    set,
    save,
    discard: () => setDraft(saved),
  };
};

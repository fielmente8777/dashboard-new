import { useState } from "react";
import { useApiAction } from "../../../hooks/useApiAction";
import { useGetAiAgentQuery, useWriteAiAgentMutation } from "../../../redux/api/aiAgentsApi";

const setIn = (obj, path, value) => {
  const keys = path.split(".");
  const copy = { ...obj };
  let cursor = copy;
  keys.slice(0, -1).forEach((key) => {
    cursor[key] = Array.isArray(cursor[key]) ? [...cursor[key]] : { ...cursor[key] };
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  return copy;
};

const SUCCESS = {
  create: "AI agent draft created",
  save: "Draft saved",
  publish: "Agent published",
  pause: "Agent paused",
  resume: "Agent resumed",
  "discard-draft": "Restored the published settings",
};

export const useAgentDraft = ({ channel, hid }) => {
  const run = useApiAction();
  const query = useGetAiAgentQuery({ channel, hid }, { refetchOnMountOrArgChange: true, pollingInterval: 60000 });
  const [writeAgent, { isLoading: saving }] = useWriteAiAgentMutation();
  const [edits, setEdits] = useState(null);
  const [lastWrite, setLastWrite] = useState(null);

  const fetched = query.currentData;
  const snapshot = lastWrite && lastWrite.revision > (fetched?.revision ?? -1) ? lastWrite : fetched;
  const saved = snapshot?.config;
  const draft = edits?.config ?? saved;
  const dirty = Boolean(edits && JSON.stringify(draft) !== JSON.stringify(saved));
  const outdated = dirty && edits.revision !== snapshot.revision;

  const set = (path, value) => setEdits((current) => {
    const config = setIn(current?.config ?? saved, path, value);
    if (JSON.stringify(config) === JSON.stringify(saved)) return null;
    return { config, revision: current?.revision ?? snapshot.revision };
  });

  const write = async (action, config) => {
    const revision = action === "save" ? edits?.revision : snapshot?.revision;
    const result = await run(writeAgent({ channel, hid, action, config, revision }), {
      success: SUCCESS[action],
      error: "Could not update the AI agent.",
    });
    if (!result?.config) return;
    setLastWrite(result);
    setEdits((current) => {
      if (action === "save" || !dirty) return null;
      if (current?.revision === revision) return { ...current, revision: result.revision };
      return current;
    });
  };

  return { query, snapshot, draft, dirty, outdated, saving, set, write, save: () => write("save", draft), discard: () => setEdits(null) };
};

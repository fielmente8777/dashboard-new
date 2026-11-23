import { Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useDeleteAiAgentActionMutation,
  useDuplicateAiAgentActionMutation,
  useExportAiAgentActionsMutation,
  useGetAiAgentActionsAvailabilityQuery,
  useGetAiAgentActionsQuery,
  useImportAiAgentActionsMutation,
  useSaveAiAgentActionMutation,
  useToggleAiAgentActionMutation,
} from "../../../redux/api/aiAgentsApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import ActionEditor from "./ActionEditor";
import ActionList from "./ActionList";
import ActionSidePanel from "./ActionSidePanel";
import { TAB_OF_FIELD, blankAction, keyFromName, toForm, toPayload, validateAction } from "./actionModel";
import CreateWithAiDialog from "./CreateWithAiDialog";

// "inputs.2.name" -> sets form.inputs[2].name (copies along the way)
const setIn = (obj, path, value) => {
  const keys = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = root;
  keys.slice(0, -1).forEach((key) => {
    const next = cursor[key];
    cursor[key] = Array.isArray(next) ? [...next] : { ...next };
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  return root;
};

const download = (name, data) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const NEW = "new";

const ActionsTab = ({ channel, hid, agentHours }) => {
  const timezone = agentHours.timezone;
  const [params, setParams] = useSearchParams();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const query = useGetAiAgentActionsQuery({ channel, hid }, { refetchOnMountOrArgChange: true });
  const { data: availability } = useGetAiAgentActionsAvailabilityQuery({ channel, hid }, { pollingInterval: 60000 });
  const [saveAction, { isLoading: saving }] = useSaveAiAgentActionMutation();
  const [toggleAction] = useToggleAiAgentActionMutation();
  const [deleteAction] = useDeleteAiAgentActionMutation();
  const [duplicateAction] = useDuplicateAiAgentActionMutation();
  const [exportActions] = useExportAiAgentActionsMutation();
  const [importActions] = useImportAiAgentActionsMutation();

  const data = query.currentData;
  const actions = useMemo(() => data?.actions || [], [data]);
  const selectedId = params.get("action") || actions[0]?.id || null;
  const isNew = selectedId === NEW;
  const view = actions.find((a) => a.id === selectedId) || null;

  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [tab, setTab] = useState("general");
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [runNonce, setRunNonce] = useState(0);

  const dirty = Boolean(form) && JSON.stringify(form) !== baseline;

  const load = useCallback((next) => {
    setForm(next);
    setBaseline(next ? JSON.stringify(next) : "");
    setServerErrors({});
    setShowErrors(false);
  }, []);

  // load the selected action (again after it was saved / refetched)
  useEffect(() => {
    if (isNew || !view) return;
    load({ ...toForm(view.draft, timezone), key: view.key });
    setAiDraft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, view?.updatedAt, isNew]);

  // leaving the page with unsaved edits
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const guard = async () => !dirty || confirm("Your changes to this action are not saved. Discard them?", { title: "Discard changes", confirmText: "Discard", variant: "danger" });

  const select = async (id) => {
    if (id === selectedId || !(await guard())) return;
    setParams((p) => { p.set("action", id); return p; }, { replace: true });
    setTab("general");
  };

  const startNew = async (draft = null) => {
    if (!(await guard())) return;
    const base = draft ? { ...blankAction(timezone), ...draft.draft } : blankAction(timezone);
    setParams((p) => { p.set("action", NEW); return p; }, { replace: true });
    load(toForm(base, timezone));
    setAiDraft(draft ? { scheduleReason: draft.scheduleReason } : null);
    setTab("general");
  };

  const existingKeys = useMemo(() => actions.map((a) => a.key), [actions]);
  const clientErrors = form ? validateAction(form, { existingKeys, isNew, isBuiltIn: view?.isBuiltIn, customCodeEnabled: data?.customCodeEnabled }) : {};
  const errors = showErrors ? { ...clientErrors, ...serverErrors } : serverErrors;

  const set = (path, value) => {
    setForm((current) => {
      const next = setIn(current, path, value);
      // a new action's key follows its name until edited
      if (isNew && path === "name" && (!current.key || current.key === keyFromName(current.name || ""))) next.key = keyFromName(value);
      return next;
    });
    if (serverErrors[path]) setServerErrors(({ [path]: _gone, ...rest }) => rest);
  };

  const save = async ({ thenTest = false } = {}) => {
    setShowErrors(true);
    if (Object.keys(clientErrors).length) {
      setTab(TAB_OF_FIELD(Object.keys(clientErrors)[0]));
      showToast({ message: "Some fields need attention.", type: "error" });
      return;
    }
    try {
      const saved = await saveAction({
        channel, hid,
        id: isNew ? undefined : view.id,
        action: toPayload(isNew ? { ...form, key: form.key || keyFromName(form.name) } : form),
        updatedAt: view?.updatedAt,
        aiGenerated: Boolean(aiDraft),
      }).unwrap();
      showToast({ message: isNew ? "Action saved as a draft. Publish to make it live." : "Action saved. Publish to make it live." });
      const fresh = { ...toForm(saved.draft, timezone), key: saved.key };
      load(fresh);
      setAiDraft(null);
      if (isNew) setParams((p) => { p.set("action", saved.id); return p; }, { replace: true });
      if (thenTest) setRunNonce((n) => n + 1);
    } catch (error) {
      if (error?.status === 422 && error.data?.errors) {
        setServerErrors(error.data.errors);
        setTab(TAB_OF_FIELD(Object.keys(error.data.errors)[0]));
      }
      showToast({ message: getApiErrorMessage(error, "Could not save the action."), type: "error" });
    }
  };

  const toggle = async (action, enabled) => {
    // the switch is saved at once (optimistic); keep the open form in step
    if (action.id === selectedId && form) {
      setForm((f) => ({ ...f, enabled }));
      setBaseline((b) => (b ? JSON.stringify({ ...JSON.parse(b), enabled }) : b));
    }
    try {
      await toggleAction({ channel, hid, id: action.id, enabled }).unwrap();
    } catch (error) {
      if (action.id === selectedId) {
        setForm((f) => ({ ...f, enabled: !enabled }));
        setBaseline((b) => (b ? JSON.stringify({ ...JSON.parse(b), enabled: !enabled }) : b));
      }
      showToast({ message: getApiErrorMessage(error, "Could not switch the action."), type: "error" });
    }
  };

  const remove = async (action) => {
    if (!(await confirm(`Delete "${action.draft.name}"? It stops working for guests right away. This can't be undone.`, { title: "Delete action", confirmText: "Delete" }))) return;
    try {
      await deleteAction({ channel, hid, id: action.id }).unwrap();
      showToast({ message: "Action deleted" });
      if (action.id === selectedId) {
        load(null);
        setParams((p) => { p.delete("action"); return p; }, { replace: true });
      }
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not delete the action."), type: "error" });
    }
  };

  const duplicate = async (action) => {
    if (!(await guard())) return;
    try {
      const copy = await duplicateAction({ channel, hid, id: action.id }).unwrap();
      showToast({ message: "Duplicated. The copy is off until you enable it." });
      setParams((p) => { p.set("action", copy.id); return p; }, { replace: true });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not duplicate the action."), type: "error" });
    }
  };

  const exportOne = async (action) => {
    try {
      download(`${action.key}.action.json`, await exportActions({ channel, hid, ids: [action.id] }).unwrap());
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not export."), type: "error" });
    }
  };

  const importFile = async (file) => {
    try {
      const parsed = JSON.parse(await file.text());
      const { results } = await importActions({ channel, hid, file: parsed }).unwrap();
      const ok = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok);
      showToast({
        message: `${ok} action(s) imported (switched off; enter any API keys again).${failed.length ? ` ${failed.length} skipped: ${failed.map((f) => `${f.key} (${Object.values(f.errors || {})[0]})`).join(", ")}` : ""}`,
        type: failed.length ? "warning" : "success",
      });
    } catch (error) {
      showToast({ message: error instanceof SyntaxError ? "That file is not valid JSON." : getApiErrorMessage(error, "Could not import."), type: "error" });
    }
  };

  if (query.isError) return <ErrorState message="Could not load the actions." onRetry={query.refetch} />;
  if (!data) return <Skeleton className="h-96" />;

  const meta = {
    isNew,
    isBuiltIn: Boolean(view?.isBuiltIn),
    view,
    aiDraft: Boolean(aiDraft),
    scheduleReason: aiDraft?.scheduleReason,
    handlers: data.builtInHandlers || [],
    customCodeEnabled: data.customCodeEnabled,
    agentHours,
    availability: availability?.actions?.find((a) => a.id === view?.id) || null,
    workingHoursLink: dashboardPath(PAGES.AI_AGENTS, { hid, query: { tab: "working-hours" } }),
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[350px_minmax(0,1fr)] 2xl:grid-cols-[350px_minmax(0,1fr)_320px]">
      <ActionList
        data={data}
        selectedId={selectedId}
        onSelect={select}
        onCreate={() => startNew()}
        onCreateWithAi={() => setAiOpen(true)}
        onToggle={toggle}
        onDuplicate={duplicate}
        onDelete={remove}
        onExport={exportOne}
        onImport={importFile}
      />
      {form ? (
        <>
          <ActionEditor
            form={form}
            set={set}
            errors={errors}
            tab={tab}
            onTab={setTab}
            meta={meta}
            dirty={dirty}
            saving={saving}
            onToggle={(enabled) => (isNew ? set("enabled", enabled) : toggle(view, enabled))}
            onSave={() => save()}
            onSaveAndTest={() => save({ thenTest: true })}
            onDelete={() => view && remove(view)}
            onDuplicate={() => view && duplicate(view)}
            onExport={() => view && exportOne(view)}
          />
          <div className="lg:col-start-2 2xl:col-start-auto">
            <ActionSidePanel form={form} actionId={isNew ? null : view?.id} channel={channel} hid={hid} runNonce={runNonce} />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-app-border! bg-app-surface">
          <EmptyState icon={Zap} title="Choose an action" description="Pick one on the left, or create a new one." />
        </div>
      )}
      <CreateWithAiDialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        channel={channel}
        hid={hid}
        onDraft={(result) => {
          setAiOpen(false);
          startNew(result);
        }}
      />
    </div>
  );
};

export default ActionsTab;

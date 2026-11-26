import { Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import {
  useDeleteAiAgentActionMutation,
  useDuplicateAiAgentActionMutation,
  useExportAiAgentActionsMutation,
  useGenerateAiAgentActionMutation,
  useGetAiAgentActionEstimateQuery,
  useGetAiAgentActionsAvailabilityQuery,
  useGetAiAgentActionsQuery,
  useImportAiAgentActionsMutation,
  useSaveAiAgentActionMutation,
  useToggleAiAgentActionMutation,
} from "../../../redux/api/aiAgentsApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetWhatsAppTemplatesQuery } from "../../../redux/api/callsApi";
import { useGetTeamUsersQuery } from "../../../redux/api/usersApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import ActionEditor from "./ActionEditor";
import ActionList from "./ActionList";
import ActionSidePanel from "./ActionSidePanel";
import { TAB_OF_FIELD, blankAction, keyFromName, toForm, toPayload, validateAction } from "./actionModel";
import CreateWithAiDialog from "./CreateWithAiDialog";
import SimpleEditor from "./SimpleEditor";
import SimpleSidePanel from "./SimpleSidePanel";
import { fill, useSimpleCopy } from "./simpleCopy";
import { blankSimple, decompileSimple, hasSimpleSidePanel, simpleToForm, validateSimple } from "./simpleModel";
import TryItSheet from "./TryItSheet";

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

// browser storage can be missing or blocked: never let it break the page
const store = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // private window or full storage
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

// server field keys -> where Simple shows them
const SIMPLE_FIELD = { name: "simple.name", description: "simple.whenToUse" };

const NEW = "new";

// list | editor | side panel. Stacked on phones, list + editor from lg (the
// side panel goes under the editor), three columns from 2xl.
const GRID = "grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)_320px]";
const UNDER_EDITOR = "min-w-0 lg:col-start-2 2xl:col-start-auto";

const ActionsTab = ({ channel, hid, agentHours }) => {
  const timezone = agentHours.timezone;
  const [params, setParams] = useSearchParams();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const { copy, lang, setLang } = useSimpleCopy();
  const authUser = useSelector((state) => state.userProfile.authUser);
  const userEmail = authUser?.Email || authUser?.emailId || authUser?.email || "";

  // Simple | Advanced, remembered per user (Simple for everyone at first)
  const modeKey = `eazotel.actions.mode:${userEmail || "me"}`;
  const [mode, setModeState] = useState(() => (store.get(modeKey) === "advanced" ? "advanced" : "simple"));
  useEffect(() => setModeState(store.get(modeKey) === "advanced" ? "advanced" : "simple"), [modeKey]);

  const query = useGetAiAgentActionsQuery({ channel, hid }, { refetchOnMountOrArgChange: true });
  const { data: availability } = useGetAiAgentActionsAvailabilityQuery({ channel, hid }, { pollingInterval: 60000 });
  const [saveAction, { isLoading: saving }] = useSaveAiAgentActionMutation();
  const [toggleAction] = useToggleAiAgentActionMutation();
  const [deleteAction] = useDeleteAiAgentActionMutation();
  const [duplicateAction] = useDuplicateAiAgentActionMutation();
  const [exportActions] = useExportAiAgentActionsMutation();
  const [importActions] = useImportAiAgentActionsMutation();
  const [generate, { isLoading: generating }] = useGenerateAiAgentActionMutation();
  const { data: estimate } = useGetAiAgentActionEstimateQuery({ channel, hid }, { skip: mode !== "simple" });

  const data = query.currentData;
  const actions = useMemo(() => data?.actions || [], [data]);
  const handlers = useMemo(() => data?.builtInHandlers || [], [data]);
  const selectedId = params.get("action") || actions[0]?.id || null;
  const isNew = selectedId === NEW;
  const view = actions.find((a) => a.id === selectedId) || null;
  const draftKey = `eazotel.actionDraft:${hid}:${channel}:${selectedId}`;

  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [tab, setTab] = useState("general");
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [runNonce, setRunNonce] = useState(0);
  const [tryOpen, setTryOpen] = useState(false);
  const [triedSig, setTriedSig] = useState("");
  const [draftNotice, setDraftNotice] = useState(null);

  const dirty = Boolean(form) && JSON.stringify(form) !== baseline;

  const load = useCallback((next, key) => {
    setForm(next);
    setBaseline(next ? JSON.stringify(next) : "");
    setServerErrors({});
    setShowErrors(false);
    setTriedSig("");
    setAiMessage("");
    // unsaved work from last time (page closed before saving)
    const kept = key ? store.get(key) : null;
    setDraftNotice(kept?.form && JSON.stringify(kept.form) !== JSON.stringify(next) ? kept.form : null);
  }, []);

  // load the selected action (again after it was saved / refetched)
  useEffect(() => {
    if (isNew || !view) return;
    load({ ...toForm(view.draft, timezone), key: view.key }, `eazotel.actionDraft:${hid}:${channel}:${view.id}`);
    setAiDraft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, view?.updatedAt, isNew]);

  // a link straight to a new action (or a reload while creating one)
  useEffect(() => {
    if (!isNew || form || !data) return;
    load(toForm({ ...blankAction(timezone), ...(mode === "simple" ? { mode: "simple", simpleConfig: blankSimple() } : {}) }, timezone), `eazotel.actionDraft:${hid}:${channel}:${NEW}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, Boolean(data)]);

  // auto-save a local copy while there are unsaved changes
  useEffect(() => {
    if (!form || !dirty || draftNotice) return undefined;
    const timer = setTimeout(() => store.set(draftKey, { form, savedAt: Date.now() }), 400);
    return () => clearTimeout(timer);
  }, [form, dirty, draftKey, draftNotice]);

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

  // --- Simple view of the form ---------------------------------------------
  const isBuiltIn = Boolean(view?.isBuiltIn) && !isNew;
  const simple = useMemo(() => (form && !isBuiltIn ? decompileSimple(form) : null), [form, isBuiltIn]);
  const readOnly = Boolean(form) && !isBuiltIn && !simple;
  const editableSimple = mode === "simple" && Boolean(simple) && !isBuiltIn;
  const tried = Boolean(simple) && triedSig === JSON.stringify(simple);

  const needTeam = simple?.next.kind === "tell_team" && simple.next.tellTeam.channel === "whatsapp";
  const needTemplates = simple?.next.kind === "reply" && simple.next.reply.source === "template";
  const { data: teamUsers } = useGetTeamUsersQuery(undefined, { skip: !needTeam || mode !== "simple" });
  const { data: templates } = useGetWhatsAppTemplatesQuery(hid, { skip: !needTemplates || !hid || mode !== "simple" });

  const setMode = (next) => {
    store.set(modeKey, next);
    setModeState(next);
  };

  const guard = async () => !dirty || confirm(copy.confirmLeave.body, { title: copy.confirmLeave.title, confirmText: copy.confirmLeave.yes, variant: "danger" });

  const select = async (id) => {
    if (id === selectedId || !(await guard())) return;
    setParams((p) => { p.set("action", id); return p; }, { replace: true });
    setTab("general");
  };

  const startNew = async (draft = null) => {
    if (!(await guard())) return;
    const base = draft
      ? { ...blankAction(timezone), ...draft.draft }
      : { ...blankAction(timezone), ...(mode === "simple" ? { mode: "simple", simpleConfig: blankSimple() } : {}) };
    setParams((p) => { p.set("action", NEW); return p; }, { replace: true });
    load(toForm(base, timezone), `eazotel.actionDraft:${hid}:${channel}:${NEW}`);
    setAiDraft(draft ? { scheduleReason: draft.scheduleReason } : null);
    setTab("general");
  };

  const existingKeys = useMemo(() => actions.map((a) => a.key), [actions]);
  let clientErrors = {};
  if (form) {
    if (editableSimple) clientErrors = validateSimple(simple, copy);
    else if (mode === "simple" && isBuiltIn) clientErrors = validateAction(form, { isBuiltIn: true });
    else clientErrors = validateAction(form, { existingKeys, isNew, isBuiltIn, customCodeEnabled: data?.customCodeEnabled });
  }
  const mappedServer = mode === "simple" ? Object.fromEntries(Object.entries(serverErrors).map(([k, v]) => [SIMPLE_FIELD[k] || k, v])) : serverErrors;
  const errors = showErrors ? { ...clientErrors, ...mappedServer } : mappedServer;

  // Advanced edits: the form stops being "simple" until the server checks it again
  const set = (path, value) => {
    setForm((current) => {
      let next = setIn(current, path, value);
      if (current.mode === "simple" && !isBuiltIn && path !== "enabled") next = { ...next, mode: "advanced" };
      // a new action's key follows its name until edited
      if (isNew && path === "name" && (!current.key || current.key === keyFromName(current.name || ""))) next.key = keyFromName(value);
      return next;
    });
    if (serverErrors[path]) setServerErrors(({ [path]: _gone, ...rest }) => rest);
  };

  // Simple edits: the whole answer set; compiled into the form at once
  const setSimple = (config) => {
    setForm((current) => (config.next.kind ? simpleToForm(config, current, handlers) : { ...current, name: config.name, description: config.whenToUse, mode: "simple", simpleConfig: config }));
    if (Object.keys(serverErrors).length) setServerErrors({});
  };

  const changeMode = (next) => {
    if (next === mode) return;
    setMode(next);
    if (next === "simple" && form && !isBuiltIn && form.mode !== "simple") {
      // an Advanced action that Simple can show: open it in Simple
      const config = decompileSimple({ ...form, mode: undefined });
      if (config) {
        const fresh = simpleToForm(config, form, handlers);
        setForm(fresh);
        if (!dirty) setBaseline(JSON.stringify(fresh));
      } else if (isNew && !dirty) {
        // an empty new action: start it as a Simple one
        const fresh = { ...form, mode: "simple", simpleConfig: blankSimple() };
        setForm(fresh);
        setBaseline(JSON.stringify(fresh));
      }
    }
  };

  const save = async ({ thenTest = false, turnOn = false } = {}) => {
    setShowErrors(true);
    if (Object.keys(clientErrors).length) {
      if (mode === "advanced") setTab(TAB_OF_FIELD(Object.keys(clientErrors)[0]));
      showToast({ message: mode === "simple" ? copy.footer.fix : "Some fields need attention.", type: "error" });
      return;
    }
    const body = turnOn ? { ...form, enabled: true } : form;
    // Simple, new: the server picks a unique key from the name
    const payloadForm = isNew ? (editableSimple ? { ...body, key: "" } : { ...body, key: body.key || keyFromName(body.name) }) : body;
    try {
      const saved = await saveAction({
        channel, hid,
        id: isNew ? undefined : view.id,
        action: toPayload(payloadForm),
        updatedAt: view?.updatedAt,
        aiGenerated: Boolean(aiDraft),
      }).unwrap();
      store.remove(draftKey);
      showToast({ message: mode === "simple" ? (saved.draft.enabled ? copy.toast.savedOn : copy.toast.saved) : isNew ? "Action saved as a draft. Publish to make it live." : "Action saved. Publish to make it live." });
      const sig = triedSig;
      load({ ...toForm(saved.draft, timezone), key: saved.key });
      setTriedSig(sig);
      setAiDraft(null);
      if (isNew) setParams((p) => { p.set("action", saved.id); return p; }, { replace: true });
      if (thenTest) setRunNonce((n) => n + 1);
    } catch (error) {
      if (error?.status === 422 && error.data?.errors) {
        setServerErrors(error.data.errors);
        if (mode === "advanced") setTab(TAB_OF_FIELD(Object.keys(error.data.errors)[0]));
      }
      const message = error?.status === 409 ? copy.errors.changedElsewhere : mode === "simple" ? (error?.status === 422 ? copy.footer.fix : copy.errors.saveFailed) : getApiErrorMessage(error, "Could not save the action.");
      showToast({ message, type: "error" });
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
    if (!(await confirm(fill(copy.confirmDelete.body, { name: action.draft.name }), { title: copy.confirmDelete.title, confirmText: copy.confirmDelete.yes, variant: "danger" }))) return;
    try {
      await deleteAction({ channel, hid, id: action.id }).unwrap();
      store.remove(`eazotel.actionDraft:${hid}:${channel}:${action.id}`);
      showToast({ message: copy.toast.deleted });
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
      const copyOf = await duplicateAction({ channel, hid, id: action.id }).unwrap();
      showToast({ message: copy.toast.duplicated });
      setParams((p) => { p.set("action", copyOf.id); return p; }, { replace: true });
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
      showToast({ message: error instanceof SyntaxError ? "That file is not valid." : getApiErrorMessage(error, "Could not import."), type: "error" });
    }
  };

  // "Create with AI" in the Simple form: fills the 3 steps, never saves or switches on
  const runAi = async (description) => {
    setAiMessage("");
    try {
      const result = await generate({ channel, hid, description, shape: "simple" }).unwrap();
      setForm((current) => ({ ...simpleToForm(result.simple, current, handlers), intents: result.intents || current.intents, enabled: false }));
      setAiDraft({ scheduleReason: "" });
      setShowErrors(false);
      setAiMessage(copy.ai.done);
      return true;
    } catch (error) {
      setAiMessage(error?.status === 402 || error?.status === 422 || error?.status === 429 ? getApiErrorMessage(error, copy.ai.failed) : copy.ai.failed);
      return false;
    }
  };

  const openTry = () => {
    if (Object.keys(clientErrors).length) {
      setShowErrors(true);
      showToast({ message: fill(copy.tryIt.fixFirst, { problem: Object.values(clientErrors)[0] }), type: "error" });
      return;
    }
    setTryOpen(true);
  };

  if (query.isError) return <ErrorState message="Could not load the actions." onRetry={query.refetch} />;
  if (!data) return <Skeleton className="h-96" />;

  const meta = {
    isNew,
    isBuiltIn,
    view,
    aiDraft: Boolean(aiDraft),
    scheduleReason: aiDraft?.scheduleReason,
    handlers,
    customCodeEnabled: data.customCodeEnabled,
    agentHours,
    availability: availability?.actions?.find((a) => a.id === view?.id) || null,
    workingHoursLink: dashboardPath(PAGES.AI_AGENTS, { hid, query: { tab: "working-hours" } }),
  };

  const liveHandlers = data.liveTestHandlers || [];
  const safeHandler = form?.executor?.type === "builtin" && liveHandlers.includes(form.executor.handlerKey);
  const canRunLive = Boolean(view) && !isNew && !dirty && safeHandler;
  const costText = !estimate ? "" : estimate.chargingEnabled ? fill(copy.ai.cost, { n: estimate.estimatedCredits }) : copy.ai.free;

  return (
    <div className={GRID}>
      <ActionList
        data={data}
        copy={copy}
        currentUser={userEmail}
        selectedId={selectedId}
        onSelect={select}
        onCreate={() => startNew()}
        onCreateWithAi={() => (mode === "simple" ? startNew() : setAiOpen(true))}
        onToggle={toggle}
        onDuplicate={duplicate}
        onDelete={remove}
        onExport={exportOne}
        onImport={importFile}
      />
      {form && mode === "simple" ? (
        <>
          <div className={`min-w-0 ${hasSimpleSidePanel({ isBuiltIn, readOnly }) ? "" : "2xl:col-span-2"}`}>
          <SimpleEditor
            copy={copy}
            lang={lang}
            setLang={setLang}
            mode={mode}
            onMode={changeMode}
            view={{ ...(view || {}), isBuiltIn, readOnly, status: view?.status || "draft" }}
            config={simple || blankSimple()}
            onChange={setSimple}
            form={form}
            setForm={set}
            errors={errors}
            enabled={Boolean(form.enabled)}
            onToggle={(enabled) => (isNew ? setForm((f) => ({ ...f, enabled })) : toggle(view, enabled))}
            dirty={dirty}
            saving={saving}
            tried={tried}
            isNew={isNew}
            ai={{ run: runAi, loading: generating, costText, message: aiMessage }}
            extras={{ teamUsers, templates, onOwnSoftware: () => { setMode("advanced"); setTab("execution"); } }}
            onTry={openTry}
            onSave={() => save({ turnOn: !readOnly })}
            onDelete={() => view && remove(view)}
            onDuplicate={() => view && duplicate(view)}
            onExport={() => view && exportOne(view)}
            draftNotice={draftNotice ? { onKeep: () => { setForm(draftNotice); setDraftNotice(null); }, onDiscard: () => { store.remove(draftKey); setDraftNotice(null); } } : null}
          />
          </div>
          {hasSimpleSidePanel({ isBuiltIn, readOnly }) && (
            <div className={UNDER_EDITOR}>
              <SimpleSidePanel config={simple || blankSimple()} copy={copy} tried={tried} isBuiltIn={isBuiltIn} readOnly={readOnly} />
            </div>
          )}
          {simple && (
            <TryItSheet
              open={tryOpen}
              onClose={() => setTryOpen(false)}
              copy={copy}
              config={simple}
              buildPayload={() => toPayload(form)}
              actionId={isNew ? null : view?.id}
              canRunLive={canRunLive}
              liveBlocked={!safeHandler ? "unsafe" : "save"}
              channel={channel}
              hid={hid}
              onTried={() => setTriedSig(JSON.stringify(simple))}
            />
          )}
        </>
      ) : form ? (
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
            mode={mode}
            onMode={changeMode}
            copy={copy}
            onToggle={(enabled) => (isNew ? set("enabled", enabled) : toggle(view, enabled))}
            onSave={() => save()}
            onSaveAndTest={() => save({ thenTest: true })}
            onDelete={() => view && remove(view)}
            onDuplicate={() => view && duplicate(view)}
            onExport={() => view && exportOne(view)}
          />
          <div className={UNDER_EDITOR}>
            <ActionSidePanel form={form} actionId={isNew ? null : view?.id} channel={channel} hid={hid} runNonce={runNonce} />
          </div>
        </>
      ) : (
        <Card className="2xl:col-span-2">
          <EmptyState icon={Zap} title={copy.list.title} description={copy.list.subtitle} />
        </Card>
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

import { Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import {
  useDeleteAiAgentSkillMutation,
  useGenerateAiAgentSkillMutation,
  useGetAiAgentActionsQuery,
  useGetAiAgentSkillsQuery,
  useReorderAiAgentSkillsMutation,
  useResetAiAgentSkillMutation,
  useSaveAiAgentSkillMutation,
  useToggleAiAgentSkillMutation,
} from "../../../redux/api/aiAgentsApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import SkillEditor from "./SkillEditor";
import SkillList from "./SkillList";
import { blankSkill, skillSize, toSkillForm, toSkillPayload, validateSkill } from "./skillModel";
import SkillSidePanel from "./SkillSidePanel";

const NEW = "new";

// list | editor | side panel. Stacked on phones, list + editor from lg (the
// side panel goes under the editor), three columns from 2xl. Same grid as the
// Actions tab.
const GRID = "grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_320px]";
const UNDER_EDITOR = "min-w-0 lg:col-start-2 2xl:col-start-auto";

// The Skills tab. Skills save themselves (like actions) and go live when the
// agent is published. The main goal is part of the agent draft (Save draft).
const SkillsTab = ({ agent, channel, hid }) => {
  const [params, setParams] = useSearchParams();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const query = useGetAiAgentSkillsQuery({ channel, hid }, { refetchOnMountOrArgChange: true });
  const actionsQuery = useGetAiAgentActionsQuery({ channel, hid });
  const [saveSkill, { isLoading: saving }] = useSaveAiAgentSkillMutation();
  const [toggleSkill] = useToggleAiAgentSkillMutation();
  const [resetSkill] = useResetAiAgentSkillMutation();
  const [deleteSkill] = useDeleteAiAgentSkillMutation();
  const [reorderSkills] = useReorderAiAgentSkillsMutation();
  const [generate, { isLoading: generating }] = useGenerateAiAgentSkillMutation();

  const data = query.currentData;
  const skills = useMemo(() => data?.skills || [], [data]);
  const actions = useMemo(() => (actionsQuery.currentData?.actions || []).filter((a) => a.draft.executor?.type !== "code"), [actionsQuery.currentData]);
  const actionKeys = useMemo(() => actions.map((a) => a.key), [actions]);
  // ?skill= holds an id, or a skill key (links from the Actions tab)
  const param = params.get("skill");
  const selectedId = skills.find((s) => s.key === param)?.id || param || skills[0]?.id || null;
  const isNew = selectedId === NEW;
  const view = skills.find((s) => s.id === selectedId) || null;

  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [aiMessage, setAiMessage] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const dirty = Boolean(form) && JSON.stringify(form) !== baseline;

  const load = useCallback((next) => {
    setForm(next);
    setBaseline(next ? JSON.stringify(next) : "");
    setShowErrors(false);
    setServerErrors({});
    setAiMessage("");
    setAiGenerated(false);
  }, []);

  // the selected skill (again after a save or refetch)
  useEffect(() => {
    if (isNew || !view) return;
    load(toSkillForm(view.draft));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, view?.updatedAt, isNew]);

  // a link straight to a new skill
  useEffect(() => {
    if (isNew && !form && data) load(blankSkill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, Boolean(data)]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const guard = async () =>
    !dirty || confirm("You have unsaved changes in this skill. Leave without saving?", { title: "Unsaved changes", confirmText: "Leave", variant: "danger" });

  const select = async (id) => {
    if (id === selectedId || !(await guard())) return;
    setParams((p) => { p.set("skill", id); return p; }, { replace: true });
  };

  const startNew = async () => {
    if (!(await guard())) return;
    setParams((p) => { p.set("skill", NEW); return p; }, { replace: true });
    load(blankSkill());
  };

  const set = (path, value) => {
    setForm((current) => ({ ...current, [path]: value }));
    if (serverErrors[path]) setServerErrors(({ [path]: _gone, ...rest }) => rest);
  };

  const clientErrors = form ? validateSkill(form, { actionKeys }) : {};
  const errors = showErrors ? { ...clientErrors, ...serverErrors } : serverErrors;

  const save = async () => {
    setShowErrors(true);
    if (Object.keys(clientErrors).length) {
      showToast({ message: "Some fields need attention.", type: "error" });
      return;
    }
    try {
      const saved = await saveSkill({ channel, hid, id: isNew ? undefined : view.id, skill: toSkillPayload(form), updatedAt: view?.updatedAt, aiGenerated }).unwrap();
      showToast({ message: isNew ? "Skill saved as a draft. Publish the agent to make it live." : "Skill saved. Publish the agent to make it live." });
      load(toSkillForm(saved.draft));
      if (isNew) setParams((p) => { p.set("skill", saved.id); return p; }, { replace: true });
    } catch (error) {
      if (error?.status === 422 && error.data?.errors) setServerErrors(error.data.errors);
      showToast({ message: error?.status === 409 ? "This skill changed in another session. Reload and try again." : getApiErrorMessage(error, "Could not save the skill."), type: "error" });
    }
  };

  const toggle = async (skill, enabled) => {
    if (skill.id === selectedId && form) {
      setForm((f) => ({ ...f, enabled }));
      setBaseline((b) => (b ? JSON.stringify({ ...JSON.parse(b), enabled }) : b));
    }
    try {
      await toggleSkill({ channel, hid, id: skill.id, enabled }).unwrap();
    } catch (error) {
      if (skill.id === selectedId) {
        setForm((f) => ({ ...f, enabled: !enabled }));
        setBaseline((b) => (b ? JSON.stringify({ ...JSON.parse(b), enabled: !enabled }) : b));
      }
      showToast({ message: getApiErrorMessage(error, "Could not switch the skill."), type: "error" });
    }
  };

  const remove = async () => {
    if (!view || !(await confirm(`Delete "${view.draft.name}"? This can't be undone.`, { title: "Delete skill", confirmText: "Delete", variant: "danger" }))) return;
    try {
      await deleteSkill({ channel, hid, id: view.id }).unwrap();
      showToast({ message: "Skill deleted. Publish the agent to apply it." });
      load(null);
      setParams((p) => { p.delete("skill"); return p; }, { replace: true });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not delete the skill."), type: "error" });
    }
  };

  const reset = async () => {
    if (!view || !(await confirm("Put this skill's text back to how it started? Your changes to it are lost.", { title: "Reset skill", confirmText: "Reset" }))) return;
    try {
      const saved = await resetSkill({ channel, hid, id: view.id }).unwrap();
      load(toSkillForm(saved.draft));
      showToast({ message: "Skill reset." });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not reset the skill."), type: "error" });
    }
  };

  const reorder = async (ids) => {
    try {
      await reorderSkills({ channel, hid, ids }).unwrap();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not save the order."), type: "error" });
    }
  };

  // "Create with AI": fills the form on screen; never saves or switches on
  const runAi = async (description) => {
    setAiMessage("");
    try {
      const result = await generate({ channel, hid, description }).unwrap();
      const next = { ...toSkillForm(result.draft), enabled: false };
      // a built-in keeps its name; otherwise take everything
      setForm((current) => (view?.isBuiltIn ? { ...next, name: current.name } : next));
      setAiGenerated(!view);
      setShowErrors(false);
      setAiMessage("Draft ready. Check it, then save.");
      return true;
    } catch (error) {
      setAiMessage(getApiErrorMessage(error, "The AI could not write the skill. Try again or fill the form yourself."));
      return false;
    }
  };

  const startWithAi = async () => {
    await startNew();
    requestAnimationFrame(() => document.querySelector('[aria-label="Describe the skill in your own words"]')?.focus());
  };

  if (query.isError) return <ErrorState message="Could not load the skills." onRetry={query.refetch} />;
  if (!data) return <Skeleton className="h-96" />;

  // the size meter counts the skill on screen as it is now
  const usedChars = skills.reduce((sum, s) => {
    if (s.id === selectedId && form) return sum + (form.enabled ? skillSize(toSkillPayload(form)) : 0);
    return sum + (s.draft.enabled ? s.size : 0);
  }, isNew && form?.enabled ? skillSize(toSkillPayload(form)) : 0);

  return (
    <div className={GRID}>
      <SkillList
        data={data}
        selectedId={selectedId}
        onSelect={select}
        onCreate={startNew}
        onCreateWithAi={startWithAi}
        onToggle={toggle}
        onReorder={reorder}
      />
      {form ? (
        <SkillEditor
          key={isNew ? NEW : view?.id}
          form={form}
          set={set}
          errors={errors}
          view={isNew ? null : view}
          actions={actions}
          dirty={dirty}
          saving={saving}
          onSave={save}
          onDelete={remove}
          onReset={reset}
          onToggle={(enabled) => (isNew ? set("enabled", enabled) : toggle(view, enabled))}
          ai={{ run: runAi, loading: generating, message: aiMessage }}
        />
      ) : (
        <Card>
          <EmptyState icon={Target} title="No skill selected" description="Pick a skill on the left, or create a new one." />
        </Card>
      )}
      <div className={UNDER_EDITOR}>
        <SkillSidePanel
          mainGoal={agent.draft.mainGoal || ""}
          onMainGoal={(value) => agent.set("mainGoal", value)}
          usedChars={usedChars}
          form={form}
          actions={actions}
        />
      </div>
    </div>
  );
};

export default SkillsTab;

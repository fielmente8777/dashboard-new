import { BookOpen, Clock3, ShieldCheck, Target, UserRound, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ActionsTab from "../actions/ActionsTab";
import WorkingHoursTab from "../actions/WorkingHoursTab";
import GoalsSection from "./sections/GoalsSection";
import HandoffSection from "./sections/HandoffSection";
import KnowledgeSection from "./sections/KnowledgeSection";
import PersonaSection from "./sections/PersonaSection";

// The builder's six tabs, kept in the URL (?tab=skills) so a link opens the
// right one. "Skills" is the old "Goals & instructions" (same settings).
const AGENT_TABS = [
  { value: "personality", label: "Personality", icon: UserRound },
  { value: "skills", label: "Skills", icon: Target },
  { value: "knowledge", label: "Knowledge", icon: BookOpen },
  { value: "actions", label: "Actions", icon: Zap },
  { value: "working-hours", label: "Working Hours", icon: Clock3 },
  { value: "handover-safety", label: "Handover & Safety", icon: ShieldCheck },
];

// old links -> new tabs
const REDIRECTS = {
  "goals-instructions": "skills",
  goals: "skills",
  overview: "personality",
  "memory-context": "knowledge",
  schedule: "working-hours",
  handoff: "handover-safety",
};

const savedTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

const AgentSetup = ({ agent, hid, channel }) => {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") || "personality";
  const tab = AGENT_TABS.some((t) => t.value === requested) ? requested : REDIRECTS[requested] || "personality";
  const tabList = useRef(null);
  const { draftSavedAt, revision } = agent.snapshot;

  useEffect(() => {
    if (requested !== tab) setParams((p) => { p.set("tab", tab); return p; }, { replace: true });
  }, [requested, tab, setParams]);

  const open = (value) => setParams((p) => { p.set("tab", value); if (value !== "actions") p.delete("action"); return p; });

  // arrow keys, Home and End move between tabs
  const onKeyDown = (e) => {
    const index = AGENT_TABS.findIndex((t) => t.value === tab);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: AGENT_TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const target = AGENT_TABS[(next + AGENT_TABS.length) % AGENT_TABS.length];
    open(target.value);
    tabList.current?.querySelector(`[data-tab="${target.value}"]`)?.focus();
  };

  const panel = (() => {
    const props = { draft: agent.draft, set: agent.set };
    switch (tab) {
      case "skills": return <GoalsSection {...props} />;
      case "knowledge": return <KnowledgeSection {...props} />;
      case "actions": return <ActionsTab channel={channel} hid={hid} agentHours={agent.draft.workingHours} />;
      case "working-hours": return <WorkingHoursTab agent={agent} channel={channel} hid={hid} />;
      case "handover-safety": return <HandoffSection {...props} />;
      default: return <PersonaSection {...props} />;
    }
  })();
  // actions save themselves; the other tabs edit the agent draft
  const editsAgentDraft = tab !== "actions";

  return (
    <div className="min-w-0 space-y-4">
      <div ref={tabList} role="tablist" aria-label="Agent builder" onKeyDown={onKeyDown} className="flex items-center gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-app-border! bg-app-surface p-2">
        {AGENT_TABS.map(({ value, label, icon: TabIcon }) => {
          const active = value === tab;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              id={`agent-tab-${value}`}
              data-tab={value}
              aria-selected={active}
              aria-controls="agent-tab-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => open(value)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-app-focus ${active ? "bg-app-accent-soft font-semibold text-app-accent-text" : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"}`}
            >
              <TabIcon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
      <div id="agent-tab-panel" role="tabpanel" aria-labelledby={`agent-tab-${tab}`} className="min-w-0 space-y-2">
        {editsAgentDraft ? <fieldset disabled={agent.saving} className="min-w-0">{panel}</fieldset> : panel}
        {editsAgentDraft && (
          <p className="px-1 text-xs text-app-text-muted">
            Revision {revision}{draftSavedAt && <> · Draft saved <time dateTime={draftSavedAt}>{savedTimeFormat.format(new Date(draftSavedAt))}</time></>}
          </p>
        )}
      </div>
    </div>
  );
};

export default AgentSetup;

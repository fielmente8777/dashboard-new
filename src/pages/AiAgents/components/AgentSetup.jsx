import { BookOpen, Clock3, ShieldCheck, Target, UserRound, Zap } from "lucide-react";
import { useState } from "react";
import ActionsSection from "./sections/ActionsSection";
import GoalsSection from "./sections/GoalsSection";
import HandoffSection from "./sections/HandoffSection";
import KnowledgeSection from "./sections/KnowledgeSection";
import PersonaSection from "./sections/PersonaSection";
import ScheduleSection from "./sections/ScheduleSection";

const SECTIONS = [
  { label: "Personality", icon: UserRound, Panel: PersonaSection },
  { label: "Goals & instructions", icon: Target, Panel: GoalsSection },
  { label: "Knowledge", icon: BookOpen, Panel: KnowledgeSection },
  { label: "Actions", icon: Zap, Panel: ActionsSection },
  { label: "Working hours", icon: Clock3, Panel: ScheduleSection },
  { label: "Handover & safety", icon: ShieldCheck, Panel: HandoffSection },
];

const savedTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

const AgentSetup = ({ agent }) => {
  const [section, setSection] = useState(0);
  const { Panel } = SECTIONS[section];
  const { draftSavedAt, revision } = agent.snapshot;

  return (
    <div className="min-w-0 space-y-4">
      <nav aria-label="Agent setup sections" className="flex items-center gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-app-border! bg-app-surface p-2">
        {SECTIONS.map(({ label, icon: SectionIcon }, index) => (
          <button key={label} type="button" aria-current={index === section ? "true" : undefined} onClick={() => setSection(index)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm ${index === section ? "bg-pink-500/10 font-semibold text-pink-700 dark:text-pink-300" : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"}`}>
            <SectionIcon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <div className="min-w-0 space-y-2">
        <fieldset disabled={agent.saving} className="min-w-0">
          <Panel draft={agent.draft} set={agent.set} />
        </fieldset>
        <p className="px-1 text-xs text-app-text-muted">
          Revision {revision}{draftSavedAt && <> · Draft saved <time dateTime={draftSavedAt}>{savedTimeFormat.format(new Date(draftSavedAt))}</time></>}
        </p>
      </div>
    </div>
  );
};

export default AgentSetup;

import { Target } from "lucide-react";
import Switch from "../../../components/ui/Switch";

// Above the action editor: which skills use this action, and "Only with
// skills" (the agent gets the action only while a switched-on skill uses it).
// The switch is part of the form: it is saved with Save.
const ActionSkillsCard = ({ isNew, isHandoff, usedBy = [], onlyWithSkills, onChange, onOpenSkill }) => {
  const anyOn = usedBy.some((s) => s.enabled);
  return (
    <section aria-labelledby="action-skills-title" className="rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="action-skills-title" className="flex items-center gap-2 text-sm font-semibold text-app-text">
            <Target className="size-4 text-app-text-muted" aria-hidden="true" /> Skills
          </h3>
          {usedBy.length ? (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-app-text-muted">
              Used by
              {usedBy.map((s) => (
                <button key={s.key} type="button" onClick={() => onOpenSkill(s.key)} className={`rounded-full px-2 py-0.5 font-medium hover:underline ${s.enabled ? "bg-app-accent-soft text-app-accent-text" : "bg-app-surface-secondary text-app-text-muted"}`}>
                  {s.name}{!s.enabled && " (off)"}
                </button>
              ))}
            </p>
          ) : (
            <p className="mt-1 text-xs text-app-text-muted">
              {isNew ? "Save the action, then add it to a skill in the Skills tab." : "No skill uses this action yet. Add it to a skill under \"Works together with these actions\"."}
            </p>
          )}
        </div>
        {!isHandoff && (
          <label className="flex max-w-xs items-start gap-2 text-xs text-app-text-muted">
            <Switch label="Only when a skill uses it" checked={Boolean(onlyWithSkills)} onChange={onChange} />
            <span>
              <span className="block font-medium text-app-text">Only when a skill uses it</span>
              {onlyWithSkills
                ? anyOn ? "The agent can use it while one of these skills is on." : "No switched-on skill uses it, so the agent can't use it now."
                : "Off: the agent can use it any time it is switched on."}
            </span>
          </label>
        )}
      </div>
      {isHandoff && <p className="mt-2 text-xs text-app-text-faint">Handing over to your team is always available, so a guest can always reach a person.</p>}
    </section>
  );
};

export default ActionSkillsCard;

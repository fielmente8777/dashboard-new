import { Textarea } from "../../../components/ui/Field";
import Badge from "../../../components/ui/Badge";
import { parseExample, SKILL_LIMITS } from "./skillModel";

const Panel = ({ title, hint, children }) => (
  <section className="rounded-xl border border-app-border! bg-app-surface p-4">
    <h3 className="text-sm font-semibold text-app-text">{title}</h3>
    {hint && <p className="text-xs text-app-text-muted">{hint}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

const sizeLabel = (ratio) => (ratio > 1 ? { text: "Too long", tone: "text-app-danger" } : ratio > 0.8 ? { text: "Getting long", tone: "text-app-warning" } : { text: "Good", tone: "text-app-success" });

// The right column: the agent's main goal (part of the agent draft), the size
// of all switched-on skills, how this skill sounds, and the actions it uses.
const SkillSidePanel = ({ mainGoal, onMainGoal, usedChars, form, actions }) => {
  const ratio = usedChars / SKILL_LIMITS.totalChars;
  const size = sizeLabel(ratio);
  const turns = parseExample(form?.example);
  const byKey = new Map(actions.map((a) => [a.key, a]));

  return (
    <div className="min-w-0 space-y-4">
      <Panel title="Main goal of your assistant" hint="One line. It comes first in the Skills part of the prompt. Save it with Save draft.">
        <Textarea
          rows={2}
          maxLength={200}
          value={mainGoal}
          onChange={(e) => onMainGoal(e.target.value)}
          placeholder="Get more direct bookings and keep guests happy."
          aria-label="Main goal of your assistant"
        />
      </Panel>

      <Panel title="Size of instructions" hint="All skills that are on. Shorter skills are faster and use fewer AI credits.">
        <div className="h-2 overflow-hidden rounded-full bg-app-surface-secondary" role="meter" aria-valuemin={0} aria-valuemax={SKILL_LIMITS.totalChars} aria-valuenow={usedChars} aria-label="Size of instructions">
          <div className={`h-full rounded-full ${ratio > 1 ? "bg-app-danger" : ratio > 0.8 ? "bg-app-warning" : "bg-app-accent"}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
        <p className="mt-1.5 flex justify-between text-xs text-app-text-muted">
          <span>{usedChars.toLocaleString()} of {SKILL_LIMITS.totalChars.toLocaleString()} characters</span>
          <span className={`font-medium ${size.tone}`}>{size.text}</span>
        </p>
      </Panel>

      {form && (
        <Panel title="How it will sound" hint={turns.length ? "From the example chat." : "Add an example chat to see it here."}>
          {turns.length ? (
            <ul className="space-y-1.5" aria-label="Example chat">
              {turns.map((turn, i) => (
                <li key={i} className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs ${turn.role === "guest" ? "border border-app-border! bg-app-surface-secondary text-app-text" : "ml-auto bg-primary text-white dark:bg-blue-600"}`}>
                  <span className="sr-only">{turn.role === "guest" ? "Guest: " : "Assistant: "}</span>{turn.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-app-text-faint">Guest: Room for 2 this weekend?<br />Assistant: Yes! Is your budget under Rs 5,000?</p>
          )}
        </Panel>
      )}

      {form && (
        <Panel title="Actions this skill uses">
          {form.actionKeys.length ? (
            <ul className="space-y-1.5">
              {form.actionKeys.map((key) => {
                const action = byKey.get(key);
                return (
                  <li key={key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-mono text-app-text" title={action?.draft.description}>{action?.toolName || key}</span>
                    <span className="flex shrink-0 gap-1">
                      {!action && <Badge tone="red">Missing</Badge>}
                      {action && !action.draft.enabled && <Badge tone="amber">Off</Badge>}
                      {action?.draft.requiresConfirmation && <Badge tone="sky">Asks first</Badge>}
                      {action?.draft.onlyWithSkills && <Badge tone="purple">Only with skills</Badge>}
                      {action?.isBuiltIn && <Badge>Built-in</Badge>}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-app-text-muted">None. Pick actions under "Works together with these actions".</p>
          )}
        </Panel>
      )}
    </div>
  );
};

export default SkillSidePanel;

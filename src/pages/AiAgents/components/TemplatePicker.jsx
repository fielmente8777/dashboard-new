import { BedDouble, Check, ConciergeBell, FilePlus2, Flower2, PartyPopper, Plane, Target, UtensilsCrossed } from "lucide-react";
import { Skeleton } from "../../../components/ui/States";

// Starter templates (gian: modules/ai-agents/templates/agentTemplates.ts).
// The server sends the icon's name; unknown names fall back to a bot-ish icon.
const ICONS = { BedDouble, ConciergeBell, Target, Flower2, PartyPopper, UtensilsCrossed, Plane };

const BLANK = { id: "", name: "Start from scratch", summary: "A friendly guest assistant you set up yourself.", skills: [] };

// A radio group of template cards. value = template id ("" = blank).
const TemplatePicker = ({ templates, loading, value, onChange, disabled }) => {
  if (loading) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>;

  return (
    <div role="radiogroup" aria-label="Agent template" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[...templates, BLANK].map((template) => {
        const selected = value === template.id;
        const TemplateIcon = template.id ? ICONS[template.icon] || Target : FilePlus2;
        return (
          <button
            key={template.id || "blank"}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(template.id)}
            className={`relative flex h-full flex-col gap-2 rounded-xl border p-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-app-focus disabled:opacity-60 ${selected ? "border-app-accent! bg-app-accent-soft" : "border-app-border! bg-app-surface hover:bg-app-surface-secondary"}`}
          >
            <span className="flex items-center gap-2">
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-app-surface text-app-accent-text" : "bg-app-surface-secondary text-app-text-muted"}`} aria-hidden="true">
                <TemplateIcon className="size-4" />
              </span>
              <span className={`min-w-0 flex-1 text-sm font-semibold ${selected ? "text-app-accent-text" : "text-app-text"}`}>{template.name}</span>
              {selected && <Check className="size-4 shrink-0 text-app-accent-text" aria-hidden="true" />}
            </span>
            <span className="text-xs text-app-text-muted">{template.summary}</span>
            {template.skills.length > 0 && (
              <span className="mt-auto flex flex-wrap gap-1 pt-1">
                {template.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="rounded-full bg-app-surface-secondary px-2 py-0.5 text-[11px] text-app-text-muted">{skill}</span>
                ))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TemplatePicker;

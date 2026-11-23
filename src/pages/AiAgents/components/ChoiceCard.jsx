import { AlertTriangle, Check } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";

// A selectable card: a title, a one-line explanation and a check.
// Used for goals, tone and actions, where the user needs to read what each means.
// Optional: icon (shown before the title), badge (e.g. "Soon"), disabled.
const ChoiceCard = ({ checked, onChange, label, hint, warning = false, type = "checkbox", icon, badge, disabled = false }) => (
  <button
    type="button"
    role={type}
    aria-checked={checked}
    aria-disabled={disabled || undefined}
    onClick={() => !disabled && onChange(!checked)}
    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus ${
      checked
        ? "border-pink-500! bg-pink-500/5"
        : "border-app-border! bg-app-surface hover:border-app-text-faint!"
    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
  >
    <span
      aria-hidden="true"
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
        checked ? "border-pink-500! bg-pink-500 text-white" : "border-app-text-faint/50!"
      } ${type === "radio" ? "rounded-full" : ""}`}
    >
      {checked && <Icon icon={Check} size="xs" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-app-text">
        {icon && <Icon icon={icon} tone="muted" />}
        {label}
        {warning && <Icon icon={AlertTriangle} size="xs" className="text-amber-500" />}
        {badge && <Badge>{badge}</Badge>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-app-text-muted">{hint}</span>}
    </span>
  </button>
);

export default ChoiceCard;

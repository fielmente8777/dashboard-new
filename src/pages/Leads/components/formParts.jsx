import { Minus, Plus } from "lucide-react";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";

const MAX_COUNT = 99;

// A titled group of fields; `action` sits on the right of the title.
export const Section = ({ icon, title, hint, action, children }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
        <Icon icon={icon} size="sm" /> {title}
        {hint && (
          <span className="font-normal normal-case tracking-normal text-app-text-faint">
            {hint}
          </span>
        )}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

// a number with - and + either side, never below 1
export const Counter = ({ label, value, onChange }) => (
  <div>
    <span className="mb-1.5 block text-xs font-medium text-app-text-muted">{label}</span>
    <div className="flex items-center justify-between rounded-lg border border-app-border! bg-app-surface p-1">
      <IconButton
        icon={Minus}
        label={`Fewer ${label.toLowerCase()}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      />
      <span className="text-sm font-semibold tabular-nums text-app-text" aria-live="polite">
        {value}
      </span>
      <IconButton
        icon={Plus}
        label={`More ${label.toLowerCase()}`}
        disabled={value >= MAX_COUNT}
        onClick={() => onChange(value + 1)}
      />
    </div>
  </div>
);

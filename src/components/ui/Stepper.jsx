import { Check } from "lucide-react";
import { Fragment } from "react";
import Icon from "./Icon";

// Progress through a multi-step form. `current` is the 0-based index.
// Pass `onSelect(index)` to let the user jump to any step up to `reachable`
// (defaults to the current one).
const Stepper = ({
  steps,
  current,
  onSelect,
  reachable = current,
  className = "",
}) => (
  <ol className={`flex items-center gap-2 ${className}`}>
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;
      const clickable = Boolean(onSelect) && !active && index <= reachable;

      return (
        <Fragment key={label}>
          <li
            aria-current={active ? "step" : undefined}
            className="flex shrink-0 items-center gap-2"
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onSelect(index)}
              className={`flex items-center gap-2 rounded-full disabled:cursor-default ${clickable ? "cursor-pointer hover:opacity-80" : ""}`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-white dark:bg-blue-600"
                    : done
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-app-surface-secondary text-app-text-muted"
                }`}
              >
                {done ? <Icon icon={Check} size="sm" /> : index + 1}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  active ? "font-medium text-app-text" : "text-app-text-muted"
                }`}
              >
                {label}
              </span>
            </button>
          </li>
          {index < steps.length - 1 && (
            <li
              aria-hidden="true"
              className="h-px min-w-4 flex-1 bg-app-border"
            />
          )}
        </Fragment>
      );
    })}
  </ol>
);

export default Stepper;

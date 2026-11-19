import { Check, Lock } from "lucide-react";

// The Eazbot sections as a tab bar. While a new bot is being set up the
// tabs show progress and lock the steps not reached yet; once published every
// tab opens freely and there is nothing to tick off.
// steps: [{ key, label }]
const StepTabs = ({ steps, current, reachable, onSelect, showProgress = false }) => (
  <nav
    aria-label="Eazbot setup"
    className="overflow-x-auto rounded-xl border border-app-border! bg-app-surface p-1.5 scrollbar-hidden"
  >
    <ol className="flex min-w-max gap-1">
      {steps.map((step, index) => {
        const active = index === current;
        const locked = index > reachable;
        const done = showProgress && index < reachable && !active;

        return (
          <li key={step.key} className="flex-1">
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              disabled={locked}
              onClick={() => !active && onSelect(index)}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "bg-primary text-white shadow-sm dark:bg-blue-600"
                  : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text disabled:hover:bg-transparent disabled:hover:text-app-text-muted"
              }`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  active
                    ? "bg-white/20 text-white"
                    : done
                      ? "bg-green-500/15 text-green-600 dark:text-green-400"
                      : "bg-app-surface-secondary text-app-text-muted"
                }`}
              >
                {done ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : locked ? (
                  <Lock className="size-2.5" />
                ) : (
                  index + 1
                )}
              </span>
              {step.label}
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default StepTabs;

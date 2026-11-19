import { Check } from "lucide-react";
import { rupees } from "../../../redux/api/billingApi";
import { effectiveMonthly } from "../billingText";

// The billing cycles as large tiles: name, the saving, and what the chosen plan then costs
// per month. Easier to read and to tap than a thin segmented control.
export default function CycleSelector({ cycles, value, onChange, planPrice }) {
  return (
    <div role="radiogroup" aria-label="Billing cycle" className="grid grid-cols-2 gap-2.5 @3xl:grid-cols-4 @3xl:gap-3">
      {cycles.map((cycle) => {
        const active = cycle.months === value;
        const monthly = planPrice > 0 ? effectiveMonthly(planPrice, cycle) : null;
        return (
          <button
            key={cycle.months}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => !active && onChange(cycle.months)}
            className={`relative min-w-0 rounded-xl border-2 px-3 py-3 text-left transition @md:px-4 ${
              active
                ? "border-orange-500! bg-orange-500/10 shadow-sm"
                : "border-app-border! bg-app-surface hover:border-orange-500/50!"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-app-text">{cycle.label}</span>
              {active ? (
                <span className="grid size-5 place-content-center rounded-full bg-orange-500 text-white">
                  <Check className="size-3.5" aria-hidden />
                </span>
              ) : (
                <span className="size-5 rounded-full border-2 border-app-border!" aria-hidden />
              )}
            </span>
            <span className="mt-1 block text-xs text-app-text-muted">
              {cycle.months === 1 ? "Billed every month" : `Billed every ${cycle.months} months`}
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {cycle.discountPercent > 0 ? (
                <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {cycle.discountPercent}%
                </span>
              ) : (
                <span className="rounded-md bg-app-surface-secondary px-1.5 py-0.5 text-xs text-app-text-muted">No discount</span>
              )}
              {monthly !== null && <span className="text-xs font-medium text-app-text">{rupees(monthly)}/mo</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

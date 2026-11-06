import { ArrowUpCircle, RefreshCw } from "lucide-react";

// Renew (the plan the hotel is on, plus add-ons) or upgrade (every plan), as two clear choices.
export default function ModeSwitch({ mode, onChange, currentPlanName }) {
  const options = [
    {
      value: "renew",
      icon: RefreshCw,
      title: "Renew my plan",
      hint: `Keep ${currentPlanName}, your apps and seats. Add more apps if you like.`,
    },
    {
      value: "upgrade",
      icon: ArrowUpCircle,
      title: "Upgrade or change plan",
      hint: "Compare every plan and switch. Unused time on your plan is credited.",
    },
  ];
  return (
    <div role="tablist" aria-label="What would you like to do?" className="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
      {options.map(({ value, icon: Icon, title, hint }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => !active && onChange(value)}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
              active ? "border-orange-500! bg-orange-500/10" : "border-app-border! bg-app-surface hover:border-orange-500/50!"
            }`}
          >
            <span className={`grid size-10 shrink-0 place-content-center rounded-lg ${active ? "bg-orange-500 text-white" : "bg-app-surface-secondary text-app-text-muted"}`}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-base font-semibold text-app-text">{title}</span>
              <span className="mt-0.5 block text-sm text-app-text-muted">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

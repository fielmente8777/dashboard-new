// tabs: [{ value, label, count }] - a count above zero shows as a badge.
const Tabs = ({ tabs, value, onChange, className = "" }) => (
  <div
    role="tablist"
    className={`flex flex-wrap items-center gap-1 ${className}`}
  >
    {tabs.map((tab) => {
      const active = tab.value === value;

      return (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            active
              ? "bg-primary text-white dark:bg-blue-600"
              : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
          }`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={`rounded-full px-1.5 text-[11px] ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default Tabs;

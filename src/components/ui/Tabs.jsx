import { useEffect, useRef } from "react";

// tabs: [{ value, label, count }] - a count above zero shows as a badge.
// Labels never wrap; in a row that scrolls sideways (phones) the selected tab
// is scrolled into view, also when it is chosen by a link (?tab=...).
const Tabs = ({ tabs, value, onChange, className = "" }) => {
  const listRef = useRef(null);

  useEffect(() => {
    const active = listRef.current?.querySelector('[aria-selected="true"]');
    // "nearest" leaves the page itself where it is
    active?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [value]);

  return (
    <div
      ref={listRef}
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
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
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
};

export default Tabs;

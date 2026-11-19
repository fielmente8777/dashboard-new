// Pills that filter a keyword table by rank band, each with its count.
// options: [{ value, label, count, color? }]
const BandFilter = ({ options, value, onChange }) => (
  <div role="radiogroup" aria-label="Filter by rank" className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const active = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition active:scale-[0.97] ${
            active
              ? "border-blue-500! bg-blue-500/10 text-blue-600 dark:border-blue-400! dark:bg-blue-400/15 dark:text-blue-300"
              : "border-app-border! text-app-text-muted hover:text-app-text"
          }`}
        >
          {option.color && (
            <span className="size-2 rounded-full" style={{ backgroundColor: option.color }} />
          )}
          {option.label}
          <span className={`tabular-nums ${active ? "opacity-75" : "text-app-text-faint"}`}>
            {option.count}
          </span>
        </button>
      );
    })}
  </div>
);

export default BandFilter;

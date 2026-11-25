// A small group of mutually exclusive options, e.g. 2 km / 5 km / 10 km.
// options: [{ value, label }]
// Keyboard: like a native radio group - Tab reaches the chosen option, the
// arrow keys move the choice.
const Segmented = ({
  options,
  value,
  onChange,
  disabled = false,
  label,
  className = "",
}) => {
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step || disabled) return;
    e.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    e.currentTarget.querySelector(`[data-value="${String(next.value)}"]`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`inline-flex rounded-lg bg-app-surface-secondary p-0.5 ${className}`}
    >
      {options.map((option, i) => {
        const active = option.value === value;
        const reachable = active || (i === 0 && !options.some((o) => o.value === value));

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-value={String(option.value)}
            aria-checked={active}
            tabIndex={reachable ? 0 : -1}
            disabled={disabled}
            onClick={() => !active && onChange(option.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-app-focus disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? "bg-app-surface text-app-text shadow-sm"
                : "text-app-text-muted hover:text-app-text"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default Segmented;

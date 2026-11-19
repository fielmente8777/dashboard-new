// A small group of mutually exclusive options, e.g. 2 km / 5 km / 10 km.
// options: [{ value, label }]
const Segmented = ({
  options,
  value,
  onChange,
  disabled = false,
  label,
  className = "",
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={`inline-flex rounded-lg bg-app-surface-secondary p-0.5 ${className}`}
  >
    {options.map((option) => {
      const active = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={disabled}
          onClick={() => !active && onChange(option.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
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

export default Segmented;

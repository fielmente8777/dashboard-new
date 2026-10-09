export const inputClassName =
  "w-full rounded-lg border border-app-border! bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition placeholder:text-app-text-faint focus:border-blue-500! focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

// Label + control + hint/error. Pass as="div" when the control is not a
// single input (a file picker, a list of chips, ...).
export const Field = ({
  label,
  hint,
  error,
  as = "label",
  className = "",
  children,
}) => {
  const Wrapper = as;

  return (
    <Wrapper className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-app-text-muted">
          {label}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      ) : (
        hint && (
          <span className="mt-1 block text-xs text-app-text-faint">{hint}</span>
        )
      )}
    </Wrapper>
  );
};

export const Input = ({ className = "", ...props }) => (
  <input className={`${inputClassName} ${className}`} {...props} />
);

export const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea
    rows={rows}
    className={`${inputClassName} resize-y ${className}`}
    {...props}
  />
);

// options: [{ value, label }]
export const Select = ({ options, className = "", ...props }) => (
  <select className={`${inputClassName} ${className}`} {...props}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

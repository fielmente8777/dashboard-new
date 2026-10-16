import SelectMenu from "./SelectMenu";

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
// Drawn as the themed SelectMenu, but used like a <select>: onChange gets an
// event-like { target: { value, name } } and the value is always a string,
// as a native select would give it.
export const Select = ({
  options,
  className = "",
  value,
  onChange,
  name,
  disabled,
  placeholder,
  "aria-label": ariaLabel,
  ...props
}) => {
  // react-hook-form's register() leaves the value to the DOM, which needs a
  // real <select>
  if (value === undefined) {
    return (
      <select
        className={`${inputClassName} ${className}`}
        name={name}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const choices = options.map((option) => ({ ...option, value: String(option.value) }));
  const emptyOption = choices.find((option) => option.value === "");

  return (
    <SelectMenu
      options={choices}
      value={value === null ? "" : String(value)}
      onChange={(next) => onChange?.({ target: { value: next, name }, currentTarget: { value: next, name } })}
      disabled={disabled}
      label={ariaLabel}
      placeholder={placeholder ?? emptyOption?.label ?? "Select…"}
      className={`w-full ${className}`}
    />
  );
};

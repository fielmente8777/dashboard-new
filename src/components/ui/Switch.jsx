const Switch = ({ checked, onChange, disabled = false, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
      checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform ${
        checked ? "translate-x-4" : ""
      }`}
    />
  </button>
);

export default Switch;

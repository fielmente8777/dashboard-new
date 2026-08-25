const ChannelToggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-[var(--sp-3)]">
    <span className="min-w-0 truncate text-[length:var(--fs-sm)] text-gray-700 dark:text-app-text">
      {label}
    </span>

    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        value ? "bg-green-500" : "bg-gray-300 dark:bg-app-surface-secondary"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default ChannelToggle;
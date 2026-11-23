// The track and knob on their own, for a row that is itself the switch
// (a whole labelled row you can click). Same look as <Switch>.
export const SwitchTrack = ({ checked, className = "" }) => (
  <span
    aria-hidden="true"
    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
      checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    } ${className}`}
  >
    <span
      className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform ${
        checked ? "translate-x-4" : ""
      }`}
    />
  </span>
);

const Switch = ({ checked, onChange, disabled = false, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="inline-flex shrink-0 rounded-full disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus"
  >
    <SwitchTrack checked={checked} />
  </button>
);

export default Switch;

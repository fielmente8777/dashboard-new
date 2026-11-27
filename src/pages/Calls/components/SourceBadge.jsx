import { callSourceOf, renderSourceMark } from "./callSources";

// Where the guest came from, as its icon (WhatsApp, Meta, Exotel ...); the name shows on hover
// and to screen readers. `withLabel` writes the name next to the icon (the call's details page).
const SourceBadge = ({ call, withLabel = false }) => {
  const s = callSourceOf(call);
  if (withLabel) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-app-text">
        {renderSourceMark(s)}
        <span>{s.label}</span>
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={s.label}
      className="group relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-app-surface-secondary"
    >
      {renderSourceMark(s, "size-5")}
      {/* beside the icon, so the first and last rows of a scrolling table don't cut it off */}
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
        {s.label}
      </span>
    </span>
  );
};

export default SourceBadge;

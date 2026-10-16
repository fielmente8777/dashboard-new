import { Check } from "lucide-react";
import Icon from "./Icon";

// A pill that can be switched on and off (filters, picks from a list of
// suggestions). Selected chips show a tick.
const Chip = ({ selected = false, onClick, className = "", children }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-[0.97] ${
      selected
        ? "border-blue-500! bg-blue-500/10 text-blue-600 dark:text-blue-400"
        : "border-app-border! text-app-text-muted hover:border-app-text-faint! hover:text-app-text"
    } ${className}`}
  >
    {selected && <Icon icon={Check} size="xs" />}
    {children}
  </button>
);

export default Chip;

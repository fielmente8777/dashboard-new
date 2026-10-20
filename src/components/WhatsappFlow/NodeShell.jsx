import { Trash2 } from "lucide-react";
import Icon from "../ui/Icon";
import { blockStyle } from "./blockStyles";

// The card every block on the canvas is drawn in: an icon + name header with
// a delete button, then the block's content. `onRemove` is optional.
export default function NodeShell({ type, selected, onRemove, width = "w-64", hint, children }) {
  const style = blockStyle(type);

  return (
    <div
      className={`relative ${width} overflow-visible rounded-xl border bg-app-surface shadow-[0_4px_16px_var(--app-shadow)] transition-shadow ${
        selected ? "border-blue-500! ring-2 ring-blue-500/30" : "border-app-border!"
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-app-border! px-3 py-2.5">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${style.tile}`}>
          <Icon icon={style.icon} size="sm" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-app-text">{style.label}</p>
          {hint && <p className="truncate text-[11px] text-app-text-faint">{hint}</p>}
        </div>
        {onRemove && (
          <button
            type="button"
            aria-label={`Delete ${style.label} block`}
            title="Delete block"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="nodrag flex size-7 shrink-0 items-center justify-center rounded-lg text-app-text-faint transition hover:bg-red-500/10 hover:text-red-500"
          >
            <Icon icon={Trash2} size="sm" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// One reply option inside a block (a button, a list row, a card button):
// `handle` (its outgoing connection) sits on the option's right edge.
export function NodeOption({ children, handle, className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-between rounded-lg border border-app-border! bg-app-surface-secondary px-3 py-2 text-sm text-app-text ${className}`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {handle}
    </div>
  );
}

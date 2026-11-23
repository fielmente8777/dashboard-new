import { MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import IconButton from "../../../components/ui/IconButton";

// A "..." button with a small menu. items: [{ label, icon, onSelect, danger, hidden }]
// Keyboard: Enter/Space opens, arrows move, Escape closes and returns focus.
const RowMenu = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef(null);
  const button = useRef(null);
  const visible = items.filter((item) => !item.hidden);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    root.current?.querySelector('[role="menuitem"]')?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onKeyDown = (e) => {
    const entries = [...(root.current?.querySelectorAll('[role="menuitem"]') || [])];
    const index = entries.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      button.current?.querySelector("button")?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      entries[(index + 1) % entries.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      entries[(index - 1 + entries.length) % entries.length]?.focus();
    }
  };

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <span ref={button}>
        <IconButton icon={MoreHorizontal} label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} />
      </span>
      {open && (
        <div id={menuId} role="menu" aria-label={label} className="absolute right-0 z-30 mt-1 min-w-44 rounded-lg border border-app-border! bg-app-surface-raised p-1 shadow-lg">
          {visible.map(({ label: itemLabel, icon: ItemIcon, onSelect, danger }) => (
            <button
              key={itemLabel}
              type="button"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onSelect(); }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-app-surface-secondary focus-visible:bg-app-surface-secondary focus-visible:ring-2 focus-visible:ring-app-focus ${danger ? "text-app-danger" : "text-app-text"}`}
            >
              {ItemIcon && <ItemIcon className="size-4 shrink-0" aria-hidden="true" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RowMenu;

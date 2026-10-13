import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 320;

// A themed replacement for <select>, with a search box for long lists.
//   <SelectMenu options={[{ value, label }]} value={v} onChange={setV} />
// `searchable` defaults to on when there are more than 8 options; `icon`
// shows before the value. The menu
// is portalled to <body>, so it is never cut off by a card's overflow.
const SelectMenu = ({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchable = options.length > 8,
  disabled = false,
  label,
  icon,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? options.filter((option) => String(option.label).toLowerCase().includes(term))
      : options;
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    buttonRef.current?.focus();
  };

  const choose = (option) => {
    if (option.value !== value) onChange(option.value);
    close();
  };

  // place the menu under the button, or above it when there's no room
  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || MENU_MAX_HEIGHT;
      const below = window.innerHeight - rect.bottom;
      const up = below < menuHeight + MENU_GAP && rect.top > below;
      setPosition({
        left: rect.left,
        width: Math.max(rect.width, 220),
        top: up ? rect.top - menuHeight - MENU_GAP : rect.bottom + MENU_GAP,
      });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, filtered.length]);

  // close on a click outside
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // start on the selected option; keep the highlighted one in view
  useEffect(() => {
    if (open) setActive(Math.max(0, filtered.findIndex((o) => o.value === value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close();
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={onKeyDown}
        className={`flex h-9 min-w-0 items-center gap-2 rounded-lg border bg-app-surface px-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
          open
            ? "border-blue-500! ring-1 ring-blue-500"
            : "border-app-border! hover:border-app-text-faint!"
        } ${className}`}
      >
        {icon && <Icon icon={icon} size="sm" tone="muted" />}
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-app-text" : "text-app-text-faint"}`}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          icon={ChevronDown}
          size="sm"
          tone="muted"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            onKeyDown={onKeyDown}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: position?.width,
            }}
            className="anim-menu fixed z-[9996] overflow-hidden rounded-xl border border-app-border! bg-app-surface text-app-text shadow-xl"
          >
            {searchable && (
              <div className="relative border-b border-app-border! p-2">
                <Icon
                  icon={Search}
                  size="sm"
                  tone="faint"
                  className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2"
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search options"
                  className="h-8 w-full rounded-md bg-app-surface-secondary pl-8 pr-2 text-sm text-app-text outline-none placeholder:text-app-text-faint"
                />
              </div>
            )}

            <ul
              ref={listRef}
              role="listbox"
              aria-label={label}
              tabIndex={-1}
              className="max-h-64 overflow-y-auto p-1"
            >
              {filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(option)}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
                      index === active ? "bg-app-surface-secondary" : ""
                    } ${isSelected ? "font-medium text-blue-600 dark:text-blue-400" : ""}`}
                  >
                    <span className="min-w-0 flex-1 truncate" title={option.label}>
                      {option.label}
                    </span>
                    {isSelected && <Icon icon={Check} size="sm" />}
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-2.5 py-6 text-center text-sm text-app-text-muted">
                  Nothing matches “{query}”
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
};

export default SelectMenu;

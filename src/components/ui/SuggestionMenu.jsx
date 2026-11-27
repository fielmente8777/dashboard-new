import { Building2, Mail, Phone, Send, UserRound, Users } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

// The list under an email / phone field (see useSuggestions.js for how to use it).

const SOURCE = {
  profile: { icon: Building2, text: "Profile" },
  team: { icon: Users, text: "Team" },
  sender: { icon: Send, text: "Sender" },
  contact: { icon: UserRound, text: "Contact" },
  lead: { icon: UserRound, text: "Lead" },
};

const SuggestionMenu = ({ state, anchorRef, onPick }) => {
  const [box, setBox] = useState(null);
  const visible = state.items.length > 0;

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return undefined;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom;
      const height = Math.min(280, state.items.length * 52 + 8);
      setBox({ left: r.left, width: Math.max(r.width, 260), top: below < height + 12 && r.top > height ? r.top - height - 4 : r.bottom + 4 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [visible, anchorRef, state.items.length]);

  if (!visible || !box) return null;
  return createPortal(
    <ul
      role="listbox"
      style={{ position: "fixed", left: box.left, top: box.top, width: Math.min(box.width, window.innerWidth - box.left - 8), zIndex: 100000 }}
      className="max-h-72 overflow-y-auto rounded-xl border border-app-border! bg-app-surface p-1 shadow-lg"
      // keep focus in the field while picking
      onMouseDown={(e) => e.preventDefault()}
    >
      {state.items.map((s, i) => {
        const source = SOURCE[s.source] || SOURCE.contact;
        return (
          <li key={`${s.source}-${s.value}`} role="option" aria-selected={i === state.active}>
            <button
              type="button"
              onMouseEnter={() => state.setActive(i)}
              onClick={() => onPick(s)}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left ${i === state.active ? "bg-app-surface-secondary" : ""}`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon icon={state.type === "phone" ? Phone : Mail} size="sm" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-app-text">{s.value}</span>
                <span className="block truncate text-xs text-app-text-muted">{s.label}</span>
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-[11px] text-app-text-faint sm:inline-flex">
                <Icon icon={source.icon} size="xs" />
                {source.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>,
    document.body,
  );
};

export default SuggestionMenu;

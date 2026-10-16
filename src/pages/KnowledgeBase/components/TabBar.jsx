import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";

const TAB_CLASS_NAME = {
  md: {
    base: "px-3.5 py-2 text-sm",
    active: "bg-primary text-white dark:bg-blue-600",
  },
  // nested levels are lighter, so the depth is easy to read
  sm: {
    base: "px-3 py-1.5 text-xs",
    active: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  },
};

// Tabs for the sections of the knowledge base, with a "+" to add a section.
// sections: [{ key, title, gapCount }]
const TabBar = ({ sections, activeKey, onSelect, onAddSection, size = "md" }) => {
  // null while the "new section" input is closed
  const [newName, setNewName] = useState(null);
  const classNames = TAB_CLASS_NAME[size];

  const submit = () => {
    const name = newName.trim();
    if (!name) return;
    onAddSection(name);
    setNewName(null);
  };

  return (
    <div
      role="tablist"
      className={`flex flex-wrap items-center gap-1 ${size === "md" ? "border-b border-app-border! pb-2" : "mb-4"}`}
    >
      {sections.map(({ key, title, gapCount }) => {
        const active = key === activeKey;

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-1.5 rounded-lg font-medium transition-colors ${classNames.base} ${
              active
                ? classNames.active
                : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
            }`}
          >
            {title}
            {gapCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 text-[11px] text-amber-600 dark:text-amber-300">
                {gapCount}
              </span>
            )}
          </button>
        );
      })}

      {newName === null ? (
        <IconButton icon={Plus} label="Add section" onClick={() => setNewName("")} />
      ) : (
        <div className="flex items-center gap-1 pl-1">
          <div className="w-36">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setNewName(null);
              }}
              placeholder="Section name"
              aria-label="Section name"
              className="h-8"
            />
          </div>
          <IconButton
            icon={Check}
            label="Add section"
            tone="success"
            disabled={!newName.trim()}
            onClick={submit}
          />
          <IconButton icon={X} label="Cancel" onClick={() => setNewName(null)} />
        </div>
      )}
    </div>
  );
};

export default TabBar;

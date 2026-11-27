import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import Button from "./Button";
import { Input } from "./Field";
import Icon from "./Icon";
import SuggestionMenu from "./SuggestionMenu";
import { useSuggestions } from "./useSuggestions";

// Builds a list of short text items. `value` is an array of strings.
// suggest="email" | "phone": while typing, suggests the hotel's own addresses / numbers,
// team members and saved contacts (pick one with a click, or ↑ ↓ and Enter).
const TagInput = ({ value, onChange, placeholder = "Add item", suggest = null }) => {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const suggestions = useSuggestions({ type: suggest || "email", query: draft, exclude: value, open: Boolean(suggest) && focused });

  const add = (raw) => {
    const tag = String(raw ?? "").trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };
  const pick = (s) => add(s.value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div ref={wrapRef} className="min-w-0 flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (suggest && suggestions.onKeyDown(e, pick)) return;
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            inputMode={suggest === "phone" ? "tel" : suggest === "email" ? "email" : undefined}
          />
        </div>
        <Button variant="secondary" icon={Plus} onClick={() => add(draft)} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
      {suggest && <SuggestionMenu state={suggestions} anchorRef={wrapRef} onPick={pick} />}

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag} className="flex items-center gap-1 rounded-md bg-app-surface-secondary py-1 pl-2 pr-1 text-xs text-app-text">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="rounded p-0.5 text-app-text-muted hover:text-red-500"
              >
                <Icon icon={X} size="xs" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;

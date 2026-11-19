import { Plus, X } from "lucide-react";
import { useState } from "react";
import Button from "./Button";
import { Input } from "./Field";
import Icon from "./Icon";

// Builds a list of short text items. `value` is an array of strings.
const TagInput = ({ value, onChange, placeholder = "Add item" }) => {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
        />
        <Button
          variant="secondary"
          icon={Plus}
          onClick={addTag}
          disabled={!draft.trim()}
        >
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li
              key={tag}
              className="flex items-center gap-1 rounded-md bg-app-surface-secondary py-1 pl-2 pr-1 text-xs text-app-text"
            >
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

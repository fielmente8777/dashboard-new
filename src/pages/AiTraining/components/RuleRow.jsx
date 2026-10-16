import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Select, Textarea } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Switch from "../../../components/ui/Switch";
import { CATEGORIES, DEFAULT_CATEGORY, getCategory } from "../constants";

// onSave(id, changes) resolves truthy when the rule was saved.
const RuleRow = ({ rule, onSave, onDelete }) => {
  const [draft, setDraft] = useState(null); // { ruleText, category } while editing
  const [busy, setBusy] = useState(false);

  const save = async (changes) => {
    setBusy(true);
    const saved = await onSave(rule._id, changes);
    setBusy(false);
    return saved;
  };

  const startEditing = () =>
    setDraft({
      ruleText: rule.ruleText,
      category: rule.category || DEFAULT_CATEGORY,
    });

  const handleSaveEdit = async () => {
    const saved = await save({
      ruleText: draft.ruleText.trim(),
      category: draft.category,
    });
    if (saved) setDraft(null);
  };

  if (draft) {
    return (
      <div className="space-y-2 rounded-xl border border-blue-500/50! bg-app-surface p-4">
        <Select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          options={CATEGORIES}
          aria-label="Category"
          className="sm:w-48"
        />
        <Textarea
          autoFocus
          rows={2}
          value={draft.ruleText}
          onChange={(e) => setDraft({ ...draft, ruleText: e.target.value })}
          aria-label="Rule"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" icon={X} onClick={() => setDraft(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            icon={Check}
            loading={busy}
            disabled={!draft.ruleText.trim()}
            onClick={handleSaveEdit}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  const category = getCategory(rule.category);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="pt-0.5">
        <Switch
          checked={Boolean(rule.enabled)}
          onChange={(enabled) => save({ enabled })}
          disabled={busy}
          label={rule.enabled ? "Turn rule off" : "Turn rule on"}
        />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-1.5 ${rule.enabled ? "" : "opacity-50"}`}
      >
        <Badge tone={category.tone}>{category.label}</Badge>
        <p className="min-w-0 flex-1 basis-48 text-sm text-app-text">
          {rule.ruleText}
        </p>
      </div>
      <IconButton icon={Pencil} label="Edit rule" onClick={startEditing} />
      <IconButton
        icon={Trash2}
        label="Delete rule"
        tone="danger"
        onClick={() => onDelete(rule)}
      />
    </div>
  );
};

export default RuleRow;

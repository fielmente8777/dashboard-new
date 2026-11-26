import { Search } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Chip from "../../../components/ui/Chip";
import { Field, Textarea } from "../../../components/ui/Field";
import TagInput from "../../../components/ui/TagInput";
import { DEFAULT_INVENTORY_ITEMS, REVIEW_TYPES } from "./reviewConstants";

// Scenario 2, step 1: what the AI should look for.
const AiBriefForm = ({ fileCount, credits, busy, onSubmit, onManual }) => {
  const [types, setTypes] = useState(["rooms", "inventory"]);
  const [items, setItems] = useState(DEFAULT_INVENTORY_ITEMS);
  const [note, setNote] = useState("");
  const [unsure, setUnsure] = useState("ask");

  const toggleType = (id) => setTypes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const submit = () => onSubmit({ types, inventoryItems: types.includes("inventory") ? items : [], note: note.trim() || undefined, unsure });

  return (
    <div className="grid gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-2">
      <Card title="1. What should we import?" description="Pick one or more. Everything else is left out.">
        <div className="grid gap-2 sm:grid-cols-2">
          {REVIEW_TYPES.map((t) => {
            const on = types.includes(t.id);
            return (
              <label key={t.id} className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 ${on ? "border-blue-500! bg-blue-500/5" : "border-app-border!"}`}>
                <input type="checkbox" checked={on} onChange={() => toggleType(t.id)} className="mt-0.5" />
                <span>
                  <span className="block text-sm font-medium text-app-text">{t.label}</span>
                  <span className="block text-xs text-app-text-muted">{t.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
        <Field label="Anything else? (optional)" className="mt-3">
          <Textarea rows={2} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="e.g. only guest rooms of the new wing, skip staff photos" />
        </Field>
      </Card>

      <div className="space-y-4">
        <Card title="2. Inventory form" description={types.includes("inventory") ? "Items the AI should count in inventory photos." : "Tick Inventory to count items."}>
          {types.includes("inventory") && <TagInput value={items} onChange={setItems} placeholder="Add an item, e.g. Minibar" />}
        </Card>
        <Card title="3. When the AI is not sure">
          <div className="flex flex-wrap gap-2">
            <Chip selected={unsure === "ask"} onClick={() => setUnsure("ask")}>Ask me (below 75%)</Chip>
            <Chip selected={unsure === "exclude"} onClick={() => setUnsure("exclude")}>Leave them out</Chip>
          </div>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
          <span className="text-xs text-app-text-muted">
            AI checks all {fileCount} files · about {Math.max(1, credits)} AI credits. Importing the matches adds only a little more.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onManual}>Choose manually</Button>
            <Button icon={Search} loading={busy} disabled={!types.length} onClick={submit}>
              Find matching files
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiBriefForm;

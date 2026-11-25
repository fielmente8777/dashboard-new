import { RotateCw, Undo2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import Segmented from "../../../components/ui/Segmented";
import TagInput from "../../../components/ui/TagInput";
import { MediaPreview } from "../components/MediaPreview";
import { EditedImage } from "./ImageTile";
import { CROPS } from "./reviewConstants";

// Scenario 1 side panel: edits for the image the client clicked.
// Empty fields are filled by the AI on import.
const EditPanel = ({ asset, edit = {}, collections, selectedCount, onChange, onApplyToSelected }) => {
  if (!asset) {
    return (
      <aside className="hidden w-80 shrink-0 border-l border-app-border! bg-app-surface p-5 text-sm text-app-text-muted lg:block">
        Select a file to edit its title, collection, room or tags.
      </aside>
    );
  }
  const image = !asset.mediaKind || asset.mediaKind === "image";
  const ai = asset.suggestion || {};
  const category = edit.category ?? ai.category ?? "";
  const names = [...new Set([...collections.map((c) => c.name), ...(category ? [category] : [])])];

  return (
    <aside aria-label="Edit media" className="w-80 shrink-0 space-y-3 overflow-y-auto border-l border-app-border! bg-app-surface p-5">
      <h3 className="text-sm font-semibold text-app-text">Edit media</h3>
      {image ? <EditedImage asset={asset} edit={edit} className="h-44 rounded-lg" /> : <MediaPreview asset={asset} className="h-44 rounded-lg" compact />}

      {image && <><div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" icon={RotateCw} onClick={() => onChange({ rotate: ((edit.rotate || 0) + 90) % 360 })}>
          Rotate
        </Button>
        <Button variant="ghost" size="sm" icon={Undo2} onClick={() => onChange({ rotate: 0, crop: null })}>
          Reset
        </Button>
      </div>
      <Segmented
        label="Crop"
        value={edit.crop || ""}
        onChange={(crop) => onChange({ crop: crop || null })}
        options={CROPS}
      /></>}

      <Field label="Title">
        <Input value={edit.title ?? ai.title ?? ""} placeholder={asset.sourceName} maxLength={120} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className="w-full rounded-md border border-app-border! bg-app-surface p-2 text-sm" rows={3} maxLength={2000} value={edit.description ?? ai.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} />
      </Field>
      <Field label="Room or inventory">
        <Input value={edit.roomIdentifier ?? ai.room?.identifier ?? ""} maxLength={120} onChange={(e) => onChange({ roomIdentifier: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Collection">
          <Input value={category} list="review-collections" placeholder="AI decides" maxLength={80} onChange={(e) => onChange({ category: e.target.value })} />
          <datalist id="review-collections">
            {names.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>
        <Field label="Sub-category">
          <Input value={edit.subCategory ?? ai.subCategory ?? ""} placeholder="e.g. Bedroom" maxLength={80} onChange={(e) => onChange({ subCategory: e.target.value })} />
        </Field>
      </div>
      <Field label="Tags" as="div">
        <TagInput value={edit.tags ?? ai.tags ?? []} onChange={(tags) => onChange({ tags })} placeholder="Add a tag" />
      </Field>

      {category && selectedCount > 1 && (
        <Button variant="secondary" size="sm" className="w-full" onClick={() => onApplyToSelected({ category, subCategory: edit.subCategory ?? ai.subCategory ?? "" })}>
          Use “{category}” for all {selectedCount} selected
        </Button>
      )}
      <p className="text-xs text-app-text-muted">Your edits are kept and teach the AI for future imports.</p>
    </aside>
  );
};

export default EditPanel;

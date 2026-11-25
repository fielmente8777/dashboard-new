import { Check, ExternalLink, RefreshCw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Drawer from "../../../components/ui/Drawer";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import TagInput from "../../../components/ui/TagInput";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import {
  mediaFileUrl,
  useDeleteMediaAssetMutation,
  useReanalyzeMediaAssetMutation,
  useUpdateMediaAssetMutation,
} from "../../../redux/api/mediaApi";
import { useKbPlacement } from "../../KnowledgeBase/hooks/useKbMediaPlacement";
import { MediaPreview } from "./MediaPreview";
import { mediaDetails } from "./mediaFormat";
import AssetLocation from "./AssetLocation";
import { ASSET_STATUS, SOURCE_LABELS } from "./mediaUi";

const formFrom = (asset) => ({
  title: asset.title || "",
  description: asset.description || "",
  category: asset.category || "",
  subCategory: asset.subCategory || "",
  tags: asset.tags || [],
  extractedText: asset.extractedText || "",
  roomIdentifier: asset.roomInfo?.identifier || "",
});

// Detail of one image. Category / tag edits are saved and remembered as
// examples, so later imports are classified the way the user corrected them.
const AssetDrawer = ({ asset, collections = [], onClose }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [form, setForm] = useState(() => (asset ? formFrom(asset) : null));
  const kbPlacement = useKbPlacement(); // inside the Knowledge Base editor: keep the document in step
  const [update, { isLoading: saving }] = useUpdateMediaAssetMutation();
  const [reanalyze, { isLoading: reanalyzing }] = useReanalyzeMediaAssetMutation();
  const [remove, { isLoading: deleting }] = useDeleteMediaAssetMutation();

  useEffect(() => setForm(asset ? formFrom(asset) : null), [asset]);
  if (!asset || !form) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));
  const status = ASSET_STATUS[asset.status] || ASSET_STATUS.needs_review;
  const categoryOptions = [
    ...(form.category && !collections.some((c) => c.name === form.category) ? [{ value: form.category, label: `${form.category} (suggested)` }] : []),
    ...collections.map((c) => ({ value: c.name, label: c.name })),
  ];
  const subSuggestions = collections.find((c) => c.name === form.category)?.children?.map((s) => s.name) || [];

  const save = async (approve = false) => {
    if (!form.category) {
      showToast({ message: "Choose a collection first.", type: "warning" });
      return;
    }
    try {
      const saved = await update({
        id: asset.id,
        title: form.title.trim() || asset.title,
        description: form.description,
        category: form.category,
        subCategory: form.subCategory.trim() || null,
        tags: form.tags,
        extractedText: form.extractedText,
        roomIdentifier: form.roomIdentifier,
        ...(approve ? { status: "ready" } : {}),
      }).unwrap();
      const moved = saved && (saved.title !== asset.title || saved.category !== asset.category || saved.subCategory !== asset.subCategory || saved.roomInfo?.identifier !== asset.roomInfo?.identifier);
      if (saved) kbPlacement?.placeAsset(saved, { moved });
      showToast({ message: approve ? "Approved and filed." : "Saved.", type: "success" });
      onClose();
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to save the changes.", type: "error" });
    }
  };

  const handleReanalyze = async () => {
    try {
      await reanalyze(asset.id).unwrap();
      showToast({ message: "Re-analyzing with Claude…", type: "success" });
      onClose();
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to start the analysis.", type: "error" });
    }
  };

  const handleDelete = async () => {
    const ok = await confirm("Delete this file from the library and the Knowledge Base?", { title: "Delete file", confirmText: "Delete" });
    if (!ok) return;
    try {
      await remove(asset.id).unwrap();
      kbPlacement?.unplaceAsset(asset);
      onClose();
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to delete the file.", type: "error" });
    }
  };

  const room = asset.roomInfo || {};

  return (
    <Drawer open title={asset.title} description={`${SOURCE_LABELS[asset.sourceType] || asset.sourceType}${asset.sourcePath ? ` · ${asset.sourcePath}` : ""}`} onClose={onClose}>
      <div className="space-y-4">
        {asset.mediaKind && asset.mediaKind !== "image" ? <MediaPreview asset={asset} className="max-h-80 rounded-lg" /> : (
          <a href={mediaFileUrl(asset.originalUrl)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg bg-app-surface-secondary">
            <MediaPreview asset={asset} className="max-h-80" />
          </a>
        )}
        <p className="break-all text-xs text-app-text-muted">{asset.sourceName} · {mediaDetails(asset)}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
          <Badge tone={status.tone}>{status.label}</Badge>
          {asset.draft ? <Badge tone="amber">Unsaved: click Save changes</Badge> : asset.inKnowledgeBase ? <Badge tone="green">In Knowledge Base</Badge> : <Badge tone="gray">Not in Knowledge Base yet</Badge>}
          <span>{Math.round((asset.confidence || 0) * 100)}% confidence</span>
          <span>· {asset.width}×{asset.height}px</span>
          {asset.capturedAt && <span>· taken {new Date(asset.capturedAt).toLocaleDateString()}</span>}
          {asset.editedByUser && <span>· edited</span>}
        </div>
        {asset.statusReason && <p className="rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">{asset.statusReason}</p>}

        <Field label="Title">
          <Input value={form.title} onChange={set("title")} maxLength={120} />
        </Field>
        <Field label="Room or inventory">
          <Input value={form.roomIdentifier} onChange={set("roomIdentifier")} maxLength={120} />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={set("description")} rows={3} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Collection">
            <Select value={form.category} onChange={set("category")} options={categoryOptions} placeholder="Choose a collection" aria-label="Collection" />
          </Field>
          <Field label="Sub-category" hint={subSuggestions.length ? `e.g. ${subSuggestions.slice(0, 3).join(", ")}` : undefined}>
            <Input value={form.subCategory} onChange={set("subCategory")} list={`subcats-${asset.id}`} placeholder="e.g. Bedroom" maxLength={80} />
            <datalist id={`subcats-${asset.id}`}>
              {subSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </div>
        <Field label="Tags" as="div">
          <TagInput value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} placeholder="Add a tag" />
        </Field>
        <Field label="Text in the image (OCR)">
          <Textarea value={form.extractedText} onChange={set("extractedText")} rows={3} className="font-mono text-xs" />
        </Field>

        {(room.type || room.identifier || room.features?.length) && (
          <div className="text-sm">
            <p className="mb-1 text-xs font-medium text-app-text-muted">Room</p>
            <p className="text-app-text">{[room.type, room.identifier].filter(Boolean).join(" · ") || "—"}</p>
            {room.features?.length > 0 && <p className="text-xs text-app-text-muted">{room.features.join(", ")}</p>}
          </div>
        )}

        {asset.detectedItems?.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-app-text-muted">Items seen</p>
            <ul className="divide-y divide-app-border rounded-lg border border-app-border! text-sm">
              {asset.detectedItems.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex justify-between gap-2 px-3 py-1.5">
                  <span className="text-app-text">
                    {item.name}
                    {item.brand_or_model && <span className="text-app-text-muted"> · {item.brand_or_model}</span>}
                  </span>
                  <span className="text-app-text-muted">
                    {item.count} · {item.condition}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <a href={asset.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-xs text-primary">
          <ExternalLink size={12} /> {asset.sourceName || asset.sourceUrl}
        </a>

        <AssetLocation asset={asset} />

        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t border-app-border! bg-app-bg px-4 py-3 sm:-mx-5 sm:px-5">
          <div className="flex gap-2">
            <Button variant="ghost" icon={Trash2} loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="secondary" icon={RefreshCw} loading={reanalyzing} onClick={handleReanalyze}>
              Re-analyze
            </Button>
          </div>
          <div className="flex gap-2">
            {asset.status !== "ready" && (
              <Button variant="secondary" icon={Check} loading={saving} onClick={() => save(true)}>
                Approve
              </Button>
            )}
            <Button icon={Save} loading={saving} onClick={() => save(false)}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default AssetDrawer;

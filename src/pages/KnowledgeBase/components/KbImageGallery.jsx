import { FileText, ImagePlus, Loader2, Maximize2, Play, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { mediaKindFor } from "../../Media/components/mediaFormat";
import { useMediaPicker } from "../hooks/useMediaPicker";
import CopyUrl from "./CopyUrl";
import { fileNameOf } from "../utils/copyUrl";
import KbLightbox from "./KbLightbox";

/**
 * A list of pictures / videos in the knowledge base (room photos, gallery, menu cards…) as an
 * Instagram-style grid: square tiles, numbered, with view / replace / delete on hover (always
 * shown on touch screens), an "Add photo" tile, and a full-screen viewer on click.
 *   items     - the URLs
 *   onReplace(index, url) / onDelete(index) / onAdd(url)
 */
export default function KbImageGallery({ items, onReplace, onDelete, onAdd }) {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 2xl:grid-cols-5">
        {items.map((url, i) => (
          <Tile key={`${url}-${i}`} url={url} index={i} onOpen={() => setOpen(i)} onReplace={(next) => onReplace(i, next)} onDelete={() => onDelete(i)} />
        ))}
        <AddTile onAdd={onAdd} />
      </div>
      <p className="mt-2 text-xs text-app-text-muted">
        {items.length} {items.length === 1 ? "file" : "files"} · click a photo to see it full screen
      </p>
      <KbLightbox items={items.map((url) => ({ url }))} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </div>
  );
}

function Tile({ url, index, onOpen, onReplace, onDelete }) {
  const picker = useMediaPicker(onReplace);
  const kind = mediaKindFor(url);
  const [failed, setFailed] = useState(false);
  const name = fileNameOf(url);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-app-border! bg-app-surface-secondary">
      <button type="button" onClick={onOpen} className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500" aria-label={`View photo ${index + 1} full screen`}>
        {kind === "video" ? (
          <>
            <video src={url} preload="metadata" muted className="size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/55 p-2.5 text-white">
                <Play className="size-5 fill-current" />
              </span>
            </span>
          </>
        ) : kind === "image" && !failed ? (
          <img
            src={url}
            alt={name || `Photo ${index + 1}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 p-2 text-app-text-muted">
            <FileText className="size-7" />
            <span className="line-clamp-2 break-all text-center text-[11px]">{failed ? "Picture not found" : name}</span>
          </span>
        )}
      </button>

      {/* top: number, the file's name (full link on hover) and Copy */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-b from-black/70 via-black/40 to-transparent p-2 pb-5">
        <span className="shrink-0 rounded-full bg-white/90 px-1.5 text-[11px] font-semibold tabular-nums text-gray-800">{index + 1}</span>
        <CopyUrl url={url} tone="dark" className="flex-1" />
      </div>

      {/* actions: on hover with a mouse, always on touch screens */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/65 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <TileButton icon={Maximize2} label="View full screen" onClick={onOpen} />
        <TileButton icon={picker.uploading ? Loader2 : RefreshCw} spin={picker.uploading} label="Replace" onClick={picker.open} disabled={picker.uploading} />
        <TileButton icon={Trash2} label="Delete" onClick={onDelete} danger />
      </div>
      {picker.input}
    </div>
  );
}

function TileButton({ icon: Icon, label, onClick, danger, disabled, spin }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`relative rounded-full bg-white/90 p-1.5 shadow transition hover:bg-white disabled:opacity-60 ${danger ? "text-red-600" : "text-gray-800"}`}
    >
      <Icon className={`size-4 ${spin ? "animate-spin" : ""}`} />
    </button>
  );
}

function AddTile({ onAdd }) {
  const picker = useMediaPicker(onAdd);
  return (
    <>
      <button
        type="button"
        onClick={picker.open}
        disabled={picker.uploading}
        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-app-border! text-sm text-app-text-muted transition hover:border-blue-400! hover:bg-blue-500/5 hover:text-blue-600 disabled:opacity-60"
      >
        {picker.uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
        {picker.uploading ? "Uploading…" : "Add photo"}
      </button>
      {picker.input}
    </>
  );
}

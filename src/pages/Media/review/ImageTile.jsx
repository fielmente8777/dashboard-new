import { Check } from "lucide-react";
import { MediaThumbnail } from "../components/MediaPreview";
import { mediaDetails } from "../components/mediaFormat";

const CROP_ASPECT = { "1:1": "1 / 1", "4:3": "4 / 3", "16:9": "16 / 9" };

/** Image preview with the pending rotate / crop applied visually (the server applies them on import). */
export const EditedImage = ({ asset, edit = {}, className = "" }) => (
  <MediaThumbnail asset={asset} className={className} fit="contain"
    style={{ transform: `rotate(${edit.rotate || 0}deg)`, aspectRatio: CROP_ASPECT[edit.crop] }} />
);

// One image in a review grid: checkbox to include it, click to edit it.
const ImageTile = ({ asset, edit, checked, active, badge, badgeTone = "gray", subtitle, onToggle, onOpen }) => (
  <article
    className={`overflow-hidden rounded-xl border bg-app-surface transition ${
      active ? "border-blue-500! ring-2 ring-blue-500/30" : checked ? "border-blue-300!" : "border-app-border! opacity-60"
    }`}
  >
    <div className="relative">
      <button type="button" onClick={onOpen} className="block w-full" aria-label={`Edit ${asset.sourceName}`}>
        <EditedImage asset={asset} edit={edit} className="aspect-4/3" />
      </button>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Include ${asset.sourceName}`}
        onClick={onToggle}
        className={`absolute left-2 top-2 flex size-6 items-center justify-center rounded-md border-2 ${checked ? "border-white bg-blue-600 text-white" : "border-slate-400 bg-white/90"}`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </button>
      {badge && (
        <span className={`absolute bottom-2 right-2 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${badgeTone === "amber" ? "bg-amber-100 text-amber-800" : "bg-white/90 text-slate-900"}`}>
          {badge}
        </span>
      )}
    </div>
    <div className="space-y-0.5 px-2.5 py-2">
      <p className="truncate text-xs font-medium text-app-text" title={edit?.title || asset.sourceName}>
        {edit?.title || asset.suggestion?.title || asset.sourceName}
      </p>
      <p className="truncate text-[11px] text-app-text-muted">{[subtitle, mediaDetails(asset)].filter(Boolean).join(" · ")}</p>
    </div>
  </article>
);

export default ImageTile;

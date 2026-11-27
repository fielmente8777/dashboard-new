import { Image as ImageIcon, Maximize2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import CopyUrl from "./CopyUrl";
import { fileNameOf } from "../utils/copyUrl";
import KbLightbox from "./KbLightbox";
import { useMediaPicker } from "../hooks/useMediaPicker";
import { MediaThumbnail } from "../../Media/components/MediaPreview";
import { mediaKindFor } from "../../Media/components/mediaFormat";

// An already-uploaded media value: thumbnail (or a file icon for videos and
// PDFs), its URL and a Replace button that uploads a new file over it.
export const MediaValue = ({ value, onChange, mimeType }) => {
  const picker = useMediaPicker(onChange);
  const mediaKind = mediaKindFor(value, mimeType);
  const [viewing, setViewing] = useState(null);
  const viewable = mediaKind === "image" || mediaKind === "video";
  const name = fileNameOf(value);

  return (
    <div className="space-y-2">
      {/* the link on top, with Copy */}
      <CopyUrl url={value} className="rounded-lg bg-app-surface-secondary px-2.5 py-1.5" />
      <div className="flex items-center gap-3">
      {viewable ? (
        // a big preview: click to see it full screen
        <button
          type="button"
          onClick={() => setViewing(0)}
          aria-label="View full screen"
          className="group relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl border border-app-border! bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:w-40"
        >
          {mediaKind === "video" ? (
            <video src={value} preload="metadata" muted className="size-full object-cover" />
          ) : (
            <img src={value} alt={name} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-[1.04]" />
          )}
          <span className="absolute right-1.5 bottom-1.5 rounded-full bg-black/55 p-1 text-white opacity-0 transition group-hover:opacity-100">
            <Maximize2 className="size-3.5" />
          </span>
        </button>
      ) : (
        <a href={value} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" aria-label="Open file in a new tab">
          <MediaThumbnail asset={{ mediaKind, thumbnailUrl: null }} className="size-14 shrink-0 rounded-lg border border-app-border!" />
        </a>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-app-text" title={name}>
          {name}
        </p>
        {viewable && (
          <button type="button" onClick={() => setViewing(0)} className="block text-xs text-blue-600 hover:underline dark:text-blue-400">
            View full screen
          </button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="mt-1.5"
          loading={picker.uploading}
          onClick={picker.open}
        >
          {picker.uploading ? "Uploading..." : "Replace"}
        </Button>
      </div>

      </div>
      {picker.input}
      {viewable && <KbLightbox items={[{ url: value, mimeType }]} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

// "+ Add media" for array fields (photo galleries, brochure lists, ...):
// uploads straight away and hands the new URL to `onAdd`.
export const AddMediaButton = ({ onAdd }) => {
  const picker = useMediaPicker(onAdd);

  return (
    <>
      <Button
        variant="dashed"
        icon={ImageIcon}
        loading={picker.uploading}
        onClick={picker.open}
      >
        {picker.uploading ? "Uploading..." : "Add media"}
      </Button>
      {picker.input}
    </>
  );
};

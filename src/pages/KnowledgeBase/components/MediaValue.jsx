import { Image as ImageIcon } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useMediaPicker } from "../hooks/useMediaPicker";
import { MediaThumbnail } from "../../Media/components/MediaPreview";
import { mediaKindFor } from "../../Media/components/mediaFormat";
import { KB_MEDIA_HELP_TEXT } from "../utils/kbMediaLimits";

const LimitsHint = () => (
  <p className="mt-1 text-xs text-app-text-muted">{KB_MEDIA_HELP_TEXT}</p>
);

// An already-uploaded media value: thumbnail (or a file icon for videos and
// PDFs), its URL and a Replace button that uploads a new file over it.
export const MediaValue = ({ value, onChange, mimeType }) => {
  const picker = useMediaPicker(onChange);
  const mediaKind = mediaKindFor(value, mimeType);

  return (
    <div className="flex items-center gap-3">
      {mediaKind === "video"
        ? <video src={value} controls preload="metadata" className="h-16 w-28 shrink-0 rounded-lg bg-black" aria-label="Video preview" />
        : (
          <a href={value} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" aria-label="Open file in a new tab">
            <MediaThumbnail asset={{ mediaKind, thumbnailUrl: mediaKind === "image" ? value : null }} className="size-14 shrink-0 rounded-lg border border-app-border!" />
          </a>
        )}

      <div className="min-w-0 flex-1">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          title={value}
          className="relative z-10 block cursor-pointer truncate text-xs text-blue-600 hover:underline focus-visible:underline focus-visible:outline-none dark:text-blue-400"
        >
          {value}
        </a>
        <Button
          variant="secondary"
          size="sm"
          className="mt-1.5"
          loading={picker.uploading}
          onClick={picker.open}
        >
          {picker.uploading ? "Uploading..." : "Replace"}
        </Button>
        <LimitsHint />
      </div>

      {picker.input}
    </div>
  );
};

// "+ Add media" for array fields (photo galleries, brochure lists, ...):
// uploads straight away and hands the new URL to `onAdd`.
export const AddMediaButton = ({ onAdd }) => {
  const picker = useMediaPicker(onAdd);

  return (
    <div className="flex flex-col items-start">
      <Button
        variant="dashed"
        icon={ImageIcon}
        loading={picker.uploading}
        onClick={picker.open}
      >
        {picker.uploading ? "Uploading..." : "Add media"}
      </Button>
      <LimitsHint />
      {picker.input}
    </div>
  );
};

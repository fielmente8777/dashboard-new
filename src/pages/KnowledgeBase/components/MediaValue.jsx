import { Image as ImageIcon } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useMediaPicker } from "../hooks/useMediaPicker";
import { MediaThumbnail } from "../../Media/components/MediaPreview";
import { mediaKindFor } from "../../Media/components/mediaFormat";

// An already-uploaded media value: thumbnail (or a file icon for videos and
// PDFs), its URL and a Replace button that uploads a new file over it.
export const MediaValue = ({ value, onChange, mimeType }) => {
  const picker = useMediaPicker(onChange);
  const mediaKind = mediaKindFor(value, mimeType);

  return (
    <div className="flex items-center gap-3">
      {mediaKind === "video"
        ? <video src={value} controls preload="metadata" className="h-16 w-28 shrink-0 rounded-lg bg-black" aria-label="Video preview" />
        : <MediaThumbnail asset={{ mediaKind, thumbnailUrl: mediaKind === "image" ? value : null }} className="size-14 shrink-0 rounded-lg border border-app-border!" />}

      <div className="min-w-0 flex-1">
        <a href={value} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary underline">{value}</a>
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

      {picker.input}
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

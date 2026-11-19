import { FileText, Image as ImageIcon } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useMediaPicker } from "../hooks/useMediaPicker";
import { isImageUrl } from "../utils/kbHelpers";
import Icon from "../../../components/ui/Icon";

// An already-uploaded media value: thumbnail (or a file icon for videos and
// PDFs), its URL and a Replace button that uploads a new file over it.
export const MediaValue = ({ value, onChange }) => {
  const picker = useMediaPicker(onChange);

  return (
    <div className="flex items-center gap-3">
      {isImageUrl(value) ? (
        <img
          src={value}
          alt=""
          className="size-14 shrink-0 rounded-lg border border-app-border! object-cover"
        />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-app-border! bg-app-surface text-app-text-muted">
          <Icon icon={FileText} size="xl" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-app-text-muted">{value}</p>
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

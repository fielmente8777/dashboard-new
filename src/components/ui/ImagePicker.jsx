import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import FileDropZone from "./FileDropZone";
import Icon from "./Icon";

// Picks one image and previews it. `file` is the selected File (or null).
const ImagePicker = ({
  file,
  onChange,
  hint = "JPG, PNG, GIF or WEBP",
  className = "h-44",
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg border border-app-border! bg-app-surface-secondary ${className}`}
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        )}
        <button
          type="button"
          aria-label="Remove image"
          title="Remove image"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
        >
          <Icon icon={X} size="sm" />
        </button>
      </div>
    );
  }

  return (
    <FileDropZone
      accept="image/*"
      className={className}
      onFiles={(files) => {
        const image = files.find((f) => f.type.startsWith("image/"));
        if (image) onChange(image);
      }}
    >
      <Icon icon={ImagePlus} size="xl" className="text-app-text-faint" />
      <p className="text-sm text-app-text-muted">
        Drop an image here, or <span className="text-blue-500">browse</span>
      </p>
      <p className="text-xs text-app-text-faint">{hint}</p>
    </FileDropZone>
  );
};

export default ImagePicker;

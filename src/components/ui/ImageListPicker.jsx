import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import FileDropZone from "./FileDropZone";
import Icon from "./Icon";

// Picks several images and previews them. `files` is an array of File.
const ImageListPicker = ({ files, onChange, max = 8 }) => {
  const [previews, setPreviews] = useState([]);
  const isFull = files.length >= max;

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = (picked) => {
    const images = picked
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, max - files.length);
    if (images.length > 0) onChange([...files, ...images]);
  };

  return (
    <div className="space-y-3">
      <FileDropZone
        accept="image/*"
        multiple
        disabled={isFull}
        onFiles={addFiles}
      >
        <Icon icon={ImagePlus} size="xl" className="text-app-text-faint" />
        <p className="text-sm text-app-text-muted">
          {isFull ? (
            "Maximum number of images reached"
          ) : (
            <>
              Drop images here, or <span className="text-blue-500">browse</span>
            </>
          )}
        </p>
        <p className="text-xs text-app-text-faint">
          {files.length} of {max} images
        </p>
      </FileDropZone>

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg bg-app-surface-secondary"
            >
              {previews[index] && (
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                title="Remove"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-red-600"
              >
                <Icon icon={X} size="xs" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImageListPicker;

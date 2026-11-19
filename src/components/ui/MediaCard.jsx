import { ChevronLeft, ChevronRight, ImageOff, Trash2 } from "lucide-react";
import { useState } from "react";
import Icon from "./Icon";

const overlayButtonClassName =
  "flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors";

// A card with a picture on top: a room, a package, an offer, a blog post...
// More than one image turns the picture into a small slideshow.
const MediaCard = ({ images = [], title, badge, onDelete, children }) => {
  const [index, setIndex] = useState(0);
  // stays in range if the list of images gets shorter
  const current = Math.min(index, Math.max(images.length - 1, 0));
  const hasSeveral = images.length > 1;

  const step = (offset) =>
    setIndex((current + offset + images.length) % images.length);

  return (
    <article className="anim-lift group flex flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="relative aspect-video bg-app-surface-secondary">
        {images.length > 0 ? (
          <img
            src={images[current]}
            alt={title || ""}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-app-text-faint">
            <Icon icon={ImageOff} size="2xl" />
          </div>
        )}

        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
            {badge}
          </span>
        )}

        {onDelete && (
          <button
            type="button"
            aria-label={`Delete ${title || "item"}`}
            title="Delete"
            onClick={onDelete}
            className={`absolute right-2 top-2 hover:bg-red-600 ${overlayButtonClassName}`}
          >
            <Icon icon={Trash2} />
          </button>
        )}

        {hasSeveral && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className={`absolute left-2 top-1/2 -translate-y-1/2 hover:bg-black/80 ${overlayButtonClassName}`}
            >
              <Icon icon={ChevronLeft} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 hover:bg-black/80 ${overlayButtonClassName}`}
            >
              <Icon icon={ChevronRight} />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] tabular-nums text-white">
              {current + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4 text-sm text-app-text-muted">
        <h3 className="text-sm font-semibold text-app-text">{title}</h3>
        {children}
      </div>
    </article>
  );
};

export default MediaCard;

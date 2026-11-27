import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { mediaKindFor } from "../../Media/components/mediaFormat";

/**
 * Full-screen viewer for knowledge base pictures and videos, like Instagram's: the picture as
 * big as the screen allows on black, arrows (and ← → keys, swipe on phones), "3 / 12", a strip
 * of thumbnails, Esc or ✕ to close, and "Open original".
 *   items  - [{ url, mimeType? }]
 *   index  - the open one, or null when closed
 *   onIndex(i) / onClose()
 */
export default function KbLightbox({ items, index, onIndex, onClose }) {
  const open = index !== null && index >= 0 && index < items.length;
  const touch = useRef(null);
  const go = useCallback((step) => onIndex((index + step + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && items.length > 1) go(1);
      if (e.key === "ArrowLeft" && items.length > 1) go(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go, onClose, items.length]);

  if (!open) return null;
  const item = items[index];
  const isVideo = mediaKindFor(item.url, item.mimeType) === "video";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 text-white"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null || items.length < 2) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm tabular-nums text-white/80">
          {index + 1} / {items.length}
        </span>
        <div className="flex items-center gap-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/85 hover:bg-white/10"
          >
            <ExternalLink className="size-4" aria-hidden /> <span className="hidden sm:inline">Open original</span>
          </a>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* clicking the dark area around the picture closes it */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {isVideo ? (
          <video key={item.url} src={item.url} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg" />
        ) : (
          <img key={item.url} src={item.url} alt={`Photo ${index + 1}`} className="max-h-full max-w-full select-none rounded-lg object-contain" />
        )}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 backdrop-blur hover:bg-white/25 sm:block"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 backdrop-blur hover:bg-white/25 sm:block"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="hide-scrollbar flex justify-start gap-2 overflow-x-auto px-4 py-3 sm:justify-center">
          {items.map((it, i) => (
            <button
              key={`${it.url}-${i}`}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
              className={`size-14 shrink-0 overflow-hidden rounded-md border-2 transition ${i === index ? "border-white" : "border-transparent opacity-55 hover:opacity-100"}`}
            >
              {mediaKindFor(it.url, it.mimeType) === "video" ? (
                <video src={it.url} preload="metadata" muted className="size-full object-cover" />
              ) : (
                <img src={it.url} alt="" loading="lazy" className="size-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

import { ChevronLeft, ChevronRight, ExternalLink, ImageOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";

// What the viewer plays: a video (reel) file, Meta's ad preview frame, or pictures.
const Media = ({ media = [], frame, loading }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [media]);

  if (loading) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-black/90 text-white/70">
        <Icon icon={Loader2} className="animate-spin" />
      </div>
    );
  }
  if (frame) {
    // Meta's ad preview (it plays the video inside); the preview is phone-sized
    return (
      <div className="flex w-full justify-center bg-app-surface-secondary">
        <iframe
          src={frame}
          title="Ad preview"
          className="h-[70vh] max-h-[640px] w-full max-w-[380px] border-0"
          allow="autoplay; encrypted-media; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }
  const item = media[index];
  if (!item) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-app-surface-secondary text-app-text-faint">
        <Icon icon={ImageOff} size="xl" />
      </div>
    );
  }
  return (
    <div className="relative flex w-full items-center justify-center bg-black">
      {item.type === "video" ? (
        <video key={item.url} src={item.url} poster={item.poster || undefined} controls playsInline autoPlay className="max-h-[70vh] w-full object-contain" />
      ) : (
        <img key={item.url} src={item.url} alt="" className="max-h-[70vh] w-full object-contain" />
      )}
      {media.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-gray-800 shadow disabled:opacity-30"
          >
            <Icon icon={ChevronLeft} />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={index === media.length - 1}
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-gray-800 shadow disabled:opacity-30"
          >
            <Icon icon={ChevronRight} />
          </button>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {index + 1} / {media.length}
          </span>
        </>
      )}
    </div>
  );
};

// A post or ad opened big: the media (played here when it is a video, reel or ad), then the
// caption and every number, with "—" where Meta keeps one back.
//   view - { title, subtitle, caption, media, frame, loading, stats: [{ label, value }], links: [{ label, url }], note }
const MediaViewer = ({ view, onClose }) => (
  <Dialog open={Boolean(view)} onClose={onClose} title={view?.title || ""} description={view?.subtitle} size="lg" sheetOnPhone>
    {view && (
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl">
          <Media media={view.media} frame={view.frame} loading={view.loading} />
        </div>
        <div className="min-w-0 space-y-4">
          {view.caption && <p className="max-h-40 overflow-y-auto whitespace-pre-line text-sm text-app-text">{view.caption}</p>}
          {view.stats?.length > 0 && (
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {view.stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-app-surface-secondary px-3 py-2">
                  <dt className="text-[11px] text-app-text-muted">{s.label}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-app-text">{s.value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          )}
          {view.note && <p className="text-xs text-app-text-muted">{view.note}</p>}
          {view.links?.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {view.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {l.label} <Icon icon={ExternalLink} size="sm" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </Dialog>
);

export default MediaViewer;

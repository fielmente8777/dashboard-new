import { Clapperboard, Copy, ImageOff, Play } from "lucide-react";
import Icon from "../ui/Icon";

const FORMAT_ICON = { reel: Clapperboard, video: Play, carousel: Copy };

// One square tile of a post or ad, Instagram-style: the picture fills the square, a mark for
// reels / videos / carousels top-right, and the numbers on a soft shade at the bottom.
//   format - "reel" | "video" | "carousel" | "image" | "text"
//   stats  - [{ icon, value }] shown on the shade
//   label  - small text top-left (e.g. a date, a status)
const MediaTile = ({ thumbnail, format, stats = [], label, caption, onClick }) => {
  const mark = FORMAT_ICON[format];
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-app-surface-secondary text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center text-app-text-faint">
          <Icon icon={ImageOff} size="lg" />
          {caption && <span className="line-clamp-4 text-xs text-app-text-muted">{caption}</span>}
        </span>
      )}
      {mark && (
        <span className="absolute right-2 top-2 rounded-md bg-black/55 p-1 text-white">
          <Icon icon={mark} size="sm" />
        </span>
      )}
      {label && <span className="absolute left-2 top-2 max-w-[70%] truncate rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">{label}</span>}
      {stats.length > 0 && (
        <span className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-3 gap-y-1 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-2.5 pb-2 pt-6 text-xs font-semibold text-white">
          {stats.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1" title={s.title}>
              {s.icon && <Icon icon={s.icon} size="xs" />}
              {s.value}
            </span>
          ))}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
    </button>
  );
};

export default MediaTile;

import { useState } from "react";
import { File, FileSpreadsheet, FileText, Image, Play, Presentation, Video } from "lucide-react";
import { mediaFileUrl } from "../../../redux/api/mediaApi";

const icons = { image: Image, video: Video, document: FileText, spreadsheet: FileSpreadsheet, presentation: Presentation, other: File };
const kindOf = (asset) => asset.mediaKind || "image";
const nameOf = (asset) => asset.sourceName || asset.name || asset.title || "File";

export const MediaThumbnail = ({ asset, className = "", style, fit = "cover" }) => {
  const [failed, setFailed] = useState("");
  const kind = kindOf(asset);
  const url = mediaFileUrl(asset.thumbnailUrl || asset.thumbUrl || asset.posterUrl);
  const Icon = icons[kind] || File;
  const duration = Number.isFinite(asset.durationSec) ? Math.floor(asset.durationSec) : null;
  return (
    <span className={`relative flex items-center justify-center overflow-hidden bg-app-surface-secondary text-app-text-muted ${className}`}>
      {url && failed !== url
        ? <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(url)} style={style} className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`} />
        : <Icon size={22} aria-hidden="true" />}
      {kind === "video" && url && failed !== url && <Play size={24} className="absolute inset-0 m-auto rounded-full bg-black/60 p-1 text-white" aria-hidden="true" />}
      {duration !== null && <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[10px] text-white">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>}
    </span>
  );
};

export const MediaPreview = ({ asset, className = "", compact = false }) => {
  const kind = kindOf(asset);
  const name = nameOf(asset);
  const original = mediaFileUrl(asset.originalUrl);
  const preview = mediaFileUrl(asset.previewUrl);
  if (kind === "image") return <img src={preview || original} alt={name} className={`w-full object-contain ${className}`} />;
  if (kind === "video" && original) return <video controls preload="metadata" src={original} poster={mediaFileUrl(asset.posterUrl) || undefined} className={`w-full bg-black ${className}`} aria-label={name} />;
  return (
    <div className="grid gap-2 text-center">
      {asset.mimeType === "application/pdf" && (preview || original) && !compact
        ? <iframe title={name} src={preview || original} className={`min-h-52 w-full rounded-lg border border-app-border! ${className}`} />
        : <MediaThumbnail asset={asset} className={`w-full rounded-lg ${className}`} fit="contain" />}
      {original && <a className="break-all text-sm text-primary underline" href={original} target="_blank" rel="noreferrer">Open or download {name}</a>}
    </div>
  );
};

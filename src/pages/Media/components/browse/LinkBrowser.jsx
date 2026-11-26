import { Check, Folder, Loader2 } from "lucide-react";
import { MediaThumbnail } from "../MediaPreview";
import { MEDIA_KIND_LABELS } from "../mediaFormat";
import { ROOT, isChosen, selectedImages, toggle } from "./browseSelection";

const PREVIEW_LIMIT = 60;

const Thumb = ({ img, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={img.folderPath ? `${img.folderPath}/${img.name}` : img.name}
    aria-pressed={onClick ? selected : undefined}
    className={`relative aspect-square overflow-hidden rounded-md border bg-app-surface-secondary ${selected ? "border-blue-500! ring-1 ring-blue-500" : "border-app-border! opacity-60"} ${onClick ? "" : "cursor-default"}`}
  >
    <MediaThumbnail asset={img} className="h-full w-full" />
    <span className="absolute inset-x-0 bottom-0 truncate bg-app-surface/90 px-0.5 text-[10px]" title={img.name}>{MEDIA_KIND_LABELS[img.mediaKind]} · {img.name}</span>
    {selected && onClick && (
      <span className="absolute right-1 top-1 rounded-full bg-blue-600 p-0.5 text-white">
        <Check size={10} aria-hidden="true" />
      </span>
    )}
  </button>
);

// Folders of a link: tick the ones to import (a parent includes its subfolders).
const FolderPicker = ({ data, sel, onChange }) => {
  const rootCount = data.images.filter((i) => !i.folderPath).length;
  const rows = [...(rootCount ? [{ path: ROOT, name: "Files directly in this folder", depth: 0, total: rootCount }] : []), ...data.folders];
  return (
    <ul className="max-h-60 space-y-0.5 overflow-y-auto rounded-md border border-app-border! p-1.5">
      {rows.map((f) => {
        const inherited = f.path !== ROOT && !sel.folders.includes(f.path) && isChosen(f.path, sel.folders);
        const checked = sel.folders.includes(f.path) || inherited;
        return (
          <li key={f.path || "__root__"} style={{ paddingLeft: f.depth * 16 }}>
            <label className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-app-surface-secondary ${inherited ? "opacity-70" : ""}`}>
              <input type="checkbox" checked={checked} disabled={inherited} onChange={() => onChange({ ...sel, folders: toggle(sel.folders, f.path) })} />
              <Folder size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
              <span className="truncate text-app-text">{f.name}</span>
              <span className="ml-auto shrink-0 text-xs text-app-text-muted">{f.total} file{f.total === 1 ? "" : "s"}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};

// One pasted link: folders to choose, or (no folders) a preview to pick images from.
const LinkBrowser = ({ entry, onChange }) => {
  const { link, status, data, error, sel } = entry;
  if (status === "loading") {
    return (
      <p className="flex items-center gap-2 text-xs text-app-text-muted">
        <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Reading {link.slice(0, 60)}…
      </p>
    );
  }
  if (status === "error") return <p className="text-xs text-red-500">{link.slice(0, 60)}: {error}</p>;
  if (!data.total) return <p className="text-xs text-amber-600">{link.slice(0, 60)}: no supported files found at this link.</p>;

  const hasFolders = data.folders.length > 0;
  const chosen = selectedImages(data, sel);
  const chosenIds = new Set(chosen.map((i) => i.id));
  const shown = (hasFolders ? chosen : data.images).slice(0, PREVIEW_LIMIT);
  const pickFile = (id) => onChange({ ...sel, files: toggle(sel.files || data.images.map((i) => i.id), id) });

  return (
    <div className="space-y-2 rounded-lg border border-app-border! p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="truncate text-app-text-muted" title={link}>{link}</span>
        <span className="font-medium text-app-text">
          {chosen.length} of {data.total} file{data.total === 1 ? "" : "s"} selected{data.truncated ? " (link has more; first ones shown)" : ""}
        </span>
      </div>

      {hasFolders ? (
        <>
          <p className="text-xs font-medium text-app-text">Choose the folders to import from</p>
          <FolderPicker data={data} sel={sel} onChange={onChange} />
        </>
      ) : (
        <div className="flex gap-3 text-xs">
          <button type="button" className="text-blue-500 hover:underline" onClick={() => onChange({ ...sel, files: null })}>Select all</button>
          <button type="button" className="text-blue-500 hover:underline" onClick={() => onChange({ ...sel, files: [] })}>Select none</button>
        </div>
      )}

      {shown.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 lg:grid-cols-10">
          {shown.map((img) => (
            <Thumb key={img.id} img={img} selected={chosenIds.has(img.id)} onClick={hasFolders ? undefined : () => pickFile(img.id)} />
          ))}
        </div>
      )}
      {(hasFolders ? chosen.length : data.images.length) > PREVIEW_LIMIT && (
        <p className="text-xs text-app-text-muted">Showing the first {PREVIEW_LIMIT} files.</p>
      )}
    </div>
  );
};

export default LinkBrowser;

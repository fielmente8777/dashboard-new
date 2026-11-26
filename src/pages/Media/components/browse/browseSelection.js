// Selection made in the browse step, per link:
//   link with folders    -> { folders: ["Rooms", "Pool/Night", ""] }   ("" = images directly in the linked folder)
//   link without folders -> { files: [ids] }                            (null = every image)

export const ROOT = "";

const covers = (folder, path) => folder !== ROOT && (path === folder || path.startsWith(`${folder}/`));

/** A folder is chosen when it or one of its parents is ticked. */
export const isChosen = (path, folders) => folders.some((f) => covers(f, path));

export const initialSelection = () => ({ folders: [], files: null });

/** Images the selection will import. */
export const selectedImages = (data, sel) => {
  if (!data) return [];
  if (!data.folders.length) return sel.files ? data.images.filter((i) => sel.files.includes(i.id)) : data.images;
  return data.images.filter((i) => (i.folderPath ? isChosen(i.folderPath, sel.folders) : sel.folders.includes(ROOT)));
};

/** What the import request sends for this link (null = import everything). */
export const toRequest = (link, data, sel) => {
  if (!data) return null;
  if (!data.folders.length) return sel.files && sel.files.length < data.images.length ? { link, files: sel.files } : null;
  const folders = sel.folders.filter((f) => f !== ROOT);
  const files = sel.folders.includes(ROOT) ? data.images.filter((i) => !i.folderPath).map((i) => i.id) : [];
  return { link, folders, files };
};

export const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

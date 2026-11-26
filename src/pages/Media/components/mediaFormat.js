const extensions = {
  image: /^(?:jpe?g|png|webp|gif|tiff?|bmp|svg|heic|heif)$/,
  video: /^(?:mp4|webm|mov|m4v|avi)$/,
  document: /^(?:pdf|docx?|txt|rtf|odt)$/,
  spreadsheet: /^(?:xlsx?|csv|ods)$/,
  presentation: /^(?:pptx?|odp)$/,
  other: /^wav$/,
};

export const mediaKindFor = (value, mimeType = "") => {
  if (typeof value !== "string" || !/^(?:https?:\/\/|\/api\/v1\/media\/)/i.test(value.trim())) return null;
  const mime = (typeof mimeType === "string" ? mimeType : "").toLowerCase().split(";")[0].trim();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (/spreadsheet|excel|csv/.test(mime)) return "spreadsheet";
  if (/presentation|powerpoint/.test(mime)) return "presentation";
  if (/pdf|word|msword|rtf|^text\/plain$|opendocument\.text/.test(mime)) return "document";
  if (mime === "audio/wav") return "other";
  const extension = value.trim().split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i)?.[1].toLowerCase();
  return Object.keys(extensions).find((kind) => extensions[kind].test(extension || "")) || null;
};

export const MEDIA_KIND_LABELS = {
  image: "Image", video: "Video", document: "Document", spreadsheet: "Spreadsheet", presentation: "Presentation", other: "Other",
};

export const mediaDetails = (asset) => [
  MEDIA_KIND_LABELS[asset.mediaKind || "image"],
  Number.isFinite(asset.bytes ?? asset.size) ? formatBytes(asset.bytes ?? asset.size) : null,
  asset.documentMetadata?.pageCount ? asset.documentMetadata.pageCount + " pages" : null,
  asset.documentMetadata?.sheetCount ? asset.documentMetadata.sheetCount + " sheets" : null,
  asset.documentMetadata?.slideCount ? asset.documentMetadata.slideCount + " slides" : null,
].filter(Boolean).join(" · ");

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 ** 2).toFixed(1) + " MB";
};

/**
 * Knowledge Base media upload limits: single source of truth for the frontend.
 *
 * KEEP IN SYNC with the backend copy:
 *   gian/src/constants/kbMediaLimits.ts
 * Same numbers, same allowed types, same messages.
 */

const MB = 1024 * 1024;

export const KB_MEDIA_MAX_MB = {
  image: 5,
  video: 16,
  pdf: 10, // TODO: placeholder, awaiting confirmation
};

export const KB_MEDIA_ALLOWED_TYPES = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "video/mp4": "video",
  "application/pdf": "pdf",
};

/** Value for <input accept="...">. */
export const KB_MEDIA_ACCEPT = Object.keys(KB_MEDIA_ALLOWED_TYPES).join(",");

export const KB_MEDIA_HELP_TEXT = `Images up to ${KB_MEDIA_MAX_MB.image} MB (JPG, PNG, WEBP). Videos up to ${KB_MEDIA_MAX_MB.video} MB (MP4). PDFs up to ${KB_MEDIA_MAX_MB.pdf} MB.`;

export const KB_MEDIA_MESSAGES = {
  tooLarge: {
    image: `This image is too large. Please upload an image under ${KB_MEDIA_MAX_MB.image} MB.`,
    video: `This video is too large. Please upload a video under ${KB_MEDIA_MAX_MB.video} MB.`,
    pdf: `This PDF is too large. Please upload a PDF under ${KB_MEDIA_MAX_MB.pdf} MB.`,
  },
  tooLargeGeneric: `This file is too large. Images must be under ${KB_MEDIA_MAX_MB.image} MB and videos under ${KB_MEDIA_MAX_MB.video} MB.`,
  unsupportedType:
    "This file type is not supported. Please upload a JPG, PNG, WEBP image, an MP4 video or a PDF.",
  noFile: "Please choose a file to upload.",
};

const KIND_NOUN = { image: "image", video: "video", pdf: "PDF" };

export const kbMediaKindFor = (mimeType) =>
  KB_MEDIA_ALLOWED_TYPES[String(mimeType || "").toLowerCase()] || null;

/** 21.4 MB, one decimal; never rounds a too-big file down to the limit (5.04 -> 5.1). */
export const formatMb = (bytes) => (Math.ceil((bytes / MB) * 10) / 10).toFixed(1);

/**
 * Checks a picked file before any upload.
 * Returns { ok: true, kind } or { ok: false, message }.
 */
export const validateKbMedia = (file) => {
  if (!file) return { ok: false, message: KB_MEDIA_MESSAGES.noFile };

  const kind = kbMediaKindFor(file.type);
  if (!kind) return { ok: false, message: KB_MEDIA_MESSAGES.unsupportedType };

  if (file.size > KB_MEDIA_MAX_MB[kind] * MB) {
    return {
      ok: false,
      message: `This ${KIND_NOUN[kind]} is ${formatMb(file.size)} MB. The limit is ${KB_MEDIA_MAX_MB[kind]} MB. Please choose a smaller file.`,
    };
  }

  return { ok: true, kind };
};

/**
 * Text to show when the server rejects an upload (RTK Query error object).
 * Uses the server's message as is; a 413 without a usable body (a proxy's
 * HTML page) gets the generic size message. Never shows raw status text.
 */
export const kbUploadErrorMessage = (err) => {
  const data = err?.data;
  if (data && typeof data === "object" && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  const status = err?.originalStatus ?? err?.status;
  if (status === 413) return KB_MEDIA_MESSAGES.tooLargeGeneric;
  if (status === 415) return KB_MEDIA_MESSAGES.unsupportedType;
  if (status === "FETCH_ERROR") return "Unable to reach the server. Please check your connection.";
  return "Upload failed. Please try again.";
};

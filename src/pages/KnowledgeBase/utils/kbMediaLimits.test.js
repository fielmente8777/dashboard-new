import test from "node:test";
import assert from "node:assert/strict";
import {
  KB_MEDIA_ACCEPT,
  KB_MEDIA_MESSAGES,
  kbUploadErrorMessage,
  validateKbMedia,
} from "./kbMediaLimits.js";

const MB = 1024 * 1024;
const file = (type, size) => ({ type, size, name: "f" });

test("accept list is the allowed types only", () => {
  assert.equal(KB_MEDIA_ACCEPT, "image/jpeg,image/png,image/webp,video/mp4,application/pdf");
});

test("images: up to 5 MB accepted, 5 MB + 1 byte refused", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.deepEqual(validateKbMedia(file(type, 5 * MB)), { ok: true, kind: "image" });
    const r = validateKbMedia(file(type, 5 * MB + 1));
    assert.equal(r.ok, false);
    assert.equal(r.message, "This image is 5.1 MB. The limit is 5 MB. Please choose a smaller file.");
  }
});

test("a 5.7 MB image is refused with its real size", () => {
  const r = validateKbMedia(file("image/jpeg", 5.7 * MB));
  assert.equal(r.message, "This image is 5.7 MB. The limit is 5 MB. Please choose a smaller file.");
});

test("videos: 16 MB accepted, 16 MB + 1 byte refused, 21.4 MB message", () => {
  assert.deepEqual(validateKbMedia(file("video/mp4", 16 * MB)), { ok: true, kind: "video" });
  assert.equal(validateKbMedia(file("video/mp4", 16 * MB + 1)).ok, false);
  assert.equal(
    validateKbMedia(file("video/mp4", 21.4 * MB)).message,
    "This video is 21.4 MB. The limit is 16 MB. Please choose a smaller file.",
  );
});

test("PDFs: 10 MB accepted, 10 MB + 1 byte refused", () => {
  assert.deepEqual(validateKbMedia(file("application/pdf", 10 * MB)), { ok: true, kind: "pdf" });
  assert.match(validateKbMedia(file("application/pdf", 10 * MB + 1)).message, /^This PDF is 10\.1 MB\. The limit is 10 MB\./);
});

test("unsupported types are refused whatever their size", () => {
  for (const type of ["image/gif", "image/svg+xml", "video/quicktime", "application/x-msdownload", ""]) {
    assert.deepEqual(validateKbMedia(file(type, 10)), { ok: false, message: KB_MEDIA_MESSAGES.unsupportedType });
  }
});

test("no file", () => {
  assert.equal(validateKbMedia(null).ok, false);
});

test("server errors: the API message is shown as is", () => {
  const msg = "This image is too large. Please upload an image under 5 MB.";
  assert.equal(kbUploadErrorMessage({ status: 413, data: { error: msg, code: "FILE_TOO_LARGE" } }), msg);
});

test("server errors: a proxy 413 with an HTML body gets the generic message", () => {
  const err = { status: "PARSING_ERROR", originalStatus: 413, data: "<html>413 Request Entity Too Large</html>" };
  assert.equal(kbUploadErrorMessage(err), KB_MEDIA_MESSAGES.tooLargeGeneric);
  assert.equal(kbUploadErrorMessage({ status: 413, data: "" }), KB_MEDIA_MESSAGES.tooLargeGeneric);
});

test("server errors: never raw status text", () => {
  const text = kbUploadErrorMessage({ status: 500, data: "Request failed with status code 500" });
  assert.equal(text, "Upload failed. Please try again.");
});

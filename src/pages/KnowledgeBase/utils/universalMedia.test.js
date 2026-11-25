import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mediaDetails, mediaKindFor } from "../../Media/components/mediaFormat.js";
import { findImagePath, placeImagesInKb } from "./placeMedia.js";

const url = (file) => "https://example.test/api/v1/media/kb/id/" + file;

test("recognizes supported originals, existing image links and MIME on extensionless URLs", () => {
  const cases = { jpeg: "image", mov: "video", pdf: "document", docx: "document", xls: "spreadsheet", ods: "spreadsheet", pptx: "presentation", wav: "other" };
  for (const [extension, kind] of Object.entries(cases)) assert.equal(mediaKindFor(url("signed." + extension + "?name=room#view")), kind);
  assert.equal(mediaKindFor(url("signed"), "application/vnd.oasis.opendocument.text"), "document");
  assert.equal(mediaKindFor("javascript:bad", "video/mp4"), null);
  assert.equal(mediaKindFor(url("signed.zip")), null);
  assert.equal(mediaDetails({ mediaKind: "document", bytes: 2 ** 20, documentMetadata: { pageCount: 2 } }), "Document · 1.0 MB · 2 pages");
});

test("appends universal media to named inventory arrays without losing room fields or duplicating URLs", () => {
  const before = { knowledge_base: { rooms: { inventory: { "Aroha Palms Majestic": {
    description: "Ocean view", images: [url("existing.jpg")], video_urls: [url("existing.mp4")],
    documents: [url("existing.pdf")], spreadsheets: [], presentations: [],
  } } } } };
  const placements = [
    { mediaKind: "image", url: url("room.jpg") },
    { mediaKind: "video", url: url("tour.mp4") },
    { mediaKind: "document", url: url("policy.docx") },
    { mediaKind: "spreadsheet", url: url("stock.xlsx") },
    { mediaKind: "presentation", url: url("deck.pptx") },
    { mediaKind: "other", url: url("chime.wav") },
    { mediaKind: "video", url: url("tour.mp4") },
  ].map((placement) => ({ ...placement, category: "Rooms", item: "Majestic room", roomIdentifier: "Aroha Palms Majestic" }));
  const { kb, places } = placeImagesInKb(before, placements);
  const inventory = kb.knowledge_base.rooms.inventory;
  assert.deepEqual(Object.keys(inventory), ["Aroha Palms Majestic"]);
  assert.equal(places.length, 6);
  assert.deepEqual(inventory["Aroha Palms Majestic"], {
    description: "Ocean view", images: [url("existing.jpg"), url("room.jpg")],
    video_urls: [url("existing.mp4"), url("tour.mp4")],
    documents: [url("existing.pdf"), url("policy.docx"), url("chime.wav")],
    spreadsheets: [url("stock.xlsx")], presentations: [url("deck.pptx")],
  });
  assert.deepEqual(before.knowledge_base.rooms.inventory["Aroha Palms Majestic"].images, [url("existing.jpg")]);
  assert.deepEqual(findImagePath(kb, url("tour.mp4")), ["Rooms", "Inventory", "Aroha Palms Majestic", "Video Urls"]);
});

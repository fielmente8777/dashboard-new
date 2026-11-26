import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ROOT, initialSelection, isChosen, selectedImages, toRequest } from "./browseSelection.js";

// The browse step: what a client's folder / image choice imports.

const withFolders = {
  folders: [
    { path: "Pool", name: "Pool", depth: 0, count: 1, total: 1 },
    { path: "Rooms", name: "Rooms", depth: 0, count: 1, total: 3 },
    { path: "Rooms/Majestic", name: "Majestic", depth: 1, count: 2, total: 2 },
  ],
  images: [
    { id: "r0", name: "cover.jpg", folderPath: "" },
    { id: "p1", name: "pool.jpg", folderPath: "Pool" },
    { id: "r1", name: "lobby.jpg", folderPath: "Rooms" },
    { id: "m1", name: "bed.jpg", folderPath: "Rooms/Majestic" },
    { id: "m2", name: "bath.jpg", folderPath: "Rooms/Majestic" },
  ],
};
const flat = { folders: [], images: [{ id: "a" }, { id: "b" }, { id: "c" }].map((i) => ({ ...i, name: `${i.id}.jpg`, folderPath: "" })) };
const ids = (list) => list.map((i) => i.id);

describe("link with folders", () => {
  it("nothing is selected until the client chooses a folder", () => {
    assert.deepEqual(selectedImages(withFolders, initialSelection()), []);
  });

  it("a parent folder includes its subfolders", () => {
    const sel = { folders: ["Rooms"], files: null };
    assert.deepEqual(ids(selectedImages(withFolders, sel)), ["r1", "m1", "m2"]);
    assert.equal(isChosen("Rooms/Majestic", sel.folders), true);
    assert.equal(isChosen("RoomsExtra", sel.folders), false, "a folder whose name only starts the same is not included");
  });

  it("a subfolder alone imports only that subfolder", () => {
    assert.deepEqual(ids(selectedImages(withFolders, { folders: ["Rooms/Majestic"], files: null })), ["m1", "m2"]);
  });

  it("images directly in the linked folder are a choice of their own", () => {
    const sel = { folders: [ROOT, "Pool"], files: null };
    assert.deepEqual(ids(selectedImages(withFolders, sel)), ["r0", "p1"]);
    assert.deepEqual(toRequest("L", withFolders, sel), { link: "L", folders: ["Pool"], files: ["r0"] });
  });
});

describe("link without folders (preview)", () => {
  it("every image is selected by default and nothing extra is sent", () => {
    assert.equal(selectedImages(flat, initialSelection()).length, 3);
    assert.equal(toRequest("L", flat, initialSelection()), null);
  });

  it("unticked images are left out", () => {
    const sel = { folders: [], files: ["a", "c"] };
    assert.deepEqual(ids(selectedImages(flat, sel)), ["a", "c"]);
    assert.deepEqual(toRequest("L", flat, sel), { link: "L", files: ["a", "c"] });
  });

  it("selecting none selects nothing (import stays disabled)", () => {
    assert.deepEqual(selectedImages(flat, { folders: [], files: [] }), []);
  });
});

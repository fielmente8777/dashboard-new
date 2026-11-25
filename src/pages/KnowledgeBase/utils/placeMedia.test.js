import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findImagePath, placeImagesInKb, removeImageFromKb } from "./placeMedia.js";

// Where images land in the Knowledge Base document. Run: npm run test:media

const kbFixture = () => ({
  url: "https://arohapalms.example",
  knowledge_base: {
    rooms: {
      shared_attributes: {},
      inventory: [
        { id: "villa_magnifica", name: "Aroha Palms Magnifica", type: "Villa", images: [] },
        { id: "villa_majestic_pilerne", name: "Aroha Palms Majestic", type: "Villa", images: ["https://s3/Majestic.jpg"], videos: [] },
        { id: "deluxe", name: "Aroha Palms Deluxe Room", type: "Room", beds: 1 },
      ],
      inventory_note: "",
    },
    dining: { outlets: [{ name: "Sea Breeze Cafe", cuisine: "Goan" }] },
  },
});
const url = (n) => `https://api.example/api/v1/media/kb/${n}/token.jpg`;
const rooms = (kb) => kb.knowledge_base.rooms.inventory;

describe("import with a title", () => {
  it("title matching a room puts the image in that room's images", () => {
    const { kb, places } = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Aroha Palms Majestic", url: url(1) }]);
    assert.deepEqual(places, ["Rooms › Aroha Palms Majestic"]);
    assert.deepEqual(rooms(kb)[1].images, ["https://s3/Majestic.jpg", url(1)]);
  });

  it("a shorter title matches a longer room name (Deluxe Room -> Aroha Palms Deluxe Room)", () => {
    const { kb } = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Deluxe Room", url: url(2) }]);
    assert.deepEqual(rooms(kb)[2].images, [url(2)]);
  });

  it("matching ignores case and punctuation", () => {
    const { places } = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "aroha-palms  MAJESTIC", url: url(3) }]);
    assert.deepEqual(places, ["Rooms › Aroha Palms Majestic"]);
  });

  it("a new title creates a new room shaped like the others", () => {
    const { kb } = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Garden Suite", url: url(4) }]);
    const created = rooms(kb).at(-1);
    assert.equal(created.name, "Garden Suite");
    assert.equal(created.type, "");
    assert.deepEqual(created.images, [url(4)]);
  });

  it("a title naming an item in another section goes there (dining outlet)", () => {
    const { kb, places } = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Sea Breeze Cafe", url: url(5) }]);
    assert.deepEqual(places, ["Dining › Sea Breeze Cafe"]);
    assert.deepEqual(kb.knowledge_base.dining.outlets[0].images, [url(5)]);
  });
});

describe("no title", () => {
  it("image title matching a room still goes to that room", () => {
    const { places } = placeImagesInKb(kbFixture(), [{ category: "Documents", match: ["Aroha Palms Majestic"], url: url(6) }]);
    assert.deepEqual(places, ["Rooms › Aroha Palms Majestic"]);
  });

  it("no match: no new room is invented; the image goes to the section", () => {
    const { kb, places } = placeImagesInKb(kbFixture(), [{ category: "Rooms", match: ["Bathroom with Shower and Vanity", "Bathroom"], url: url(7) }]);
    assert.equal(rooms(kb).length, 3);
    assert.deepEqual(places, ["Rooms"]);
    assert.deepEqual(kb.knowledge_base.rooms.images, [url(7)]);
  });

  it("a collection with no section goes to the Gallery", () => {
    const { kb, places } = placeImagesInKb(kbFixture(), [{ category: "Pool", match: [], url: url(8) }]);
    assert.deepEqual(places, ["Gallery › Pool"]);
    assert.deepEqual(kb.knowledge_base.gallery.pool, [url(8)]);
  });

  it("a generic word (villa, bathroom) never matches an item on its own", () => {
    const { places } = placeImagesInKb(kbFixture(), [{ category: "Other", match: ["Villa"], matchOnly: true, url: url(9) }]);
    assert.deepEqual(places, []);
  });

  it("Needs review images are not placed", () => {
    assert.deepEqual(placeImagesInKb(kbFixture(), [{ category: "Needs review", url: url(10) }]).places, []);
  });
});

describe("library images (match only)", () => {
  it("placed only when the title matches an item", () => {
    const { places } = placeImagesInKb(kbFixture(), [
      { category: "Rooms", match: ["Aroha Palms Magnifica"], matchOnly: true, url: url(11) },
      { category: "Rooms", match: ["Sunset over the bay"], matchOnly: true, url: url(12) },
    ]);
    assert.deepEqual(places, ["Rooms › Aroha Palms Magnifica"]);
  });
});

describe("moving, removing, finding", () => {
  it("an image already in the document is not added twice", () => {
    const first = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Aroha Palms Majestic", url: url(13) }]).kb;
    const again = placeImagesInKb(first, [{ category: "Rooms", item: "Aroha Palms Majestic", url: url(13) }]);
    assert.equal(again.kb, first);
    assert.deepEqual(again.places, []);
  });

  it("renaming moves the image: removed from the old item, added to the new one", () => {
    const a = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Aroha Palms Magnifica", url: url(14) }]).kb;
    const b = placeImagesInKb(removeImageFromKb(a, url(14)), [{ category: "Rooms", match: ["Aroha Palms Majestic"], url: url(14) }]).kb;
    assert.deepEqual(rooms(b)[0].images, []);
    assert.ok(rooms(b)[1].images.includes(url(14)));
  });

  it("removing the last Gallery image removes the empty Gallery", () => {
    const a = placeImagesInKb(kbFixture(), [{ category: "Pool", url: url(15) }]).kb;
    assert.equal(removeImageFromKb(a, url(15)).knowledge_base.gallery, undefined);
  });

  it("findImagePath names the place in words", () => {
    const a = placeImagesInKb(kbFixture(), [{ category: "Rooms", item: "Aroha Palms Majestic", url: url(16) }]).kb;
    assert.deepEqual(findImagePath(a, url(16)), ["Rooms", "Inventory", "Aroha Palms Majestic", "Images"]);
    assert.equal(findImagePath(a, url(99)), null);
  });

  it("the original document is never mutated", () => {
    const original = kbFixture();
    const snapshot = JSON.stringify(original);
    placeImagesInKb(original, [{ category: "Rooms", item: "Garden Suite", url: url(17) }]);
    assert.equal(JSON.stringify(original), snapshot);
  });

  it("works when sections are at the top level (no knowledge_base wrapper)", () => {
    const flat = kbFixture().knowledge_base;
    const { kb } = placeImagesInKb(flat, [{ category: "Rooms", item: "Aroha Palms Majestic", url: url(18) }]);
    assert.ok(kb.rooms.inventory[1].images.includes(url(18)));
  });
});

import { blankLikeTemplate, formatLabel, isPlainObject, slugifyKey } from "./kbHelpers.js";

// Puts images into the right place of the Knowledge Base document:
//   title "Aroha Palms Majestic" -> rooms.inventory[Aroha Palms Majestic].images
// Items are matched by name. A new item is created only for an explicit import
// title; otherwise the image goes to its section (or the Gallery).

// media collection -> Knowledge Base section
const SECTION_ALIASES = {
  rooms: ["rooms", "room", "bedroom", "bedrooms", "suites", "accommodation", "villas"],
  dining: ["dining", "food_beverage", "food", "restaurant", "restaurants", "menu", "menus", "bar"],
  experiences: ["experiences", "spa", "pool", "activities", "wellness", "amenities"],
  location: ["location", "exterior", "surroundings", "views"],
  buyout_and_events: ["events", "weddings", "banquet", "meetings"],
};
const NAME_KEYS = ["name", "room_name", "title", "room_type", "type", "label"];
const MEDIA_KEYS = {
  image: ["images", "photos", "gallery", "image_urls", "pictures"],
  video: ["videos", "video_urls"],
  document: ["documents", "document_urls"],
  spreadsheet: ["spreadsheets", "documents", "document_urls"],
  presentation: ["presentations", "documents", "document_urls"],
  other: ["documents", "files"],
};
const GALLERY = "gallery"; // collections with no matching section
// single words too common to identify an item on their own
const GENERIC = new Set(["rooms", "villa", "villas", "suite", "suites", "bedroom", "bathroom", "kitchen", "lobby", "garden", "beach", "terrace", "balcony", "image", "photo", "picture"]);

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const sameItem = (a, b) => {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [short, long] = x.length < y.length ? [x, y] : [y, x];
  // "deluxe room" matches "aroha palms deluxe room"; a bare "room" / "villa" matches nothing
  return short.length >= 5 && !GENERIC.has(short) && ` ${long} `.includes(` ${short} `);
};

const nameKeyOf = (item) =>
  NAME_KEYS.find((k) => typeof item?.[k] === "string" && item[k].trim()) ||
  Object.keys(item || {}).find((k) => typeof item[k] === "string") ||
  "name";

const sectionKeyFor = (root, category) => {
  const slug = slugifyKey(category || "");
  if (!slug) return null;
  if (isPlainObject(root[slug]) || Array.isArray(root[slug])) return slug;
  const alias = Object.entries(SECTION_ALIASES).find(([, names]) => names.includes(slug));
  return alias && alias[0] in root ? alias[0] : null;
};

// The list of things in a section (rooms.inventory, dining.outlets...), or null.
const itemListOf = (section) => {
  if (Array.isArray(section)) return section.every(isPlainObject) ? section : null;
  if (!isPlainObject(section)) return null;
  const lists = Object.entries(section).filter(([, v]) => Array.isArray(v) && v.length && v.every(isPlainObject));
  return (lists.find(([k]) => k === "inventory") || lists[0])?.[1] || (Array.isArray(section.inventory) ? section.inventory : null);
};

const entriesOf = (section) => {
  if (isPlainObject(section?.inventory)) {
    return Object.entries(section.inventory).filter(([, entry]) => isPlainObject(entry)).map(([name, entry]) => ({ name, entry }));
  }
  return (itemListOf(section) || []).map((entry) => ({ name: entry[nameKeyOf(entry)], entry }));
};

const addMedia = (target, url, kind = "image") => {
  const keys = Object.hasOwn(MEDIA_KEYS, kind) ? MEDIA_KEYS[kind] : MEDIA_KEYS.other;
  const key = keys.find((candidate) => Array.isArray(target[candidate]) && target[candidate].every((item) => typeof item === "string"))
    || keys.find((candidate) => !Object.hasOwn(target, candidate));
  if (!key) return false;
  target[key] = [...new Set([...(target[key] || []), url])];
  return true;
};

// An existing item anywhere in the document whose name matches (rooms first).
const findItem = (root, names, preferKey) => {
  const keys = [preferKey, ...Object.keys(root).filter((k) => k !== preferKey)].filter(Boolean);
  for (const name of names.filter(Boolean)) {
    for (const key of keys) {
      const items = entriesOf(root[key]);
      const found = items.find((item) => norm(item.name) === norm(name)) || items.find((item) => sameItem(item.name, name));
      if (found) return { key, ...found };
    }
  }
  return null;
};

const SECTION_LABEL = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// p: { category, item, match?, matchOnly?, url }
//   match     - names to look for among existing items (the title, the sub-collection)
//   item      - explicit import title: created in the category's section when missing
//   matchOnly - place only under a matching item (library images)
const placeOne = (root, { category, item, match = [], matchOnly = false, url, mediaKind = "image", roomIdentifier }) => {
  const key = sectionKeyFor(root, category);
  const hit = findItem(root, [roomIdentifier, item, ...match], key);
  if (hit) {
    if (!addMedia(hit.entry, url, mediaKind)) return null;
    return `${SECTION_LABEL(hit.key)} › ${hit.name}`;
  }
  if (matchOnly || !category || /^needs review$/i.test(category)) return null;

  if (!key) {
    root[GALLERY] = isPlainObject(root[GALLERY]) ? root[GALLERY] : {};
    const group = slugifyKey(category);
    const groupKey = mediaKind === "image" ? group : group + "_" + (MEDIA_KEYS[mediaKind]?.[0] || "documents");
    if (Object.hasOwn(root[GALLERY], groupKey) && !Array.isArray(root[GALLERY][groupKey])) return null;
    root[GALLERY][groupKey] = [...new Set([...(root[GALLERY][groupKey] || []), url])];
    return `Gallery › ${category}`;
  }

  const section = root[key];
  const list = itemListOf(section);
  if (item && list) {
    const nameKey = list[0] ? nameKeyOf(list[0]) : "name";
    const entry = { ...(list[0] ? blankLikeTemplate(list[0]) : {}), [nameKey]: item };
    list.push(entry);
    addMedia(entry, url, mediaKind);
    return `${category} › ${item}`;
  }
  if (isPlainObject(section)) {
    if (!addMedia(section, url, mediaKind)) return null;
    return category;
  }
  return null;
};

const rootOf = (kb) => (isPlainObject(kb?.knowledge_base) ? kb.knowledge_base : kb || {});
const withRoot = (kb, root) => (isPlainObject(kb?.knowledge_base) ? { ...kb, knowledge_base: root } : root);

// Removes an image link from wherever it is in the document.
const strip = (value, url) => {
  if (Array.isArray(value)) return value.filter((v) => v !== url).map((v) => strip(v, url));
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, strip(v, url)]));
  return value;
};

// The Gallery is ours: drop groups (and the section) that a move left empty.
const pruneGallery = (root) => {
  if (!isPlainObject(root[GALLERY])) return root;
  const groups = Object.fromEntries(Object.entries(root[GALLERY]).filter(([, v]) => !Array.isArray(v) || v.length));
  const { [GALLERY]: _gallery, ...rest } = root;
  return Object.keys(groups).length ? { ...rest, [GALLERY]: groups } : rest;
};

export const removeImageFromKb = (kb, url) =>
  url && JSON.stringify(rootOf(kb)).includes(url) ? withRoot(kb, pruneGallery(strip(rootOf(kb), url))) : kb;

/**
 * placements: [{ category, item, url }] -> { kb, places: ["Rooms › Deluxe Room", ...] }
 * Images already in the document (same URL) are skipped.
 */
export const placeImagesInKb = (kb, placements) => {
  const root = structuredClone(rootOf(kb));
  const places = [];
  for (const placement of placements) {
    if (!placement.url || findImagePath(root, placement.url)) continue;
    const place = placeOne(root, placement);
    if (place) places.push(place);
  }
  if (!places.length) return { kb, places };
  return { kb: withRoot(kb, root), places };
};

/**
 * Where an image link sits in the document, as readable labels:
 *   ["Rooms", "Inventory", "Aroha Palms Majestic", "Images"]   (null when absent)
 */
export const findImagePath = (kb, url) => {
  if (!url) return null;
  const walk = (value, labels) => {
    if (value === url) return labels;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        const v = value[i];
        const label = isPlainObject(v) ? v[nameKeyOf(v)] || `Item ${i + 1}` : null;
        const found = walk(v, label ? [...labels, label] : labels);
        if (found) return found;
      }
    } else if (isPlainObject(value)) {
      for (const [k, v] of Object.entries(value)) {
        const found = walk(v, [...labels, formatLabel(k)]);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(rootOf(kb), []);
};

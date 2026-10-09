export const emptyKb = {
  url: "",
  knowledge_base: {
    kb_meta: {
      kb_name: "",
      version: "1.0",
      built_on: "",
      source_domain: "",
      default_language: "en",
      currency: "",
      timezone: "",
    },
    business: { brand: "", category: "", positioning: "", description: "" },
    contact: { phone: "", whatsapp: "", email: "", social: {} },
    booking: {},
    location: {},
    rooms: { shared_attributes: {}, inventory: [], inventory_note: "" },
    dining: {},
    experiences: {},
    policies: { cancellation: "", payment: "", other: [] },
    cancellation_policy: {},
    buyout_and_events: {},
    brochures: [],
    chatbot_config: {},
    faqs: [],
    data_gaps: [],
  },
};

// n8n sometimes wraps the generated KB in an array (multiple items),
// sometimes returns it as a plain object — handle both shapes safely.
export const unwrapGeneratedKb = (data) => {
  const payload = data?.knowledgeBase ?? data;
  return Array.isArray(payload) ? payload[0] : payload;
};

// Fields the backend owns: never shown in the editor.
export const HIDDEN_FIELDS = new Set([
  "_id",
  "__v",
  "hid",
  "ndid",
  "createdAt",
  "updatedAt",
  "normalized_source_url",
]);

// Old top-level fields that are now duplicated inside knowledge_base (see
// knowledge_base.faqs, knowledge_base.data_gaps). Hiding them is display-only:
// the document itself is untouched, so nothing breaks if another part of the
// backend still reads them.
export const TOP_LEVEL_LEGACY_KEYS = new Set([
  "locations",
  "offerings",
  "faqs",
  "fields_to_populate",
]);

// "source_domain" -> "Source Domain"
export const formatLabel = (key) =>
  String(key)
    .replace(/[_.]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

// Turns a human-typed label into a safe JSON key: "Spa Services" -> "spa_services".
export const slugifyKey = (label) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// Rough English singularizer for array-item button labels:
// "Rooms" -> "Room", so the button reads "Add Room" instead of "Add item".
export const singularize = (label) => {
  if (/ies$/i.test(label)) return label.replace(/ies$/i, "y");
  if (/ses$/i.test(label)) return label;
  if (/s$/i.test(label) && !/ss$/i.test(label)) return label.slice(0, -1);
  return label;
};

export const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// A value is a "group" (gets its own sub-tab) when it is an object or an
// array. Plain strings/numbers/booleans are leaf fields and stay inline.
export const isGroupValue = (value) => value !== null && typeof value === "object";

// Clones an existing array item's shape but blanks out every leaf value, so
// "Add Room" gives the same fields as the other rooms, empty and ready to fill.
export const blankLikeTemplate = (sample) => {
  if (Array.isArray(sample)) return [];
  if (isPlainObject(sample)) {
    return Object.fromEntries(
      Object.entries(sample).map(([key, value]) => [
        key,
        blankLikeTemplate(value),
      ]),
    );
  }
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  return "";
};

// --- media -----------------------------------------------------------------
// A "media" value is a plain string URL like any other text field. Any string
// whose path ends in an image/video/pdf extension is shown with a thumbnail
// and a Replace button instead of a text box.

export const MEDIA_ACCEPT = "image/*,video/*,application/pdf";

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i;
const MEDIA_EXT_RE =
  /\.(png|jpe?g|gif|webp|svg|bmp|mp4|webm|mov|avi|pdf)(\?.*)?$/i;

export const isImageUrl = (value) => IMAGE_EXT_RE.test(value || "");

export const isMediaUrl = (value) =>
  typeof value === "string" && MEDIA_EXT_RE.test(value.trim());

// --- immutable updates -----------------------------------------------------
// Both helpers copy only the objects along `path` and reuse everything else,
// so editing one field does not clone the whole knowledge base and untouched
// sections keep their identity (which lets React skip re-rendering them).

export const setValueAtPath = (source, path, value) => {
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  const base = isGroupValue(source) ? source : {};
  const copy = Array.isArray(base) ? [...base] : { ...base };
  copy[key] = setValueAtPath(base[key], rest, value);
  return copy;
};

export const deleteValueAtPath = (source, path) => {
  if (path.length === 0 || !isGroupValue(source)) return source;

  const [key, ...rest] = path;

  if (rest.length === 0) {
    if (Array.isArray(source)) {
      return source.filter((_, index) => index !== Number(key));
    }
    const { [key]: _removed, ...kept } = source;
    return kept;
  }

  if (!(key in source)) return source;

  const copy = Array.isArray(source) ? [...source] : { ...source };
  copy[key] = deleteValueAtPath(source[key], rest);
  return copy;
};

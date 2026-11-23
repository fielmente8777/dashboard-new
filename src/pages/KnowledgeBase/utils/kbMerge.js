// Merges what the document import found into the open knowledge base.
//
// Nothing already in the knowledge base is overwritten or removed:
// - objects are merged key by key
// - lists get the new items appended (an item with the same name / title /
//   question as an existing one is merged into it instead of added twice)
// - an empty value is filled in
// - a different value for something already filled in is a CONFLICT: the
//   existing value stays, and the conflict is reported so the hotel can decide

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0) ||
  (isObject(value) && Object.keys(value).length === 0);

const same = (a, b) =>
  typeof a === "string" && typeof b === "string"
    ? a.trim().toLowerCase() === b.trim().toLowerCase()
    : JSON.stringify(a) === JSON.stringify(b);

// what identifies an item in a list of objects
const identity = (item) => {
  if (!isObject(item)) return null;
  const key = item.id ?? item.name ?? item.title ?? item.question ?? item.label;
  return typeof key === "string" && key.trim() ? key.trim().toLowerCase() : null;
};

const mergeValue = (existing, incoming, path, report) => {
  if (isEmpty(incoming)) return existing;
  if (isEmpty(existing)) {
    report.added(path);
    return incoming;
  }

  if (isObject(existing) && isObject(incoming)) {
    const result = { ...existing };
    Object.entries(incoming).forEach(([key, value]) => {
      result[key] = mergeValue(existing[key], value, [...path, key], report);
    });
    return result;
  }

  if (Array.isArray(existing)) {
    const result = [...existing];
    (Array.isArray(incoming) ? incoming : [incoming]).forEach((item) => {
      if (isEmpty(item) || result.some((current) => same(current, item))) return;
      const id = identity(item);
      const match = id ? result.findIndex((current) => identity(current) === id) : -1;
      if (match >= 0) {
        result[match] = mergeValue(result[match], item, [...path, match], report);
      } else {
        result.push(item);
        report.added([...path, result.length - 1]);
      }
    });
    return result;
  }

  if (same(existing, incoming)) return existing;

  // a filled-in value the documents say differently: keep it, report it
  report.conflict(path, existing, incoming);
  return existing;
};

// -> { kb, changedSections: [sectionKey], conflicts: [{ path, existing, incoming }] }
export const mergeDocumentAdditions = (kb, additions) => {
  const changed = new Set();
  const conflicts = [];
  const report = {
    added: (path) => changed.add(path[0]),
    conflict: (path, existing, incoming) => conflicts.push({ path, existing, incoming }),
  };

  const merged = mergeValue(kb?.knowledge_base || {}, additions || {}, [], report);
  return {
    kb: { ...kb, knowledge_base: merged },
    changedSections: [...changed].filter(Boolean),
    conflicts,
  };
};

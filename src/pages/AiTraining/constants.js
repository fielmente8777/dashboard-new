// Keep this list in sync with whatever STATIC_SYSTEM_PROMPT's comment block
// expects, so a rule's category means the same thing on both ends.
// `tone` is the Badge colour.
export const CATEGORIES = [
  { value: "tone", label: "Tone", tone: "sky" },
  { value: "policy", label: "Policy", tone: "amber" },
  { value: "discounts", label: "Discounts", tone: "green" },
  { value: "restricted_topic", label: "Restricted Topic", tone: "red" },
  { value: "escalation", label: "Escalation", tone: "purple" },
  { value: "other", label: "Other", tone: "gray" },
];

export const DEFAULT_CATEGORY = "other";

export const getCategory = (value) =>
  CATEGORIES.find((category) => category.value === value) ||
  CATEGORIES.find((category) => category.value === DEFAULT_CATEGORY);

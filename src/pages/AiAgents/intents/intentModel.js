// Labels for the intent settings (values match gian:
// modules/ai-agents/intent/intentTypes.ts and intentRouter.ts).

export const GROUP_LABELS = {
  general: { label: "General conversation", hint: "Greetings, goodbyes, general questions" },
  product: { label: "Rooms & services", hint: "Rooms, facilities, prices, availability, location" },
  sales: { label: "Sales & leads", hint: "Bookings, quotes, tours, discounts, payments" },
  support: { label: "Guest support", hint: "Complaints, refunds, cancellations, existing bookings" },
  instagram: { label: "Instagram", hint: "Stories, posts, collaborations, creators" },
};

export const SOURCE_LABELS = {
  llm: "AI classifier",
  rules: "Quick rules",
  fallback: "Fallback",
  off: "Rules only",
};

export const DEFAULT_INTENT_SETTINGS = {
  enabled: true,
  classifier: "llm",
  disabled: [],
  descriptions: {},
  confidenceThreshold: 0.55,
  narrowTools: false,
  clarificationMessage: "",
  unsupportedMessage: "",
};

export const CLASSIFIER_OPTIONS = [
  { value: "llm", label: "AI + quick rules (recommended)" },
  { value: "rules", label: "Quick rules only (no extra AI call)" },
];

// "pricing_inquiry" -> "Pricing inquiry"
export const intentLabel = (key = "") => {
  const text = key.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const percent = (value) => (value == null ? "—" : `${Math.round(value * 100)}%`);

// Badge tone per workflow
export const WORKFLOW_TONES = {
  human_handoff: "amber",
  complaint: "red",
  support: "red",
  booking: "green",
  pricing: "green",
  lead_capture: "blue",
  payment: "blue",
  knowledge: "sky",
  clarification: "gray",
  not_handled: "gray",
  greeting: "purple",
  conversation: "purple",
  feedback: "purple",
};

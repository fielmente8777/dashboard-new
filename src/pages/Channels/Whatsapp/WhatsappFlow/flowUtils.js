// What a WhatsApp flow can be created from. `category` is Meta's flow category.
export const FLOW_TEMPLATES = [
  {
    id: "lead-generation",
    category: "LEAD_GENERATION",
    title: "Lead generation",
    description: "Collect a guest's details right inside WhatsApp.",
    screen: "Your details",
    fields: [
      { label: "Full name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Check-in date", type: "date", required: false },
    ],
  },
  {
    id: "feedback-form",
    category: "FEEDBACK_FORM",
    title: "Feedback form",
    description: "Ask guests how their stay went.",
    screen: "Your feedback",
    fields: [
      { label: "Your name", type: "text", required: false },
      { label: "How was your stay?", type: "textarea", required: true },
    ],
  },
];

export const FIELD_TYPES = [
  { value: "text", label: "Short answer" },
  { value: "textarea", label: "Long answer" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
];

export const fieldTypeLabel = (type) =>
  FIELD_TYPES.find((item) => item.value === type)?.label || type;

export const newScreen = (title = "New screen", fields = []) => ({
  id: Date.now() + Math.random(),
  title,
  fields: fields.map((field) => ({ ...field })),
});

// first problem that blocks publishing, or null
export const flowProblem = (screens) => {
  for (const [index, screen] of screens.entries()) {
    const name = screen.title.trim() || `Screen ${index + 1}`;
    if (!screen.title.trim()) return `Screen ${index + 1} needs a title.`;
    if (!screen.fields.length) return `Add at least one field to “${name}”.`;
    if (screen.fields.some((field) => !field.label.trim())) {
      return `Every field on “${name}” needs a label.`;
    }
  }
  return null;
};

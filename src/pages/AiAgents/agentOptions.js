// Labels and choices for the AI agent settings (values match gian:
// modules/ai-agents/types.ts).

export const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly", hint: "Warm and upbeat, like a front-desk host" },
  { value: "professional", label: "Professional", hint: "Polite, clear and efficient" },
  { value: "luxury", label: "Luxury", hint: "Gracious and refined, like a concierge" },
  { value: "casual", label: "Casual", hint: "Relaxed, like chatting with a friend" },
];

export const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "detailed", label: "Detailed" },
];

export const LENGTH_HINTS = {
  short: "1–2 sentences. Best for quick DMs.",
  medium: "2–4 sentences. Reads well on WhatsApp.",
  detailed: "Up to a short paragraph when the question needs it.",
};

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Hinglish",
  "Arabic",
  "French",
  "German",
  "Spanish",
].map((value) => ({ value, label: value }));

// Goals are skills now: pages/AiAgents/skills (built-ins in gian skills/builtinSkills.ts)

// Actions and working hours: pages/AiAgents/actions (actionModel.js, scheduleCore.js)

// Badge tones: components/ui/Badge
export const RUN_STATUS = {
  replied: { label: "Replied", tone: "green" },
  handoff: { label: "Handed over", tone: "amber" },
  skipped: { label: "Skipped", tone: "gray" },
  failed: { label: "Failed", tone: "red" },
};

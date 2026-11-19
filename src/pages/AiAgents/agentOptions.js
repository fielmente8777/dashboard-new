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
  short: "1–2 sentences. Best for Instagram DMs.",
  medium: "2–4 sentences.",
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

export const GOAL_OPTIONS = [
  {
    value: "answer_questions",
    label: "Answer questions",
    hint: "Rooms, amenities, policies, location, from your knowledge base.",
  },
  {
    value: "capture_leads",
    label: "Collect lead details",
    hint: "Asks interested guests for their name, phone, dates and guests.",
  },
  {
    value: "drive_bookings",
    label: "Drive bookings",
    hint: "Checks availability and guides the guest towards booking.",
  },
];

export const ACTION_OPTIONS = [
  {
    key: "checkAvailability",
    label: "Check room availability",
    hint: "Looks up live availability and rates from your booking engine before answering.",
  },
  {
    key: "captureLeadDetails",
    label: "Save guest details to the lead",
    hint: "Name, phone, email, dates and guests the guest shares are saved on their lead.",
  },
  {
    key: "handoffToHuman",
    label: "Hand over to your team",
    hint: "When a guest asks for a person, is upset, or the AI can't help, it stops and alerts your team.",
  },
  {
    key: "createBooking",
    label: "Create bookings",
    hint: "Creates a reservation (with a payment link for online payment) once the guest confirms. Turn on only when your booking engine is connected.",
    warning: true,
  },
];

export const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Monday first on screen
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Muscat",
  "Asia/Kathmandu",
  "Asia/Colombo",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
].map((value) => ({ value, label: value.replace("_", " ") }));

// Badge tones: components/ui/Badge
export const RUN_STATUS = {
  replied: { label: "Replied", tone: "green" },
  handoff: { label: "Handed over", tone: "amber" },
  skipped: { label: "Skipped", tone: "gray" },
  failed: { label: "Failed", tone: "red" },
};

// the channels the AI agents page lists
export const CHANNELS = [
  {
    key: "instagram",
    label: "Instagram",
    description: "Answers DMs to your connected Instagram account.",
    configurable: true,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "On/off and hours are set in Settings → WhatsApp for now.",
    configurable: false,
  },
  {
    key: "voice",
    label: "Voice",
    description: "Call instructions are in AI training → Voice AI for now.",
    configurable: false,
  },
];

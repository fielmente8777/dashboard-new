import { CHATBOT_WIDGET_SCRIPT_URL } from "../../config/env";

export const COLOR_SWATCHES = ["#4F46E5", "#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#111827"];

export const COLOR_FIELDS = [
  { key: "bg_color", label: "Theme colour", hint: "Header and the chat button" },
  { key: "text_color", label: "Header text colour" },
  { key: "button_color", label: "Answer button colour" },
  { key: "button_text_color", label: "Answer button text colour" },
];

export const BEHAVIOUR_TOGGLES = [
  { key: "active", label: "Show on my website", description: "Turn off to hide the chat button without removing the script." },
  { key: "enable_live_chat", label: "Live chat", description: "Let your team take over the conversation." },
  { key: "show_typing_indicator", label: "Typing indicator", description: "Show “…” before each bot message." },
  { key: "show_eazotel_branding", label: "Eazotel branding", description: "Show “Powered by Eazotel” under the chat." },
];

export const isOn = (value) => value === true || value === "true";

const DEFAULTS = {
  bot_name: "",
  email: "",
  contact: "",
  description: "",
  avatar_url: "",
  welcome_message: "",
  fallback_message: "",
  chat_terminate_message: "",
  time_interval: "40",
  active: false,
  enable_live_chat: false,
  show_typing_indicator: false,
  show_eazotel_branding: false,
  bg_color: "#4F46E5",
  text_color: "#FFFFFF",
  button_color: "#4F46E5",
  button_text_color: "#FFFFFF",
  chat_flow: [],
};

// the saved bot as a flat, editable form (the colours live under `theme`)
export const toForm = (bot) => {
  const form = { ...DEFAULTS };
  Object.keys(DEFAULTS).forEach((key) => {
    const saved = COLOR_FIELDS.some((field) => field.key === key)
      ? bot?.theme?.[key] || bot?.[key]
      : bot?.[key];
    if (saved !== undefined && saved !== null && saved !== "") form[key] = saved;
  });
  BEHAVIOUR_TOGGLES.forEach(({ key }) => {
    form[key] = isOn(form[key]);
  });
  form.chat_flow = Array.isArray(bot?.chat_flow) ? bot.chat_flow : [];
  return form;
};

// The questions a new bot starts with. The keys are the ones the chat widget
// turns into a lead (name, email, phone, check-in, check-out, number of guest).
// `active` must be true: the widget skips any question without it.
export const DEFAULT_CHAT_FLOW = [
  { key: "name", question: "May I know your name?", type: "text", active: true },
  { key: "email", question: "What's your email address?", type: "email", active: true },
  { key: "phone", question: "What's your phone number?", type: "number", active: true },
  { key: "check-in", question: "When would you like to check in?", type: "date", active: true },
  { key: "check-out", question: "And when will you check out?", type: "date", active: true },
  {
    key: "number of guest",
    question: "How many guests will be staying?",
    type: "select",
    active: true,
    options: ["1", "2", "3", "4", "5+"].map((count) => ({
      label: count,
      value: count,
      active: true,
    })),
  },
];

// fills an empty bot name, email, phone, messages and questions, so a
// new bot is ready to publish and the user only edits what they want
export const withDefaults = (form, { name, email, phone }) => ({
  ...form,
  bot_name: form.bot_name || name || "",
  email: form.email || email || "",
  contact: form.contact || (phone ? String(phone) : ""),
  welcome_message:
    form.welcome_message ||
    `Welcome to ${name || "our hotel"}! How can I help you today?`,
  fallback_message:
    form.fallback_message || "Sorry, I didn't get that. Please choose one of the options.",
  chat_terminate_message:
    form.chat_terminate_message ||
    "Thank you! Our team will get back to you shortly.",
  chat_flow: form.chat_flow.length ? form.chat_flow : DEFAULT_CHAT_FLOW,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// what must be filled before moving past a step: { field: message }
export const validateStep = (step, form) => {
  const errors = {};
  if (step === "profile") {
    if (!form.bot_name.trim()) errors.bot_name = "Bot name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address";
    if (!String(form.contact).trim()) errors.contact = "Contact number is required";
    else if (String(form.contact).replace(/\D/g, "").length < 7) {
      errors.contact = "Enter a valid phone number";
    }
  }
  if (step === "messages" && !form.welcome_message.trim()) {
    errors.welcome_message = "Welcome message is required";
  }
  return errors;
};

// what the create endpoint expects (the same shape the old page sent)
export const toPayload = (form) => ({
  ...form,
  bot_type: "lead",
  redirection_url: "thankyou",
});

export const installScripts = ({ ndid, hid }) => ({
  html: `<!-- Eazbot -->
<script>
  window.eazbotConfig = {
    ndid: "${ndid || ""}",
    hid: "${hid || ""}",
  };
</script>
<script src="${CHATBOT_WIDGET_SCRIPT_URL}"></script>`,

  nextjs: `{/* Eazbot (Next.js, e.g. in app/layout.jsx) */}
<Script id="eazbot-config" strategy="afterInteractive">
  {\`
    window.eazbotConfig = {
      ndid: "${ndid || ""}",
      hid: "${hid || ""}",
    };
  \`}
</Script>
<Script src="${CHATBOT_WIDGET_SCRIPT_URL}" strategy="afterInteractive" />`,
});

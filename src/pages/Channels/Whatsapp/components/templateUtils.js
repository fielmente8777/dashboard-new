export const CATEGORIES = [
  { value: "UTILITY", label: "Utility", hint: "Booking updates, reminders, receipts" },
  { value: "MARKETING", label: "Marketing", hint: "Offers, promotions, re-engagement" },
  { value: "AUTHENTICATION", label: "Authentication", hint: "One-time passwords" },
];

export const LANGUAGES = [
  { value: "en_US", label: "English (US)" },
  { value: "hi", label: "Hindi" },
];

export const HEADER_TYPES = [
  { value: "NONE", label: "None" },
  { value: "TEXT", label: "Text" },
  { value: "IMAGE", label: "Image" },
];

export const BUTTON_TYPES = [
  { value: "URL", label: "Visit website" },
  { value: "PHONE_NUMBER", label: "Call phone number" },
  { value: "QUICK_REPLY", label: "Quick reply" },
];

export const CATEGORY_TONE = { MARKETING: "purple", UTILITY: "blue", AUTHENTICATION: "amber" };

export const STATUS_TONE = {
  APPROVED: "green",
  PENDING: "amber",
  IN_APPEAL: "amber",
  REJECTED: "red",
  PAUSED: "gray",
  DISABLED: "gray",
};

// unique {{1}}, {{2}}… in the order they first appear
export const extractVariables = (text = "") => [
  ...new Set(String(text).match(/{{\d+}}/g) || []),
];

// "Booking Confirmed!" -> "booking_confirmed"
export const toTemplateName = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);

// a button from Meta or the library, as the form edits it
const toFormButton = (button) => {
  const type =
    button.type === "CALL" ? "PHONE_NUMBER" : BUTTON_TYPES.some((t) => t.value === button.type)
      ? button.type
      : "URL";
  // the library uses a bare "{{n}}" as a stand-in URL; the user enters the real one
  const url = /^{{\d+}}$/.test(button.url || "") ? "" : button.url || "";
  return {
    type,
    text: button.text || "",
    url,
    phone_number: button.phone_number || "",
  };
};

// Meta templates come as `components`, library templates as plain fields.
export const normalizeTemplate = (template) => {
  if (!template) return null;

  if (!template.components) {
    return {
      name: template.name || "",
      language: "en_US",
      category: template.category || "UTILITY",
      headerType: template.header ? "TEXT" : "NONE",
      header: template.header || "",
      body: template.body || "",
      footer: template.footer || "",
      buttons: (template.buttons || []).map(toFormButton),
      headerVariables: [],
      bodyVariables: [],
    };
  }

  const find = (type) => template.components.find((c) => c.type === type);
  const header = find("HEADER");
  const body = find("BODY");

  return {
    id: template.id,
    name: template.name,
    language: template.language,
    category: template.category,
    headerType: header?.format || "NONE",
    header: header?.text || "",
    headerImage: header?.format === "IMAGE" ? header?.example?.header_handle?.[0] || null : null,
    body: body?.text || "",
    footer: find("FOOTER")?.text || "",
    buttons: (find("BUTTONS")?.buttons || []).map(toFormButton),
    headerVariables: header?.example?.header_text || [],
    bodyVariables: body?.example?.body_text?.[0] || [],
  };
};

// buttons as Meta expects them (no empty or unused fields)
export const toMetaButtons = (buttons = []) =>
  buttons.map(({ type, text, url, phone_number: phone }) => {
    if (type === "PHONE_NUMBER") return { type, text, phone_number: phone };
    if (type === "QUICK_REPLY") return { type, text };
    return { type: "URL", text, url };
  });

// first problem with the buttons, or null
export const buttonsProblem = (buttons = []) => {
  for (const [index, button] of buttons.entries()) {
    const n = index + 1;
    if (!button.text?.trim()) return `Button ${n} needs a label.`;
    if (button.type === "URL" && !/^https?:\/\/\S+$/.test(button.url || "")) {
      return `Button ${n} needs a website address starting with https://`;
    }
    if (button.type === "PHONE_NUMBER" && !/^\+?\d{8,15}$/.test((button.phone_number || "").replace(/[\s-]/g, ""))) {
      return `Button ${n} needs a phone number with country code, e.g. +919876543210`;
    }
  }
  return null;
};

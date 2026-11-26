// Small rules shared by the AI agent screens. Same as gian
// (modules/ai-agents/agentConfig.defaults.ts and channels/whatsapp.agent.ts).

export const MAX_TEST_NUMBERS = 3;

// A WhatsApp number as digits (country code included), or "" (E.164: 8-15 digits).
export const normalizeNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : "";
};

// Adds a number to the list: { numbers } or { error } for the form.
export const addTestNumber = (numbers, value) => {
  const digits = normalizeNumber(value);
  if (!digits) return { error: "Enter a WhatsApp number with country code, e.g. +91 98765 43210." };
  if (numbers.includes(digits)) return { error: "That number is already on the list." };
  if (numbers.length >= MAX_TEST_NUMBERS) return { error: `You can add up to ${MAX_TEST_NUMBERS} test numbers.` };
  return { numbers: [...numbers, digits] };
};

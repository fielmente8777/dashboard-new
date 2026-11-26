// The Actions overview (AiSensy-style): business actions, custom API actions
// grouped into intents, and system actions. Same rules as gian
// (actions/actionValidator.ts cleanIntentGroup, actions/runtimeTools.ts toolNameFor).

export const MAX_EXAMPLES = 5;

export const cleanIntentGroup = (value) =>
  typeof value === "string"
    ? value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^(\d)/, "g_$1").slice(0, 40).replace(/_+$/, "")
    : "";

export const toolNameFor = (key, intentGroup) => {
  const group = cleanIntentGroup(intentGroup);
  const room = 64 - key.length - 2;
  if (!group || room < 3) return key;
  return `${group.slice(0, room).replace(/_+$/, "")}__${key}`;
};

// The three sections of the overview
export const groupActions = (actions) => {
  const system = actions.filter((a) => a.isBuiltIn);
  const custom = actions.filter((a) => !a.isBuiltIn);
  const api = custom.filter((a) => a.draft.executor?.type === "http");
  const business = custom.filter((a) => a.draft.executor?.type !== "http");
  const groups = new Map();
  for (const action of api) {
    const group = action.draft.intentGroup || "";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(action);
  }
  // named groups A-Z, ungrouped last
  const intents = [...groups.entries()]
    .sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)))
    .map(([group, items]) => ({ group, actions: items }));
  return { business, intents, system };
};

// Sensitivity = how careful the agent is: maps to riskLevel + confirmation.
export const SENSITIVITY = [
  { value: "low", label: "Low — no confirmation", hint: "Runs without an extra confirmation turn. For look-ups (order status, availability)." },
  { value: "medium", label: "Medium — asks the guest first", hint: "The agent asks the guest to confirm before it runs." },
  { value: "high", label: "High — always confirms", hint: "Always confirmed, across two guest messages. For bookings, payments and anything that changes data." },
];

export const sensitivityOf = (form) => (form.riskLevel === "high" ? "high" : form.requiresConfirmation ? "medium" : "low");

export const applySensitivity = (form, value) => ({
  ...form,
  riskLevel: value,
  requiresConfirmation: value !== "low",
  confirmationText: value === "low" ? form.confirmationText : form.confirmationText || `Shall I go ahead with ${form.name ? form.name.toLowerCase() : "this"}?`,
});

// The badge on a row, from the last dashboard test of the action
export const connectionOf = (action) => {
  const last = action.lastTest;
  if (!last) return { state: "untested", label: "Not tested" };
  if (last.live && last.ok) return { state: "connected", label: "Connected" };
  if (!last.ok) return { state: "failed", label: last.live ? "Failed" : "Check failed" };
  return { state: "checked", label: "Checked (dry run)" };
};

// Examples are typed as "orderId=A-1001, date=2026-12-01"
export const exampleToText = (example) => Object.entries(example || {}).map(([k, v]) => `${k}=${v}`).join(", ");
export const textToExample = (text) =>
  Object.fromEntries(
    String(text || "")
      .split(/,(?=\s*[A-Za-z_][\w]*\s*=)/)
      .map((pair) => pair.split("="))
      .filter(([k, ...rest]) => k?.trim() && rest.length)
      .map(([k, ...rest]) => {
        const raw = rest.join("=").trim();
        const value = /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw === "true" ? true : raw === "false" ? false : raw;
        return [k.trim(), value];
      }),
  );

// {{input.x}} names used in the URL, headers and body (for "Next: variables")
export const placeholdersIn = (http) => {
  const text = [http?.url, http?.bodyTemplate, ...(http?.headers || []).map((h) => h.value)].join(" ");
  return [...new Set([...text.matchAll(/\{\{\s*input\.([a-zA-Z_][\w]*)\s*\}\}/g)].map((m) => m[1]))];
};

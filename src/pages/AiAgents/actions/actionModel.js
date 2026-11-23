// Actions in the dashboard: choices, a blank action, and the same field rules
// as gian modules/ai-agents/actions/actionValidator.ts (inline errors before
// saving; the server validates again and its 422 errors use the same keys).

import { officeHours, validateSchedule } from "./scheduleCore.js";

export const CATEGORIES = [
  { value: "booking", label: "Booking" },
  { value: "leads", label: "Leads" },
  { value: "messaging", label: "Messaging" },
  { value: "payments", label: "Payments" },
  { value: "support", label: "Support" },
  { value: "operations", label: "Operations" },
  { value: "other", label: "Other" },
];

export const EXECUTOR_TYPES = [
  { value: "http", label: "API / Webhook", hint: "Calls your own API or any web service." },
  { value: "n8n", label: "Workflow (n8n)", hint: "Starts an n8n workflow through its webhook." },
  { value: "builtin", label: "Built-in", hint: "Uses an Eazotel feature: leads, WhatsApp, team alerts." },
  { value: "code", label: "Custom code", hint: "Runs your own code. Coming soon." },
];

export const INPUT_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes / no" },
  { value: "enum", label: "Choice" },
];

export const RISK_LEVELS = [
  { value: "low", label: "Low", hint: "Only reads information." },
  { value: "medium", label: "Medium", hint: "Changes something small." },
  { value: "high", label: "High", hint: "Books, charges, cancels or messages the guest. Always asks first." },
];

export const CHANNELS = [
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp (later)" },
  { value: "web", label: "Website chat (later)" },
];

export const SCHEDULE_MODES = [
  { value: "inherit", label: "Same as agent hours" },
  { value: "always", label: "Always on" },
  { value: "custom", label: "Custom schedule" },
];

export const CONDITION_FIELDS = [
  { value: "channel", label: "Channel" },
  { value: "lead.hasPhone", label: "Guest has a phone number" },
  { value: "lead.hasEmail", label: "Guest has an email" },
  { value: "lead.hasName", label: "Guest has a name" },
  { value: "lead.status", label: "Lead status" },
  { value: "input", label: "An input" },
];

export const CONDITION_OPS = [
  { value: "equals", label: "is" },
  { value: "not_equals", label: "is not" },
  { value: "in", label: "is one of" },
  { value: "exists", label: "is set" },
  { value: "not_exists", label: "is not set" },
];

export const CONTEXT_VARS = ["hotelName", "channel", "conversationId", "propertyId", "today", "guestName", "guestPhone", "guestEmail"];
export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ value, label: value }));
export const MASK = "••••••••";

export const typeLabel = (type) => EXECUTOR_TYPES.find((t) => t.value === type)?.label || type;
export const categoryLabel = (category) => CATEGORIES.find((c) => c.value === category)?.label || category;

export const blankAction = (timezone) => ({
  key: "",
  name: "",
  category: "other",
  description: "",
  intents: [],
  inputs: [],
  executor: {
    type: "http",
    http: { method: "POST", url: "", headers: [], bodyTemplate: "", timeoutMs: 8000, retries: 0, auth: { type: "none", headerName: "", token: "" } },
  },
  response: { mappings: [], successTemplate: "", failureTemplate: "", aiInstructions: "" },
  conditions: [],
  requiresConfirmation: false,
  confirmationText: "",
  riskLevel: "medium",
  channels: [],
  rateLimitPerConversation: 0,
  schedule: { mode: "inherit", ...officeHours(timezone) },
  enabled: false,
  sampleInput: {},
  sampleOutput: null,
});

// The editor works on a full copy: missing parts (older records) get defaults.
export const toForm = (spec, timezone) => {
  const blank = blankAction(timezone);
  const http = { ...blank.executor.http, ...(spec.executor?.http || {}) };
  return {
    ...blank,
    ...spec,
    executor: {
      ...spec.executor,
      http: { ...http, auth: { ...blank.executor.http.auth, ...(http.auth || {}), token: "" }, headers: (http.headers || []).map((h) => ({ ...h, value: h.secret ? "" : h.value })) },
      n8n: { webhookUrl: "", secret: "", ...(spec.executor?.n8n || {}) },
      code: { source: "", ...(spec.executor?.code || {}) },
    },
    response: { ...blank.response, ...(spec.response || {}) },
    schedule: { ...blank.schedule, ...(spec.schedule || {}) },
  };
};

// What goes to the API: only the parts for the chosen executor type.
export const toPayload = (form) => {
  const { executor } = form;
  const clean = { ...form, executor: { type: executor.type } };
  if (executor.type === "http") clean.executor.http = executor.http;
  if (executor.type === "n8n") clean.executor.n8n = { webhookUrl: executor.n8n?.webhookUrl || "", secret: executor.n8n?.secret || "" };
  if (executor.type === "builtin") clean.executor.handlerKey = executor.handlerKey || "";
  if (executor.type === "code") clean.executor.code = executor.code;
  return clean;
};

export const keyFromName = (name) =>
  (name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^(\d)/, "a_$1") || "action").slice(0, 48);

const KEY = /^[a-z][a-z0-9_]{2,47}$/;
const NAME = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;
const HEADER = /^[A-Za-z0-9-]{1,64}$/;
const FORBIDDEN_HEADERS = ["host", "content-length", "connection", "transfer-encoding", "cookie", "proxy-authorization"];
const PLACEHOLDER = /\{\{\s*([a-zA-Z_][\w]*(?:\.[\w]+|\[\d+\])*)\s*\}\}/g;
const PATH = /^(\$\.?)?[a-zA-Z_][\w-]*(?:\.[\w-]+|\[\d+\])*$/;
const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|.*\.localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:|\[?fe80:)/i;

const checkUrl = (url) => {
  if (!url) return "Enter the URL to call.";
  const beforeFirst = url.split("{{")[0];
  if (url.includes("{{") && !/^https?:\/\/[^/{}]+\//i.test(beforeFirst)) return "Variables can only be used in the path or query, not in the host.";
  let parsed;
  try {
    parsed = new URL(url.replace(/\{\{[^}]*\}\}/g, "x"));
  } catch {
    return "Enter a full URL, e.g. https://api.example.com/bookings";
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return "Only http and https URLs are allowed.";
  if (parsed.username || parsed.password) return "Put credentials in a header, not in the URL.";
  if (PRIVATE_HOST.test(parsed.hostname)) return "Private, local and internal addresses are not allowed.";
  return null;
};

const unknownPlaceholder = (template, inputNames, outputs = null) => {
  for (const match of String(template || "").matchAll(PLACEHOLDER)) {
    const [scope, name] = match[1].split(/[.[]/);
    const ok = (scope === "input" && inputNames.includes(name)) || (scope === "context" && CONTEXT_VARS.includes(name)) || (scope === "output" && outputs && (outputs.includes(name) || outputs.includes("*")));
    if (!ok) return `{{${match[1]}}} is not available here.`;
  }
  return null;
};

// errors keyed like the server: "name", "executor.http.url", "inputs[2].name"
export const validateAction = (form, { existingKeys = [], isNew = false, isBuiltIn = false, customCodeEnabled = false } = {}) => {
  const errors = {};
  if ((form.description || "").trim().length < 10) errors.description = "Describe when the AI should use this action (at least 10 characters).";
  if (form.requiresConfirmation && !form.confirmationText?.trim()) errors.confirmationText = "Write the question the AI asks before running it.";
  if (form.riskLevel === "high" && !form.confirmationText?.trim()) errors.confirmationText = "High-risk actions always ask first: write the question.";
  if (form.schedule?.mode === "custom") {
    const problems = validateSchedule(form.schedule);
    if (problems.length) errors.schedule = problems.join(" ");
  }
  if (isBuiltIn) return errors;

  if ((form.name || "").trim().length < 2) errors.name = "Give the action a name.";
  if (isNew) {
    const key = form.key || keyFromName(form.name || "");
    if (!KEY.test(key)) errors.key = "Use 3-48 lower-case letters, digits or _ , starting with a letter (e.g. book_spa).";
    else if (existingKeys.includes(key)) errors.key = "Another action already uses this key.";
  }

  const names = [];
  (form.inputs || []).forEach((input, i) => {
    if (!NAME.test(input.name || "")) errors[`inputs[${i}].name`] = "Use letters, digits and _ , starting with a letter (e.g. checkIn).";
    else if (names.includes(input.name)) errors[`inputs[${i}].name`] = `"${input.name}" is used twice.`;
    names.push(input.name);
    if (input.type === "enum" && !(input.enumValues || []).length) errors[`inputs[${i}].enumValues`] = "Add at least one choice.";
    if (input.type === "date" && input.default && !/^\d{4}-\d{2}-\d{2}$/.test(input.default)) errors[`inputs[${i}].default`] = "Use YYYY-MM-DD.";
  });

  const { executor } = form;
  if (executor.type === "code" && !customCodeEnabled) errors["executor.type"] = "Custom code actions are coming soon.";
  if (executor.type === "builtin" && !executor.handlerKey) errors["executor.handlerKey"] = "Choose a built-in handler.";
  if (executor.type === "n8n") {
    const url = executor.n8n?.webhookUrl || "";
    errors["executor.n8n.webhookUrl"] = checkUrl(url) || (url.includes("{{") ? "The webhook URL can't contain variables." : undefined);
    if (!errors["executor.n8n.webhookUrl"]) delete errors["executor.n8n.webhookUrl"];
  }
  if (executor.type === "http") {
    const http = executor.http;
    const urlError = checkUrl(http.url) || unknownPlaceholder(http.url, names);
    if (urlError) errors["executor.http.url"] = urlError;
    if (http.bodyTemplate?.trim()) {
      if (http.method === "GET") errors["executor.http.bodyTemplate"] = "GET requests have no body. Put values in the URL instead.";
      try {
        JSON.parse(http.bodyTemplate);
        const problem = unknownPlaceholder(http.bodyTemplate, names);
        if (problem) errors["executor.http.bodyTemplate"] = problem;
      } catch (error) {
        errors["executor.http.bodyTemplate"] = `The body template is not valid JSON: ${error.message}`;
      }
    }
    (http.headers || []).forEach((header, i) => {
      if (!HEADER.test(header.name || "")) errors[`executor.http.headers[${i}].name`] = "Use letters, digits and -";
      else if (FORBIDDEN_HEADERS.includes(header.name.toLowerCase())) errors[`executor.http.headers[${i}].name`] = `${header.name} is set automatically.`;
      if (header.secret && !header.value && !header.hasSecret) errors[`executor.http.headers[${i}].value`] = "Enter the secret value.";
    });
    const auth = http.auth || {};
    if (auth.type === "header" && !HEADER.test(auth.headerName || "")) errors["executor.http.auth.headerName"] = "Enter the header name, e.g. X-Api-Key.";
    if (auth.type !== "none" && !auth.token && !auth.hasSecret) errors["executor.http.auth.token"] = auth.type === "bearer" ? "Enter the token." : "Enter the key.";
  }

  const outputs = (form.response?.mappings || []).map((m) => m.name);
  (form.response?.mappings || []).forEach((m, i) => {
    if (!NAME.test(m.name || "")) errors[`response.mappings[${i}].name`] = "Use letters, digits and _ , starting with a letter.";
    if (!PATH.test((m.path || "").trim())) errors[`response.mappings[${i}].path`] = "Use a path like data.rooms[0].price";
  });
  const outs = outputs.length ? outputs : ["*"];
  const success = unknownPlaceholder(form.response?.successTemplate, names, outs);
  if (success) errors["response.successTemplate"] = success;
  const failure = unknownPlaceholder(form.response?.failureTemplate, names, outs);
  if (failure) errors["response.failureTemplate"] = failure;

  (form.conditions || []).forEach((c, i) => {
    if (c.field === "input" && !names.includes(c.inputName)) errors[`conditions[${i}].inputName`] = "Choose one of the inputs.";
    if (!["exists", "not_exists"].includes(c.op) && !String(c.value || "").trim()) errors[`conditions[${i}].value`] = "Enter a value.";
  });
  return errors;
};

// Which editor tab shows a field's error
export const TAB_OF_FIELD = (field) => {
  if (field.startsWith("inputs")) return "inputs";
  if (field.startsWith("executor")) return "execution";
  if (field.startsWith("response")) return "response";
  if (field.startsWith("conditions") || field === "schedule") return "conditions";
  if (["key", "rateLimitPerConversation", "channels", "riskLevel"].includes(field)) return "advanced";
  return "general";
};

export const outputsOf = (form) => {
  if (form.response?.mappings?.length) return form.response.mappings.map((m) => ({ name: m.name, type: m.type }));
  return form.executor?.type === "http" || form.executor?.type === "n8n" ? [{ name: "raw", type: "text" }] : [{ name: "result", type: "text" }];
};

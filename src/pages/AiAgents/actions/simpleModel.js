

export const QUESTION_PRESETS = ["name", "phone", "email", "date", "time", "guests", "roomType"];

export const PRESET_INPUTS = {
  name: { type: "text", description: "Guest's full name" },
  phone: { type: "text", description: "Phone number with country code, e.g. +91 98765 43210" },
  email: { type: "text", description: "Email address" },
  date: { type: "date", description: "The day they want" },
  time: { type: "text", description: "The time they want, as HH:mm (24-hour), e.g. 17:00" },
  guests: { type: "number", description: "Number of guests" },
  roomType: { type: "text", description: "The room type they want" },
};

// the label used in automatic messages and notes (server: PRESET_LABELS)
export const PRESET_LABELS = { name: "Name", phone: "Phone", email: "Email", date: "Date", time: "Time", guests: "Guests", roomType: "Room type" };

export const FEATURE_HANDLERS = {
  check_rooms: "check_room_availability",
  make_booking: "create_booking",
  payment_link: null, // coming soon: payment links come with create_booking
  handoff: "handoff_to_human",
};

const HIGH_RISK_FEATURES = ["make_booking", "payment_link"];

export const blankSimple = () => ({
  version: 1,
  name: "",
  whenToUse: "",
  questions: [],
  next: {
    kind: "",
    tellTeam: { channel: "in_app", to: "", toLabel: "", message: "" },
    saveLead: { status: "" },
    reply: { source: "text", text: "", templateName: "" },
    feature: "",
  },
  askFirst: false,
});

export const askFirstDefault = (next) => next.kind === "reply" || (next.kind === "feature" && HIGH_RISK_FEATURES.includes(next.feature));
export const askFirstLocked = (next) => next.kind === "feature" && HIGH_RISK_FEATURES.includes(next.feature);

// "Any food allergies?" -> "anyFoodAllergies" (same as the server)
export const questionKey = (text, taken) => {
  const words = String(text || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 5);
  let base = words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join("").replace(/^\d+/, "").slice(0, 32) || "answer";
  if (QUESTION_PRESETS.includes(base)) base = `${base}Answer`;
  let key = base;
  for (let n = 2; taken.includes(key); n++) key = `${base}${n}`;
  return key;
};

export const toStoredTemplate = (text, keys) =>
  String(text || "").replace(/\{\{\s*([a-zA-Z_]\w*)\s*\}\}/g, (whole, key) => (keys.includes(key) ? `{{input.${key}}}` : whole));
export const fromStoredTemplate = (text) => String(text || "").replace(/\{\{\s*input\.([a-zA-Z_]\w*)\s*\}\}/g, "{{$1}}");

export const questionLabel = (q, copy) => (q.preset === "custom" ? q.text.replace(/[?.:]+$/, "") : copy?.presets?.[q.preset] || PRESET_LABELS[q.preset]);

// The team message when the hotel hasn't written one (the server builds the
// same at run time, leaving out unanswered questions)
export const autoTeamMessage = (config) => {
  const parts = config.questions.map((q) => `${questionLabel(q)}: {{${q.key}}}`);
  return `${config.name || "New request"}${parts.length ? ` - ${parts.join(", ")}` : ""}`;
};

// --- checks (friendly, keyed like the server: "simple.name") -------------

const unknownToken = (text, keys) => [...String(text || "").matchAll(/\{\{\s*([a-zA-Z_]\w*)\s*\}\}/g)].map((m) => m[1]).find((k) => !keys.includes(k));

export const validateSimple = (config, copy) => {
  const e = copy.errors;
  const errors = {};
  if ((config.name || "").trim().length < 2) errors["simple.name"] = e.name;
  if ((config.whenToUse || "").trim().length < 10) errors["simple.whenToUse"] = e.whenToUse;
  const { next } = config;
  if (!next.kind) errors["simple.next.kind"] = e.next;
  if (next.kind !== "feature") {
    config.questions.forEach((q, i) => {
      if (q.preset === "custom" && (q.text || "").trim().length < 2) errors[`simple.questions[${i}].text`] = e.question;
    });
  }
  const keys = config.questions.map((q) => q.key);
  if (next.kind === "tell_team") {
    if (next.tellTeam.channel === "whatsapp" && String(next.tellTeam.to || "").replace(/\D/g, "").length < 8) errors["executor.config.to"] = e.teamNumber;
    const bad = unknownToken(next.tellTeam.message, keys);
    if (bad) errors["simple.next.tellTeam.message"] = e.unknownField.replace("{field}", bad);
  }
  if (next.kind === "save_lead" && next.saveLead.status && !/^[a-z][a-z0-9_ ]*$/i.test(next.saveLead.status)) errors["simple.next.saveLead.status"] = e.status;
  if (next.kind === "reply") {
    if (next.reply.source === "text" && !next.reply.text.trim()) errors["simple.next.reply.text"] = e.replyText;
    if (next.reply.source === "text" && unknownToken(next.reply.text, keys)) errors["simple.next.reply.text"] = e.unknownField.replace("{field}", unknownToken(next.reply.text, keys));
    if (next.reply.source === "template" && !next.reply.templateName) errors["simple.next.reply.templateName"] = e.template;
  }
  if (next.kind === "feature") {
    if (!next.feature) errors["simple.next.feature"] = e.feature;
    else if (!FEATURE_HANDLERS[next.feature]) errors["simple.next.feature"] = e.paymentSoon;
  }
  return errors;
};

// --- compile (mirror of the server) --------------------------------------

const CONFIRMATION = {
  tell_team: "Shall I pass this on to our team?",
  save_lead: "Shall I save these details for you?",
  reply: "Shall I send this to you?",
};
const AI_INSTRUCTIONS = {
  tell_team: "Tell the guest you have passed this to the team and someone will get back to them soon.",
  save_lead: "Thank the guest and tell them their details are saved.",
  reply: "",
};

const questionToInput = (q) =>
  q.preset === "custom"
    ? { name: q.key, type: "text", required: q.required, description: q.text, enumValues: [], default: null }
    : { name: q.key, ...PRESET_INPUTS[q.preset], required: q.required, enumValues: [], default: null };

// handlers: the list API's builtInHandlers ({ key, inputs }): a feature asks
// that handler's own questions
export const compileSimple = (config, base = {}, handlers = []) => {
  const { next } = config;
  const keys = config.questions.map((q) => q.key);
  let inputs = config.questions.map(questionToInput);
  let executor;
  let category;
  let riskLevel = "low";
  let confirmation = CONFIRMATION[next.kind] || "";
  if (next.kind === "tell_team") {
    const t = next.tellTeam;
    category = "support";
    executor = { type: "builtin", handlerKey: "notify_team", config: { channel: t.channel, to: t.channel === "whatsapp" ? t.to : "", toLabel: t.toLabel, messageTemplate: toStoredTemplate(t.message, keys) } };
  } else if (next.kind === "save_lead") {
    category = "leads";
    executor = { type: "builtin", handlerKey: "save_lead_details", config: { status: (next.saveLead.status || "").trim().toLowerCase().replace(/\s+/g, "_") } };
  } else if (next.kind === "reply") {
    category = "messaging";
    if (next.reply.source === "template") {
      riskLevel = "medium";
      executor = { type: "builtin", handlerKey: "send_whatsapp_template", config: { templateName: next.reply.templateName } };
    } else {
      executor = { type: "builtin", handlerKey: "send_quick_reply", config: { text: toStoredTemplate(next.reply.text, keys) } };
    }
  } else {
    const handlerKey = FEATURE_HANDLERS[next.feature] || "check_room_availability";
    category = handlerKey === "handoff_to_human" ? "support" : "booking";
    riskLevel = handlerKey === "create_booking" ? "high" : "low";
    confirmation = handlerKey === "create_booking" ? "Shall I go ahead and book this for you?" : "Shall I go ahead?";
    inputs = handlers.find((h) => h.key === handlerKey)?.inputs || (base.executor?.handlerKey === handlerKey ? base.inputs || [] : []);
    executor = { type: "builtin", handlerKey };
  }
  const requiresConfirmation = riskLevel === "high" || Boolean(config.askFirst);
  return {
    name: config.name.trim(),
    description: config.whenToUse.trim(),
    category,
    inputs,
    executor,
    response: { mappings: [], successTemplate: "", failureTemplate: "", aiInstructions: AI_INSTRUCTIONS[next.kind] || "" },
    requiresConfirmation,
    confirmationText: (base.confirmationText || "").trim() || confirmation,
    riskLevel,
    mode: "simple",
    simpleConfig: config,
    editedInAdvanced: false,
  };
};

// The whole advanced form from a Simple one (fields Simple doesn't own are kept)
export const simpleToForm = (config, form, handlers = []) => ({ ...form, ...compileSimple(config, form, handlers) });

// --- decompile -----------------------------------------------------------

const inputToQuestion = (input) => {
  if (input.default !== null && input.default !== undefined && input.default !== "") return null;
  if (QUESTION_PRESETS.includes(input.name)) return { preset: input.name, key: input.name, text: "", required: Boolean(input.required) };
  if (input.type !== "text") return null;
  return { preset: "custom", key: input.name, text: input.description || "", required: Boolean(input.required) };
};

// spec -> Simple form, or null ("Edited in Advanced": open it there)
export const decompileSimple = (spec) => {
  if (spec.mode === "simple" && spec.simpleConfig) return { ...blankSimple(), ...spec.simpleConfig, next: { ...blankSimple().next, ...spec.simpleConfig.next } };
  const { executor } = spec;
  if (executor?.type !== "builtin") return null;
  if (spec.conditions?.length || spec.channels?.length || spec.response?.mappings?.length) return null;
  const blank = blankSimple();
  const config = executor.config || null;
  const feature = Object.keys(FEATURE_HANDLERS).find((k) => FEATURE_HANDLERS[k] && FEATURE_HANDLERS[k] === executor.handlerKey);
  let next;
  let questions = [];
  if (feature && !config) {
    next = { ...blank.next, kind: "feature", feature };
  } else {
    const mapped = (spec.inputs || []).map(inputToQuestion);
    if (mapped.some((q) => !q) || !config) return null;
    questions = mapped;
    if (executor.handlerKey === "notify_team") next = { ...blank.next, kind: "tell_team", tellTeam: { channel: config.channel || "in_app", to: config.to || "", toLabel: config.toLabel || "", message: fromStoredTemplate(config.messageTemplate) } };
    else if (executor.handlerKey === "save_lead_details") next = { ...blank.next, kind: "save_lead", saveLead: { status: config.status || "" } };
    else if (executor.handlerKey === "send_quick_reply") next = { ...blank.next, kind: "reply", reply: { source: "text", text: fromStoredTemplate(config.text), templateName: "" } };
    else if (executor.handlerKey === "send_whatsapp_template") next = { ...blank.next, kind: "reply", reply: { source: "template", text: "", templateName: config.templateName || "" } };
    else return null;
  }
  return { ...blank, name: spec.name || "", whenToUse: spec.description || "", questions, next, askFirst: Boolean(spec.requiresConfirmation) };
};

// --- right column ----------------------------------------------------------

export const checklist = (config, tried) => [
  { id: "name", done: config.name.trim().length >= 2 },
  { id: "whenToUse", done: config.whenToUse.trim().length >= 10 },
  { id: "questions", done: config.next.kind === "feature" || config.questions.length > 0 },
  { id: "next", done: Boolean(config.next.kind) && (config.next.kind !== "feature" || Boolean(FEATURE_HANDLERS[config.next.feature])) },
  { id: "tried", done: Boolean(tried), optional: true },
];

// What a guest would see: [{ from: "guest" | "bot", text }]
export const sampleChat = (config, copy) => {
  const c = copy.chat;
  const lines = [{ from: "guest", text: guestOpening(config, copy) }];
  const { next } = config;
  if (next.kind === "feature") {
    const asks = c.featureAsks[next.feature];
    if (asks) lines.push({ from: "bot", text: asks });
  } else {
    config.questions.forEach((q) => lines.push({ from: "bot", text: q.preset === "custom" ? q.text : c.ask[q.preset] }));
  }
  if (config.askFirst || askFirstLocked(next)) lines.push({ from: "bot", text: c.confirm }, { from: "guest", text: c.yes });
  const done = next.kind === "tell_team" ? c.doneTeam : next.kind === "save_lead" ? c.doneLead : next.kind === "reply" ? (next.reply.source === "text" && next.reply.text ? next.reply.text : c.doneReply) : next.kind === "feature" ? c.doneFeature[next.feature] || c.doneGeneric : c.doneGeneric;
  lines.push({ from: "bot", text: done });
  return lines;
};

const guestOpening = (config, copy) => {
  const text = config.whenToUse.trim();
  const match = text.match(/(?:wants? to|asks? (?:for|about)|asks? to)\s+([^.,;]+)/i);
  if (match) return copy.chat.guestWants.replace("{what}", match[1].trim());
  return config.name ? copy.chat.guestNamed.replace("{name}", config.name.trim().toLowerCase()) : copy.chat.guestDefault;
};

// --- Try it: a guest's answer -> the value the action expects ---------------

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// returns { ok, value } ; never throws
export const parseAnswer = (type, raw, now = new Date()) => {
  const text = String(raw || "").trim();
  if (!text) return { ok: false };
  const lower = text.toLowerCase();
  if (type === "number") {
    const n = Number((lower.match(/\d+/) || [])[0]);
    return Number.isFinite(n) && n > 0 ? { ok: true, value: n } : { ok: false };
  }
  if (type === "date") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return { ok: true, value: text };
    if (/\b(today|aaj)\b/.test(lower)) return { ok: true, value: iso(now) };
    if (/\b(tomorrow|kal)\b/.test(lower)) return { ok: true, value: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)) };
    const dmy = text.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
    if (dmy) {
      const year = dmy[3] ? (dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3])) : now.getFullYear();
      const d = new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
      return d.getDate() === Number(dmy[1]) ? { ok: true, value: iso(d) } : { ok: false };
    }
    const named = lower.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+([a-z]{3})/) || lower.match(/([a-z]{3})[a-z]*\s+(\d{1,2})/);
    if (named) {
      const [day, mon] = /^\d/.test(named[1]) ? [Number(named[1]), named[2]] : [Number(named[2]), named[1].slice(0, 3)];
      const month = MONTHS.indexOf(mon);
      if (month >= 0) return { ok: true, value: iso(new Date(now.getFullYear(), month, day)) };
    }
    return { ok: false };
  }
  if (type === "time") {
    const t = lower.match(/(\d{1,2})(?::|\.)?(\d{2})?\s*(am|pm|baje)?/);
    if (!t) return { ok: false };
    let h = Number(t[1]);
    const m = Number(t[2] || 0);
    if (t[3] === "pm" && h < 12) h += 12;
    if (t[3] === "am" && h === 12) h = 0;
    return h < 24 && m < 60 ? { ok: true, value: `${pad(h)}:${pad(m)}` } : { ok: false };
  }
  if (type === "phone") return text.replace(/\D/g, "").length >= 8 ? { ok: true, value: text } : { ok: false };
  if (type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? { ok: true, value: text } : { ok: false };
  return { ok: true, value: text };
};

// what kind of answer a question wants (for parseAnswer)
export const answerType = (q) => (q.preset === "custom" ? "text" : { date: "date", time: "time", guests: "number", phone: "phone", email: "email" }[q.preset] || "text");

// What an action does, in plain words
export const plainSubtitle = (action, copy) => {
  const executor = action.draft.executor || {};
  if (executor.type === "http" || executor.type === "n8n") return copy.list.subtitles.own;
  if (executor.type === "code") return copy.list.subtitles.code;
  return copy.list.subtitles[executor.handlerKey] || action.draft.description?.split(".")[0] || "";
};

// Server answer / error -> { text, hint } in plain words (never raw errors)
export const friendlyProblem = (source, copy) => {
  const e = copy.tryIt.errors;
  const h = copy.tryIt.hints;
  if (source?.status === 429) return { text: e.busy, hint: h.busy };
  if (source?.status === 422 && source.data?.errors) return { text: copy.tryIt.fixFirst.replace("{problem}", Object.values(source.data.errors)[0]), hint: h.generic };
  const r = source?.response || {};
  const message = String(source?.error || r.error || "").toLowerCase();
  if (r.status === "missing_inputs") return { text: e.missing, hint: h.missing };
  if (r.status === "action_unavailable_now") return { text: e.unavailable, hint: h.unavailable };
  if (message.includes("template")) return { text: e.template, hint: h.template };
  if (message.includes("no lead")) return { text: e.noLead, hint: h.noLead };
  return { text: e.generic, hint: h.generic };
};

// Words that must never appear in Simple mode (checked by a test on the copy)
export const BANNED_WORDS = ["api", "webhook", "executor", "schema", "payload", "json", "endpoint", "mapping", "header", "intent", "parameter"];

// Built-in actions and ones changed in Advanced have no preview or checklist
export const hasSimpleSidePanel = ({ isBuiltIn, readOnly }) => !isBuiltIn && !readOnly;

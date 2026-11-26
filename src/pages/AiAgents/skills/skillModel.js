// Skills: the form <-> API shape, and the same rules as gian
// (modules/ai-agents/skills/skillValidator.ts) for inline errors.

export const SKILL_LIMITS = {
  name: 60,
  summary: 120,
  goal: 200,
  line: 300,
  triggers: 15,
  steps: 12,
  donts: 8,
  exampleTurns: 6,
  exampleText: 300,
  actions: 8,
  totalChars: 4000,
};

export const ACTION_MENTION = /@([a-z][a-z0-9_]{2,47})\b/g;

const lines = (text) =>
  [...new Set(String(text || "").split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean))];

// "1. Ask the dates" -> "Ask the dates" (the prompt numbers the steps itself)
const stripNumber = (line) => line.replace(/^\d{1,2}[.)]\s+/, "");

// "Guest: hi" / "Assistant: hello" (also "You:" / "AI:") -> turns
export const parseExample = (text) =>
  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(guest|assistant|you|ai|bot)\s*:\s*(.*)$/i);
      if (!match) return { role: "guest", text: line };
      return { role: match[1].toLowerCase() === "guest" ? "guest" : "assistant", text: match[2].trim() };
    })
    .filter((t) => t.text);

export const exampleToText = (turns = []) => turns.map((t) => `${t.role === "guest" ? "Guest" : "Assistant"}: ${t.text}`).join("\n");

export const blankSkill = () => ({
  name: "",
  summary: "",
  goal: "",
  triggers: "",
  steps: "",
  donts: "",
  example: "",
  actionKeys: [],
  enabled: false,
});

export const toSkillForm = (spec) => ({
  name: spec.name || "",
  summary: spec.summary || "",
  goal: spec.goal || "",
  triggers: (spec.triggers || []).join("\n"),
  steps: (spec.steps || []).join("\n"),
  donts: (spec.donts || []).join("\n"),
  example: exampleToText(spec.example),
  actionKeys: [...(spec.actionKeys || [])],
  enabled: Boolean(spec.enabled),
});

export const toSkillPayload = (form) => ({
  name: form.name.trim(),
  summary: form.summary.trim(),
  goal: form.goal.trim(),
  triggers: lines(form.triggers),
  steps: lines(form.steps).map(stripNumber).filter(Boolean),
  donts: lines(form.donts),
  example: parseExample(form.example).slice(0, SKILL_LIMITS.exampleTurns),
  actionKeys: form.actionKeys,
  enabled: Boolean(form.enabled),
});

export const mentionsIn = (text) => [...new Set([...String(text || "").matchAll(ACTION_MENTION)].map((m) => m[1]))];

// characters the skill adds to the prompt (same as the server's skillSize)
export const skillSize = (payload) =>
  [payload.name, payload.goal, ...payload.triggers, ...payload.steps, ...payload.donts, ...payload.example.map((t) => t.text)].join("\n").length;

export const validateSkill = (form, { actionKeys = [] } = {}) => {
  const errors = {};
  const p = toSkillPayload(form);
  if (p.name.length < 2) errors.name = "Give the skill a name.";
  else if (p.name.length > SKILL_LIMITS.name) errors.name = `Keep the name under ${SKILL_LIMITS.name} characters.`;
  if (p.summary.length > SKILL_LIMITS.summary) errors.summary = `Keep it under ${SKILL_LIMITS.summary} characters.`;
  if (p.goal.length < 5) errors.goal = "Write the goal of this skill in one line.";
  else if (p.goal.length > SKILL_LIMITS.goal) errors.goal = `Keep the goal under ${SKILL_LIMITS.goal} characters.`;
  if (p.triggers.length > SKILL_LIMITS.triggers) errors.triggers = `Add at most ${SKILL_LIMITS.triggers} examples.`;
  if (!p.steps.length) errors.steps = "Write at least one step: what should the assistant do?";
  else if (p.steps.length > SKILL_LIMITS.steps) errors.steps = `Write at most ${SKILL_LIMITS.steps} steps.`;
  else if (p.steps.some((s) => s.length > SKILL_LIMITS.line)) errors.steps = `Keep each step under ${SKILL_LIMITS.line} characters.`;
  else {
    const unlinked = mentionsIn(form.steps).filter((k) => !p.actionKeys.includes(k));
    if (unlinked.length) errors.steps = `Add ${unlinked.map((k) => `@${k}`).join(", ")} under "Works together with these actions", or remove it from the steps.`;
  }
  if (p.donts.length > SKILL_LIMITS.donts) errors.donts = `Add at most ${SKILL_LIMITS.donts} lines.`;
  if (parseExample(form.example).length > SKILL_LIMITS.exampleTurns) errors.example = `Use at most ${SKILL_LIMITS.exampleTurns} lines.`;
  if (p.actionKeys.length > SKILL_LIMITS.actions) errors.actionKeys = `Use at most ${SKILL_LIMITS.actions} actions in one skill.`;
  const missing = p.actionKeys.filter((k) => !actionKeys.includes(k));
  if (missing.length && actionKeys.length) errors.actionKeys = `These actions don't exist any more: ${missing.join(", ")}.`;
  return errors;
};

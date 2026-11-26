// The prompt order (Prompt & Rules tab). Same rules as gian
// (modules/ai-agents/runtime/promptLayout.ts): the first and last blocks are
// fixed, built blocks appear once, at most 20 custom rules.

export const FIXED_FIRST = "role_safety";
export const FIXED_LAST = "reminder";
export const MAX_RULES = 20;
export const MAX_RULE_TEXT = 1000;
export const MAX_RULE_TITLE = 80;

export const DEFAULT_BUILT_ORDER = ["style", "skills", "actions", "channel_instructions", "knowledge", "quick_replies", "website", "ai_training"];

// what each block is and where its content is edited (tab = agent builder tab)
export const BLOCK_INFO = {
  role_safety: { title: "Role & safety rules", source: "Eazotel · always first", about: "Who the assistant is, today's date, the fallback reply and the rules that stop it inventing prices, availability or links. Your rules can't change these." },
  style: { title: "Style & language", source: "From Personality", tab: "personality", about: "Tone, reply length, emojis and which language to reply in." },
  skills: { title: "Skills", source: "From Skills", tab: "skills", about: "Your main goal and every skill that is on, in the order of the Skills list." },
  actions: { title: "Actions you can take", source: "From Actions", tab: "actions", about: "One line per action the assistant can use right now." },
  channel_instructions: { title: "Channel instructions", source: "Edit here", editable: true, about: "Anything specific to this channel, for example: mention our weekend brunch when guests ask about food." },
  knowledge: { title: "Hotel knowledge base", source: "From Knowledge", tab: "knowledge", about: "Rooms, prices, policies and facilities from your knowledge base. Usually the biggest block." },
  quick_replies: { title: "Quick replies", source: "From Knowledge", tab: "knowledge", about: "Your saved quick replies, so the assistant can share links and texts from them." },
  website: { title: "Website facts", source: "From Knowledge", tab: "knowledge", about: "Facts you accepted from \"Train from website\". The knowledge base wins if they disagree." },
  ai_training: { title: "AI training rules (shared)", source: "All channels · AI training", training: true, about: "The rules from the AI training page. They are shared with WhatsApp and Voice and keep their High / Normal / Low priority inside this block." },
  reminder: { title: "Final reminder", source: "Eazotel · always last", about: "Repeats the reply language, keeps it short, and that the safety rules at the top win." },
};

const fixed = (id) => ({ id, type: "fixed", enabled: true });

export const isFixed = (block) => block.type === "fixed";

export const newRuleId = () => `r_${Math.random().toString(36).slice(2, 10).padEnd(6, "0")}`;

export const blankRule = () => ({ id: newRuleId(), type: "custom", enabled: true, title: "", text: "", whenSkill: "" });

// Keeps the fixed blocks at the ends whatever happened in between.
export const withFixedEnds = (layout) => [fixed(FIXED_FIRST), ...layout.filter((b) => !isFixed(b)), fixed(FIXED_LAST)];

// Moves a block by one; fixed blocks never move and nothing passes them.
export const moveBlock = (layout, id, delta) => {
  const middle = layout.filter((b) => !isFixed(b));
  const from = middle.findIndex((b) => b.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= middle.length) return layout;
  middle.splice(to, 0, middle.splice(from, 1)[0]);
  return withFixedEnds(middle);
};

// Drop `id` on `targetId`'s place (after it when moving down, before it when moving up)
export const dropBlock = (layout, id, targetId) => {
  const middle = layout.filter((b) => !isFixed(b));
  const from = middle.findIndex((b) => b.id === id);
  const to = middle.findIndex((b) => b.id === targetId);
  if (from < 0 || to < 0 || from === to) return layout;
  middle.splice(from, 1);
  middle.splice(to, 0, layout.find((b) => b.id === id));
  return withFixedEnds(middle);
};

// Default order of the built blocks; the hotel's rules go after Skills.
export const resetOrder = (layout) => {
  const enabled = new Map(layout.map((b) => [b.id, b.enabled]));
  const rules = layout.filter((b) => b.type === "custom");
  const middle = [];
  for (const id of DEFAULT_BUILT_ORDER) {
    middle.push({ id, type: "built", enabled: enabled.get(id) ?? true });
    if (id === "skills") middle.push(...rules);
  }
  return withFixedEnds(middle);
};

export const ruleErrors = (rule) => {
  const errors = {};
  if (!rule.title?.trim()) errors.title = "Give the rule a short title.";
  if ((rule.text || "").trim().length < 5) errors.text = "Write the rule (at least 5 characters).";
  else if (rule.text.trim().length > MAX_RULE_TEXT) errors.text = `Keep the rule under ${MAX_RULE_TEXT} characters.`;
  return errors;
};

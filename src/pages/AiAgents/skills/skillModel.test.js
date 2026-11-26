import assert from "node:assert/strict";
import test from "node:test";
import { dropBlock, moveBlock, resetOrder, ruleErrors } from "../prompt/promptLayoutModel.js";
import { blankSkill, mentionsIn, parseExample, toSkillForm, toSkillPayload, validateSkill } from "./skillModel.js";

const actionKeys = ["check_room_availability", "create_booking"];

test("skill form round-trips and strips step numbers", () => {
  const spec = { name: "Sell", summary: "", goal: "Book rooms", triggers: ["Room?"], steps: ["Ask dates", "Run @check_room_availability"], donts: [], example: [{ role: "guest", text: "Hi" }, { role: "assistant", text: "Hello!" }], actionKeys: ["check_room_availability"], enabled: true };
  assert.deepEqual(toSkillPayload(toSkillForm(spec)), spec);
  const numbered = toSkillPayload({ ...blankSkill(), name: "x", goal: "y", steps: "1. Ask dates\n2) Offer spa" });
  assert.deepEqual(numbered.steps, ["Ask dates", "Offer spa"]);
});

test("example chat lines become turns", () => {
  assert.deepEqual(parseExample("Guest: Hi\nAI: Hello\nYou: Sure\nno label"), [
    { role: "guest", text: "Hi" },
    { role: "assistant", text: "Hello" },
    { role: "assistant", text: "Sure" },
    { role: "guest", text: "no label" },
  ]);
});

test("a step may only mention linked actions", () => {
  const form = { ...blankSkill(), name: "Sell", goal: "Book rooms", steps: "Run @create_booking" };
  assert.match(validateSkill(form, { actionKeys }).steps, /@create_booking/);
  assert.deepEqual(validateSkill({ ...form, actionKeys: ["create_booking"] }, { actionKeys }), {});
  assert.deepEqual(mentionsIn("Run @create_booking then @create_booking"), ["create_booking"]);
});

// --- prompt order ---------------------------------------------------------

const layout = [
  { id: "role_safety", type: "fixed", enabled: true },
  { id: "style", type: "built", enabled: true },
  { id: "r_rule01", type: "custom", enabled: true, title: "Budget", text: "Ask the budget" },
  { id: "skills", type: "built", enabled: false },
  { id: "reminder", type: "fixed", enabled: true },
];
const ids = (l) => l.map((b) => b.id);

test("blocks move by one; fixed blocks never move and nothing passes them", () => {
  assert.deepEqual(ids(moveBlock(layout, "r_rule01", -1)), ["role_safety", "r_rule01", "style", "skills", "reminder"]);
  assert.deepEqual(moveBlock(layout, "style", -1), layout);
  assert.deepEqual(moveBlock(layout, "role_safety", 1), layout);
  assert.deepEqual(ids(dropBlock(layout, "style", "skills")), ["role_safety", "r_rule01", "skills", "style", "reminder"]);
});

test("reset keeps rules (after Skills) and on/off", () => {
  const reset = resetOrder(layout);
  assert.equal(reset[0].id, "role_safety");
  assert.equal(reset[reset.length - 1].id, "reminder");
  assert.equal(ids(reset).indexOf("r_rule01"), ids(reset).indexOf("skills") + 1);
  assert.equal(reset.find((b) => b.id === "skills").enabled, false);
});

test("a rule needs a title and text", () => {
  assert.ok(ruleErrors({ title: "", text: "abc" }).title);
  assert.ok(ruleErrors({ title: "x", text: "abc" }).text);
  assert.deepEqual(ruleErrors({ title: "x", text: "Ask the budget" }), {});
});

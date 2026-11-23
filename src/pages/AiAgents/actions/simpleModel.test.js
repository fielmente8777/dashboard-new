import assert from "node:assert/strict";
import test from "node:test";
import { blankAction, toForm, toPayload } from "./actionModel.js";
import { SIMPLE_COPY } from "./simpleCopy.js";
import { BANNED_WORDS, blankSimple, checklist, compileSimple, decompileSimple, parseAnswer, sampleChat, simpleToForm, validateSimple } from "./simpleModel.js";

const TZ = "Asia/Kolkata";
const en = SIMPLE_COPY.en;

const spa = (next, extra = {}) => ({
  ...blankSimple(),
  name: "Book spa slot",
  whenToUse: "When a guest wants to book a massage or a spa treatment.",
  questions: [
    { preset: "name", key: "name", text: "", required: true },
    { preset: "time", key: "time", text: "", required: true },
    { preset: "custom", key: "anyAllergies", text: "Any allergies?", required: false },
  ],
  next: { ...blankSimple().next, ...next },
  ...extra,
});

test("compile matches the server for every choice (same fixtures as gian simpleActions.unit.test.ts)", () => {
  const team = compileSimple(spa({ kind: "tell_team", tellTeam: { channel: "whatsapp", to: "+919876543210", toLabel: "Front desk", message: "Spa: {{name}} at {{time}}" } }));
  assert.deepEqual(team.executor, { type: "builtin", handlerKey: "notify_team", config: { channel: "whatsapp", to: "+919876543210", toLabel: "Front desk", messageTemplate: "Spa: {{input.name}} at {{input.time}}" } });
  assert.deepEqual(team.inputs.map((i) => [i.name, i.type, i.required]), [["name", "text", true], ["time", "text", true], ["anyAllergies", "text", false]]);
  assert.equal(team.mode, "simple");
  assert.equal(team.riskLevel, "low");

  assert.deepEqual(compileSimple(spa({ kind: "save_lead", saveLead: { status: "Interested" } })).executor.config, { status: "interested" });
  assert.equal(compileSimple(spa({ kind: "reply", reply: { source: "text", text: "Hi {{name}}", templateName: "" } })).executor.config.text, "Hi {{input.name}}");
  assert.equal(compileSimple(spa({ kind: "reply", reply: { source: "template", text: "", templateName: "spa_menu" } })).executor.handlerKey, "send_whatsapp_template");

  const handlers = [{ key: "check_room_availability", inputs: [{ name: "checkIn", type: "text" }, { name: "checkOut", type: "text" }] }];
  const rooms = compileSimple(spa({ kind: "feature", feature: "check_rooms" }), {}, handlers);
  assert.deepEqual(rooms.executor, { type: "builtin", handlerKey: "check_room_availability" });
  assert.deepEqual(rooms.inputs.map((i) => i.name), ["checkIn", "checkOut"]);
  const booking = compileSimple(spa({ kind: "feature", feature: "make_booking" }, { askFirst: false }));
  assert.equal(booking.requiresConfirmation, true, "bookings always ask first");
});

test("simple <-> advanced: the compiled form decompiles back; an Advanced-only edit does not", () => {
  const config = spa({ kind: "tell_team", tellTeam: { channel: "in_app", to: "", toLabel: "", message: "" } });
  const form = simpleToForm(config, toForm(blankAction(TZ), TZ));
  assert.deepEqual(decompileSimple({ ...form, mode: undefined }), { ...config, askFirst: false });
  assert.equal(decompileSimple({ ...form, mode: "advanced", conditions: [{ field: "channel", op: "equals", value: "instagram" }] }), null);
  assert.equal(decompileSimple({ ...form, mode: "advanced", executor: { type: "http", http: {} } }), null);
  // the handler settings reach the server
  assert.deepEqual(toPayload(form).executor, form.executor);
});

test("friendly checks, keyed like the server", () => {
  const errors = validateSimple({ ...blankSimple(), questions: [{ preset: "custom", key: "x", text: "", required: true }] }, en);
  assert.equal(errors["simple.name"], en.errors.name);
  assert.equal(errors["simple.whenToUse"], en.errors.whenToUse);
  assert.equal(errors["simple.next.kind"], en.errors.next);
  assert.equal(errors["simple.questions[0].text"], en.errors.question);
  const wa = validateSimple(spa({ kind: "tell_team", tellTeam: { channel: "whatsapp", to: "12", toLabel: "", message: "Room {{roomNumber}}" } }), en);
  assert.equal(wa["executor.config.to"], en.errors.teamNumber);
  assert.equal(wa["simple.next.tellTeam.message"], "{{roomNumber}} is not one of your questions.");
  assert.equal(validateSimple(spa({ kind: "feature", feature: "payment_link" }), en)["simple.next.feature"], en.errors.paymentSoon);
  assert.deepEqual(validateSimple(spa({ kind: "save_lead", saveLead: { status: "" } }), en), {});
});

test("guest preview and checklist follow the form", () => {
  const config = spa({ kind: "tell_team", tellTeam: { channel: "in_app", to: "", toLabel: "", message: "" } });
  const chat = sampleChat(config, en);
  assert.equal(chat[0].from, "guest");
  assert.equal(chat[0].text, "Hi, I want to book a massage or a spa treatment.");
  assert.deepEqual(chat.slice(1, 4).map((l) => l.text), [en.chat.ask.name, en.chat.ask.time, "Any allergies?"]);
  assert.equal(chat.at(-1).text, en.chat.doneTeam);
  assert.ok(sampleChat({ ...config, askFirst: true }, en).some((l) => l.text === en.chat.confirm));
  assert.deepEqual(checklist(config, false).map((i) => i.done), [true, true, true, true, false]);
  assert.deepEqual(checklist(blankSimple(), false).map((i) => i.done), [false, false, false, false, false]);
});

test("Try it understands answers the way guests write them", () => {
  const now = new Date(2026, 10, 23);
  assert.deepEqual(parseAnswer("time", "5 pm"), { ok: true, value: "17:00" });
  assert.deepEqual(parseAnswer("time", "17:30"), { ok: true, value: "17:30" });
  assert.deepEqual(parseAnswer("date", "kal", now), { ok: true, value: "2026-11-24" });
  assert.deepEqual(parseAnswer("date", "25/12", now), { ok: true, value: "2026-12-25" });
  assert.deepEqual(parseAnswer("date", "3rd Dec", now), { ok: true, value: "2026-12-03" });
  assert.equal(parseAnswer("date", "someday", now).ok, false);
  assert.deepEqual(parseAnswer("number", "we are 3 people"), { ok: true, value: 3 });
  assert.equal(parseAnswer("phone", "98765").ok, false);
  assert.equal(parseAnswer("email", "riya@example.com").ok, true);
});

test("no technical word anywhere in the Simple copy (English and Hindi)", () => {
  const strings = [];
  const walk = (value) => (typeof value === "string" ? strings.push(value) : value && typeof value === "object" && Object.values(value).forEach(walk));
  walk(SIMPLE_COPY);
  const pattern = new RegExp(`\\b(${BANNED_WORDS.join("|")})s?\\b`, "i");
  const bad = strings.filter((s) => pattern.test(s));
  assert.deepEqual(bad, []);
  // both languages have the same keys
  const keys = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
  assert.deepEqual(keys(SIMPLE_COPY.hi).sort(), keys(SIMPLE_COPY.en).sort());
});

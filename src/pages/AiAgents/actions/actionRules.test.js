import assert from "node:assert/strict";
import test from "node:test";
import { blankAction, keyFromName, toForm, toPayload, validateAction } from "./actionModel.js";
import { copyDayToAll, summarizeWeekly, validateSchedule } from "./scheduleCore.js";

const TZ = "Asia/Kolkata";
const week = (days) => ({ timezone: TZ, alwaysOpen: false, exceptions: [], weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: Boolean(days[day]), ranges: days[day] || [] })) });

test("schedule rules match the server: overlaps, midnight, bad zones, exceptions", () => {
  assert.match(validateSchedule(week({ 1: [{ from: "09:00", to: "13:00" }, { from: "12:00", to: "14:00" }] })).join(), /overlap/);
  assert.match(validateSchedule(week({ 1: [{ from: "22:00", to: "03:00" }], 2: [{ from: "02:00", to: "05:00" }] })).join(), /Monday 22:00-03:00 overlaps Tuesday 02:00-05:00/);
  assert.match(validateSchedule(week({ 6: [{ from: "23:00", to: "02:00" }], 0: [{ from: "01:00", to: "03:00" }] })).join(), /overlap/);
  assert.deepEqual(validateSchedule(week({ 1: [{ from: "09:00", to: "13:00" }, { from: "13:00", to: "17:00" }] })), []);
  assert.deepEqual(validateSchedule(week({ 5: [{ from: "18:00", to: "24:00" }] })), []);
  assert.match(validateSchedule({ ...week({ 1: [{ from: "09:00", to: "10:00" }] }), timezone: "Mars/Base" }).join(), /time zone/);
  assert.match(validateSchedule(week({ 1: [] , 2: [{ from: "10:00", to: "10:00" }] })).join(), /same time/);
  assert.match(validateSchedule({ ...week({}), alwaysOpen: true, exceptions: [{ from: "2026-12-24", to: "2026-12-26", closed: true }, { from: "2026-12-26", closed: true }] }).join(), /Exceptions overlap/);
  assert.match(validateSchedule(week({})).join(), /at least one day/);
});

test("weekly summary groups days and shows exceptions", () => {
  const s = week({ 1: [{ from: "09:00", to: "13:00" }, { from: "16:00", to: "22:00" }] });
  const all = { ...s, weekly: copyDayToAll(s.weekly, 1), exceptions: [{ from: "2026-12-25", closed: true }] };
  assert.equal(summarizeWeekly(all), "Mon-Sun 09:00-13:00, 16:00-22:00 · 1 exception");
  assert.equal(summarizeWeekly({ ...s, alwaysOpen: true }), "24/7");
  assert.equal(summarizeWeekly(week({})), "Closed every day");
});

test("action rules match the server's field keys", () => {
  const form = { ...blankAction(TZ), name: "Book spa", description: "Books the spa when asked." };
  form.executor.http.url = "https://{{input.x}}/a";
  form.inputs = [{ name: "date", type: "date" }, { name: "date", type: "enum", enumValues: [] }];
  form.executor.http.bodyTemplate = "{\"a\":";
  form.executor.http.headers = [{ name: "Host", value: "x" }, { name: "X-Key", value: "", secret: true }];
  form.executor.http.auth = { type: "bearer", token: "" };
  form.response.mappings = [{ name: "ref", path: "a..b" }];
  form.response.successTemplate = "Ref {{output.nope}}";
  const errors = validateAction(form, { isNew: true, existingKeys: ["book_spa"] });
  assert.match(errors.key, /already/);
  assert.match(errors["executor.http.url"], /not in the host/);
  assert.match(errors["inputs[1].name"], /twice/);
  assert.match(errors["inputs[1].enumValues"], /choice/);
  assert.match(errors["executor.http.bodyTemplate"], /not valid JSON/);
  assert.match(errors["executor.http.headers[0].name"], /automatically/);
  assert.match(errors["executor.http.headers[1].value"], /secret/);
  assert.match(errors["executor.http.auth.token"], /token/);
  assert.match(errors["response.mappings[0].path"], /path/);
  assert.match(errors["response.successTemplate"], /not available/);

  const ok = { ...blankAction(TZ), name: "Book spa", description: "Books the spa when asked.", inputs: [{ name: "date", type: "date" }] };
  ok.executor.http.url = "https://api.example.com/spa/{{input.date}}";
  assert.deepEqual(validateAction(ok, { isNew: true }), {});
  ok.executor.http.url = "https://192.168.1.4/spa";
  assert.match(validateAction(ok, { isNew: true })["executor.http.url"], /Private/);
});

test("built-ins only check their editable fields; payload keeps the chosen executor only", () => {
  assert.deepEqual(validateAction({ ...blankAction(TZ), description: "Checks rooms for dates.", name: "" }, { isBuiltIn: true }), {});
  const form = toForm({ ...blankAction(TZ), executor: { type: "n8n", n8n: { webhookUrl: "https://n8n.example.com/webhook/1" } } }, TZ);
  assert.deepEqual(Object.keys(toPayload(form).executor), ["type", "n8n"]);
  assert.equal(keyFromName("Book Spa Slot!"), "book_spa_slot");
});

import assert from "node:assert/strict";
import test from "node:test";
import { joinUrl, parseCurl, shellWords, splitUrl } from "./curlParser.js";
import { applySensitivity, cleanIntentGroup, connectionOf, groupActions, placeholdersIn, sensitivityOf, textToExample, exampleToText, toolNameFor } from "./intentModel.js";

test("cURL: method, URL, headers, JSON body; Bearer goes to Auth, keys marked secret", () => {
  const parsed = parseCurl(`curl -X POST 'https://api.spa.example.com/v2/bookings?src=wa' \\
    -H 'Authorization: Bearer sk_live_123' \\
    -H "X-Api-Key: abc" -H 'Content-Type: application/json' \\
    --data-raw '{"date":"2026-12-01","guests":2}'`);
  assert.equal(parsed.method, "POST");
  assert.equal(parsed.url, "https://api.spa.example.com/v2/bookings?src=wa");
  assert.deepEqual(parsed.auth, { type: "bearer", headerName: "", token: "sk_live_123" });
  assert.deepEqual(parsed.headers, [{ name: "X-Api-Key", value: "abc", secret: true }, { name: "Content-Type", value: "application/json", secret: false }]);
  assert.equal(parsed.body, '{\n  "date": "2026-12-01",\n  "guests": 2\n}');
});

test("cURL: GET by default, -G moves data to the query, basic auth is dropped", () => {
  assert.equal(parseCurl("curl https://api.calendly.com/event_types").method, "GET");
  const get = parseCurl("curl -G https://x.example.com/slots -d day=mon -u user:pass");
  assert.equal(get.url, "https://x.example.com/slots?day=mon");
  assert.equal(get.method, "GET");
  assert.ok(!JSON.stringify(get).includes("pass"));
  assert.match(parseCurl("wget https://x.com").error, /starts with curl/);
  assert.match(parseCurl("curl -X OPTIONS https://x.com").error, /not supported/);
  assert.deepEqual(shellWords(`curl "a b" 'c'`), ["curl", "a b", "c"]);
});

test("Params tab: query string <-> rows, placeholders stay readable", () => {
  const { base, params } = splitUrl("https://x.com/orders?id={{input.orderId}}&lang=en%20GB");
  assert.equal(base, "https://x.com/orders");
  assert.deepEqual(params, [{ key: "id", value: "{{input.orderId}}" }, { key: "lang", value: "en GB" }]);
  assert.equal(joinUrl(base, params), "https://x.com/orders?id={{input.orderId}}&lang=en%20GB");
  assert.equal(joinUrl(base, [{ key: "", value: "x" }]), "https://x.com/orders");
});

test("intent groups and tool names match the server", () => {
  assert.equal(cleanIntentGroup("Fetch Order-Status"), "fetch_order_status");
  assert.equal(toolNameFor("order_status", "fetch_order_status"), "fetch_order_status__order_status");
  assert.equal(toolNameFor("order_status", ""), "order_status");
  assert.ok(toolNameFor("k".repeat(48), "g".repeat(40)).length <= 64);
});

test("overview sections: system, business, API actions grouped (ungrouped last)", () => {
  const a = (id, extra) => ({ id, isBuiltIn: false, draft: { executor: { type: "http" }, intentGroup: "", ...extra } });
  const { system, business, intents } = groupActions([
    { id: "s", isBuiltIn: true, draft: { executor: { type: "builtin" } } },
    { id: "b", isBuiltIn: false, draft: { executor: { type: "builtin", handlerKey: "notify_team" } } },
    a("1", { intentGroup: "fetch_order_status" }),
    a("2", {}),
    a("3", { intentGroup: "appointments" }),
  ]);
  assert.deepEqual(system.map((x) => x.id), ["s"]);
  assert.deepEqual(business.map((x) => x.id), ["b"]);
  assert.deepEqual(intents.map((g) => g.group), ["appointments", "fetch_order_status", ""]);
});

test("sensitivity drives risk level and confirmation", () => {
  const low = applySensitivity({ name: "Order status", riskLevel: "high", requiresConfirmation: true, confirmationText: "" }, "low");
  assert.equal(sensitivityOf(low), "low");
  assert.equal(low.requiresConfirmation, false);
  const medium = applySensitivity(low, "medium");
  assert.equal(sensitivityOf(medium), "medium");
  assert.match(medium.confirmationText, /order status/);
  assert.equal(sensitivityOf(applySensitivity(low, "high")), "high");
});

test("connection badge from the last test", () => {
  assert.equal(connectionOf({ lastTest: null }).label, "Not tested");
  assert.equal(connectionOf({ lastTest: { live: true, ok: true } }).label, "Connected");
  assert.equal(connectionOf({ lastTest: { live: true, ok: false } }).label, "Failed");
  assert.equal(connectionOf({ lastTest: { live: false, ok: true } }).state, "checked");
});

test("examples typed as key=value, and placeholders found for variables", () => {
  assert.deepEqual(textToExample("orderId=A-1001, guests=2, vip=true, note=a=b"), { orderId: "A-1001", guests: 2, vip: true, note: "a=b" });
  assert.equal(exampleToText({ orderId: "A-1001", guests: 2 }), "orderId=A-1001, guests=2");
  assert.deepEqual(placeholdersIn({ url: "https://x.com/{{input.orderId}}?d={{ input.date }}", bodyTemplate: '{"g":"{{input.guests}}","h":"{{context.hotelName}}"}', headers: [] }), ["orderId", "date", "guests"]);
});

import assert from "node:assert/strict";
import test from "node:test";
import { addTestNumber, normalizeNumber } from "../agentRules.js";

test("test numbers: digits with country code, 8-15 long (same as gian)", () => {
  assert.equal(normalizeNumber("+91 98765-43210"), "919876543210");
  assert.equal(normalizeNumber("12345"), "");
  assert.equal(normalizeNumber("1".repeat(16)), "");
});

test("test numbers: added once, at most 3, with a message the form can show", () => {
  assert.deepEqual(addTestNumber([], "+91 98765 43210"), { numbers: ["919876543210"] });
  assert.match(addTestNumber(["919876543210"], "919876543210").error, /already/);
  assert.match(addTestNumber([], "abc").error, /country code/);
  assert.match(addTestNumber(["14155550100", "442079460958", "971501234567"], "+91 98765 43210").error, /up to 3/);
});

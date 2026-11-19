import test from "node:test";
import assert from "node:assert/strict";
import {
  BOOKING_STEPS, bookingButtonHtml, buildBookingDeepLink, clientHandoff,
  createDeepLinkDefaults, localDateString,
} from "../src/utils/bookingDeepLink.js";

const today = "2026-11-17";
const config = (extra = {}) => ({ ...createDeepLinkDefaults(), baseUrl: "https://www.hotelwebsite.com/", ...extra });
const build = (extra) => buildBookingDeepLink(config(extra), today);

test("matches the PDF's two-adult/no-children URL contract", () => {
  const result = build({
    baseUrl: "https://www.lumenbkkudomsuk.com/?pid=9ca580c9-341a-40b8-94d6-fc683b7118ee",
    includeDates: true, checkIn: "2026-12-10", checkOut: "2026-12-12", language: "th", currency: "THB",
  });
  assert.deepEqual(result.errors, {});
  assert.ok(result.url.includes("d=2026-12-10%2C2026-12-12"));
  assert.ok(result.url.includes("br=_%2C_%2C_%2C_%2C2%2C0%3A0"));
  const params = new URL(result.url).searchParams;
  assert.equal(params.get("pid"), "9ca580c9-341a-40b8-94d6-fc683b7118ee");
  assert.equal(params.get("p"), "base");
  assert.equal(params.get("c"), "availability");
});

test("preserves hotel paths, unrelated parameters, and URL-encodes values exactly once", () => {
  const result = build({ baseUrl: "https://chain.example/hotelname?pid=old&ref=partner", propertyId: "new", promoCode: "SAVE & STAY+", utmCampaign: "Summer / Winter" });
  const url = new URL(result.url);
  assert.equal(url.pathname, "/hotelname");
  assert.equal(url.searchParams.get("pid"), "new");
  assert.equal(url.searchParams.get("ref"), "partner");
  assert.equal(url.searchParams.get("pc"), "SAVE & STAY+");
  assert.equal(url.searchParams.get("utm_campaign"), "Summer / Winter");
  assert.ok(!result.url.includes("%252C"));
});

test("uses the configured hotel-specific child groups and preserves all positional IDs", () => {
  const result = build({ sessionId: "session", packageId: "package", roomId: "room", rateId: "rate", adults: "3", childGroups: [{ id: "1", count: "0" }, { id: "2", count: "1" }] });
  assert.equal(new URL(result.url).searchParams.get("br"), "session,package,room,rate,3,1:0,2:1");
  assert.equal(new URL(build({ childGroups: [{ id: "hotel-specific", count: "2" }] }).url).searchParams.get("br"), "_,_,_,_,2,hotel-specific:2");
});

test("removes stale managed options from a pasted URL when options are disabled", () => {
  const result = build({ baseUrl: "https://hotel.example/?d=old&fo=true&pc=OLD&pr=OLD&utm_source=old&br=old&p=other&c=checkout", expanded: false });
  const params = new URL(result.url).searchParams;
  for (const key of ["d", "fo", "pc", "pr", "utm_source"]) assert.equal(params.has(key), false);
  assert.equal(params.get("br"), "_,_,_,_,2,0:0");
  assert.equal(params.get("p"), "base");
  assert.equal(params.get("c"), "availability");
});

test("preserves distinct preferred rate and booking-request rate settings", () => {
  const result = build({ rateId: "selected-rate", preferredRate: "68462", promoCode: "SUMMER25", expanded: false });
  const params = new URL(result.url).searchParams;
  assert.equal(params.get("pr"), "68462");
  assert.equal(params.get("br"), "_,_,_,selected-rate,2,0:0");
  assert.equal(params.get("pc"), "SUMMER25");
  assert.equal(params.has("fo"), false); // pc itself expands the engine per the contract.
});

test("supports all documented navigation steps with optional booking IDs", () => {
  for (const step of BOOKING_STEPS) {
    const result = build({ step: step.value });
    assert.equal(new URL(result.url).searchParams.get("c"), step.value);
    assert.equal(new URL(result.url).searchParams.get("br"), "_,_,_,_,2,0:0");
  }
  assert.ok(build({ step: "unknown" }).errors.step);
});

test("rejects missing, invalid, expired and reversed dates", () => {
  for (const dates of [
    { checkIn: "", checkOut: "" }, { checkIn: "2026-11-16", checkOut: "2026-12-01" },
    { checkIn: "2027-02-30", checkOut: "2027-03-02" }, { checkIn: "2026-12-12", checkOut: "2026-12-12" },
    { checkIn: "2026-12-12", checkOut: "2026-12-10" },
  ]) assert.equal(build({ includeDates: true, ...dates }).url, "");
  assert.ok(build({ includeDates: true, checkIn: today, checkOut: "2026-11-18" }).url);
});

test("rejects invalid occupancies, delimiter injection and duplicate child groups", () => {
  for (const adults of ["", "0", "-1", "1.5", "NaN", "Infinity", "9007199254740992"]) assert.ok(build({ adults }).errors.adults);
  assert.ok(build({ roomId: "room,injected" }).errors.roomId);
  assert.ok(build({ childGroups: [{ id: "2", count: "-1" }] }).errors["group-0-count"]);
  assert.ok(build({ childGroups: [{ id: "2:1", count: "1" }] }).errors["group-0-id"]);
  assert.ok(build({ childGroups: [{ id: "2", count: "0" }, { id: "2", count: "1" }] }).errors["group-1-id"]);
});

test("rejects non-public URL schemes, credentials and authentication query parameters", () => {
  for (const baseUrl of ["", "hotel.example", "javascript:alert(1)", "file:///tmp/test", "https://user:password@hotel.example", "https://hotel.example/?token=secret", "https://hotel.example/?ACCESS_TOKEN=secret", "https://hotel.example/#booking"]) {
    assert.ok(build({ baseUrl }).errors.baseUrl, baseUrl);
  }
});

test("validates language tags and currency codes", () => {
  assert.ok(build({ language: "en_US" }).errors.language);
  assert.ok(build({ currency: "RUPEES" }).errors.currency);
  assert.ok(build({ language: "th-TH", currency: "EUR" }).url);
});

test("exports usable HTML and a client handoff with fixed-date guidance", () => {
  assert.equal(bookingButtonHtml('https://hotel.example/?pc="offer"&p=base'), '<a href="https://hotel.example/?pc=&quot;offer&quot;&amp;p=base">Book your stay</a>');
  const settings = config({ includeDates: true, checkIn: "2026-12-10", checkOut: "2026-12-12" });
  const url = buildBookingDeepLink(settings, today).url;
  const handoff = clientHandoff(settings, url);
  assert.ok(handoff.includes(url));
  assert.ok(handoff.includes("2026-12-10 to 2026-12-12"));
  assert.ok(handoff.includes(bookingButtonHtml(url)));
});

test("formats local calendar dates without UTC conversion", () => {
  assert.equal(localDateString(new Date(2026, 10, 17)), "2026-11-17");
});

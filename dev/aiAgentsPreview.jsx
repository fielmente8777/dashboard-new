/* eslint-disable react-refresh/only-export-components -- an entry file, not a module */
// Dev-only preview of the AI Agent Builder with fake data: renders the real
// components (AgentWorkspace and its tabs) and answers their API calls from
// memory, so the screens can be checked and screenshotted without a login or
// a backend. Query: ?tab=actions&theme=dark&action=<id>&dialog=ai
//   ?channel=whatsapp             the WhatsApp agent (draft, testing on a number)
//   ?page=create&channel=whatsapp the create flow (template library)
//   ?page=directory               the AI Agents home
// Never imported by the app.
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "../src/index.css";
import "../src/App.css";
import { ConfirmProvider } from "../src/context/ConfirmContext";
import { ToastProvider } from "../src/context/ToastContext";
import AgentDirectory from "../src/pages/AiAgents/components/AgentDirectory";
import AgentWorkspace from "../src/pages/AiAgents/components/AgentWorkspace";
import { useAgentDraft } from "../src/pages/AiAgents/hooks/useAgentDraft";
import store from "../src/redux/Store.js";
import { applyColorMode } from "../src/redux/slice/themeSlice.js";

const params = new URLSearchParams(location.search);
applyColorMode(params.get("theme") === "dark" ? "dark" : "light");
// ?mode=advanced | simple and ?lang=hi (the Actions tab remembers both in the browser)
try {
  localStorage.setItem("eazotel.actions.mode:me", params.get("mode") === "advanced" ? "advanced" : "simple");
  localStorage.setItem("eazotel.actions.lang", params.get("lang") === "hi" ? "hi" : "en");
  Object.keys(localStorage).filter((k) => k.startsWith("eazotel.actionDraft:")).forEach((k) => localStorage.removeItem(k));
} catch {
  // storage blocked: defaults apply
}

// --- fake data ------------------------------------------------------------

const TZ = "Asia/Kolkata";
const week = (ranges, days = [0, 1, 2, 3, 4, 5, 6]) => [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: days.includes(day), ranges: days.includes(day) ? ranges : [] }));
const workingHours = {
  timezone: TZ,
  alwaysOpen: false,
  weekly: week([{ from: "09:00", to: "13:00" }, { from: "16:00", to: "22:00" }]),
  exceptions: [{ from: "2026-12-25", to: "2026-12-25", closed: true, ranges: [], label: "Christmas" }, { from: "2026-12-31", to: "2026-12-31", closed: false, ranges: [{ from: "10:00", to: "02:00" }], label: "New Year's Eve" }],
  outOfHours: { mode: "auto_message", message: "Thanks for your message! Our team is away right now and will reply {{nextOpen}}.", translations: [{ language: "Hindi", message: "Sandesh ke liye dhanyavaad! Hamari team {{nextOpen}} jawab degi." }] },
};
const config = {
  ndid: "demo", hid: "demo", channel: "instagram", enabled: false,
  persona: { name: "Aria", role: "Guest assistant who answers questions and helps guests plan their stay", tone: "friendly", replyLength: "short", useEmojis: true, languageMode: "auto", language: "English" },
  behaviour: { goals: ["answer_questions", "capture_leads"], instructions: "Mention the rooftop pool when guests ask about facilities.", welcomeMessage: "", fallbackMessage: "Let me check that with our team and get back to you shortly." },
  knowledge: { useQuickReplies: true, useCustomRules: true },
  actions: { checkAvailability: true, createBooking: false, captureLeadDetails: true, handoffToHuman: true },
  schedule: { mode: "custom", timezone: TZ, days: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: true, from: "09:00", to: "22:00" })) },
  workingHours,
  handoff: { keywords: ["human", "manager", "refund"], message: "Connecting you with our team.", pauseHours: 12, maxRepliesPerConversation: 25, notifyTeam: true },
  guardrails: { restrictedTopics: [] },
  replyDelaySeconds: 4,
  template: "",
  channelOptions: { testNumbers: [], replyButtons: false },
};
const snapshot = () => ({
  config, defaults: config, revision: 7, draftSavedAt: "2026-11-23T08:40:00Z", hasDraftChanges: true, pendingActions: 2, connected: true,
  status: { state: "live", active: true, label: "Replying now" }, model: "gpt-5-mini",
});

// the WhatsApp agent: created from the Room Booking template, trained from the website, testing on one number
const PAGE = params.get("page") || "workspace";
const CHANNEL = params.get("channel") === "whatsapp" ? "whatsapp" : "instagram";
const waConfig = {
  ...config, channel: "whatsapp", template: "room_sales",
  persona: { ...config.persona, name: "Tara", role: "Reservations assistant who helps guests choose a room and plan their stay", replyLength: "medium" },
  behaviour: { ...config.behaviour, goals: ["answer_questions", "capture_leads", "drive_bookings"], instructions: "When a guest asks about a stay, find out check-in date, check-out date and number of guests (one question at a time), then check availability.", welcomeMessage: "Welcome to Aroha Palms! How can I help you plan your stay?" },
  knowledge: { ...config.knowledge, website: { url: "https://arohapalms.example.com/", summary: "Boutique beach resort in Candolim, Goa, a 3 minute walk from the beach.", facts: ["Check-in from 2 pm, check-out by 11 am.", "Deluxe Room with sea view sleeps 3, from Rs 6,500 a night including breakfast.", "Family Suite sleeps 5.", "Outdoor pool, spa and an all-day restaurant.", "Candolim beach is a 3 minute walk."], syncedAt: "2026-11-23T08:10:00Z" } },
  channelOptions: { testNumbers: ["919876543210"], replyButtons: true },
};
const waDefaults = { ...config, channel: "whatsapp", persona: { ...config.persona, name: "Aria" }, channelOptions: { testNumbers: [], replyButtons: true }, knowledge: { ...config.knowledge, website: { url: "", summary: "", facts: [], syncedAt: "" } } };
const waSnapshot = () => PAGE === "create"
  ? { config: null, defaults: waDefaults, revision: 0, draftSavedAt: null, hasDraftChanges: false, pendingActions: 0, connected: true, status: { state: "uncreated", active: false, label: "Set up" }, model: "gpt-5-mini" }
  : { config: waConfig, defaults: waDefaults, revision: 3, draftSavedAt: "2026-11-23T09:05:00Z", hasDraftChanges: false, pendingActions: 0, connected: true, status: { state: "draft", active: false, label: "Testing on 1 number" }, model: "gpt-5-mini" };
const templates = [
  ["room_sales", "Room Booking Assistant", "Turns room enquiries into bookings: availability, rates, room types and next steps.", "BedDouble", ["Answers room questions", "Checks live availability", "Recommends room types"], "friendly", ["Do you have a room for 2 adults this weekend?", "What is the price of a deluxe room?", "Kal ke liye family room available hai?"]],
  ["guest_support", "Guest Support & Concierge", "Answers guest questions 24/7: check-in, amenities, policies, directions and in-stay requests.", "ConciergeBell", ["Answers FAQs", "Shares directions & timings", "Logs in-stay requests"], "professional", ["What time is check-in?"]],
  ["lead_qualifier", "Lead Qualifier", "Qualifies enquiries from ads: dates, group size, budget and occasion, then passes hot leads to sales.", "Target", ["Asks screening questions", "Saves lead details", "Tags the occasion"], "friendly", ["Hi, I saw your ad"]],
  ["spa_wellness", "Spa & Wellness", "Suggests treatments, shares prices and timings, and collects a preferred slot for the spa team.", "Flower2", ["Recommends treatments", "Shares spa menu & timings", "Collects preferred slot"], "luxury", ["Do you have couple massages?"]],
  ["events_weddings", "Weddings & Events", "Handles banquet, wedding and corporate event enquiries and briefs your sales manager.", "PartyPopper", ["Shares venues & capacity", "Collects event brief", "Explains packages"], "professional", ["Can you host a wedding for 300 guests?"]],
  ["restaurant", "Restaurant & Dining", "Shares menus and timings and takes table reservation requests for your restaurants.", "UtensilsCrossed", ["Shares menu & timings", "Takes table requests", "Answers dietary questions"], "friendly", ["Table for 4 at 8 pm?"]],
  ["tours_transfers", "Tours & Transfers", "Arranges airport pickups, cabs and local sightseeing requests, and alerts the front desk.", "Plane", ["Collects flight details", "Shares transfer prices", "Suggests local tours"], "friendly", ["Can you arrange an airport pickup?"]],
].map(([id, name, summary, icon, skills, tone, starterQuestions]) => ({ id, name, summary, icon, skills, tone, starterQuestions, bestFor: "", goals: [] }));

const inherit = { mode: "inherit", timezone: TZ, alwaysOpen: false, weekly: week([{ from: "09:00", to: "18:00" }], [1, 2, 3, 4, 5]), exceptions: [] };
const builtIn = (key, name, category, description, enabled, inputs, extra = {}) => ({
  id: key.padEnd(24, "0").slice(0, 24).replace(/[^a-f0-9]/g, "a"), key, isBuiltIn: true, handlerKey: key, position: 0, status: "published", version: 3, aiGenerated: false,
  createdBy: "system", updatedBy: "owner@hotel.test", publishedBy: "owner@hotel.test", createdAt: "2026-11-02T10:00:00Z", updatedAt: "2026-11-20T09:12:00Z", publishedAt: "2026-11-20T09:15:00Z",
  draft: { name, category, description, intents: ["Do you have rooms this weekend?", "Kal ke liye room hai?"], inputs, executor: { type: "builtin", handlerKey: key }, response: { mappings: [], successTemplate: "", failureTemplate: "", aiInstructions: "" }, conditions: [], requiresConfirmation: false, confirmationText: "", riskLevel: "low", channels: [], rateLimitPerConversation: 0, schedule: inherit, enabled, sampleInput: {}, sampleOutput: null, ...extra },
});
const text = (name, description, required = true) => ({ name, type: "text", required, description, enumValues: [], default: null });
let actions = [
  builtIn("check_room_availability", "Check room availability", "booking", "Looks up live room availability and rates from the booking engine. Use it before saying anything about availability or prices for specific dates.", true, [{ ...text("checkIn", "Check-in date, YYYY-MM-DD") }, { ...text("checkOut", "Check-out date, YYYY-MM-DD") }]),
  builtIn("create_booking", "Create booking", "booking", "Creates a reservation once availability is confirmed and the guest clearly wants to book.", false, [text("guestName", "Guest name")], { riskLevel: "high", requiresConfirmation: true, confirmationText: "Shall I go ahead and book this for you?" }),
  builtIn("save_lead_details", "Save lead details", "leads", "Saves the details the guest shares on their lead.", true, [text("name", "", false), text("phone", "With country code", false)]),
  builtIn("handoff_to_human", "Hand over to your team", "support", "Hands the conversation to the hotel team when the guest asks for a person or is upset.", true, [text("reason", "Why")]),
  builtIn("notify_team", "Notify your team", "support", "Sends your team an in-app alert about a special request.", false, [text("message", "What the team should know")]),
  {
    id: "6750aa00000000000000spa1".replace(/[^a-f0-9]/g, "b"), key: "book_spa_slot", isBuiltIn: false, handlerKey: null, position: 6, status: "draft", version: 2, aiGenerated: false,
    createdBy: "owner@hotel.test", updatedBy: "manager@hotel.test", publishedBy: "owner@hotel.test", createdAt: "2026-11-10T07:00:00Z", updatedAt: "2026-11-23T08:30:00Z", publishedAt: "2026-11-18T12:00:00Z",
    draft: {
      name: "Book spa slot", category: "booking", description: "Books a spa treatment when the guest asks for a massage or the spa. Not for room bookings.",
      intents: ["Can I book a massage?", "Is the spa free tomorrow at 5?", "Couple massage for two", "Spa slot chahiye"],
      inputs: [{ name: "date", type: "date", required: true, description: "Treatment day", enumValues: [], default: null }, { name: "time", type: "text", required: true, description: "Start time, e.g. 17:00", enumValues: [], default: null }, { name: "guests", type: "number", required: true, description: "How many people", enumValues: [], default: 1 }, { name: "treatment", type: "enum", required: false, description: "Which treatment", enumValues: ["swedish", "deep_tissue", "aromatherapy"], default: "swedish" }],
      executor: { type: "http", http: { method: "POST", url: "https://api.serenityspa.example.com/v2/bookings", headers: [{ name: "X-Property", value: "{{context.propertyId}}", secret: false }, { name: "X-Api-Key", value: "", secret: true, hasSecret: true }], bodyTemplate: "{\n  \"date\": \"{{input.date}}\",\n  \"time\": \"{{input.time}}\",\n  \"guests\": \"{{input.guests}}\",\n  \"treatment\": \"{{input.treatment}}\",\n  \"guest\": \"{{context.guestName}}\"\n}", timeoutMs: 8000, retries: 1, auth: { type: "none", headerName: "", hasSecret: false } } },
      response: { mappings: [{ name: "ref", path: "data.booking.ref", type: "text" }, { name: "price", path: "data.booking.price", type: "number" }], successTemplate: "Booked! Your spa reference is {{output.ref}}.", failureTemplate: "Sorry, that slot isn't available.", aiInstructions: "Share the reference and time. Mention the price only if asked." },
      conditions: [{ field: "lead.hasPhone", op: "equals", value: "true" }], requiresConfirmation: true, confirmationText: "Shall I book this spa slot for you?", riskLevel: "high", channels: ["instagram"], rateLimitPerConversation: 3,
      schedule: { mode: "custom", timezone: TZ, alwaysOpen: false, weekly: week([{ from: "10:00", to: "20:00" }]), exceptions: [{ from: "2026-12-25", to: "2026-12-25", closed: true, ranges: [], label: "Christmas" }] },
      enabled: true, sampleInput: { date: "2026-12-01", time: "17:00", guests: 2 }, sampleOutput: { data: { booking: { ref: "SPA-1042", price: 4800 } } },
    },
  },
  {
    id: "6750aa0000000000000000a2", key: "airport_pickup", isBuiltIn: false, handlerKey: null, position: 7, status: "draft", version: 0, aiGenerated: true,
    createdBy: "owner@hotel.test", updatedBy: "owner@hotel.test", createdAt: "2026-11-22T10:00:00Z", updatedAt: "2026-11-22T10:00:00Z", publishedAt: null,
    draft: { name: "Airport pickup", category: "operations", description: "Arranges an airport pickup when the guest asks for a transfer from the airport.", intents: ["Can you pick me up?", "Airport transfer please"], inputs: [text("flightNumber", "Flight number"), text("landingTime", "Landing time")], executor: { type: "n8n", n8n: { webhookUrl: "https://n8n.example.com/webhook/pickup", hasSecret: false } }, response: { mappings: [], successTemplate: "Your pickup is arranged.", failureTemplate: "", aiInstructions: "" }, conditions: [], requiresConfirmation: false, confirmationText: "", riskLevel: "medium", channels: [], rateLimitPerConversation: 0, schedule: { ...inherit, mode: "always" }, enabled: false, sampleInput: {}, sampleOutput: null },
  },
];
// made in Simple mode: "Tell my team" on WhatsApp
const spaSimple = {
  version: 1, name: "Spa callback", whenToUse: "When a guest wants to book a massage or a spa treatment.",
  questions: [{ preset: "name", key: "name", text: "", required: true }, { preset: "phone", key: "phone", text: "", required: true }, { preset: "time", key: "time", text: "", required: true }, { preset: "custom", key: "anyAllergies", text: "Any allergies?", required: false }],
  next: { kind: "tell_team", tellTeam: { channel: "whatsapp", to: "+91 98765 43210", toLabel: "Front desk", message: "" }, saveLead: { status: "" }, reply: { source: "text", text: "", templateName: "" }, feature: "check_rooms" },
  askFirst: false,
};
actions.push({
  id: "6750aa0000000000000000c3", key: "spa_callback", isBuiltIn: false, handlerKey: null, position: 8, status: "published", version: 1, aiGenerated: false,
  createdBy: "owner@hotel.test", updatedBy: "owner@hotel.test", createdAt: "2026-11-22T10:00:00Z", updatedAt: "2026-11-22T10:00:00Z", publishedAt: "2026-11-22T10:05:00Z",
  draft: {
    name: spaSimple.name, category: "support", description: spaSimple.whenToUse, intents: ["Spa book karna hai", "Massage at 5?"],
    inputs: [text("name", "Guest's full name"), text("phone", "Phone number with country code, e.g. +91 98765 43210"), text("time", "The time they want, as HH:mm (24-hour), e.g. 17:00"), text("anyAllergies", "Any allergies?", false)],
    executor: { type: "builtin", handlerKey: "notify_team", config: { channel: "whatsapp", to: "+919876543210", toLabel: "Front desk", messageTemplate: "" } },
    response: { mappings: [], successTemplate: "", failureTemplate: "", aiInstructions: "Tell the guest you have passed this to the team and someone will get back to them soon." },
    conditions: [], requiresConfirmation: false, confirmationText: "Shall I pass this on to our team?", riskLevel: "low", channels: [], rateLimitPerConversation: 0, schedule: inherit, enabled: true, sampleInput: {}, sampleOutput: null,
    mode: "simple", simpleConfig: spaSimple, editedInAdvanced: false,
  },
});
// API actions grouped into intents (AiSensy-style overview)
actions.push({
  id: "6750aa0000000000000000d4", key: "booking_status", isBuiltIn: false, handlerKey: null, position: 9, status: "published", version: 2, aiGenerated: false,
  createdBy: "owner@hotel.test", updatedBy: "owner@hotel.test", createdAt: "2026-11-21T10:00:00Z", updatedAt: "2026-11-22T10:00:00Z", publishedAt: "2026-11-22T10:05:00Z",
  lastTest: { live: true, ok: true, status: 200, error: null, at: "2026-11-23T07:55:00Z" },
  draft: {
    name: "Booking status", category: "booking", description: "When a guest asks about an existing booking, look it up by the booking ID and tell them its status.", intents: ["Is my booking confirmed?", "Booking ID EZ-2231 status"],
    inputs: [text("bookingId", "Booking ID from the confirmation email")], intentGroup: "fetch_booking_status", examples: [{ bookingId: "EZ-2231" }],
    executor: { type: "http", http: { method: "GET", url: "https://pms.example.com/api/bookings/{{input.bookingId}}?fields=status,checkIn", headers: [{ name: "Content-Type", value: "application/json", secret: false }], bodyTemplate: "", timeoutMs: 8000, retries: 1, auth: { type: "bearer", headerName: "", hasSecret: true } } },
    response: { mappings: [], successTemplate: "", failureTemplate: "", aiInstructions: "Tell the guest the status and their check-in date." },
    conditions: [], requiresConfirmation: false, confirmationText: "", riskLevel: "low", channels: [], rateLimitPerConversation: 0, schedule: { ...inherit, mode: "always" }, enabled: true, sampleInput: {}, sampleOutput: null,
  },
});
actions.push({
  id: "6750aa0000000000000000e5", key: "spa_slots", isBuiltIn: false, handlerKey: null, position: 10, status: "draft", version: 0, aiGenerated: false,
  createdBy: "owner@hotel.test", updatedBy: "owner@hotel.test", createdAt: "2026-11-23T06:00:00Z", updatedAt: "2026-11-23T06:00:00Z", publishedAt: null, lastTest: null,
  draft: {
    name: "Get available spa slots", category: "booking", description: "When a guest asks which spa times are free on a day, list the open slots.", intents: ["Spa free tomorrow?"],
    inputs: [{ name: "date", type: "date", required: true, description: "The day", enumValues: [], default: null }], intentGroup: "spa_bookings", examples: [],
    executor: { type: "http", http: { method: "GET", url: "https://api.serenityspa.example.com/v2/slots?date={{input.date}}", headers: [], bodyTemplate: "", timeoutMs: 8000, retries: 0, auth: { type: "header", headerName: "X-Api-Key", hasSecret: true } } },
    response: { mappings: [], successTemplate: "", failureTemplate: "", aiInstructions: "" },
    conditions: [], requiresConfirmation: false, confirmationText: "", riskLevel: "low", channels: [], rateLimitPerConversation: 0, schedule: inherit, enabled: true, sampleInput: {}, sampleOutput: null,
  },
});
actions.find((a) => a.key === "book_spa_slot").draft.intentGroup = "spa_bookings";
actions.find((a) => a.key === "book_spa_slot").lastTest = { live: false, ok: true, status: null, error: null, at: "2026-11-22T12:00:00Z" };
const toolNameOf = (a) => (a.draft.intentGroup ? `${a.draft.intentGroup}__${a.key}` : a.key);
actions = actions.map((a, i) => ({ ...a, position: i, toolName: toolNameOf(a) }));
const list = () => ({
  actions,
  counts: { all: actions.length, enabled: actions.filter((a) => a.draft.enabled).length, custom: actions.filter((a) => !a.isBuiltIn).length, unpublished: actions.filter((a) => a.status === "draft").length },
  builtInHandlers: actions.filter((a) => a.isBuiltIn).map((a) => ({ key: a.key, name: a.draft.name, description: a.draft.description, inputs: a.draft.inputs, riskLevel: a.draft.riskLevel })),
  liveTestHandlers: ["notify_team", "check_room_availability", "send_quick_reply"],
  customCodeEnabled: false,
});
const availability = () => ({
  now: new Date().toISOString(), timezone: TZ, agent: { open: false, nextOpenAt: "2026-11-24T03:30:00Z", timezone: TZ },
  actions: actions.map((a) => {
    const open = a.draft.schedule.mode === "always";
    return { id: a.id, key: a.key, open, nextOpenAt: open ? null : a.key === "book_spa_slot" ? "2026-11-24T04:30:00Z" : "2026-11-24T03:30:00Z", timezone: TZ, live: { open, nextOpenAt: null, timezone: TZ } };
  }),
});

// --- fake API -------------------------------------------------------------

const ok = (result) => new Response(JSON.stringify({ success: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url, location.href);
  const method = (init.method || (typeof input === "object" && input.method) || "GET").toUpperCase();
  const body = typeof input === "object" && input.text ? await input.clone().text() : init.body;
  const data = body ? JSON.parse(body) : {};
  const path = url.pathname;
  if (!path.includes("/api/")) return realFetch(input, init);
  await new Promise((r) => setTimeout(r, 120));

  if (path.endsWith("/instagram/accounts")) return ok({ accounts: [{ igUsername: "seaviewresort" }, { igUsername: "seaview_spa" }] });
  if (path.endsWith("/ai-agents/instagram")) return ok(snapshot());
  if (path.endsWith("/ai-agents/whatsapp")) return ok(waSnapshot());
  if (path.endsWith("/ai-agents/templates")) return ok({ templates });
  if (path.endsWith("/ai-agents/whatsapp/test")) {
    return ok({ reply: "Lovely! For this weekend I can offer our Deluxe Room with sea view from Rs 6,500 a night with breakfast. Shall I check your exact dates?", buttons: ["Check my dates", "See room types", "Talk to the team"], handoff: false, toolsUsed: [], sources: ["Knowledge base"], chargedCredits: 1.2, latencyMs: 1840, promptChars: 5200, tools: ["check_room_availability", "save_lead_details", "handoff_to_human"], actionCalls: [] });
  }
  if (path.endsWith("/setup/website")) {
    const root = String(data.url).replace(/\/$/, "");
    return ok({ url: data.url, pages: [data.url, `${root}/rooms`, `${root}/dining`], propertyName: "Aroha Palms", summary: "Boutique beach resort in Candolim, Goa, a 3 minute walk from the beach.", welcomeMessage: "Welcome to Aroha Palms, Goa! How can I help you plan your stay?", facts: waConfig.knowledge.website.facts.concat(["Airport transfers from Goa airport on request.", "Pets are not allowed."]), template: "room_sales", chargedCredits: 2.4 });
  }
  if (path.endsWith("/actions/availability")) return ok(availability());
  if (path.endsWith("/actions/generate/estimate")) return ok({ chargingEnabled: true, estimatedCredits: 6 });
  if (path.endsWith("/actions/generate") && data.shape === "simple") {
    return ok({ simple: { ...spaSimple, name: "Book spa slot", questions: spaSimple.questions.slice(0, 3), next: { ...spaSimple.next, tellTeam: { channel: "whatsapp", to: "", toLabel: "", message: "" } } }, intents: ["Spa book karna hai", "Massage slot milega?", "Can I book a spa at 5?", "Book a massage for 2", "मसाज बुक करना है", "Spa kab khula hai"], chargedCredits: 3 });
  }
  const tryReport = (spec, input) => {
    const cfg = spec?.executor?.config || {};
    const values = (spec?.inputs || []).filter((i) => input?.[i.name]).map((i) => `${{ name: "Name", phone: "Phone", time: "Time" }[i.name] || i.description.replace(/[?.]$/, "")}: ${input[i.name]}`).join(", ");
    const wouldDo = spec?.executor?.handlerKey === "notify_team" ? `Would tell ${cfg.toLabel || cfg.to || "your team"} ${cfg.channel === "whatsapp" ? "on WhatsApp" : "in the Eazotel app"}: "${cfg.messageTemplate || `${spec.name} - ${values}`}"` : undefined;
    return { dryRun: true, latencyMs: 90, error: null, request: null, response: { success: true, simulated: true, wouldDo } };
  };
  if (path.endsWith("/actions/try")) return ok(tryReport(data.action, data.input));
  if (path.endsWith("/actions") && method === "POST") {
    const created = { id: `6750aa00000000000000${String(actions.length).padStart(4, "0")}`, key: (data.action.name || "new").toLowerCase().replace(/[^a-z0-9]+/g, "_"), isBuiltIn: false, position: actions.length, status: "draft", version: 0, createdBy: "owner@hotel.test", updatedAt: new Date().toISOString(), draft: data.action };
    actions.push(created);
    return ok(created);
  }
  if (path.endsWith("/actions/generate")) return ok({ draft: { ...actions[6].draft, key: "airport_pickup_2" }, scheduleReason: "Same as the agent", chargedCredits: 3 });
  if (path.endsWith("/actions") && method === "GET") return ok(list());
  const id = path.match(/\/actions\/([^/]+)/)?.[1];
  const action = actions.find((a) => a.id === id);
  if (path.endsWith("/toggle") && action) { action.draft.enabled = data.enabled; action.status = "draft"; return ok(action); }
  if (path.endsWith("/test") && action && data.action?.mode === "simple") return ok(tryReport(data.action, data.input));
  if (path.endsWith("/test") && action) {
    return ok({ dryRun: !data.live, latencyMs: 214, error: null,
      request: { method: "POST", url: "https://api.serenityspa.example.com/v2/bookings", headers: { "User-Agent": "Eazotel-AI-Agent/1.0", "X-Property": "demo", "X-Api-Key": "••••••••", "Content-Type": "application/json" }, body: { date: "2026-12-01", time: "17:00", guests: 2, treatment: "swedish", guest: "" } },
      response: { success: true, simulated: true, data: { ref: "SPA-1042", price: 4800 }, message: "Booked! Your spa reference is SPA-1042." } });
  }
  if (method === "PUT" && action) { action.draft = { ...action.draft, ...data.action }; action.updatedAt = new Date().toISOString(); action.status = "draft"; return ok(action); }
  if (path.endsWith("/activity")) return ok({ runs: [], last7Days: {}, summary: {} });
  return ok(null);
};

// --- page -----------------------------------------------------------------

const Preview = () => {
  const agent = useAgentDraft({ channel: CHANNEL, hid: "demo" });
  if (PAGE === "directory") return <AgentDirectory hid="demo" />;
  if (!agent.snapshot) return <p style={{ padding: 24 }}>Loading…</p>;
  if (agent.snapshot.status.state === "uncreated") return <AgentDirectory hid="demo" createAgent={agent} />;
  return <AgentWorkspace agent={agent} hid="demo" />;
};

const Shell = () => (
  <ToastProvider>
    <ConfirmProvider>
      <div className="min-h-screen bg-app-bg text-app-text"><Outlet /></div>
    </ConfirmProvider>
  </ToastProvider>
);

const router = createBrowserRouter([{ path: "*", element: <Shell />, children: [{ path: "*", element: <Preview /> }] }]);
createRoot(document.getElementById("root")).render(<Provider store={store}><RouterProvider router={router} /></Provider>);

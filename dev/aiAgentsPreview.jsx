// Dev-only preview of the AI Agent Builder with fake data: renders the real
// components (AgentWorkspace and its tabs) and answers their API calls from
// memory, so the screens can be checked and screenshotted without a login or
// a backend. Query: ?tab=actions&theme=dark&action=<id>&dialog=ai
// Never imported by the app.
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "../src/index.css";
import "../src/App.css";
import { ConfirmProvider } from "../src/context/ConfirmContext";
import { ToastProvider } from "../src/context/ToastContext";
import AgentWorkspace from "../src/pages/AiAgents/components/AgentWorkspace";
import { useAgentDraft } from "../src/pages/AiAgents/hooks/useAgentDraft";
import store from "../src/redux/Store.js";
import { applyColorMode } from "../src/redux/slice/themeSlice.js";

const params = new URLSearchParams(location.search);
applyColorMode(params.get("theme") === "dark" ? "dark" : "light");

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
};
const snapshot = () => ({
  config, defaults: config, revision: 7, draftSavedAt: "2026-11-23T08:40:00Z", hasDraftChanges: true, pendingActions: 2, connected: true,
  status: { state: "live", active: true, label: "Replying now" }, model: "gpt-5-mini",
});

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
actions = actions.map((a, i) => ({ ...a, position: i }));
const list = () => ({
  actions,
  counts: { all: actions.length, enabled: actions.filter((a) => a.draft.enabled).length, custom: actions.filter((a) => !a.isBuiltIn).length, unpublished: actions.filter((a) => a.status === "draft").length },
  builtInHandlers: actions.filter((a) => a.isBuiltIn).map((a) => ({ key: a.key, name: a.draft.name, description: a.draft.description })),
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
  if (path.endsWith("/actions/availability")) return ok(availability());
  if (path.endsWith("/actions/generate/estimate")) return ok({ chargingEnabled: true, estimatedCredits: 6 });
  if (path.endsWith("/actions/generate")) return ok({ draft: { ...actions[6].draft, key: "airport_pickup_2" }, scheduleReason: "Same as the agent", chargedCredits: 3 });
  if (path.endsWith("/actions") && method === "GET") return ok(list());
  const id = path.match(/\/actions\/([^/]+)/)?.[1];
  const action = actions.find((a) => a.id === id);
  if (path.endsWith("/toggle") && action) { action.draft.enabled = data.enabled; action.status = "draft"; return ok(action); }
  if (path.endsWith("/test") && action) {
    return ok({ dryRun: !data.live, latencyMs: 214, error: null,
      request: { method: "POST", url: "https://api.serenityspa.example.com/v2/bookings", headers: { "User-Agent": "Eazotel-AI-Agent/1.0", "X-Property": "demo", "X-Api-Key": "••••••••", "Content-Type": "application/json" }, body: { date: "2026-12-01", time: "17:00", guests: 2, treatment: "swedish", guest: "" } },
      response: { success: true, simulated: true, data: { ref: "SPA-1042", price: 4800 }, message: "Booked! Your spa reference is SPA-1042." } });
  }
  if (method === "PUT" && action) { action.draft = { ...action.draft, ...data.action }; action.updatedAt = new Date().toISOString(); action.status = "draft"; return ok(action); }
  if (path.endsWith("/ai-agents/instagram/activity")) return ok({ runs: [], last7Days: {}, summary: {} });
  return ok(null);
};

// --- page -----------------------------------------------------------------

const Preview = () => {
  const agent = useAgentDraft({ channel: "instagram", hid: "demo" });
  if (!agent.snapshot) return <p style={{ padding: 24 }}>Loading…</p>;
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

import { API_URLS } from "../config/env";
import { getToken } from "../utils/session";

// "Ask Eazotel AI" is served by the Node API (gian: /api/v1/chatbot).
const API_URL = `${API_URLS.node}/api/v1`;

async function request(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Login token missing. Please log in again.");
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  let response;
  try {
    // "omit": aapka backend CORS origin '*' use karta hai, jo credentials "include" ke saath browser block kar deta hai
    response = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: "omit" });
  } catch (cause) {
    const error = new Error(import.meta.env.DEV
      ? `Cannot reach ${API_URL}. Is the backend running, and does CORS allow this origin?`
      : "Cannot reach the server. Please check your connection and try again.");
    error.cause = cause;
    throw error;
  }

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Backend ki asli wajah dikhao ("no tenant", "bad token", "model error"...).
    const backendMessage = typeof payload === "object" && payload ? (payload.message || payload.responseMessage) : null;
    const error = new Error(backendMessage || (response.status === 401 ? "Authentication failed" : `Request failed (${response.status})`));
    error.status = response.status;
    // e.g. { conversationId } when the user message was saved but the model failed.
    if (typeof payload === "object" && payload?.data) error.data = payload.data;
    throw error;
  }
  return payload;
}

// hid: the hotel location the answer should be about.
export function sendChatMessage({ message, conversationId, clientMessageId, hid }) {
  return request("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversationId } : {}),
      ...(clientMessageId ? { clientMessageId } : {}),
      ...(hid ? { hid: String(hid) } : {}),
    }),
  });
}
export function addChatbotKnowledge(data) { return request("/chatbot/knowledge", { method: "POST", body: JSON.stringify(data) }); }
export function getChatbotKnowledge() { return request("/chatbot/knowledge"); }

// ---- Conversation history ----
export function getConversations({ search, limit } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return request(`/chatbot/conversations${qs ? `?${qs}` : ""}`);
}
export function createConversation(title) { return request("/chatbot/conversations", { method: "POST", body: JSON.stringify(title ? { title } : {}) }); }
export function getConversation(id) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`); }
export function renameConversation(id, title) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ title }) }); }
export function setConversationPinned(id, pinned) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ pinned: Boolean(pinned) }) }); }
export function deleteConversation(id) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "DELETE" }); }
// ---- Voice input ----
// Recorded audio (Blob from MediaRecorder) -> { text, languageCode }.
// Sent as multipart, so not through request(), which always sends JSON.
// gian answers { success:false, code, message } on failure, e.g. NO_SPEECH.
export async function transcribeAudio(blob) {
  const token = getToken();
  if (!token) throw new Error("Login token missing. Please log in again.");

  const form = new FormData();
  const type = (blob.type || "audio/webm").split(";")[0];
  const extension = type.split("/")[1] || "webm";
  form.append("audio", blob, `voice.${extension}`);

  let response;
  try {
    response = await fetch(`${API_URL}/chatbot/transcribe`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      credentials: "omit",
    });
  } catch {
    throw new Error("Cannot reach the server. Please check your connection and try again.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.text) {
    const error = new Error(
      response.status === 404
        ? "Voice input arrives with the next server update."
        : payload?.message || "Could not understand the recording. Please try again.",
    );
    error.code = payload?.code;
    throw error;
  }
  return { text: payload.text, languageCode: payload.languageCode ?? null };
}

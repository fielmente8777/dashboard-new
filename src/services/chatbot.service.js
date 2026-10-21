// import { API_URLS } from "../config/env";
// import { getToken } from "../utils/session";

// // "Ask Eazotel AI" is served by the Node API (gian: /api/v1/chatbot).
// const API_URL = `${API_URLS.node}/api/v1`;

// async function request(endpoint, options = {}) {
//   const token = getToken();
//   if (!token) {
//     throw new Error("Login token missing. Please log in again.");
//   }
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//     ...(options.headers || {}),
//   };

//   let response;
//   try {
//     // "omit": aapka backend CORS origin '*' use karta hai, jo credentials "include" ke saath browser block kar deta hai
//     response = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: "omit" });
//   } catch (cause) {
//     const error = new Error(import.meta.env.DEV
//       ? `Cannot reach ${API_URL}. Is the backend running, and does CORS allow this origin?`
//       : "Cannot reach the server. Please check your connection and try again.");
//     error.cause = cause;
//     throw error;
//   }

//   const isJson = (response.headers.get("content-type") || "").includes("application/json");
//   const payload = isJson ? await response.json() : await response.text();

//   if (!response.ok) {
//     // Backend ki asli wajah dikhao ("no tenant", "bad token", "model error"...).
//     const backendMessage = typeof payload === "object" && payload ? (payload.message || payload.responseMessage) : null;
//     const error = new Error(backendMessage || (response.status === 401 ? "Authentication failed" : `Request failed (${response.status})`));
//     error.status = response.status;
//     // e.g. { conversationId } when the user message was saved but the model failed.
//     if (typeof payload === "object" && payload?.data) error.data = payload.data;
//     throw error;
//   }
//   return payload;
// }

// // hid: the hotel location the answer should be about.
// export function sendChatMessage({ message, conversationId, clientMessageId, hid }) {
//   return request("/chatbot/chat", {
//     method: "POST",
//     body: JSON.stringify({
//       message,
//       ...(conversationId ? { conversationId } : {}),
//       ...(clientMessageId ? { clientMessageId } : {}),
//       ...(hid ? { hid: String(hid) } : {}),
//     }),
//   });
// }
// export function addChatbotKnowledge(data) { return request("/chatbot/knowledge", { method: "POST", body: JSON.stringify(data) }); }
// export function getChatbotKnowledge() { return request("/chatbot/knowledge"); }

// // ---- Conversation history ----
// export function getConversations({ search, limit } = {}) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   if (limit) params.set("limit", String(limit));
//   const qs = params.toString();
//   return request(`/chatbot/conversations${qs ? `?${qs}` : ""}`);
// }
// export function createConversation(title) { return request("/chatbot/conversations", { method: "POST", body: JSON.stringify(title ? { title } : {}) }); }
// export function getConversation(id) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`); }
// export function renameConversation(id, title) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ title }) }); }
// export function setConversationPinned(id, pinned) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ pinned: Boolean(pinned) }) }); }
// export function deleteConversation(id) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "DELETE" }); }


import { API_URLS } from "../config/env";
import { getToken } from "../utils/session";

// "Ask Eazotel AI" is served by the Node API (gian: /api/v1/chatbot).
const API_URL = `${API_URLS.node}/api/v1`;

async function request(endpoint, options = {}) {
  const { timeoutMs, signal: callerSignal, ...fetchOptions } = options;
  const token = getToken();
  if (!token) {
    throw new Error("Login token missing. Please log in again.");
  }

  // FormData (voice upload): don't set Content-Type, the browser adds the multipart boundary itself.
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...(fetchOptions.headers || {}),
  };

  // Optional timeout + caller abort (e.g. chat window closed while transcribing).
  const controller = new AbortController();
  let timedOut = false;
  const timer = timeoutMs ? setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs) : null;
  const onCallerAbort = () => controller.abort();
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener("abort", onCallerAbort, { once: true });
  }

  let response;
  try {
    // "omit": aapka backend CORS origin '*' use karta hai, jo credentials "include" ke saath browser block kar deta hai
    response = await fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers, credentials: "omit", signal: controller.signal });
  } catch (cause) {
    if (controller.signal.aborted) {
      const error = new Error(timedOut ? "The request timed out. Please try again." : "Request cancelled.");
      error.name = timedOut ? "TimeoutError" : "AbortError";
      error.cause = cause;
      throw error;
    }
    const error = new Error(import.meta.env.DEV
      ? `Cannot reach ${API_URL}. Is the backend running, and does CORS allow this origin?`
      : "Cannot reach the server. Please check your connection and try again.");
    error.cause = cause;
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
    callerSignal?.removeEventListener("abort", onCallerAbort);
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
    // e.g. "AUDIO_TOO_LARGE", "NO_SPEECH" from /chatbot/transcribe.
    if (typeof payload === "object" && payload?.code) error.code = payload.code;
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

// ---- Voice input (Sarvam Saaras v4 via the Node API) ----
const AUDIO_EXTENSIONS = { "audio/webm": "webm", "video/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mpeg": "mp3" };

// POST /chatbot/transcribe, multipart field "audio". Resolves to { success, text, languageCode, requestId }.
export function transcribeAudio(blob, { signal, timeoutMs = 45000 } = {}) {
  const baseType = String(blob?.type || "").split(";")[0];
  const form = new FormData();
  form.append("audio", blob, `voice-input.${AUDIO_EXTENSIONS[baseType] || "webm"}`);
  return request("/chatbot/transcribe", { method: "POST", body: form, signal, timeoutMs });
}

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

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");


let tokenProvider = () => {
  try {
    const key = import.meta.env.VITE_AUTH_TOKEN_KEY || "token";
    return (
      localStorage.getItem(key) ||
      sessionStorage.getItem(key)
    );
  } catch {
    return null;
  }
};

export function setChatbotTokenProvider(fn) {
  tokenProvider = fn;
}

let contextProvider = () => ({});
export function setChatbotContextProvider(fn) { contextProvider = fn; }

async function request(endpoint, options = {}) {
  const token = tokenProvider?.();
  if (!token) {
  throw new Error("Login token missing. Please log in again.");
}
const headers = {
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    throw error;
  }
  return payload;
}

export function sendChatMessage(message, conversationId) {
  const hid = contextProvider?.()?.hid;
  return request("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({ message, ...(conversationId ? { conversationId } : {}), ...(hid ? { hid: String(hid) } : {}) }),
  });
}
export function addChatbotKnowledge(data) { return request("/chatbot/knowledge", { method: "POST", body: JSON.stringify(data) }); }
export function getChatbotKnowledge() { return request("/chatbot/knowledge"); }
export function getConversations() { return request("/chatbot/conversations"); }
export function getConversation(id) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`); }
export function deleteConversation(id) { return request(`/chatbot/conversations/${encodeURIComponent(id)}`, { method: "DELETE" }); }
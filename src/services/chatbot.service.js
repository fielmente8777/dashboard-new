
import { NEW_BASE_URL } from "../data/constant";

const API_URL = `${NEW_BASE_URL}/api/v1`.replace(/\/+$/, "");

// ---------------------------------------------
// Authentication
// ---------------------------------------------

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
  tokenProvider =
    typeof fn === "function"
      ? fn
      : () => {
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
}

function getToken() {
  return tokenProvider?.();
}

// ---------------------------------------------
// Tenant / Context
// ---------------------------------------------

let contextProvider = () => ({});

export function setChatbotContextProvider(fn) {
  contextProvider =
    typeof fn === "function" ? fn : () => ({});
}

function getContext() {
  try {
    return contextProvider?.() || {};
  } catch {
    return {};
  }
}

// ---------------------------------------------
// Shared API Request
// ---------------------------------------------

async function request(endpoint, options = {}) {
  const {
    timeoutMs,
    signal: callerSignal,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const token = getToken();

  if (!token) {
    throw new Error("Login token missing. Please log in again.");
  }

  const isFormData =
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...(customHeaders || {}),
  };

  const controller = new AbortController();
  let timedOut = false;

  const timer = timeoutMs
    ? setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs)
    : null;

  const onCallerAbort = () => controller.abort();

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, {
        once: true,
      });
    }
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "omit",
      signal: controller.signal,
    });
  } catch (cause) {
    if (controller.signal.aborted) {
      const error = new Error(
        timedOut
          ? "The request timed out. Please try again."
          : "Request cancelled."
      );

      error.name = timedOut ? "TimeoutError" : "AbortError";
      error.cause = cause;

      throw error;
    }

    const error = new Error(
      import.meta.env.DEV
        ? `Cannot reach ${API_URL}. Is the backend running, and does CORS allow this origin?`
        : "Cannot reach the server. Please check your connection and try again."
    );

    error.cause = cause;
    throw error;
  } finally {
    if (timer) clearTimeout(timer);

    callerSignal?.removeEventListener(
      "abort",
      onCallerAbort
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const backendMessage =
      typeof payload === "object" && payload
        ? payload.message || payload.responseMessage
        : null;

    const error = new Error(
      backendMessage ||
        (response.status === 401
          ? "Authentication failed"
          : `Request failed (${response.status})`)
    );

    error.status = response.status;

    if (typeof payload === "object" && payload?.data) {
      error.data = payload.data;
    }

    if (typeof payload === "object" && payload?.code) {
      error.code = payload.code;
    }

    throw error;
  }

  return payload;
}

// ---------------------------------------------
// Chat
// ---------------------------------------------

export function sendChatMessage({
  message,
  conversationId,
  clientMessageId,
  hid,
} = {}) {
  const context = getContext();
  const hotelId = hid ?? context.hid;

  return request("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversationId } : {}),
      ...(clientMessageId ? { clientMessageId } : {}),
      ...(hotelId ? { hid: String(hotelId) } : {}),
    }),
  });
}

// ---------------------------------------------
// Knowledge Base
// ---------------------------------------------

export function addChatbotKnowledge(data) {
  return request("/chatbot/knowledge", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getChatbotKnowledge() {
  return request("/chatbot/knowledge");
}

// ---------------------------------------------
// Voice Input: Sarvam Saaras v4
// POST /api/v1/chatbot/transcribe
// ---------------------------------------------

const AUDIO_EXTENSIONS = {
  "audio/webm": "webm",
  "video/webm": "webm",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/mpeg": "mp3",
};

export function transcribeAudio(
  blob,
  { signal, timeoutMs = 45000 } = {}
) {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("No audio recorded. Please try again.");
  }

  const baseType = String(blob.type || "")
    .split(";")[0]
    .toLowerCase();

  const extension = AUDIO_EXTENSIONS[baseType] || "webm";

  const form = new FormData();

  form.append("audio", blob, `voice-input.${extension}`);

  return request("/chatbot/transcribe", {
    method: "POST",
    body: form,
    signal,
    timeoutMs,
  });
}

// ---------------------------------------------
// Conversation History
// ---------------------------------------------

export function getConversations({ search, limit } = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (limit) params.set("limit", String(limit));

  const queryString = params.toString();

  return request(
    `/chatbot/conversations${
      queryString ? `?${queryString}` : ""
    }`
  );
}

export function createConversation(title) {
  return request("/chatbot/conversations", {
    method: "POST",
    body: JSON.stringify(
      title ? { title } : {}
    ),
  });
}

export function getConversation(id) {
  return request(
    `/chatbot/conversations/${encodeURIComponent(id)}`
  );
}

export function renameConversation(id, title) {
  return request(
    `/chatbot/conversations/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }
  );
}

export function setConversationPinned(id, pinned) {
  return request(
    `/chatbot/conversations/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        pinned: Boolean(pinned),
      }),
    }
  );
}

export function deleteConversation(id) {
  return request(
    `/chatbot/conversations/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

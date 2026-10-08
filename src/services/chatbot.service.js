const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },

      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Something went wrong"
    );
  }

  return data;
}

/**
 * Send chatbot message
 */
export async function sendChatMessage(
  message,
  conversationId
) {
  return request("/chatbot/chat", {
    method: "POST",

    body: JSON.stringify({
      message,

      ...(conversationId
        ? { conversationId }
        : {}),
    }),
  });
}

/**
 * Get single conversation
 */
export async function getConversation(
  conversationId
) {
  return request(
    `/chatbot/conversations/${conversationId}`
  );
}

/**
 * Get all conversations
 */
export async function getConversations() {
  return request(
    "/chatbot/conversations"
  );
}

/**
 * Delete conversation
 */
export async function deleteConversation(
  conversationId
) {
  return request(
    `/chatbot/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );
}
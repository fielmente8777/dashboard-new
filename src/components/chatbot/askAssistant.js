export const ASK_ASSISTANT_EVENT = "eazotel:ask-assistant";

// Opens the AI assistant and asks it `question` in a new chat.
// Usable from anywhere in the dashboard (the navbar search uses it).
export const askAssistant = (question) =>
  window.dispatchEvent(
    new CustomEvent(ASK_ASSISTANT_EVENT, { detail: { question } }),
  );

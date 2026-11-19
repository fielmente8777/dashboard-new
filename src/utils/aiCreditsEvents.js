// "AI was blocked by the credit wallet" signal. Every way the dashboard calls
// gian (RTK Query's baseQuery, services/chatbot.service.js) reports a blocked
// AI request here; AiCreditsBlockedListener shows one consistent notice with a
// recharge link and refreshes the wallet / AI status.

export const AI_CREDITS_BLOCKED_EVENT = "eazotel:ai-credits-blocked";

const BLOCK_CODES = new Set(["AI_CREDITS_INSUFFICIENT", "WALLET_SUSPENDED"]);

// gian answers 402 (no credits) or 403 (wallet suspended) with one of these
// codes. Other 4xx with the same code (e.g. an admin deduction above a
// balance) are not a paused AI feature.
export const isAiCreditsBlock = (status, body) =>
  (status === 402 || status === 403) && BLOCK_CODES.has(body?.code);

export const notifyAiCreditsBlocked = (body = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(AI_CREDITS_BLOCKED_EVENT, {
      detail: {
        code: body.code,
        message: body.message || body.responseMessage,
        availableCredits: body.availableCredits,
        requiredCredits: body.requiredCredits,
      },
    }),
  );
};

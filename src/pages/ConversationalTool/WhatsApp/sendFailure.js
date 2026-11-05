// Meta's reasons for not delivering a message, in words the team can act on.
// `canRetry` is false when sending it again can't work until something else
// changes. https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
const REASONS = {
  130429: {
    text: "Too many messages are being sent. Wait a few minutes.",
    canRetry: true,
  },
  131026: {
    text: "This number can't receive this message. It may not be on WhatsApp.",
    canRetry: true,
  },
  131031: {
    text: "This WhatsApp account is locked. Contact your admin.",
    canRetry: false,
  },
  131042: {
    text: "WhatsApp billing issue on this account. Contact your admin.",
    canRetry: false,
  },
  131047: {
    text: "The 24-hour window has closed. Send an approved template instead.",
    canRetry: false,
  },
  131048: {
    text: "WhatsApp limited this number because of spam reports. Contact your admin.",
    canRetry: false,
  },
  131049: {
    text: "WhatsApp limited marketing messages to this person for now.",
    canRetry: false,
  },
  131050: {
    text: "This person has stopped marketing messages.",
    canRetry: false,
  },
  131056: {
    text: "Too many messages to this number. Wait a while first.",
    canRetry: true,
  },
};

// What to show under a failed message. `text` is empty when Meta gave no
// reason (the server refused it, or it failed before reasons were saved).
export const getSendFailure = ({ failure }) => {
  if (!failure) return { text: "", canRetry: true };
  return (
    REASONS[failure.code] || {
      text: failure.title || failure.message || "",
      canRetry: true,
    }
  );
};

// --- statuses that beat the send's own answer ---
// Meta's status can reach the socket before the POST answers with the message
// id, when nothing in the chat can be matched to it yet. It waits here until
// the send picks it up.
const MAX_EARLY_STATUSES = 50;
const earlyStatuses = new Map();

export const rememberEarlyStatus = (messageId, update) => {
  earlyStatuses.set(messageId, update);
  if (earlyStatuses.size > MAX_EARLY_STATUSES) {
    earlyStatuses.delete(earlyStatuses.keys().next().value);
  }
};

export const takeEarlyStatus = (messageId) => {
  const update = earlyStatuses.get(messageId);
  earlyStatuses.delete(messageId);
  return update;
};

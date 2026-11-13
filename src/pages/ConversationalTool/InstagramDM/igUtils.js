// Helpers for the Instagram DM live chat. Date helpers are shared with the
// WhatsApp chat so both look the same.
export {
  formatDayLabel,
  formatListTime,
  formatTime,
  getAvatarColor,
  isSameDay,
} from "../WhatsApp/chatUtils";

const DAY = 24 * 60 * 60 * 1000;

// pushed by gian (src/constants/websocket.ts -> INSTAGRAM)
export const IG_EVENTS = {
  NEW_MESSAGE: "INSTAGRAM_NEW_MESSAGE",
  NEW_CONVERSATION: "INSTAGRAM_NEW_CONVERSATION",
  MESSAGE_STATUS: "INSTAGRAM_MESSAGE_STATUS",
};

export const IG_TABS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

// what the guest is called: name, @username, or their id
export const getDisplayName = (conversation) =>
  conversation?.name ||
  (conversation?.username ? `@${conversation.username}` : "") ||
  `Instagram user ${String(conversation?.igsid || "").slice(-4)}`;

export const getLastActivity = (conversation) =>
  conversation.last_message?.created_at ||
  conversation.updatedAt ||
  conversation.createdAt;

// Instagram allows free replies only for 24h after the guest's last message
export const canReply = (conversation) => {
  const time = new Date(conversation?.last_user_message_at).getTime();
  return !Number.isNaN(time) && Date.now() - time < DAY;
};

export const isInTab = (conversation, tab) => {
  if (tab === "all") return true;
  return tab === "active" ? canReply(conversation) : !canReply(conversation);
};

export const byLatestActivity = (a, b) =>
  new Date(getLastActivity(b)) - new Date(getLastActivity(a));

export const matchesSearch = (conversation, search) => {
  const text = search.trim().toLowerCase().replace(/^@/, "");
  if (!text) return true;
  return [
    conversation.name,
    conversation.username,
    conversation.last_message?.text,
  ].some((value) => String(value || "").toLowerCase().includes(text));
};

export const isOutgoing = (message) => message.sender === "me";

export const isPending = (message) => String(message._id).startsWith("temp-");

export const sameMessage = (a, b) =>
  (a._id && b._id && String(a._id) === String(b._id)) ||
  (a.mid && b.mid && a.mid === b.mid);

export const buildOutgoingMessage = (conversation, text) => {
  const now = new Date().toISOString();
  return {
    _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId: conversation._id,
    igsid: conversation.igsid,
    direction: "outbound",
    sender: "me",
    messageType: "text",
    text,
    attachments: [],
    status: "sending",
    timestamp: now,
    createdAt: now,
  };
};

// when a message happened (Meta's time, else when it was saved)
export const getMessageTime = (message) => message.timestamp || message.createdAt;

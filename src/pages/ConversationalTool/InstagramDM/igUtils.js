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
  CONVERSATION_UPDATED: "INSTAGRAM_CONVERSATION_UPDATED",
};

// who replies in a chat: the AI agent (default) or the team
export const isAiHandling = (conversation) => conversation?.handling?.mode !== "HUMAN";

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

// A message as it is shown before the server has confirmed it.
// `fields` sets messageType / text / attachments / fileName.
export const buildOutgoingMessage = (conversation, fields) => {
  const now = new Date().toISOString();
  return {
    _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId: conversation._id,
    igsid: conversation.igsid,
    direction: "outbound",
    sender: "me",
    messageType: "text",
    attachments: [],
    status: "sending",
    timestamp: now,
    createdAt: now,
    ...fields,
  };
};

// --- media Instagram accepts (same rules as gian: instagram.service MEDIA_RULES) ---
const MB = 1024 * 1024;
export const IG_MEDIA = {
  image: { mimes: ["image/png", "image/jpeg", "image/jpg", "image/gif"], max: 8 * MB, label: "photos up to 8 MB" },
  video: {
    mimes: ["video/mp4", "video/ogg", "video/x-msvideo", "video/avi", "video/quicktime", "video/webm"],
    max: 25 * MB,
    label: "videos up to 25 MB",
  },
  audio: {
    mimes: ["audio/aac", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/wav", "audio/x-wav", "audio/wave"],
    max: 25 * MB,
    label: "audio up to 25 MB",
  },
  file: { mimes: ["application/pdf"], max: 25 * MB, label: "PDFs up to 25 MB" },
};

// for the file picker
export const IG_ACCEPT = [
  ...Object.values(IG_MEDIA).flatMap((rule) => rule.mimes),
  ".m4a",
  ".aac",
  ".mov",
].join(",");

// "image" | "video" | "audio" | "file" | null
export const getIgMediaType = (mimeType = "") => {
  const mime = mimeType.toLowerCase();
  const found = Object.entries(IG_MEDIA).find(([, rule]) => rule.mimes.includes(mime));
  return found ? found[0] : null;
};

// null when Instagram takes the file, otherwise why not
export const checkIgFile = (file) => {
  const type = getIgMediaType(file.type);
  if (!type) {
    return "Instagram can send photos (PNG, JPEG, GIF), videos (MP4, MOV, WEBM…), audio (M4A, AAC, WAV) and PDFs.";
  }
  if (file.size > IG_MEDIA[type].max) {
    return `That file is too large. Instagram allows ${IG_MEDIA[type].label}.`;
  }
  return null;
};

// when a message happened (Meta's time, else when it was saved)
export const getMessageTime = (message) => message.timestamp || message.createdAt;

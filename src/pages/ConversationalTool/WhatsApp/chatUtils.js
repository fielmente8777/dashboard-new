import { API_URLS } from "../../../config/env";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DAY = 24 * 60 * 60 * 1000;

export const CHAT_TABS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "converted", label: "Converted" },
];

// "+91 98765-43210" and "919876543210" are the same number
export const samePhone = (a, b) => {
  const digits = (value) => String(value || "").replace(/\D/g, "");
  return Boolean(digits(a)) && digits(a).slice(-10) === digits(b).slice(-10);
};

// --- conversations ---

// when the conversation last had a message (or was started)
export const getLastActivity = (conversation) =>
  conversation.last_message?.updated_at || conversation.createdAt;

// WhatsApp only allows free-form replies for 24 hours after the last
// message; after that only an approved template can be sent.
export const isWindowClosed = (date) => {
  const time = new Date(date).getTime();
  return Number.isNaN(time) || Date.now() - time >= DAY;
};

export const isConverted = (conversation) =>
  conversation.status?.toLowerCase() === "converted";

// the tab a conversation is listed under
export const getConversationTab = (conversation) => {
  if (isConverted(conversation)) return "converted";
  return isWindowClosed(getLastActivity(conversation)) ? "inactive" : "active";
};

// A conversation is in "converted" when its stage says so, and in "active" or
// "inactive" by the 24 hour rule (a converted one is in one of those too).
export const isInTab = (conversation, tab) => {
  if (tab === "converted") return isConverted(conversation);
  const closed = isWindowClosed(getLastActivity(conversation));
  return tab === "inactive" ? closed : !closed;
};

export const byLatestActivity = (a, b) =>
  new Date(getLastActivity(b)) - new Date(getLastActivity(a));

export const matchesSearch = (conversation, search) => {
  const text = search.trim().toLowerCase();
  if (!text) return true;
  return (
    conversation.name?.toLowerCase().includes(text) ||
    String(conversation.phone || "").includes(text) ||
    conversation.last_message?.text?.toLowerCase().includes(text)
  );
};

// who is replying: { byAi, byMe, byOther }
export const getHandling = (conversation, userEmail) => {
  const handling = conversation?.handling;
  const byAi = !handling || handling.mode === "AI";
  const mine = String(handling?.assignedTo) === String(userEmail);
  return {
    byAi,
    byMe: handling?.mode === "HUMAN" && mine,
    byOther: handling?.mode === "HUMAN" && !mine,
  };
};

const AVATAR_COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];

// the same name always gets the same colour
export const getAvatarColor = (name) =>
  name
    ? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
    : "bg-gray-400";

// --- messages ---

export const isOutgoing = (message) => message.sender === "me";

// a message still on its way to the server (not yet confirmed)
export const isPending = (message) => String(message._id).startsWith("temp-");

export const getMessageTypeOfFile = (file) => {
  const [kind] = file.type.split("/");
  return ["image", "video", "audio"].includes(kind) ? kind : "document";
};

// Media is either already a URL, or an id to fetch through our server.
export const getMediaUrl = (media, ndid) => {
  if (media?.url) return media.url;
  if (!media?.id) return "";
  return `${API_URLS.node}/api/v1/whatsapp/media/${media.id}?ndid=${ndid}`;
};

// "pdf" | "sheet" | "word" | "image" | "file", to pick an icon
export const getDocumentKind = (mimeType = "") => {
  const type = mimeType.toLowerCase();
  if (type.includes("pdf")) return "pdf";
  if (/spreadsheet|excel|sheet/.test(type)) return "sheet";
  if (/wordprocessingml|msword/.test(type)) return "word";
  if (type.includes("image")) return "image";
  return "file";
};

// A message as it is shown before the server has confirmed it.
export const buildOutgoingMessage = (conversation, fields) => {
  const now = new Date().toISOString();
  return {
    _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId: conversation._id,
    from: "me",
    to: conversation.phone,
    sender: "me",
    direction: "outbound",
    status: "sending",
    timestamp: now,
    createdAt: now,
    ...fields,
  };
};

// A template's body with its sample values filled in, plus those values
// (what the send API expects).
export const fillTemplate = (template) => {
  const find = (type) =>
    template.components?.find((component) => component.type === type);
  const params = find("BODY")?.example?.body_text?.[0] || [];
  const headerParams = find("HEADER")?.example?.header_text || [];

  const body = params.reduce(
    (text, param, index) => text.replace(`{{${index + 1}}}`, param),
    find("BODY")?.text || "",
  );
  return { body, params, headerParams };
};

// What to send again for a message that failed, or null if it cannot be resent.
export const buildResendPayload = (message) => {
  const phone = message.to;

  switch (message.messageType) {
    case "text":
      return { phone, text: message.body };
    case "image":
    case "video":
    case "document":
    case "audio":
      if (!message.media?.id) return null;
      return {
        phone,
        file: { mediaId: message.media.id, mimetype: message.media.mimeType },
      };
    case "template": {
      const template = message.template?.template;
      if (!template) return null;
      const find = (type) =>
        template.components?.find(
          (component) => component.type?.toLowerCase() === type,
        );
      return {
        phone,
        templateName: template.name,
        templateLanguage: template.language?.code || template.language,
        templateParams: find("body")?.parameters?.map((p) => p.text) || [],
        templateParamsHeader: find("header")?.parameters?.[0] || null,
      };
    }
    case "interactive":
      return { phone, interactive: message.interactive };
    default:
      return null;
  }
};

// --- dates ---

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const startOfDay = (date) => new Date(date).setHours(0, 0, 0, 0);

// "Today", "Yesterday" or "12 Oct 2026"
export const formatDayLabel = (date) => {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(date)) / DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// For the conversation list: the time today, otherwise the day.
export const formatListTime = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return "";
  const label = formatDayLabel(date);
  if (label === "Today") return formatTime(date);
  if (label === "Yesterday") return label;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const isSameDay = (a, b) => startOfDay(a) === startOfDay(b);

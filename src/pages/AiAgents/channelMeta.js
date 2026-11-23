import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { PAGES } from "../../routes/paths";

// What differs per channel in the AI Agent Builder (values match gian:
// modules/ai-agents/types.ts AGENT_CHANNELS and channels/channelInfo.ts).
export const AGENT_CHANNELS = ["whatsapp", "instagram"];

export const CHANNEL_META = {
  whatsapp: {
    value: "whatsapp",
    name: "WhatsApp",
    surface: "WhatsApp chats",
    icon: FaWhatsapp,
    iconClass: "text-green-600 dark:text-green-400",
    cardClass: "border-green-500/35!",
    inboxPage: PAGES.CHAT_WHATSAPP,
    connectPage: PAGES.SETTINGS,
    connectQuery: { tab: "whatsapp" },
    blurb: "Answer WhatsApp guests 24/7, qualify leads and book rooms, with tap-to-reply buttons.",
    replyHint: "2–4 sentences read well on WhatsApp.",
  },
  instagram: {
    value: "instagram",
    name: "Instagram",
    surface: "Instagram DMs",
    icon: FaInstagram,
    iconClass: "text-pink-600 dark:text-pink-400",
    cardClass: "border-pink-500/35!",
    inboxPage: PAGES.CHAT_INSTAGRAM,
    connectPage: PAGES.CHAT_INSTAGRAM,
    connectQuery: undefined,
    blurb: "Answer guest DMs using your hotel knowledge, AI training and quick replies.",
    replyHint: "1–2 sentences. Best for Instagram DMs.",
  },
};

export const isAgentChannel = (value) => AGENT_CHANNELS.includes(value);
export const channelMeta = (channel) => CHANNEL_META[channel] || CHANNEL_META.instagram;

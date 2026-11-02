import {
  Bell,
  CalendarCheck,
  ConciergeBell,
  Megaphone,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";

// How each kind of notification is drawn: the server's categories plus
// "visitor" (website chatbot, kept in this browser). Unknown kinds use `general`.
// `label` names the filter on the Notifications page.
export const NOTIFICATION_KINDS = {
  lead: {
    label: "Leads",
    icon: Users,
    tile: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: IoLogoWhatsapp,
    tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
  visitor: {
    label: "Website visitors",
    icon: MessageCircle,
    tile: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  },
  call: {
    label: "Calls",
    icon: Phone,
    tile: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  },
  booking: {
    label: "Bookings",
    icon: CalendarCheck,
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  request: {
    label: "Guest requests",
    icon: ConciergeBell,
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  system: {
    label: "Eazotel",
    icon: Megaphone,
    tile: "bg-app-surface-secondary text-app-text-muted",
  },
  general: {
    label: "Other",
    icon: Bell,
    tile: "bg-app-surface-secondary text-app-text-muted",
  },
};

export const getNotificationKind = (kind) =>
  NOTIFICATION_KINDS[kind] || NOTIFICATION_KINDS.general;

// Filters on the Notifications page, in this order.
export const NOTIFICATION_FILTERS = ["lead", "whatsapp", "visitor", "call", "booking", "system"];

// What each server notification type is, for the settings toggles.
export const NOTIFICATION_TYPE_LABELS = {
  "lead.created": { label: "New leads", hint: "From Meta, Google Ads, your website and every other source." },
  "whatsapp.conversation.new": { label: "New WhatsApp chats", hint: "A guest messages you for the first time." },
  "whatsapp.message.new": { label: "WhatsApp messages", hint: "Every new message in an existing chat." },
  "system.announcement": { label: "Eazotel announcements", hint: "Product news and important account updates." },
  "system.test": { label: "Test notifications", hint: "Sent when you test push from this page." },
};

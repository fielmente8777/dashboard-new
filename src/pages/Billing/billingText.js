import {
  Bot,
  CalendarCheck,
  ChartLine,
  Contact,
  Hotel,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Plug,
  Puzzle,
  Share2,
  Target,
  Webhook,
} from "lucide-react";

export const APP_ICONS = {
  whatsapp: MessageCircle,
  lead_management: Target,
  exotel: PhoneCall,
  crm: Contact,
  booking_engine: Hotel,
  eazbot: Bot,
  webhook: Webhook,
  wordpress_webhook: Puzzle,
  grm: CalendarCheck,
  meta: ChartLine,
  googleadsinsights: Megaphone,
  social_media: Share2,
};
export const appIcon = (code) => APP_ICONS[code] || Plug;

export const SUPPORT_LABELS = {
  none: "Community help",
  standard: "Email support",
  premium: "Priority support",
  enterprise: "Dedicated account manager",
};

export const PHASE_LABELS = {
  none: "No plan yet",
  trial: "Free trial",
  active: "Active",
  ending: "Ending soon",
  ended: "Ended",
  stopped: "Paused",
};

export const PHASE_TONES = { none: "gray", trial: "blue", active: "green", ending: "amber", ended: "red", stopped: "red" };

export const day = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const cycleWords = (months) => (months === 1 ? "month" : months === 12 ? "year" : `${months} months`);

export const limitText = (value, unit) => (value < 0 ? `Unlimited ${unit}` : `${Number(value).toLocaleString("en-IN")} ${unit}`);

// A plan's monthly price after the cycle's discount, rupees.
export const effectiveMonthly = (price, cycle) => Math.round(price * (1 - (cycle?.discountPercent || 0) / 100));

// Whether this hotel can pay for the plan online (mirrors the server's rule).
export const purchasable = (plan) => plan.price > 0 && plan.code !== "TRIAL";

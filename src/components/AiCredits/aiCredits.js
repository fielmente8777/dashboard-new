// Shared by AI Wallet and AI Credit Management.

export const formatCredits = (value) => (Number(value) || 0).toLocaleString("en-IN");

export const formatMoney = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

// provider prices are tiny (per 1M tokens) and in any currency
export const formatPrice = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 6,
  }).format(Number(amount) || 0);

export const formatTokens = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
};

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

// what each billed AI operation is called (AiUsageLog.service)
export const SERVICE_LABELS = {
  chatbot: "AI Chatbot",
  knowledge_base: "Knowledge base",
};
export const serviceLabel = (id) => SERVICE_LABELS[id] ?? id ?? "—";

export const PROVIDER_LABELS = { sarvam: "Sarvam", openai: "OpenAI", anthropic: "Anthropic" };
export const providerLabel = (id) => PROVIDER_LABELS[id] ?? id ?? "—";

export const TRANSACTION_TYPES = {
  purchase: { label: "Purchase", tone: "blue" },
  usage: { label: "Usage", tone: "gray" },
  adjustment: { label: "Adjustment", tone: "sky" },
};

// badge tone for every status the two pages show
export const STATUS_TONES = {
  active: "green",
  completed: "green",
  inactive: "gray",
  pending: "amber",
  failed: "red",
  suspended: "red",
};

export const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

// "healthy" | "low" | "critical" | "empty", from the balance and the
// thresholds set in AI Credit Management > Credit settings
export const creditState = (balance, { low = 1000, critical = 250 } = {}) => {
  if (balance <= 0) return "empty";
  if (balance < critical) return "critical";
  if (balance < low) return "low";
  return "healthy";
};

// "YYYY-MM-DD" (local) -> the instant the day starts / ends, for the usage API
export const dayStartISO = (date) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined);
export const dayEndISO = (date) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined);

// a fresh key per admin action, so a double-click or retry applies once
export const newIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

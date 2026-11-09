// Shared by AI Wallet and AI Credit Management.

export const formatCredits = (value) => (Number(value) || 0).toLocaleString("en-IN");

export const formatMoney = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const PRICING_TYPES = [
  { value: "per_request", label: "Per request" },
  { value: "per_conversation", label: "Per conversation" },
  { value: "per_run", label: "Per run" },
  { value: "per_1k_tokens", label: "Per 1K tokens" },
  { value: "per_image", label: "Per image" },
];

export const pricingTypeLabel = (value) =>
  PRICING_TYPES.find((type) => type.value === value)?.label ?? value;

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
// thresholds set in AI Credit Management > Low-credit settings
export const creditState = (balance, { low = 1000, critical = 250 } = {}) => {
  if (balance <= 0) return "empty";
  if (balance < critical) return "critical";
  if (balance < low) return "low";
  return "healthy";
};

// Shared look-ups for the WhatsApp broadcast pages.

// Meta's tier-1 sending limit: unique contacts per 24 hours
export const DAILY_SEND_LIMIT = 1000;

// ₹ the WhatsApp wallet is charged per message, by template category (Meta's India rates, as in
// gian Whatsappbilling RATES). Only a fallback: the real rates come from /campaign/limits.
export const PRICE_PER_MESSAGE = { utility: 0.115, marketing: 0.7846 };

export const TEMPLATE_CATEGORIES = [
  { value: "utility", label: "Utility" },
  { value: "marketing", label: "Marketing" },
];

const CAMPAIGN_STATUS = {
  completed: { tone: "green", label: "Completed" },
  sent: { tone: "green", label: "Sent" },
  sending: { tone: "amber", label: "Sending" },
  inprogress: { tone: "amber", label: "In progress" },
  "in-progress": { tone: "amber", label: "In progress" },
  scheduled: { tone: "blue", label: "Scheduled" },
  failed: { tone: "red", label: "Failed" },
  stopped: { tone: "red", label: "Stopped" },
};

/**
 * How long a campaign takes, the way gian plans it (services/whatsappCampaign/campaignPlan.ts):
 * PER_MINUTE messages a minute, and at most 90 % of Meta's 24-hour limit per day (minus what was
 * used today), so a bigger audience goes out over several days.
 *   -> { text, days, today }   e.g. "about 25 minutes", or "about 6 days: 1,800 a day"
 */
export const estimateDuration = (count, limits) => {
  if (!count || !limits) return null;
  const perMinute = limits.perMinute || 120;
  const minutes = (n) => Math.max(1, Math.ceil(n / perMinute));
  const span = (m) => (m < 60 ? `about ${m} minute${m === 1 ? "" : "s"}` : `about ${Math.round((m / 60) * 10) / 10} hours`);
  if (limits.dailyLimit === -1) return { text: span(minutes(count)), days: 1, today: count };
  const perDay = Math.max(1, Math.floor(limits.dailyLimit * 0.9));
  const today = Math.max(0, perDay - (limits.usedToday || 0));
  if (count <= today) return { text: span(minutes(count)), days: 1, today: count };
  const days = (today > 0 ? 1 : 0) + Math.ceil((count - today) / perDay);
  return {
    text: `about ${days} days: ${today > 0 ? `${today.toLocaleString("en-IN")} today, then ` : "starts tomorrow, "}${perDay.toLocaleString("en-IN")} a day`,
    days,
    today,
  };
};

export const campaignStatus = (status) =>
  CAMPAIGN_STATUS[status] || { tone: "gray", label: status || "Unknown" };

// Recipient states, in the order a message goes through them. The colours
// are chart colours so the funnel bar and the badges agree.
export const RECIPIENT_STATUS = {
  read: { tone: "sky", label: "Read", color: "var(--chart-1)" },
  delivered: { tone: "green", label: "Delivered", color: "var(--chart-3)" },
  sent: { tone: "amber", label: "Sent", color: "var(--chart-4)" },
  failed: { tone: "red", label: "Failed", color: "var(--chart-8)" },
};

export const recipientStatus = (status) =>
  RECIPIENT_STATUS[status] || RECIPIENT_STATUS.sent;

// share of `part` in `whole`, as a whole percentage
export const percent = (part, whole) =>
  whole > 0 ? Math.round(((part || 0) / whole) * 100) : 0;

export const formatNumber = (value) => (value || 0).toLocaleString("en-IN");

export const formatRupees = (value) =>
  `₹${(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// What the create API expects for the chosen template and its values.
export const buildCampaignTemplate = (template, values) => ({
  templateId: template.id,
  templateName: template.name,
  templateCategory: template.category,
  templateLanguage: template.language,
  templateParams: values.body,
  // the campaign API takes the header value as a single string (a header
  // has at most one {{1}}), unlike the chat send API
  templateParamsHeader: values.header.length ? values.header[0] : [],
});

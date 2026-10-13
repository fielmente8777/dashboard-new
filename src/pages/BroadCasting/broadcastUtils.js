// Shared look-ups for the WhatsApp broadcast pages.

// Meta's tier-1 sending limit: unique contacts per 24 hours
export const DAILY_SEND_LIMIT = 1000;

// rough cost per message in ₹, by template category
export const PRICE_PER_MESSAGE = { utility: 0.05, marketing: 0.1 };

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

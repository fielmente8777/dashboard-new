export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// "a@x.com, b@y.com; c@z.com" -> unique, lowercased addresses
export const parseEmails = (value) => [
  ...new Set(
    String(value || "")
      .split(/[,\n;\s]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  ),
];

export const formatDate = (value, withTime = false) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime && { hour: "numeric", minute: "2-digit" }),
      })
    : "—";

export const CAMPAIGN_TONE = {
  draft: "gray",
  scheduled: "blue",
  sending: "amber",
  sent: "green",
  paused: "gray",
  failed: "red",
};

export const campaignStatus = (status) => ({
  tone: CAMPAIGN_TONE[status] || "gray",
  label: status ? status[0].toUpperCase() + status.slice(1) : "Unknown",
});

// share of `part` in `whole`, as a whole percentage
export const percent = (part, whole) =>
  whole > 0 ? Math.round(((part || 0) / whole) * 100) : 0;

export const formatNumber = (value) => (value || 0).toLocaleString("en-IN");

export const RECIPIENT_TONE = {
  pending: "gray",
  sending: "blue",
  sent: "green",
  delivered: "green",
  failed: "red",
  opened: "purple",
  clicked: "sky",
  unsubscribed: "amber",
};

// share of `part` in `total`, as "12%"
export const rate = (part = 0, total = 0) =>
  total > 0 ? `${Math.round((part / total) * 100)}%` : "—";

// The inbox "preview text" shown next to the subject: a hidden first line in the
// email (preheader). Same markup as gian's emailHtmlOptimizer, which then skips it.
export const withPreviewText = (html = "", text = "") => {
  const clean = String(text).trim();
  if (!clean) return html;
  const escaped = clean.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const block =
    `<div data-eaz-preheader style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:transparent">` +
    `${escaped}${"&#847;&zwnj;&nbsp;".repeat(80)}</div>`;
  const stripped = String(html).replace(/<div data-eaz-preheader[^>]*>[\s\S]*?<\/div>/i, "");
  return /<body[^>]*>/i.test(stripped) ? stripped.replace(/<body([^>]*)>/i, `<body$1>${block}`) : `${block}${stripped}`;
};

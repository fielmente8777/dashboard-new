// Plain name@domain.tld in English letters only: what every mail server accepts.
// (send.one.com rejects "hélène@..." with "501 5.1.3 Bad recipient address syntax".)
export const EMAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

// letters that do not split into base letter + accent
const SPECIAL_LETTERS = { ß: "ss", æ: "ae", œ: "oe", ø: "o", đ: "d", ð: "d", ł: "l", þ: "th", ı: "i" };

// " Hélène.Versavel@Gmail.com " -> "helene.versavel@gmail.com"
// Removes accents, spaces, "mailto:" and <>; lower case. Check the result with EMAIL_REGEX.
export const normalizeEmail = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/^mailto:/, "")
    .replace(/[<>"']/g, "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[ßæœøđðłþı]/g, (ch) => SPECIAL_LETTERS[ch])
    .replace(/\s+/g, "");

// Addresses ready to send: normalized, valid, no duplicates. `invalid` = what could not be fixed.
export const cleanEmails = (list = []) => {
  const valid = new Set();
  const invalid = [];
  for (const raw of list) {
    const email = normalizeEmail(raw);
    if (!email) continue;
    if (EMAIL_REGEX.test(email)) valid.add(email);
    else invalid.push(String(raw).trim());
  }
  return { valid: [...valid], invalid };
};

// "a@x.com, b@y.com; c@z.com" -> unique, normalized addresses
export const parseEmails = (value) => [
  ...new Set(
    String(value || "")
      .split(/[,\n;\s]+/)
      .map(normalizeEmail)
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
  stopping: "amber",
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

// gian sends by SMTP, which never reports delivery, so stats.delivered stays 0.
// Until a provider webhook fills it, an email the mail server accepted (sent) counts as delivered.
export const deliveredCount = (stats = {}) => stats?.delivered || stats?.sent || 0;

// A failed recipient's server error ("INVALID_INPUT: SMTP error from ...: 501 5.1.3 Bad recipient
// address syntax") in plain words: what went wrong and what to do. First match wins.
const SEND_PROBLEMS = [
  {
    test: /5\.1\.3|bad recipient address|address syntax|invalid (email|address|recipient)|malformed/i,
    title: "Email address is not valid",
    hint: "Check it for typos, spaces or accented letters (é, ñ, ç).",
  },
  {
    test: /5\.1\.1|user unknown|no such user|does ?n[o']t exist|unknown (user|recipient)|recipient (not found|rejected)|mailbox (unavailable|not found)|address rejected/i,
    title: "This email address doesn't exist",
    hint: "Ask the guest for the right address, or remove it from your list.",
  },
  {
    test: /5\.1\.2|domain not found|host not found|no mx|enotfound|unrouteable|domain (does not|doesn't) exist/i,
    title: "The email domain doesn't exist",
    hint: "The part after @ looks wrong (e.g. gmial.com instead of gmail.com).",
  },
  {
    test: /5\.2\.2|mailbox (is )?full|quota|over ?quota|insufficient storage/i,
    title: "The guest's inbox is full",
    hint: "They need to free up space. You can send again later.",
  },
  // before "blocked": a failed login is also 5.7.x (535 5.7.8)
  {
    test: /535|eauth|authenticat|login|credentials|password/i,
    title: "Your sending mailbox could not sign in",
    hint: "Check the sender email settings (password or app password).",
  },
  {
    test: /spam|blocked|blacklist|block ?list|policy|reputation|5\.7\.\d|554/i,
    title: "Blocked by the guest's email provider",
    hint: "Their provider treated this email as unwanted. Avoid spammy words and too many links.",
  },
  {
    test: /^4\d\d|\b4\.\d\.\d|421|450|451|452|timeout|timed out|etimedout|econn|try again|temporar|rate limit|too many/i,
    title: "The email server was busy",
    hint: "A temporary problem. Try sending to this guest again later.",
  },
  {
    test: /unsubscrib|suppress|bounced before|previously bounced/i,
    title: "This guest can't receive campaigns",
    hint: "They unsubscribed or their address bounced before.",
  },
];

export const describeSendProblem = (error = "") => {
  const text = String(error || "");
  const match = SEND_PROBLEMS.find((p) => p.test.test(text));
  return match
    ? { title: match.title, hint: match.hint }
    : { title: "The email could not be delivered", hint: "Check the address and try again later." };
};

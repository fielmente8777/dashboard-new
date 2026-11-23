// Small formatters for the Gmail-style Sent and Drafts views.

// Gmail's list date: the time today, "20 Nov" this year, "20/11/25" before
export const mailDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit" });
};

// the full date in the open message: "Thu, 20 Nov 2026, 3:45 pm (2 hours ago)"
export const mailFullDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const full = date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${full} (${timeAgo(date)})`;
};

const timeAgo = (date) => {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

// a person as Gmail lists them: the name, else the part before @
export const personName = ({ name, email } = {}) => (name?.trim() ? name.trim() : String(email || "").split("@")[0]);

// "Anita, rahul and 1,240 others" from a campaign's first recipients and its count
export const recipientsSummary = (campaign, { names = true } = {}) => {
  const shown = campaign?.toPreview || [];
  const total = campaign?.recipientCount || shown.length;
  if (!shown.length) return total ? `${total.toLocaleString("en-IN")} people` : "no recipients";
  const labels = shown.map((p) => (names ? personName(p) : p.email));
  const others = total - shown.length;
  if (others <= 0) return labels.join(", ");
  return `${labels.join(", ")} and ${others.toLocaleString("en-IN")} other${others === 1 ? "" : "s"}`;
};

// how an email went out (gian GET /campaigns/:id/message -> from.via)
export const SENDER_VIA = {
  ses: { label: "Your address · Amazon SES", tone: "amber" },
  mailbox: { label: "Your mailbox", tone: "green" },
  eazotel: { label: "via Eazotel", tone: "gray" },
};

// one line under the sender: what guests saw, and how sure we are
export const senderNote = (from) => {
  if (!from) return "";
  if (from.source === "unknown") {
    return `The sender wasn't recorded for emails this old.${from.replyTo ? ` Replies went to ${from.replyTo}.` : ""}`;
  }
  const where =
    from.via === "eazotel"
      ? `Guests saw “${from.name}” <${from.email}>${from.replyTo ? `; replies went to ${from.replyTo}` : ""}.`
      : from.replyTo
          ? `Replies went to ${from.replyTo}.`
          : "";
  const how =
    from.source === "send-log"
      ? " Worked out from the mail server's log."
      : from.source === "amazon-id"
        ? " Worked out from Amazon's message ID (sent before senders were recorded)."
        : "";
  return `${where}${how}`.trim();
};

// the dashboard user who sent it (newer campaigns save the login email)
export const sentBy = (campaign) =>
  campaign?.createdByEmail || (String(campaign?.createdBy || "").includes("@") ? String(campaign.createdBy) : "");

// a stable colour per letter, for avatars
const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-cyan-600", "bg-orange-500"];
export const avatarColor = (text = "") => AVATAR_COLORS[(String(text).toLowerCase().charCodeAt(0) || 0) % AVATAR_COLORS.length];

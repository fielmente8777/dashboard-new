import { downloadCsv } from "../../utils/csv";

// internal fields that mean nothing in an exported sheet
const EXPORT_HIDDEN_FIELDS = ["_id", "ndid", "hId", "updatedAt", "updated_at"];

export const getLeadName = (lead) =>
  lead.Name || lead.other_details?.full_name || "—";

// Meta leads carry the time the form was filled in, which is the real one
export const getLeadCreatedAt = (lead) =>
  lead.meta?.created_time || lead.Created_at;

export const getLeadSourceLabel = (lead) =>
  lead.created_from === "facebook" ? "meta" : lead.created_from || "—";

// the text of the newest note, or "" when there are none
export const getLatestNote = (lead) => lead.notes?.at?.(-1)?.message || "";

export const isFollowUpToday = (lead) => {
  const value = lead.followUpDate || lead.followUp;
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
};

// "overdue" | "today" | "upcoming", or "" when no follow-up is set
export const getFollowUpState = (lead) => {
  const value = lead.followUpDate || lead.followUp;
  if (!value) return "";
  if (isFollowUpToday(lead)) return "today";
  return new Date(value) < new Date() ? "overdue" : "upcoming";
};

// "Rahul Kumar" -> "RK"; "" when there is no name
export const getLeadInitials = (lead) => {
  const name = getLeadName(lead);
  if (name === "—") return "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

// Some sources save missing fields as the text "undefined" or "null".
// Returns the value as text, or "" when there is nothing real in it.
export const cleanValue = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return ["undefined", "null", "nan"].includes(text.toLowerCase()) ? "" : text;
};

export const getLeadPhone = (lead) => cleanValue(lead.Contact);

export const getLeadEmail = (lead) => cleanValue(lead.Email);

// "check-in: 10/08/2026,check-out: 11/08/2026,number of guest: 5" ->
// [{ label, value }]. Empty when the message is ordinary text rather than
// a list of "name: value" pairs (what the website forms and Eazbot send).
export const parseMessageFields = (message) => {
  const parts = cleanValue(message)
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const fields = [];
  for (const part of parts) {
    const match = part.match(/^([^:]{1,40}):\s*(.*)$/);
    if (match) {
      fields.push({
        label: toLabel(match[1].trim().replace(/[-\s]+/g, "_")),
        value: cleanValue(match[2]),
      });
    } else if (fields.length) {
      // a comma inside a value ("services: Rooms, Spa")
      const last = fields.at(-1);
      last.value = last.value ? `${last.value}, ${part}` : part;
    } else {
      return [];
    }
  }
  return fields.length >= 2 ? fields : [];
};

// The value of the first message field whose name contains one of `words`
const findMessageField = (fields, words) =>
  fields.find((field) =>
    words.some((word) =>
      field.label.toLowerCase().replace(/\s/g, "").includes(word),
    ),
  )?.value || "";

// "10/08/2026" (day first) or any date the browser reads -> Date, or null
const parseStayDate = (text) => {
  const dayFirst = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text);
  const date = dayFirst
    ? new Date(dayFirst[3], dayFirst[2] - 1, dayFirst[1])
    : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

// The stay the lead asked for: { checkIn, checkOut, guests, nights }.
// Taken from the lead's own fields, or else from its message.
export const getStayDetails = (lead) => {
  const fields = parseMessageFields(lead.Message);
  const checkIn =
    cleanValue(lead.check_in) || findMessageField(fields, ["checkin", "arrival"]);
  const checkOut =
    cleanValue(lead.check_out) ||
    findMessageField(fields, ["checkout", "departure"]);
  const guests =
    cleanValue(lead.number_of_guest) ||
    cleanValue(lead.numberOfGuest) ||
    findMessageField(fields, ["guest", "pax", "people"]);

  const from = checkIn && parseStayDate(checkIn);
  const to = checkOut && parseStayDate(checkOut);
  const days = from && to ? Math.round((to - from) / 86_400_000) : 0;

  return { checkIn, checkOut, guests, nights: days > 0 ? days : 0 };
};

// The Badge tone for each stage. Stages not listed are gray.
const STAGE_TONES = {
  Open: "blue",
  Contacted: "sky",
  Qualified: "purple",
  "Quotation Provided": "purple",
  "Follow Up": "amber",
  Potential: "amber",
  Converted: "green",
  "Not Respond": "gray",
  Duplicate: "gray",
  "Out Of Budget": "red",
  "Not Qualified": "red",
  "Dead Lead": "red",
  "Date Sold Out": "red",
  "Turn Away": "red",
  Hot: "red",
  Warm: "amber",
  Cold: "sky",
};

export const getStageTone = (stage) => STAGE_TONES[stage] || "gray";

// The way a lead normally moves forward. Stages outside it (Dead Lead,
// Turn Away...) end the lead without converting it.
export const PIPELINE_STAGES = [
  "Open",
  "Contacted",
  "Qualified",
  "Quotation Provided",
  "Converted",
];

// The colours of each source's chip and avatar.
const SOURCE_STYLES = {
  facebook: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  meta: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  whatsapp: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  google: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  google_ads: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  webform: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  eazbot: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  visitors: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  insta_ad_dm: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  instagram: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

export const getSourceStyle = (lead) =>
  SOURCE_STYLES[lead.created_from] ||
  "bg-gray-500/10 text-gray-600 dark:text-gray-300";

// The ad a Meta lead came from, as [{ label, value }] (empty ones left out).
export const getCampaignDetails = (lead) =>
  [
    { label: "Campaign", value: lead.meta?.campaign_name || lead.campaign_name },
    { label: "Ad", value: lead.meta?.ad_name },
    { label: "Campaign ID", value: lead.meta?.campaign_id },
    { label: "Ad set ID", value: lead.meta?.adgroup_id },
    { label: "Form ID", value: lead.meta?.form_id },
    { label: "Lead ID", value: lead.meta?.leadgen_id },
  ].filter((detail) => detail.value);

// Readable names for the tracking parameters ad platforms add to a link.
const URL_PARAM_LABELS = {
  utm_source: "Lead Source",
  utm_medium: "Marketing Type",
  utm_campaign: "Marketing Campaign",
  utm_term: "Search Keyword",
  utm_content: "Ad Version",
  hsa_acc: "Advertising Account",
  hsa_cam: "Campaign ID",
  hsa_grp: "Ad Group",
  hsa_ad: "Advertisement ID",
  hsa_src: "Traffic Source",
  hsa_tgt: "Target Audience",
  hsa_kw: "Keyword Triggered",
  hsa_mt: "Match Type",
  hsa_net: "Advertising Network",
  hsa_ver: "Tracking Version",
  gad_source: "Google Ad Source",
  gad_campaignid: "Google Campaign",
  gbraid: "Mobile Ad Tracking",
  gclid: "Google Click Reference",
};

// "utm_source" -> "Utm Source"
export const toLabel = (key) =>
  key
    .replace(/\?/g, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

// the page the lead came from, or "" when it was not recorded
export const getLeadSourceUrl = (lead) => cleanValue(lead.source_url);

// The query parameters of that page as [{ label, value }]
export const getSourceUrlParams = (lead) => {
  try {
    const params = new URL(getLeadSourceUrl(lead)).searchParams;
    return [...params.entries()].map(([key, value]) => ({
      label: URL_PARAM_LABELS[key] || toLabel(key),
      value,
    }));
  } catch {
    return [];
  }
};

// Where the request came from, as [{ label, value }]. IP addresses are left out.
export const getRequestDetails = (lead) => {
  const { geo, ...rest } = lead.request_metadata || {};
  const entries = [
    ...Object.entries(rest),
    ...(geo && typeof geo === "object" ? Object.entries(geo) : []),
  ];
  return entries
    .filter(([key]) => !["ip", "readme", "geo"].includes(key))
    .map(([key, value]) => ({ label: toLabel(key), value: String(value || "—") }));
};

// "YYYY-MM-DD" (what the date filter holds) -> the ISO time the API expects
export const toApiDate = (date) =>
  date ? new Date(`${date}T00:00:00`).toISOString() : "";

export const exportLeadsToCsv = (leads, filename) =>
  downloadCsv(
    leads.map((lead) =>
      Object.fromEntries(
        Object.entries(lead).filter(
          ([field]) => !EXPORT_HIDDEN_FIELDS.includes(field),
        ),
      ),
    ),
    filename,
  );

// --- CSV import ---
// The column names (lower case, letters only) accepted for each lead field.
const IMPORT_COLUMNS = {
  Name: ["name", "fullname", "customername", "clientname"],
  Email: ["email", "emailaddress", "mail"],
  Contact: ["phone", "contact", "mobilenumber", "phonenumber", "whatsappnumber"],
  status: ["status", "leadstatus", "stage"],
  Message: ["message", "leadmessage", "notes"],
  created_from: ["createdfrom", "source", "createdsource", "leadsource"],
  Created_at: ["date", "createdat", "createdon", "timestamp", "added", "datecreated"],
};

// "2023-02-27 - 19:16" -> ISO time, or null when it is not in that format
const parseImportDate = (text) => {
  const [datePart, timePart] = (text || "").split(" - ");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

// One CSV row -> the lead the import API expects. The whole row is also
// kept under `other_details`, so no column is lost.
export const csvRowToLead = (row) => {
  const byColumn = Object.fromEntries(
    Object.entries(row).map(([column, value]) => [
      column.toLowerCase().replace(/[^a-z]/g, ""),
      value,
    ]),
  );
  const pick = (field) =>
    IMPORT_COLUMNS[field].map((column) => byColumn[column]).find(Boolean) || "";

  return {
    Name: pick("Name"),
    Email: pick("Email"),
    Contact: pick("Contact"),
    status: pick("status"),
    Message: pick("Message"),
    created_from: pick("created_from").toLowerCase(),
    Created_at: parseImportDate(pick("Created_at")),
    other_details: row,
  };
};

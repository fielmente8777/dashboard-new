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
export const getLeadSourceUrl = (lead) =>
  lead.source_url && lead.source_url !== "undefined" ? lead.source_url : "";

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

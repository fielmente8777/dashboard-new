import * as XLSX from "xlsx";
import { normalizeEmail } from "../EmailMarketing/emailUtils";
import { readSheetFile } from "../EmailMarketing/readSheetFile";

export const SOURCE_LABELS = {
  website: "Website",
  manual: "Added by hand",
  import: "Imported",
  campaign: "From a campaign",
  lead: "From leads",
  contact: "From contacts",
};

// How a lead or contact source is named on screen ("webform" -> "Website form").
const PEOPLE_SOURCE_LABELS = {
  webform: "Website form",
  website: "Website",
  whatsapp: "WhatsApp",
  eazbot: "Eazbot",
  facebook: "Facebook",
  instagram: "Instagram",
  meta: "Meta",
  googleads: "Google Ads",
  google_ads: "Google Ads",
  call: "Calls",
  calls: "Calls",
  manual: "Added by hand",
  import: "Imported",
  other: "Other",
};
export const peopleSourceLabel = (source) =>
  PEOPLE_SOURCE_LABELS[source] || source.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "subscribed", label: "Subscribed" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

export const SOURCE_OPTIONS = [
  { value: "", label: "Any source" },
  ...Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label })),
];

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const formatDate = (value) => (value ? day.format(new Date(value)) : "—");
export const formatNumber = (n) => Number(n || 0).toLocaleString("en-IN");

// "2026-11" -> "Nov"
export const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" });

export const EMAIL_REGEX = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

// headings as they are after normalizeHeader (lower case, no spaces, "_" or "-"), in English,
// Spanish and French, for lists like a Spanish or French guest database
const EMAIL_HEADERS = new Set([
  "email", "emailaddress", "emailid", "mail", "mailid", "subscriber",
  "correo", "correoelectronico", "correoelectrónico", "direcciondecorreo", "direccióndecorreo", "emailcliente",
  "courriel", "adresseemail", "adressemail", "adressee-mail", "adressecourriel",
]);
const NAME_HEADERS = new Set([
  "name", "fullname", "guestname", "firstname", "customername", "subscribername",
  "nombre", "nombrecompleto", "nombreycliente", "nombrecliente",
  "nom", "nomcomplet", "prenom", "prénom", "prénometnom", "prenometnom",
]);

/**
 * Rows { email, name, fields } from a CSV / Excel file. Uses the "email" and "name" columns when
 * the first row names them, and keeps every other column in `fields` (Country, Language, ...).
 * Without an email header, every cell that looks like an email (no names or columns).
 * Emails are checked again on the server; this only counts what will be sent.
 */
export async function readSubscriberFile(file) {
  const workbook = await readSheetFile(file);
  const rows = [];
  const columns = new Set();
  for (const sheetName of workbook.SheetNames) {
    const cells = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", raw: false });
    if (!cells.length) continue;
    const header = (cells[0] || []).map(normalizeHeader);
    const emailCol = header.findIndex((h) => EMAIL_HEADERS.has(h));
    const nameCol = header.findIndex((h) => NAME_HEADERS.has(h));
    if (emailCol >= 0) {
      const labels = (cells[0] || []).map((h) => String(h ?? "").trim());
      const extra = labels
        .map((label, i) => ({ label, i }))
        .filter(({ label, i }) => label && i !== emailCol && i !== nameCol);
      extra.forEach(({ label }) => columns.add(label));
      for (const row of cells.slice(1)) {
        const email = normalizeEmail(row[emailCol]);
        if (!email) continue;
        const fields = {};
        for (const { label, i } of extra) {
          const value = String(row[i] ?? "").trim();
          if (value) fields[label] = value;
        }
        rows.push({ email, name: nameCol >= 0 ? String(row[nameCol] ?? "").trim() || null : null, fields });
      }
    } else {
      for (const row of cells) {
        for (const cell of row) {
          const email = normalizeEmail(cell);
          if (EMAIL_REGEX.test(email.toLowerCase())) rows.push({ email, name: null });
        }
      }
    }
  }
  const valid = rows.filter((r) => EMAIL_REGEX.test(r.email.toLowerCase()));
  return {
    rows,
    valid: valid.length,
    invalid: rows.length - valid.length,
    hasNames: rows.some((r) => r.name),
    // the extra columns kept on each person (the server keeps at most 30)
    columns: [...columns].slice(0, 30),
  };
}

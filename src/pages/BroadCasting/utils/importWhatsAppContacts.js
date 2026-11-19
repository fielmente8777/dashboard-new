
import * as XLSX from "xlsx";

const PHONE_HEADERS = [
  "phone",
  "phonenumber",
  "mobile",
  "mobilenumber",
  "contact",
  "contactno",
  "contactnumber",
  "whatsapp",
  "whatsappnumber",
];

const NAME_HEADERS = [
  "name",
  "fullname",
  "contactname",
  "customername",
  "guestname",
];

const normalizeHeader = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

export const normalizeWhatsAppPhone = (value) => {
  if (value === null || value === undefined) return "";

  let phone = String(value).trim();

  if (!phone) return "";

  // Remove spaces, brackets, hyphens and other separators.
  phone = phone.replace(/[^\d+]/g, "");

  // Convert international 00 prefix to +.
  if (phone.startsWith("00")) {
    phone = `+${phone.slice(2)}`;
  }

  // Remove an existing leading + before processing digits.
  const hadPlus = phone.startsWith("+");
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";

  // Assume India for 10-digit mobile numbers, also when written with the
  // trunk 0 (09876543210).
  if (/^0?[6-9]\d{9}$/.test(digits)) {
    phone = `+91${digits.slice(-10)}`;
  } else if (hadPlus) {
    phone = `+${digits}`;
  } else if (/^\d{11,15}$/.test(digits)) {
    phone = `+${digits}`;
  } else {
    return "";
  }

  // E.164 validation.
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : "";
};

export const importWhatsAppContacts = async (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!["csv", "xlsx", "xls"].includes(extension)) {
    throw new Error("Only CSV, XLS and XLSX files are supported.");
  }

  const buffer = await file.arrayBuffer();

  // raw values, not formatted text: Excel shows a numeric cell such as
  // 919876543210 as "9.19877E+11" in General format, which loses digits.
  // For CSV, raw keeps each cell as typed (leading + or 0 stays).
  const workbook = XLSX.read(buffer, {
    type: "array",
    raw: true,
  });

  const contactsMap = new Map();
  const invalidRows = [];

  let totalRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: true,
    });

    if (rows.length < 2) continue;

    const headers = rows[0].map(normalizeHeader);

    const phoneIndex = headers.findIndex((header) =>
      PHONE_HEADERS.includes(header)
    );

    const nameIndex = headers.findIndex((header) =>
      NAME_HEADERS.includes(header)
    );

    if (phoneIndex === -1) {
      console.warn(`Phone column not found in sheet: ${sheetName}`);
      continue;
    }

    rows.slice(1).forEach((row, index) => {
      const rawPhone = row[phoneIndex];

      if (!String(rawPhone ?? "").trim()) return;

      totalRows++;

      const phone = normalizeWhatsAppPhone(rawPhone);

      if (!phone) {
        invalidRows.push({
          sheet: sheetName,
          row: index + 2,
          phone: String(rawPhone),
          reason: "Invalid phone number",
        });
        return;
      }

      if (!contactsMap.has(phone)) {
        contactsMap.set(phone, {
          name:
            nameIndex >= 0
              ? String(row[nameIndex] ?? "").trim()
              : "",
          phone,
        });
      }
    });
  }

  if (!contactsMap.size) {
    throw new Error(
      "No valid phone numbers found. Check your Excel column headers and phone number format."
    );
  }

  const contacts = Array.from(contactsMap.values());

  return {
    contacts,
    totalRows,
    valid: contacts.length,
    invalid: invalidRows.length,
    duplicates: totalRows - invalidRows.length - contacts.length,
    invalidRows,
  };
};

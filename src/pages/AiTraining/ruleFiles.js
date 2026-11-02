import Papa from "papaparse";
import { CATEGORIES, DEFAULT_CATEGORY } from "./constants";

// Rules to and from a CSV or JSON file, so a hotel can back them up, edit
// them in a spreadsheet, or copy them to another property.
// Columns / keys: ruleText, category, enabled.

export const MAX_IMPORT_RULES = 500;

const CATEGORY_VALUES = new Set(CATEGORIES.map((c) => c.value));
const YES = ["true", "1", "yes", "on", "active"];
const NO = ["false", "0", "no", "off", "inactive"];

// one row of the file -> { ruleText, category, enabled }, or throws with the row number
const toRule = (row, index) => {
  const line = `Row ${index + 1}`;
  const ruleText = String(row?.ruleText ?? "").trim();
  if (!ruleText) throw new Error(`${line}: ruleText is empty.`);

  const category = String(row.category || DEFAULT_CATEGORY).trim().toLowerCase();
  if (!CATEGORY_VALUES.has(category)) throw new Error(`${line}: unknown category "${category}".`);

  let enabled = true;
  if (typeof row.enabled === "boolean") enabled = row.enabled;
  else if (row.enabled != null && row.enabled !== "") {
    const value = String(row.enabled).trim().toLowerCase();
    if (NO.includes(value)) enabled = false;
    else if (!YES.includes(value)) throw new Error(`${line}: enabled must be true or false.`);
  }

  return { ruleText, category, enabled };
};

const toRows = (rules) =>
  rules.map((rule) => ({
    ruleText: rule.ruleText ?? "",
    category: rule.category ?? DEFAULT_CATEGORY,
    enabled: Boolean(rule.enabled),
  }));

const download = (content, fileName, type) => {
  // the BOM makes Excel read the CSV as UTF-8 (Hindi, ₹ ...)
  const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportRules = (rules, name, format) => {
  if (format === "json") {
    download(JSON.stringify(toRows(rules), null, 2), `${name}-ai-rules.json`, "application/json;charset=utf-8");
  } else {
    download(
      Papa.unparse(toRows(rules), { columns: ["ruleText", "category", "enabled"] }),
      `${name}-ai-rules.csv`,
      "text/csv;charset=utf-8",
    );
  }
};

// File -> [{ ruleText, category, enabled }]; throws a message to show
export const readRulesFile = async (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["csv", "json"].includes(extension)) throw new Error("Pick a .csv or .json file.");

  const text = (await file.text()).replace(/^\uFEFF/, "");
  let rows;
  if (extension === "json") {
    try {
      rows = JSON.parse(text);
    } catch {
      throw new Error("That JSON file can't be read.");
    }
    if (!Array.isArray(rows)) throw new Error("The JSON file must hold a list of rules.");
  } else {
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
    });
    if (parsed.errors.length) throw new Error(`That CSV file can't be read: ${parsed.errors[0].message}`);
    rows = parsed.data;
  }

  if (!rows.length) throw new Error("The file has no rules.");
  if (rows.length > MAX_IMPORT_RULES) throw new Error(`Import up to ${MAX_IMPORT_RULES} rules at a time.`);
  return rows.map(toRule);
};

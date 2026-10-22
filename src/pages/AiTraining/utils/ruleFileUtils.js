
import Papa from "papaparse";

const VALID_CATEGORIES = new Set([
  "tone",
  "policy",
  "discounts",
  "restricted_topic",
  "escalation",
  "other",
]);

function normalizeRule(rule, index) {
  const ruleText = String(rule.ruleText ?? "").trim();

  if (!ruleText) {
    throw new Error(`Row ${index + 1}: ruleText is required.`);
  }

  const category = String(rule.category || "other")
    .trim()
    .toLowerCase();

  if (!VALID_CATEGORIES.has(category)) {
    throw new Error(
      `Row ${index + 1}: invalid category "${category}".`
    );
  }

  let enabled = true;

  if (typeof rule.enabled === "boolean") {
    enabled = rule.enabled;
  } else if (rule.enabled != null && rule.enabled !== "") {
    const value = String(rule.enabled).trim().toLowerCase();

    if (["true", "1", "yes", "active"].includes(value)) {
      enabled = true;
    } else if (
      ["false", "0", "no", "inactive"].includes(value)
    ) {
      enabled = false;
    } else {
      throw new Error(
        `Row ${index + 1}: enabled must be true or false.`
      );
    }
  }

  return { ruleText, category, enabled };
}

export function exportRulesToCSV(rules, channel = "whatsapp") {
  const rows = rules.map((rule) => ({
    ruleText: rule.ruleText ?? "",
    category: rule.category ?? "other",
    enabled: Boolean(rule.enabled),
  }));

  const csv = Papa.unparse(rows, {
    columns: ["ruleText", "category", "enabled"],
  });

  downloadFile(
    csv,
    `${channel}-ai-rules.csv`,
    "text/csv;charset=utf-8;"
  );
}

export function exportRulesToJSON(rules, channel = "whatsapp") {
  const rows = rules.map((rule) => ({
    ruleText: rule.ruleText ?? "",
    category: rule.category ?? "other",
    enabled: Boolean(rule.enabled),
  }));

  downloadFile(
    JSON.stringify(rows, null, 2),
    `${channel}-ai-rules.json`,
    "application/json;charset=utf-8;"
  );
}

export async function parseRulesFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!["csv", "json"].includes(extension)) {
    throw new Error("Please select a CSV or JSON file.");
  }

  const text = await file.text();
  let rows;

  if (extension === "json") {
    try {
      rows = JSON.parse(text);
    } catch {
      throw new Error("The JSON file is not valid.");
    }

    if (!Array.isArray(rows)) {
      throw new Error("JSON must contain an array of rules.");
    }
  } else {
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      throw new Error(
        `CSV parsing failed: ${result.errors[0].message}`
      );
    }

    rows = result.data;
  }

  if (rows.length === 0) {
    throw new Error("The file contains no rules.");
  }

  if (rows.length > 500) {
    throw new Error("Import is limited to 500 rules per file.");
  }

  return rows.map(normalizeRule);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob(["\uFEFF", content], {
    type: mimeType,
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

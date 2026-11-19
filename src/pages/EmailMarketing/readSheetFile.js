import * as XLSX from "xlsx";

const isCsv = (file) =>
  /\.(csv|txt)$/i.test(file?.name || "") || /text\/(csv|plain)/i.test(file?.type || "");

// UTF-8 first; a CSV saved by Excel as "CSV (Comma delimited)" is Windows-1252
const decodeText = (buffer) => {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
};

// An .xlsx / .xls / .csv file as a workbook. XLSX reads a CSV's bytes as Latin-1,
// which turns "sächin@" into "sÃ¤chin@", so CSV text is decoded here first.
export const readSheetFile = async (file) => {
  const buffer = await file.arrayBuffer();
  return isCsv(file)
    ? XLSX.read(decodeText(buffer), { type: "string" })
    : XLSX.read(buffer, { type: "array" });
};

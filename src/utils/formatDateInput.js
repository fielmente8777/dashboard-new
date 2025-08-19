export function formatToDateInput(dateStr) {
  if (!dateStr) return "";
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const [day, month, year] = dateStr.split(/[-/]/);
  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

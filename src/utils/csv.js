import Papa from "papaparse";

// Downloads `rows` (an array of plain objects) as "<filename>.csv".
// Rows may have different fields: the columns are every field seen, in the
// order they first appear. Nested values are written as JSON.
export const downloadCsv = (rows, filename) => {
  const columns = [...new Set(rows.flatMap(Object.keys))];
  const flatRows = rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => {
        const value = row[column];
        return [
          column,
          value && typeof value === "object" ? JSON.stringify(value) : value,
        ];
      }),
    ),
  );

  // the byte order mark makes Excel read the file as UTF-8
  const csv = String.fromCharCode(0xfeff) + Papa.unparse(flatRows, { columns });
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Reads a CSV file with a header row. Resolves with one object per row.
export const readCsvFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });

import React, { useState } from "react";
import Papa from "papaparse";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

export default function ImportLead() {
  const [fileName, setFileName] = useState("");
  const [leads, setLeads] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);



    const normalizeKey = (key) =>key.toLowerCase().replace(/[^a-z]/g, "");

    const FIELD_MAP = {
    name: ["name", "fullname", "customername"],
    email: ["email", "emailaddress", "mail"],
    phone: ["phone", "contact", "mobilenumber", "phonenumber"]
    };

    const findField = (row, field) => {
    const keys = Object.keys(row);

    for (let key of keys) {
        const normalized = normalizeKey(key);

        if (FIELD_MAP[field].includes(normalized)) {
        return row[key];
        }
    }

    return "";
    };

  const transformLead = (row) => {
    console.log("Row", row);
    const { Name, name, Email, email, Contact, Phone, phone, ...rest } = row;

    // return {
    //   name: Name || name || "",
    //   email: Email || email || "",
    //   phone: Contact || Phone || phone || "",
    //   other_details: rest, // everything else goes here
    // };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Result",results);
        const transformed = results.data.map(transformLead);
        setLeads(transformed);
        setPreview(transformed.slice(0, 5)); // show only first 5 rows in preview
      },
    });
  };

  const handleImport = async () => {
    // if (leads.length === 0) {
    //   alert("No leads to import");
    //   return;
    // }

    // setLoading(true);

    // try {
    //   const res = await fetch("/api/leads/import-csv", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ leads }),
    //   });

    //   const data = await res.json();

    //   alert(`Imported: ${data.success}, Failed: ${data.failed}`);
    // } catch (err) {
    //   console.error(err);
    //   alert("Import failed");
    // }

    // setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Import Leads (CSV)</h2>

      <div>
        <div className="p-4 space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />

          {fileName && (
            <p className="text-sm text-gray-500">Uploaded: {fileName}</p>
          )}

          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preview</h3>
              <table className="w-full border text-sm">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="border p-2 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="border p-2">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={handleImport} disabled={loading}>
            {loading ? "Importing..." : "Import Leads"}
          </button>
        </div>
      </div>
    </div>
  );
}

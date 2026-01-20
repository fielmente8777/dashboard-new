import React, { useEffect, useState } from "react";

// Utility: normalize webhook payload into flat row object
function normalizeLead(payload, index) {
  const row = {
    id: payload.lead_id || index,
    dateAdded: new Date().toLocaleString(),
    source: "Webhook",
    stage: "Contacted",
  };

  (payload.user_column_data || []).forEach((col) => {
    row[col.column_id] = col.string_value || "-";
  });

  return row;
}

const columns = [
  { key: "select", label: "" },
  { key: "id", label: "#" },
  { key: "dateAdded", label: "Date Added" },
  { key: "source", label: "Source" },
  { key: "FULL_NAME", label: "Name" },
  { key: "PHONE_NUMBER", label: "Contact" },
  { key: "EMAIL", label: "Email" },
  { key: "CITY", label: "City" },
  { key: "stage", label: "Stages" },
];

export default function GoogleLeadsWebhook() {
  const [rows, setRows] = useState([]);

  // Simulated webhook ingestion (replace with real-time push / polling)
  useEffect(() => {
    async function fetchWebhookData() {
      // Example: replace with your backend endpoint
      // const res = await fetch("/api/webhook/leads");
      // const data = await res.json();

      const mockPayload = {
        lead_id: "TeSter-123",
        user_column_data: [
          { column_id: "FULL_NAME", string_value: "FirstName LastName" },
          { column_id: "EMAIL", string_value: "test@example.com" },
          { column_id: "PHONE_NUMBER", string_value: "+16505550123" },
          { column_id: "CITY", string_value: "Mountain View" },
        ],
      };

      setRows((prev) => [...prev, normalizeLead(mockPayload, prev.length + 1)]);
    }

    fetchWebhookData();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-900 text-white text-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No leads received yet
                </td>
              </tr>
            )}

            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3">{row.dateAdded}</td>
                <td className="px-4 py-3">{row.source}</td>
                <td className="px-4 py-3 font-medium">{row.FULL_NAME}</td>
                <td className="px-4 py-3">{row.PHONE_NUMBER}</td>
                <td className="px-4 py-3">{row.EMAIL}</td>
                <td className="px-4 py-3">{row.CITY}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-gray-100">
                    {row.stage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "../../utils/formateData";
import DataContext from "../../context/DataContext";
import jsonToCsvExport from "json-to-csv-export";
import WebSocketClient from "../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../data/constant";
const MetaLeads = () => {
  const wsRef = useRef(null);
  const { metaLeads, limit, setLimit } = useContext(DataContext);
  const [selectedLead, setSelectedLead] = useState(null);

  /* ---------------------------------------------
       Extract Only Required Fields For Table
    ----------------------------------------------*/
  function extractLeadFields(lead) {
    const fields = {};

    lead?.field_data?.forEach((field) => {
      fields[field.name.toLowerCase()] = field.values?.[0] || "";
    });

    return {
      created_time: new Date(lead.created_time).toLocaleString(),

      full_name: fields.full_name || fields.name || "",

      phone_number:
        fields.phone_number || fields.phone || fields.mobile_number || "",

      email: fields.email || fields.email_address || "",

      check_in:
        fields["what_is_your_preferred_check_in_date"] ||
        fields["when_would_you_like_to_check_in?"] ||
        "",

      check_out:
        fields["preferred_check_out_date"] || fields["check_out_date"] || "",
    };
  }

  /* ---------------------------------------------
       Table Headers (Fixed)
    ----------------------------------------------*/
  const tableHeaders = [
    { key: "created_time", label: "Created Time" },
    { key: "full_name", label: "Full Name" },
    { key: "phone_number", label: "Phone Number" },
    { key: "email", label: "Email" },
    { key: "check_in", label: "Check-in" },
    { key: "check_out", label: "Check-out" },
  ];

  /* ---------------------------------------------
       Prepare Table Data From metaLeads
    ----------------------------------------------*/
  const tableData = useMemo(() => {
    if (!Array.isArray(metaLeads)) return [];
    return metaLeads.map((lead) => extractLeadFields(lead));
  }, [metaLeads]);

  /* ---------------------------------------------
       UI
    ----------------------------------------------*/

  const limitOptions = [5, 10, 20, 50, 100, 500];

  const exportToExcel = () => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      console.log("No data available for export");
      return;
    }

    const options = {
      filename: "Meta_Leads",
      delimiter: ",",
      headers: tableHeaders.map((h) => h.key),
    };

    jsonToCsvExport({ data: tableData, options });
  };

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      const { data } = serverResponse;
      console.log(data);

      if (serverResponse?.event === WEBSOCKET_EVENTS.META_NEW_LEAD) {
        console.log(data);
      }
    });

    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="bg-white shadow border p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Meta Lead</h2>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm"
        >
          {limitOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Export to Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-x-auto">
        {tableData?.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No leads available</p>
        ) : (
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-primary border-b">
              <tr>
                <th className="px-3 py-3 text-left text-white">#</th>
                {tableHeaders.map((h) => (
                  <th
                    key={h.key}
                    className="px-3 py-3 text-left font-semibold text-xs text-white min-w-[160px]"
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedLead(metaLeads[i])}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition cursor-pointer"
                >
                  <td className="px-3 py-2 font-medium text-gray-600">
                    {i + 1}
                  </td>

                  {tableHeaders.map((h) => (
                    <td
                      key={h.key}
                      className="px-3 py-2 text-gray-800 min-w-[160px]"
                    >
                      {row[h.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP - SHOW ALL ORIGINAL DATA */}
      {selectedLead && (
        <div className="absolute top-0 left-0 bg-black/50 shadow flex justify-center items-center h-screen w-full z-[99999]">
          <div className="bg-white w-[600px] p-4 rounded overflow-auto">
            <p className="text-sm text-gray-500 mb-4 flex items-center justify-between">
              Lead Added: {formatDate(selectedLead?.created_time)}
              <button
                onClick={() => setSelectedLead(null)}
                className="bg-orange-400 text-white font-medium px-3 py-1 rounded"
              >
                Close
              </button>
            </p>

            {selectedLead?.field_data?.map((field, index) => (
              <div key={index} className="mb-3">
                <p className="font-medium capitalize text-zinc-600">
                  {field?.name.replaceAll("_", " ")}
                </p>
                <p className="text-gray-700">{field?.values?.[0] || ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaLeads;

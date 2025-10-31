import React, { useEffect, useMemo, useState } from "react";
import { NEW_BASE_URL } from "../../data/constant";

const MetaLeads = () => {
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch accounts
  const getAccounts = async () => {
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/meta/accounts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setAccounts(data?.result?.docs?.pages || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // ✅ Fetch leads for selected page ID
  const getLeads = async (pageId) => {
    if (!pageId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/meta/leads?pageId=${pageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setLeads(data?.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccounts();
  }, []);

  // ✅ Filter accounts by search
  const filteredAccounts = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Extract headers dynamically
  const headers = useMemo(() => {
    const fieldNames = new Set();
    leads.forEach((lead) => {
      lead.field_data.forEach((f) => fieldNames.add(f.name));
    });
    return Array.from(fieldNames);
  }, [leads]);

  const getValue = (fields, fieldName) =>
    fields.find((f) => f.name === fieldName)?.values?.[0] || "-";

  return (
    <div className="p-4">
      {/* ✅ Search + Dropdown */}
      <div className="w-full max-w-md mx-auto mt-10 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search account..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {showDropdown && filteredAccounts.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-md mt-1 max-h-48 overflow-y-auto">
              {filteredAccounts.map((acc) => (
                <li
                  key={acc.id}
                  onClick={() => {
                    setSelectedId(acc.id);
                    setSearchTerm(acc.name);
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {acc.name}
                </li>
              ))}
            </ul>
          )}

          {showDropdown && filteredAccounts.length === 0 && (
            <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-md mt-1 p-2 text-gray-500 text-sm">
              No accounts found
            </div>
          )}
        </div>

        <button
          onClick={() => getLeads(selectedId)}
          disabled={loading || !selectedId}
          className={`w-full p-2 rounded-md text-white ${
            loading || !selectedId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Fetch Leads"}
        </button>
      </div>

      {/* ✅ Leads Table */}
      <h1 className="text-xl font-semibold mt-8 mb-4 text-center">
        Meta Leads
      </h1>

      {leads.length === 0 ? (
        <p className="text-center text-gray-500">No leads found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left whitespace-nowrap"
                  >
                    {header.replace(/_/g, " ")}
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Created Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.slice(0, 10).map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-3 whitespace-nowrap">
                      {getValue(lead.field_data, header)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(lead.created_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MetaLeads;

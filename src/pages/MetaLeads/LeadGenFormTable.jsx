import React, { useEffect, useState } from "react";

const LeadGenFormTable = () => {
  const [leadGenFormData, setLeadGenFormData] = useState([
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      message: "Interested in your services.",
      date: "2025-08-20",
      time: "10:30 AM",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1-555-234-5678",
      message: "Looking for more details.",
      date: "2025-08-19",
      time: "02:15 PM",
    },
    {
      name: "Robert Brown",
      email: "robert.brown@example.com",
      phone: "+1-555-345-6789",
      message: "Can we schedule a call?",
      date: "2025-08-18",
      time: "09:00 AM",
    },
  ]);

  // Collect all unique keys dynamically
  const allKeys = Array.from(
    new Set(leadGenFormData.flatMap((item) => Object.keys(item)))
  );

  const fetchLeadGenFormData = async () => {
    try {
    } catch (error) {
      console.error("Error fetching lead gen form data:", error);
    }
  };

  useEffect(() => {
    fetchLeadGenFormData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">LeadGen Form Data</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
              {allKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-2 border-b border-gray-200 text-left font-medium"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leadGenFormData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {allKeys.map((key) => (
                  <td
                    key={key}
                    className="px-4 py-2 border-b border-gray-200 text-gray-700 text-sm"
                  >
                    {row[key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadGenFormTable;

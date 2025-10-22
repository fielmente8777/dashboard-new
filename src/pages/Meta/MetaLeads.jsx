import React from "react";

const MetaLeads = () => {
  const leads = [
    {
      name: "Amit Sharma",
      email: "amit@example.com",
      campaign: "Summer Offer",
      date: "Oct 15, 2025",
    },
    {
      name: "Rita Das",
      email: "rita@example.com",
      campaign: "Winter Discount",
      date: "Oct 13, 2025",
    },
    {
      name: "David Park",
      email: "david@example.com",
      campaign: "Meta Ads",
      date: "Oct 10, 2025",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Meta Leads</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Campaign</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr key={lead.email} className="hover:bg-gray-50">
                <td className="px-6 py-3">{lead.name}</td>
                <td className="px-6 py-3">{lead.email}</td>
                <td className="px-6 py-3">{lead.campaign}</td>
                <td className="px-6 py-3 text-gray-500">{lead.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetaLeads;

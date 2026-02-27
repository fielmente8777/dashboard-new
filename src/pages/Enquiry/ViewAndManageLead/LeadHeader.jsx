const LeadHeader = ({ lead }) => (
  <div className="bg-white rounded-lg shadow-sm p-5">
    <h1 className="text-2xl font-semibold text-gray-800">
      {lead?.Name || "Lead"}
    </h1>
    <p className="text-sm text-gray-500 mt-1">Lead ID: {lead?._id}</p>
  </div>
);

export default LeadHeader;

const LeadHeader = ({ lead }) => (
  <div className="bg-white rounded-lg  p-5 flex justify-between">
    <h1 className="text-2xl font-semibold text-gray-800 capitalize">
      {lead?.Name || "Lead"}
    </h1>

    <button className="bg-orange-600 px-3 py-1 rounded-md text-sm font-medium! text-white">
      Convert
    </button>
    {/* <p className="text-sm text-gray-500 mt-1">Lead ID: {lead?._id}</p> */}
  </div>
);

export default LeadHeader;

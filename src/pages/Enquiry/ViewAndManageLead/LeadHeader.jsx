const LeadHeader = ({ lead }) => (
  <div className="bg-white rounded-lg p-5 flex justify-between items-center">
    <h1 className="text-2xl font-semibold text-gray-800 capitalize">
      {lead?.Name || "Lead"}
    </h1>

    {/* <button
      onClick={onCreateBooking}
      className="bg-primary px-4 py-1.5 text-white rounded-sm"
    >
      Create Booking
    </button> */}
    {/* <p className="text-sm text-gray-500 mt-1">Lead ID: {lead?._id}</p> */}
  </div>
);

export default LeadHeader;

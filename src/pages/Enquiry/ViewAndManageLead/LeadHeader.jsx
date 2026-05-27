import { useState } from "react";
import ReservationForm from "./ReservationForm";

const LeadHeader = ({ lead }) => {
  const [openReservationForm, setOpenReservationForm] = useState();

  return (
    <div className="bg-app-surface border border-app-border rounded-lg p-5 flex justify-between shadow-app-shadow">
      <h1 className="text-2xl font-semibold text-app-text dark:text-app-text-muted capitalize">
        {lead?.Name || "Lead"}
      </h1>

      <button
        onClick={() => setOpenReservationForm(!openReservationForm)}
        className="bg-orange-600 px-3 py-1 rounded-md text-sm font-medium text-white "
      >
        Convert
      </button>

      {openReservationForm && (
        <div className="absolute top-0 left-0 h-screen w-full flex items-center justify-center bg-black/30 z-50">
          <ReservationForm
            openReservationForm={openReservationForm}
            setOpenReservationForm={setOpenReservationForm}
            lead={lead}
          />
        </div>
      )}
    </div>
  );
};

export default LeadHeader;
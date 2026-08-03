import { useState } from "react";
import ReservationForm from "./ReservationForm";
import { formatDateTime } from "../../../utils/formateDate";

const LeadHeader = ({ lead }) => {
  const [openReservationForm, setOpenReservationForm] = useState();

  return (
    <div className="bg-app-surface border border-app-border rounded-lg p-4 flex justify-between items-center shadow-app-shadow">
      <div>
        <h1 className="text-xl font-semibold text-app-text dark:text-app-text-muted capitalize">
          {lead?.Name || "Lead"}
        </h1>

        <span className="text-xs">{formatDateTime(lead?.Created_at)}</span>
      </div>

      <button
        onClick={() => setOpenReservationForm(!openReservationForm)}
        className="bg-orange-600 px-3 py-2 rounded-md text-sm font-medium text-white "
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

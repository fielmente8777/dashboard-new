import { useState } from "react";
import ContactForm from "../Popup/ContactForm";
import { MarketPlaceService } from "../../data/constant";
import MarkInterestedPopup from "../Popup/MarkInterestedPopup";

const CommanHeader = ({ serviceName }) => {

  const [open, setOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState([serviceName])


  console.log(selectedServices)
  return (
    <div className="bg-white">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 font-semibold">{serviceName}</p>
        {/* <button onClick={handleMarkAsInterested(serviceName)} className="bg-green-600 text-white py-2 px-3 rounded-lg hover:scale-95 font-semibold">
          Mark as interested
        </button> */}
        <button onClick={() => setOpen(true)} className="bg-green-600 text-white py-2 px-3 rounded-lg hover:scale-95 font-semibold">
          Mark as interested
        </button>
      </div>

      <MarkInterestedPopup open={open} setOpen={setOpen} selectedServices={selectedServices} setSelectedServices={setSelectedServices} />
    </div>
  );
};

export default CommanHeader;

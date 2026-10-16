import { useState } from "react";
import MarkInterestedPopup from "../Popup/MarkInterestedPopup";
import Button from "../ui/Button";

// The bar on top of a service page: the service's name and the button to
// tell us you are interested in it.
const CommanHeader = ({ serviceName }) => {
  const [open, setOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([serviceName]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-semibold text-app-text">{serviceName}</p>
      <Button onClick={() => setOpen(true)}>Mark as interested</Button>

      <MarkInterestedPopup
        open={open}
        setOpen={setOpen}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
      />
    </div>
  );
};

export default CommanHeader;

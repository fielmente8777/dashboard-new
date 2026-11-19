import { Check } from "lucide-react";
import { useSelector } from "react-redux";
import { MarketPlaceService } from "../../data/constant";
import { useApiAction } from "../../hooks/useApiAction";
import { useCreateLeadMutation } from "../../redux/api/leadsApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";

// the account these requests are filed under
const REQUESTS_DOMAIN = "fielmente";

// Lets the hotel tell us which of our services it is interested in. The
// request reaches our team as an enquiry.
const MarkInterestedPopup = ({
  open,
  setOpen,
  selectedServices,
  setSelectedServices,
}) => {
  const run = useApiAction();
  const profile = useSelector((state) => state.userProfile.user?.Profile);
  const [createRequest, { isLoading }] = useCreateLeadMutation();

  const toggleService = (service) =>
    setSelectedServices(
      selectedServices.includes(service)
        ? selectedServices.filter((item) => item !== service)
        : [...selectedServices, service],
    );

  const handleConfirm = async () => {
    const sent = await run(
      createRequest({
        Contact: profile?.hotelPhone,
        Description: `Interested Sevices: ${selectedServices}`,
        Domain: REQUESTS_DOMAIN,
        Name: profile?.hotelName,
        Remark: "I'm interested in services",
        Subject: "",
        check_in: "",
        check_out: "",
        created_from: "Dashboard",
        email: profile?.hotelEmail,
        numbers_of_guest: "",
      }),
      {
        success: "Thanks! Our team will get in touch with you.",
        error: "Could not send your request. Please try again.",
      },
    );
    if (sent) setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Which services are you interested in?"
      description="Pick one or more and our team will contact you."
      footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={selectedServices.length === 0}
            loading={isLoading}
            onClick={handleConfirm}
          >
            Send request
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {MarketPlaceService.map((service) => {
          const selected = selectedServices.includes(service);
          return (
            <button
              key={service}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleService(service)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selected
                  ? "border-blue-500! bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-app-border! text-app-text-muted hover:border-blue-500! hover:text-app-text"
              }`}
            >
              {selected && <Icon icon={Check} size="xs" />}
              {service}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
};

export default MarkInterestedPopup;

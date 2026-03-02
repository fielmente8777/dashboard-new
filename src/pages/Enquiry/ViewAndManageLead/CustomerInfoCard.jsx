import { FaPhone } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import InfoRow from "./InfoRow";
import CustomDropdown from "../../../components/ui/Dropdown";
import { Stages } from "../../../data/constant";
import { updateLead } from "../../../services/api/leads.api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const CustomerInfoCard = ({ lead }) => {
  if (!lead) return null;

  const handleStageChange = async (value) => {
    try {
      const payload = {
        leadId: lead._id,
        status: value,
        hid: lead?.hId,
      };

      const response = await updateLead(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Lead stage updated successfully",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to update lead stage",
      });
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm p-5 h-auto">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-4">
          Customer Information
        </h3>

        {lead?.Contact && (
          <InfoRow
            label="Mobile Number"
            value={lead.Contact}
            icon={<FaPhone />}
          />
        )}

        {lead?.Email && (
          <InfoRow label="Email Address" value={lead.Email} icon={<MdMail />} />
        )}

        {(lead?.check_in || lead?.check_out || lead?.number_of_guest) && (
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            {lead?.check_in && (
              <p className="font-medium">
                Check In: <span className="text-xs">{lead.check_in}</span>
              </p>
            )}
            {lead?.check_out && (
              <p className="font-medium">
                Check Out: <span className="text-xs">{lead.check_out}</span>
              </p>
            )}
            {lead?.number_of_guest && (
              <p className="font-medium">
                Guests: <span className="text-xs">{lead.number_of_guest}</span>
              </p>
            )}
          </div>
        )}

        {lead?.source_url && (
          <Link
            target="_blank"
            to={lead.source_url}
            className="text-sm text-gray-500 mt-4 inline-block"
          >
            <strong>Source:</strong>{" "}
            <span className="text-primary underline text-xs">
              {lead.source_url.slice(0, 70)}…
            </span>
          </Link>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <CustomDropdown
          label={lead?.status}
          options={Stages}
          onChange={(value) => handleStageChange(value)}
        />
      </div>
    </div>
  );
};

export default CustomerInfoCard;

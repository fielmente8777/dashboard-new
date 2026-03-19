import { FaPhone } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import InfoRow from "./InfoRow";
import CustomDropdown from "../../../components/ui/Dropdown";
import { Stages } from "../../../data/constant";
import { updateLead } from "../../../services/api/leads.api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { useEffect, useState } from "react";
import { fetchUserManagementData } from "../../../services/api";

const CustomerInfoCard = ({ lead }) => {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState([]);

  if (!lead) return null;

  const handleStageChange = async (value) => {
    try {
      const payload = {
        leadId: lead._id,
        status: value,
        hid: lead?.hId,
        conversationId: lead?.conversationId,
      };

      const response = await updateLead(payload);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  const handleUserAssign = async (value) => {
    try {
      const payload = {
        leadId: lead._id,
        hid: lead?.hId,
        conversationId: lead?.conversationId,
        assignee: value,
      };

      const response = await updateLead(payload);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  const fetchUsersData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
    setAllUsers(usersData);
  };

  const handleCall=(contact)=>{
    console.log("Contact",contact);
  }

  useEffect(() => {
    fetchUsersData();
  }, []);

  console.log(allUsers);

  return (
    <div className="flex flex-col bg-white rounded-lg md:shadow-sm p-5 h-auto">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-4">
          Customer Information
        </h3>

        {lead?.Contact && (
          <div onClick={()=>handleCall(lead.Contact)} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">Mobile Number</p>
                <p onClick={()=>handleCall(lead.Contact)} className="text-sm text-gray-600">{lead.Contact}</p>
              </div>
              <div   className="text-primary"><FaPhone /></div>
          </div>
          // <InfoRow
          //   label="Mobile Number"
          //   value={lead.Contact}
          //   icon={<FaPhone />}
          // />
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

      <div className="flex items-center justify-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="" className="text-sm text-gray-500 ml-1">
            Assignee
          </label>
          <CustomDropdown
            label={lead?.assignee || "Select User"}
            options={
              allUsers?.map((user) => ({
                value: user?.userName,
                label: user?.userName,
              })) || []
            }
            onChange={(value) => handleUserAssign(value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="" className="text-sm text-gray-500 ml-1">
            Stages
          </label>
          <CustomDropdown
            label={lead?.status}
            options={Stages}
            onChange={(value) => handleStageChange(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard;

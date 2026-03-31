import { FaPhone, FaWhatsapp } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import InfoRow from "./InfoRow";
import CustomDropdown from "../../../components/ui/Dropdown";
import { NEW_BASE_URL, Stages, TurnAwayCode } from "../../../data/constant";
import { updateLead } from "../../../services/api/leads.api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { useContext, useEffect, useState } from "react";
import { fetchUserManagementData } from "../../../services/api";
import DataContext from "../../../context/DataContext";
import DatePickerModal from "../../../components/Modal/DatePickerModal";

const CustomerInfoCard = ({ lead, onClick }) => {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState([]);
  const [agentNumber, setAgentNumber] = useState();
  const [selectedGuestNumber, setSelectedGuestNumber] = useState("");
  const { integrationStatus, checkIntegrationStatus } = useContext(DataContext);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [callPopup, setCallPopup] = useState(false);

  const handleStageChange = async ({ value, followUpDate, turnAwayCode }) => {
    try {
      const payload = {
        leadId: lead._id,
        status: value,
        hid: lead?.hId,
        conversationId: lead?.conversationId,
        followUpDate: followUpDate || null,
        ...(turnAwayCode && { turnAwayCode }),
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

  const handleCallPopup = (contact) => {
    if (contact || contact.length < 10) {
      console.log("Wronge contact information");
    }
    console.log(contact);
    setSelectedGuestNumber(contact);
    setCallPopup(true);
  };
  const handleCall = async () => {
    console.log("Contact", selectedGuestNumber, agentNumber);
    try {
      if (!agentNumber || !selectedGuestNumber) {
        alert("Both numbers are required");
        return;
      }

      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/call/auth/make-call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // authMiddleware expects this
          },
          body: JSON.stringify({
            fromNumber: agentNumber,
            toNumber: selectedGuestNumber,
          }),
        },
      );

      const data = await response.json();

      // console.log("lkjhgfdxcvbmnm,",data);

      if (!response.ok) {
        alert(data?.error || "Call failed");
        return;
      }

      alert("✅ Call initiated successfully");
      setCallPopup(false);
      // setFromNumber("");
      // setToNumber("");
    } catch (error) {
      console.error("Call error:", error);
      alert("Something went wrong while making the call");
    }
  };

  useEffect(() => {
    fetchUsersData();
    checkIntegrationStatus();
  }, []);

  if (!lead) return null;

  return (
    <div className="flex flex-col bg-white rounded-lg md:shadow-sm p-5 h-auto">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-4">
          Customer Information
        </h3>

        {lead?.Contact && (
          <div className="cursor-pointer flex justify-between items-center py-2 border-b last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700">Mobile Number</p>
              <p
                onClick={() => handleCallPopup(lead.Contact)}
                className="text-sm text-gray-600"
              >
                {lead.Contact}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                onClick={onClick}
                className="text-primary rounded bg-orange-600/10 p-2"
              >
                <FaWhatsapp />
              </div>
              {integrationStatus.exotel ? (
                <div
                  onClick={() => handleCallPopup(lead.Contact)}
                  className="rounded text-primary bg-orange-600/10 p-2"
                >
                  <FaPhone />
                </div>
              ) : (
                <Link
                  to={`tel:${lead.Contact}`}
                  className="rounded text-primary bg-orange-600/10 p-2"
                >
                  <FaPhone />
                </Link>
              )}
            </div>
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

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <div className="flex w-auto flex-col gap-1">
          <label htmlFor="" className="text-sm text-gray-500 ml-1">
            Attempted By
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

        <div className="flex flex-col gap-1 w-auto">
          <label htmlFor="" className="text-sm text-gray-500 ml-1">
            Stages
          </label>
          <CustomDropdown
            label={lead?.status}
            options={Stages}
            onChange={(value) => {
              if (value === "Follow Up") {
                setShowDatePicker(true);
              } else {
                handleStageChange({
                  value,
                });
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-1 w-auto">
          <label htmlFor="" className="text-sm text-gray-500 ml-1">
            Turn Away Code
          </label>
          <CustomDropdown
            label={lead?.turnAwayCode || "Select Code"}
            options={TurnAwayCode}
            onChange={(value) => {
              handleStageChange({
                value: "Turn Away",
                turnAwayCode: value,
              });
            }}
          />
        </div>
      </div>

      {callPopup && (
        <div className="fixed inset-0 z-[99999] flex justify-center bg-black/50">
          <div className="w-[400px] h-[200px] max-w-md p-4 bg-white shadow-xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col">
            <div className="flex flex-col gap-2">
              <h1>Enter Number to make a call!</h1>
              <CustomDropdown
                label={lead?.assignee || "Select Agent"}
                options={
                  allUsers?.map((user) => ({
                    value: user?.phone,
                    label: user?.userName,
                  })) || []
                }
                onChange={(value) => setAgentNumber(value)}
              />
              {/* <input value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} placeholder="From number" required className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /> */}
              <input
                value={selectedGuestNumber}
                onChange={(e) => setSelectedGuestNumber(e.target.value)}
                placeholder="Guest number"
                required
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCallPopup(false)}
                  className="flex justify-end w-fit border py-1 px-5 bg-red-300 rounded hover:bg-orange-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCall}
                  className="flex justify-end w-fit border py-1 px-5  rounded hover:bg-orange-400"
                >
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={(date) => {
          handleStageChange({
            value: "Follow Up",
            followUpDate: date,
          });
          setShowDatePicker(false);
        }}
      />
    </div>
  );
};

export default CustomerInfoCard;

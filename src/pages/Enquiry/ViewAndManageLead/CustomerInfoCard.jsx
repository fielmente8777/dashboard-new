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
import CustomDropdown2 from "../../../components/ui/Dropdown2";
import { formatDate, formatDateTime } from "../../../utils/formateDate";
import { normalizePhoneNumber } from "../../../utils/normalizePhoneNumber";

const CustomerInfoCard = ({ lead, onClick }) => {
  console.log(lead);
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

  const handleUserAssign = async (item) => {
    const [phone, email] = item.value.split(",");

    try {
      const payload = {
        leadId: lead._id,
        hid: lead?.hId,
        conversationId: lead?.conversationId,
        assignee: item?.label,
        assigneeNumber: phone || null,
        assigneeEmail: email || null,
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
        }
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

  const getQueryParams = (url) => {
    try {
      const params = new URL(url).searchParams;
      return Object.fromEntries(params.entries());
    } catch {
      return {};
    }
  };

  const friendlyLabels = {
    utm_source: "Lead Source",
    utm_medium: "Marketing Type",
    utm_campaign: "Marketing Campaign",
    utm_term: "Search Keyword",
    utm_content: "Ad Version",

    hsa_acc: "Advertising Account",
    hsa_cam: "Campaign ID",
    hsa_grp: "Ad Group",
    hsa_ad: "Advertisement ID",
    hsa_src: "Traffic Source",
    hsa_tgt: "Target Audience",
    hsa_kw: "Keyword Triggered",
    hsa_mt: "Match Type",
    hsa_net: "Advertising Network",
    hsa_ver: "Tracking Version",

    gad_source: "Google Ad Source",
    gad_campaignid: "Google Campaign",

    gbraid: "Mobile Ad Tracking",
    gclid: "Google Click Reference",
  };

  const queryParams = getQueryParams(lead?.source_url);

  if (!lead) return null;

  return (
    <div className="flex flex-col bg-app-surface-secondary rounded-lg md:shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] p-5 h-auto border border-gray-200 dark:border-[#2d3748]">
      <div className="flex-">
        <h3 className="font-semibold text-gray-800 dark:text-[#e8eaed] mb-4">
          Customer Information
        </h3>

        {lead?.Contact && (
          <div className="cursor-pointer flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#2d3748] last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-[#e8eaed]">
                Mobile Number
              </p>
              <p
                onClick={() => handleCallPopup(lead.Contact)}
                className="text-sm text-gray-600 dark:text-[#9ca3af]"
              >
                {normalizePhoneNumber(lead?.Contact)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div
                onClick={onClick}
                className="text-primary rounded bg-primary/10 dark:bg-white p-2"
              >
                <FaWhatsapp />
              </div>

              {integrationStatus.exotel ? (
                <div
                  onClick={() => handleCallPopup(lead.Contact)}
                  className="rounded text-primary bg-primary/10 dark:bg-white p-2"
                >
                  <FaPhone />
                </div>
              ) : (
                <Link
                  to={`tel:${lead.Contact}`}
                  className="rounded text-primary bg-primary/10 dark:bg-white p-2"
                >
                  <FaPhone />
                </Link>
              )}
            </div>
          </div>
        )}

        {lead?.Email && (
        
            <InfoRow
              label="Email Address"
              value={lead.Email}
              icon={<MdMail />}
            />
      
        )}

        {(lead?.check_in || lead?.check_out || lead?.number_of_guest) && (
          <div className="mt-4 text-sm text-gray-700 dark:text-[#9ca3af] space-y-1">
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

        {lead?.source_url && lead?.source_url !== "undefined" && (
          <Link
            style={{ wordBreak: "break-all" }}
            target="_blank"
            to={lead.source_url}
            className="text-sm mt-4 whitespace-pre-wrap text-blue-500 dark:text-blue-400"
          >
            <strong className="text-gray-500 dark:text-[#9ca3af]">
              Source:
            </strong>{" "}
            {lead.source_url}
          </Link>
        )}

        <div className="mt-4 text-sm text-gray-700 dark:text-[#e8eaed] border border-gray-200 dark:border-[#2d3748] p-4 rounded-xl">
          <h1 className="font-semibold mb-3">URL Parameters</h1>

          {Object.keys(queryParams)?.length > 0 ? (
            <div className="space-y-2">
              {Object.entries(queryParams)?.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-4 border-b border-gray-200 dark:border-[#2d3748] pb-2 last:border-b-0"
                >
                  <span className="font-medium text-gray-600 dark:text-[#9ca3af]">
                    {friendlyLabels[key] || key.replace(/_/g, " ")}
                  </span>

                  <span className="text-gray-800 dark:text-[#e8eaed] break-all text-right">
                    {decodeURIComponent(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-[#6b7280]">
              No URL parameters found
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <div className="flex w-auto flex-col gap-1">
          <label className="text-sm bg-app-surface-secondary ml-1">
            Attempted By
          </label>
          <CustomDropdown2
            label={lead?.assignee || "Select User"}
            options={
              allUsers?.map((user) => ({
                value: `${user?.phone},${user?.emailId}`,
                label: user?.userName,
              })) || []
            }
            onChange={(value) => handleUserAssign(value)}
          />
        </div>

        <div className="flex flex-col gap-1 w-auto">
          <label className="text-sm text-gray-500 dark:text-[#9ca3af] ml-1">
            Stages
          </label>
          <CustomDropdown
            label={lead?.status}
            options={Stages}
            onChange={(value) => {
              if (value === "Follow Up") {
                setShowDatePicker(true);
              } else {
                handleStageChange({ value });
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-1 w-auto">
          <label className="text-sm text-gray-500 dark:text-[#9ca3af] ml-1">
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
          <div className="w-[400px] h-50 max-w-md p-4 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#2d3748] shadow-xl flex flex-col rounded-lg">
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 dark:text-[#e8eaed]">
                Enter Number to make a call!
              </h1>

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

              <input
                value={selectedGuestNumber}
                onChange={(e) => setSelectedGuestNumber(e.target.value)}
                placeholder="Guest number"
                required
                className="mt-1 w-full border border-gray-300 dark:border-[#2d3748] bg-white dark:bg-[#242b3d] text-gray-900 dark:text-[#e8eaed] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCallPopup(false)}
                  className="border py-1 px-5 bg-red-300 dark:bg-red-500/20 dark:text-red-300 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCall}
                  className="border border-gray-300 dark:border-[#2d3748] py-1 px-5 rounded text-gray-900 dark:text-[#e8eaed] hover:bg-orange-400 dark:hover:bg-orange-500/20"
                >
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfoCard;

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  MdAccountBalance,
  MdAdd,
  MdClose,
  MdLink,
  MdLinkOff,
  MdVerified,
} from "react-icons/md";
import WhatsappBusinessSkelton from "../../../components/Skeltons/WhatsappBusinessSkelton";
import DataContext from "../../../context/DataContext";
import { connectWhatsapp } from "../../../services/api/Integration";
import {
  getWhatsappAccountDetails,
  getWhatsAppFlows,
  getWhatsAppMessageTemplates,
  getWhatsAppProfile,
  updateWhatsAppProfile,
} from "../../../services/api/whatsApp";

import { FiMenu } from "react-icons/fi";
import { ReactFlowProvider } from "reactflow";
import FlowBuilder from "../../../components/WhatsappFlow/FlowBuilder";
import AutoMessageCard from "./components/AutoMessageCard";
import WhatsappFlow from "./WhatsappFlow/WhatsappFlow";
import TemplateLibrary from "./components/TemplateLibrary";
import WhatsAppMessageTemplate from "../Whatsapp/components/Templates";
import CreateTemplate from "../Whatsapp/components/CreateTemplate";
import WhatsAppProfileCard from "./components/WhatsAppProfileCard";
import { useToast } from "../../../context/ToastContext";
import Flows from "./components/Flows";
import ChannelToggle from "./components/ChannelToggle";

const sidebarTabs = [
  { id: "overview", label: "Overview" },
  {
    id: "create-template",
    label: "Message Templates",
    children: [
      { id: "create-template", label: "Create Template" },
      { id: "template-library", label: "Template Library" },
    ],
  },
  { id: "auto-message", label: "Auto Message" },
  // { id: "credits", label: "Credits" },
  {
    id: "whatsapp-flows",
    label: "Flows",
    children: [
      { id: "whatsapp-flows", label: "Create Flow" },
      { id: "flows", label: "Flows" },
    ],
  },
  { id: "whatsapp-flow", label: "WhatsApp Flow" },
];

const WhatsAppBusiness = ({ template = false }) => {
  const hasFetchedRef = useRef(false);
  const { showToast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("create-template");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [activeTab, setActiveTab] = useState(
    template ? "templates" : "overview",
  );
  const [collapsed, setCollapsed] = useState(false);
  const { integrationStatus, checkIntegrationStatus } = useContext(DataContext);
  const [accountDetails, setAccountDetails] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [flows, setFlows] = useState({});
  const [whatsAppProfile, setWhatsAppProfile] = useState({});
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const handleWhatsappConnect = async () => {
    try {
      const response = await connectWhatsapp();

      if (response?.success && response?.responseStatusCode) {
        window.open(response?.result?.docs?.signupUrl, "_blank");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAccountDetails = useCallback(async () => {
    try {
      const response = await getWhatsappAccountDetails();
      console.log(response);
      setAccountDetails(response?.result?.docs);
    } catch (error) {
      console.error("Error fetching data", error?.message);
    }
  }, []);

  const fetchWhatsAppProfile = useCallback(async () => {
    try {
      const response = await getWhatsAppProfile();
      if (response?.success) {
        setWhatsAppProfile(response?.result?.doc);
      }
    } catch (error) {
      console.error("Error fetching data", error?.message);
    }
  }, []);

  const updateWhatsAppProfileFunc = useCallback(async (data) => {
    setIsProfileSaving(true);
    try {
      const formData = new FormData();

      // ✅ Normal fields
      if (data.about) formData.append("about", data.about);
      if (data.vertical) formData.append("vertical", data.vertical);
      if (data?.email) formData.append("email", data.email);
      if (data?.address) formData.append("address", data.address);

      // ✅ websites (convert to string if array)
      if (data.websites) {
        const websites = Array.isArray(data.websites)
          ? data.websites
          : [data.websites];

        formData.append("websites", JSON.stringify(websites));
      }

      // ✅ IMAGE HANDLING
      if (data.image instanceof File) {
        // 👉 file upload case
        formData.append("file", data.image); // 🔥 important: key should match backend (multer)
      } else if (typeof data.image === "string") {
        // 👉 URL case
        formData.append("profile_picture_url", data.image);
      }

      const response = await updateWhatsAppProfile(formData);
      if (response?.success) {
        showToast({
          message: "Profile updated successfully",
          type: "success",
        });
        fetchWhatsAppProfile();
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsProfileSaving(false);
    }
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const fetchFlows = async () => {
    const response = await getWhatsAppFlows();

    if (response.success && response.responseStatusCode === 200) {
      setFlows(response?.result?.docs?.flow || {});
    }
  };

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  useEffect(() => {
    if (integrationStatus?.metaWhatsapp && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAccountDetails();
      fetchTemplate();
      fetchWhatsAppProfile();
    }
  }, [integrationStatus]);

  useEffect(() => {
    fetchFlows();
  }, []);

  if (!accountDetails) {
    return <WhatsappBusinessSkelton />;
  }

  if (!integrationStatus?.metaWhatsapp) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 border border-gray-100 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-7 w-7 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 21l1.5-4.5A8.5 8.5 0 1 1 21 12a8.5 8.5 0 0 1-8.5 8.5H3z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-medium text-gray-600">
            Connect WhatsApp Business
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Connect your WhatsApp Business account to send messages, manage
            conversations, automate notifications, and engage with customers
            directly from your dashboard.
          </p>

          {/* CTA */}
          <button
            onClick={handleWhatsappConnect} // 👈 Meta OAuth / Embedded Signup
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span>Connect WhatsApp Business</span>
          </button>

          {/* Helper text */}
          <p className="mt-4 text-xs text-gray-400">
            Secure Meta OAuth • Verified Tech Provider • Official WhatsApp Cloud
            API
          </p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {accountDetails && (
        <div className="flex h-full">
          <div
            className={` bg-gray-100/60 shadow! h-full transition-all duration-300
                        ${collapsed ? "w-10" : "w-56"} p-2`}
          >
            {/* Hamburger */}
            <div className="flex justify-end mb-3">
              <button onClick={() => setCollapsed(!collapsed)}>
                <FiMenu size={20} />
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex flex-col h-full scrollbar-hidden overflow-y-auto gap-1">
              {sidebarTabs.map((tab) => {
                const isOpen = openDropdown === tab.id;

                return (
                  <div key={tab.id}>
                    {/* Parent Tab */}
                    <button
                      onClick={() => {
                        if (tab.children) {
                          setOpenDropdown(isOpen ? null : tab.id);
                          setActiveTab(tab.id);
                          setActiveSubTab(tab.id);
                        } else {
                          setActiveTab(tab.id);
                          setOpenDropdown(null);
                        }
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-primary/10 "
                      }`}
                    >
                      {!collapsed && <span>{tab.label}</span>}

                      {tab.children && !collapsed && (
                        <span className="text-xs transition-all duration-300">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      )}
                    </button>

                    {/* Sub Dropdown */}
                    {tab.children && isOpen && !collapsed && (
                      <div className="ml-4 mt-1 flex flex-col gap-1">
                        {tab.children.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              // setActiveTab(tab.id);
                              setActiveSubTab(sub.id);
                            }}
                            className={`text-left px-3 py-2 rounded-md text-sm ${
                              activeSubTab === sub.id
                                ? "bg-gray-300 text-black"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 h-full overflow-y-auto scrollbar-hidden">
            {activeTab === "overview" && (
              <div className="w-full gap-4 grid md:grid-cols-2">
                <div className="flex gap-4 flex-col">
                  {/* <BusinessInfoCard business={accountDetails?.business} /> */}

                  <WabaDetailsCard
                    waba={accountDetails?.waba}
                    business={accountDetails?.business}
                  />
                  <PhoneNumberCard phoneNumber={accountDetails?.phoneNumber} />
                </div>
                <WhatsAppProfileCard
                  profile={whatsAppProfile}
                  loading={isProfileSaving}
                  onSave={updateWhatsAppProfileFunc}
                />
                {/* <CreditInfoCard /> */}
                <AutoMessageCard
                  phoneNumberId={accountDetails?.phoneNumber?.id}
                  autoMessage={accountDetails?.autoMessage}
                  templates={templates} // backend should send this
                  flows={flows || []}
                  notification={accountDetails?.notification}
                />
                <WhatsAppMessageTemplate />
              </div>
            )}

            {activeTab === "create-template" &&
              activeSubTab === "create-template" && (
                <CreateTemplate
                  initialData={selectedTemplate}
                  onClose={() => {
                    setSelectedTemplate(null);
                    setActiveSubTab("template-library");
                  }}
                />
              )}

            {activeTab === "create-template" &&
              activeSubTab === "template-library" && (
                <TemplateLibrary
                  onSelectTemplate={(template) => {
                    setActiveSubTab("create-template");
                    setSelectedTemplate(template);
                  }}
                />
              )}

            {activeTab === "whatsapp-flow" && (
              <ReactFlowProvider>
                <FlowBuilder />
              </ReactFlowProvider>
            )}

            {activeSubTab === "whatsapp-flows" && <WhatsappFlow />}

            {activeSubTab === "flows" && <Flows />}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default WhatsAppBusiness;

const BusinessInfoCard = ({ business }) => {
  if (!business) return null;

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-white px-6 py-5">
      {/* Top */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              WhatsApp Business Account
            </p>

            {business.verificationStatus === "verified" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <MdVerified className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          <h2 className="text-2xl font-medium text-gray-600 leading-none">
            {business.name}
          </h2>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100" />

      <div className="mt-3 text-sm text-gray-500">
        Business ID
        <span className="ml-2 font-medium text-gray-800">{business.id}</span>
      </div>
    </div>
  );
};

const PhoneNumberCard = ({ phoneNumber }) => {
  if (!phoneNumber) return null;

  const isCloudApi = phoneNumber.platformType === "CLOUD_API";
  const isLive = phoneNumber.accountMode === "LIVE";
  const isConnected = isCloudApi && isLive;

  const messageStatusLabel = isConnected
    ? "Message Enabled"
    : "Messaging Disabled";

  const messageStatusColor = isConnected
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-100 text-gray-600";

  return (
    <div className="w-full border border-gray-200  bg-white px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaWhatsapp className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-medium text-gray-600">Phone Number</h3>
        </div>

        <span className="text-sm font-medium text-gray-600">
          Quality Rating:{" "}
          <span className="bg-green-500 text-white px-3 font-medium text-sm py-1 rounded-2xl">
            {phoneNumber.qualityRating === "GREEN"
              ? "Green"
              : phoneNumber.qualityRating}
          </span>
        </span>

        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${messageStatusColor}`}
        >
          {messageStatusLabel}
        </span>
      </div>

      {/* Number */}
      <div className="mb-5">
        <p className="text-xl font-medium text-gray-600">
          {phoneNumber.displayPhoneNumber}
        </p>
        <p className="text-sm text-gray-500">{phoneNumber.verifiedName}</p>
      </div>

      {/* Status Summary Row */}
      <div className="flex justify-between items-center gap-3 mb-4 text-sm">
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
              isConnected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isConnected ? (
              <MdLink className="w-4 h-4" />
            ) : (
              <MdLinkOff className="w-4 h-4" />
            )}
            {isConnected ? "Connected" : "Not Connected"}
          </span>
          {!isCloudApi && (
            <span className="text-xs text-gray-500">
              Requires Cloud API to send messages
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="inline-block">Enable Cloud API</label>
          <ChannelToggle />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Verification */}
        <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
          <span className="text-gray-600 font-medium">Verification</span>
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              phoneNumber.codeVerificationStatus === "VERIFIED"
                ? "text-green-700"
                : "text-red-600"
            }`}
          >
            {phoneNumber.codeVerificationStatus === "VERIFIED" ? (
              <MdVerified className="w-4 h-4" />
            ) : (
              <MdClose className="w-4 h-4" />
            )}
            {phoneNumber.codeVerificationStatus}
          </span>
        </div>

        {/* Platform */}
        <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
          <span className="text-gray-600 font-medium">Platform</span>
          <span
            className={`font-medium ${
              isCloudApi ? "text-green-700" : "text-gray-800"
            }`}
          >
            {phoneNumber.platformType || "—"}
          </span>
        </div>

        {/* Account Mode */}
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <span className="text-gray-600 font-medium">Account Mode</span>
          <span
            className={`font-medium ${
              phoneNumber.accountMode === "LIVE"
                ? "text-primary"
                : "text-gray-500"
            }`}
          >
            {phoneNumber.accountMode || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

const WabaDetailsCard = ({ waba, business }) => {
  if (!waba) return null;

  const MARKETING_STATUS_UI = {
    COMPLETED: {
      label: "Completed",
      description: "Marketing messages are enabled",
      style: "bg-green-100 text-green-700",
    },
    IN_PROGRESS: {
      label: "In Progress",
      description: "Setup is currently under review",
      style: "bg-yellow-100 text-yellow-700",
    },
    NOT_STARTED: {
      label: "Not Started",
      description: "Marketing messaging setup not completed",
      style: "bg-gray-100 text-gray-600",
    },
    REJECTED: {
      label: "Rejected",
      description: "Setup was rejected by Meta",
      style: "bg-red-100 text-red-700",
    },
    UNKNOWN: {
      label: "Unknown",
      description: "Status not available",
      style: "bg-gray-100 text-gray-500",
    },
  };

  // const statusKey = waba.marketingMessagesOnboardingStatus || "UNKNOWN";
  // const status = MARKETING_STATUS_UI[statusKey];

  return (
    <div className="w-full border border-gray-200 bg-white px-6 py-5">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FaWhatsapp className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            WhatsApp Business Account
          </span>
        </div>

        <h2 className="text-xl font-medium text-gray-600">
          {waba.name || "Unnamed WABA"}
        </h2>

        <p className="text-sm text-gray-500">
          WABA ID:
          <span className="ml-2 font-medium text-gray-800">{waba.id}</span>
        </p>
        <p className="text-sm text-gray-500">
          Business ID:
          <span className="ml-2 font-medium text-gray-800">{business.id}</span>
        </p>
      </div>

      {/* Divider */}
      {/* <div className="mt-4 border-t border-gray-100" /> */}

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Marketing Status */}
        {/* <div className="flex items-center justify-between border border-gray-100 px-3 py-2">
          <span className="text-gray-500">Marketing Status</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md ${status.style}`}
          >
            {status.label}
          </span>
        </div> */}

        {/* Marketing Explanation */}
        {/* <div className="flex items-center justify-between border border-gray-100 px-3 py-2">
          <span className="text-gray-500">Marketing Messaging</span>
          <span className="font-medium text-gray-800">
            {status.description}
          </span>
        </div> */}

        {/* Timezone */}
        {/* <div className="flex items-center justify-between border border-gray-100 px-3 py-2">
          <span className="text-gray-500">Timezone ID</span>
          <span className="font-medium text-gray-800">
            {waba.timezone || "N/A"}
          </span>
        </div> */}
      </div>
    </div>
  );
};

const CreditInfoCard = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 bg-white px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium  text-gray-600">
          WhatsApp Credit Report
        </h3>

        <button
          onClick={() => setOpen(true)}
          className="flex gap-[5px] text-sm font-medium px-3 rounded py-2 bg-green-500 text-white items-center justify-between"
        >
          <MdAdd size={20} /> Buy Credits
        </button>
      </div>
      <div>
        <p className="flex items-center gap-1 font-medium text-gray-700">
          <MdAccountBalance />
          Account Balance
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-medium text-gray-600">0000.5</span>
          <span className="text-sm text-gray-600">remaining credits</span>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-99999"
        >
          <div className="bg-white w-full max-w-md p-6 space-y-5">
            <h2 className="font-medium text-gray-500 text-center">
              {" "}
              We are coming soon with this feature, Thanks
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

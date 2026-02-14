import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaWhatsapp, FaBusinessTime, FaRegClock } from "react-icons/fa";
import { getWhatsappAccountDetails } from "../../../services/api/whatsApp";
import {
  MdVerified,
  MdClose,
  MdLinkOff,
  MdLink,
  MdCheckCircle,
} from "react-icons/md";
import WhatsappBusinessSkelton from "../../../components/Skeltons/WhatsappBusinessSkelton";
import DataContext from "../../../context/DataContext";
import { connectWhatsapp } from "../../../services/api/Integration";

const WhatsAppBusiness = () => {
  const hasFetchedRef = useRef(false);
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useContext(DataContext);
  const [accountDetails, setAccountDetails] = useState(null);

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

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  useEffect(() => {
    if (integrationStatus?.metaWhatsapp && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAccountDetails();
    }
  }, [integrationStatus]);

  if (!accountDetails) {
    return <WhatsappBusinessSkelton />;
  }

  if (!integrationStatus?.metaWhatsapp) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
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
          <h2 className="text-2xl font-semibold text-gray-900">
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
            Secure Meta OAuth • Embedded signup • Official WhatsApp Cloud API
          </p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {accountDetails && (
        <div className="w-full space-y-6 p-4">
          <BusinessInfoCard business={accountDetails?.business} />
          <WabaDetailsCard
            waba={accountDetails?.waba}
            business={accountDetails?.business}
          />
          <PhoneNumberCard phoneNumber={accountDetails?.phoneNumber} />
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

          <h2 className="text-2xl font-semibold text-gray-900 leading-none">
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
    <div className="w-full border border-gray-200 rounded-lg bg-white px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaWhatsapp className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-900">Phone Number</h3>
        </div>

        <span className="text-sm">
          Quality Rating: <span className="bg-green-300 px-3 font-medium text-sm py-1 rounded-2xl">{phoneNumber.qualityRating==="GREEN"?"Green":phoneNumber.qualityRating}</span>
        </span>

        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${messageStatusColor}`}
        >
          {messageStatusLabel}
        </span>
      </div>

      {/* Number */}
      <div className="mb-5">
        <p className="text-xl font-semibold text-gray-900">
          {phoneNumber.displayPhoneNumber}
        </p>
        <p className="text-sm text-gray-500">{phoneNumber.verifiedName}</p>
      </div>

      {/* Status Summary Row */}
      <div className="flex items-center gap-3 mb-4 text-sm">
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

const WabaDetailsCard = ({ waba }) => {
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

  const statusKey = waba.marketingMessagesOnboardingStatus || "UNKNOWN";
  const status = MARKETING_STATUS_UI[statusKey];

  return (
    <div className="w-full border border-gray-200 bg-white px-6 py-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FaWhatsapp className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            WhatsApp Business Account
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900">
          {waba.name || "Unnamed WABA"}
        </h2>

        <p className="text-sm text-gray-500">
          WABA ID
          <span className="ml-2 font-medium text-gray-800">{waba.id}</span>
        </p>
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-gray-100" />

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Marketing Status */}
        <div className="flex items-center justify-between border border-gray-100 px-3 py-2">
          <span className="text-gray-500">Marketing Status</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md ${status.style}`}
          >
            {status.label}
          </span>
        </div>

        {/* Marketing Explanation */}
        <div className="flex items-center justify-between border border-gray-100 px-3 py-2">
          <span className="text-gray-500">Marketing Messaging</span>
          <span className="font-medium text-gray-800">
            {status.description}
          </span>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between border border-gray-100 px-3 py-2">
          <span className="text-gray-500">Timezone ID</span>
          <span className="font-medium text-gray-800">
            {waba.timezone || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

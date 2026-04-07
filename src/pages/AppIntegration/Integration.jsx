import { useContext, useEffect, useState } from "react";
import { MdMail, MdOutlineTrackChanges } from "react-icons/md";
import { SiAnalogue, SiGoogleanalytics } from "react-icons/si";
import { FaMeta } from "react-icons/fa6";
import { IoIosClose, IoLogoWhatsapp } from "react-icons/io";
import { BASE_PATH, BASE_URL, NEW_BASE_URL } from "../../data/constant";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import handleLocalStorage from "../../utils/handleLocalStorage";
import Loader from "../../components/Loader";
import DataContext from "../../context/DataContext";
import {
  connectMetaLead,
  connectWhatsapp,
  disconnectIntegration,
} from "../../services/api/Integration";
import IntegrationSkelton from "../../components/Skeltons/IntegrationSkelton";

// import { Mail, TrendingUp, Calendar, MessageSquare, Database, Cloud, Search, ChevronRight } from 'lucide-react';

function Integration() {
  const navigate = useNavigate();
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useContext(DataContext);
  const [formData, setFormData] = useState({
    apiKey: "",
    authToken: "",
    subDomain: "",
    accountSID: "",
    virtualNumber: "",
  });

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [currentIntegrationId, setCurrentIntegrationId] = useState(null);
  // const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showOtpLessSidebar, setOtpLessSidebar] = useState(false);
  const [isCreateConnectLoading, setIsCreateConnectLoading] = useState(false);

  const [integrations] = useState([
    {
      id: "gmail",
      name: "Gmail",
      description:
        "Sync your inbox and manage emails directly from your dashboard.",
      icon: <MailIcon className="" />,
      status: "connected",
      category: "Communication",
      color: "",
    },
    {
      id: "gmb",
      name: "GMB",
      description:
        "Sync your inbox and manage emails directly from your dashboard.",
      icon: <MailIcon className="" />,
      status: "connected",
      category: "Communication",
      color: "",
    },
    {
      id: "googleAdsInsight",
      name: "Google Ads Insights",
      description: "Track google ads metrics.",
      icon: <SiGoogleanalytics className="w-10 h-10 text-orange-500" />,
      status: "not-connected",
      category: "Analytics",
      color: "",
    },
    {
      id: "metaWhatsapp",
      name: "WhatsApp Business",
      description:
        "Connect whatsapp to manage your business with our Hotelier WhatsApp Manager",
      icon: <IoLogoWhatsapp className="w-10 h-10" />,
      status: "not-connected",
      category: "Communication",
      color: "bg-green-500",
    },
    {
      id: "meta",
      name: "Meta Leads",
      description:
        "Connect website tracking code to your website and get Website Engagement",
      icon: <FaMeta className="w-10 h-10" color="#0281F0" />,
      status: "not-connected",
      category: "Analytics",
      color: "",
    },
    {
      id: "WebsiteTracking",
      name: "Website Tracking",
      description:
        "Connect website tracking code to your website and get Website Engagement",
      icon: <MdOutlineTrackChanges className="w-10 h-10" color="#2D1953" />,
      status: "not-connected",
      category: "Analytics",
      color: "",
    },

    {
      id: "exotel",
      name: "Exotel",
      description:
        "Connect website tracking code to your website and get Website Engagement",
      // icon: <ExotelIcon />,
      img: "/exotel.jpg",
      status: "not-connected",
      category: "Analytics",
      color: "bg-white",
    },

    {
      id: "otp-less",
      name: "OTP-Less",
      description:
        "Connect website tracking code to your website and get Website Engagement",
      // icon: <OtpIcon />,
      img: "/otp.png",
      status: "not-connected",
      category: "Analytics",
      color: "bg-white",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Communication",
    "Analytics",
    // "Productivity",
    // "Storage",
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory =
      selectedFilter === "All" || integration.category === selectedFilter;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsappConnect = async () => {
    try {
      const response = await connectWhatsapp();

      if (response?.success && response?.responseStatusCode) {
        window.open(response?.result?.docs?.signupUrl, "_blank");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const handleMetaLeadConnect = async () => {
    try {
      const response = await connectMetaLead();

      // console.log(response);

      if (response?.success && response?.responseStatusCode) {
        window.open(response?.result?.docs?.authUrl, "_blank");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const handleDisconnectIntegration = async (id) => {
    // setIsUpdateLoading(true);
    setCurrentIntegrationId(id);
    try {
      const response = await disconnectIntegration(id);
      if (response?.success && response?.responseStatusCode) {
        checkIntegrationStatus();
      }
    } catch (error) {
      // console.log(error);
    } finally {
      // setIsUpdateLoading(false);
      setCurrentIntegrationId(null);
    }
  };

  const toggleIntegration = (id) => {
    if (id === "metaWhatsapp") {
      handleWhatsappConnect();
      return;
    } else if (id === "meta") {
      handleMetaLeadConnect();
    } else if (id === "exotel") {
      setShowSidebar(true);
    } else if (id === "otp-less") {
      setOtpLessSidebar(true);
    } else if (id === "gmail") {
      const handleConnection = async () => {
        try {
          // console.log("Connecting with google")
          const response = await axios.get(
            `http://localhost:8000/api/v1/emails/google/login?ndid=${localStorage.getItem(
              "ndid",
            )}`,
          );
          // console.log(response.data);
          window.location.href = response.data.auth_url;
        } catch (error) {
          console.error("Error connecting google:", error);
        }
      };
      handleConnection();
      return;
    } else if (id === "gmb") {
      const handleConnection = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/gmb/connect`,
            {
              params: {
                ndid: localStorage.getItem("ndid"),
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            },
          );
          window.open(response.data.url, "_blank");
        } catch (error) {
          console.error("Error connecting google:", error);
        }
      };
      handleConnection();
      return;
    } else if (id === "googleAdsInsight") {
      const handleConnection = async () => {
        try {
          // console.log("Connecting with google")
          const { data } = await axios.get(
            `${NEW_BASE_URL}/api/v1/google-ads/auth/google/start?ndid=${localStorage.getItem("ndid")}`,
          );

          window.open(data.googleAuthUrl, "_blank");
        } catch (error) {
          console.error("Error connecting google:", error);
        }
      };
      handleConnection();
    }
    // setIntegrations(
    //   integrations.map((integration) => {
    //     if (integration.id === id) {
    //       return {
    //         ...integration,
    //         status:
    //           integration.status === "connected"
    //             ? "not-connected"
    //             : "connected",
    //       };
    //     }
    //     return integration;
    //   }),
    // );
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsCreateConnectLoading(true);
    try {
      const { data } = await axios.post(
        `${NEW_BASE_URL}/api/v1/call/auth/connect`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (data?.success) {
        setShowSidebar(false);
        navigate(`${BASE_PATH}/${handleLocalStorage("hid")}/calls-management`);
        // getConnectStatus();
      }
      // setTimeout(() => {}, 2000);
      // getConnectStatus();
    } catch (error) {
      // console.log(error);
    } finally {
      setIsCreateConnectLoading(false);
    }
  };

  const handleOtpLessConnect = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${BASE_URL}/otp/connect`,
        {
          client_id: clientId,
          client_secret: clientSecret,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      // console.log("Response data", data);
    } catch (err) {
      // console.log("Error:", err);
    }
  };

  const fetchForms = async () => {
    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/meta/forms?pageId=${"137655242755921"}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      // console.log(response);
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchleads = async () => {
    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/meta/leads?pageId=${"137655242755921"}&formId=${"24048488281459114"}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      // console.log(response);
    } catch (error) {
      // console.log(error);
    }
  };

  // const getAccout = async () => {
  //   try {
  //     const result = await axios.get(
  //       " https://3f966247c27a.ngrok-free.app/api/v1/meta/accounts",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     console.log(result);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  useEffect(() => {
    checkIntegrationStatus();
    fetchForms();
    fetchleads();
  }, []);

  if (isLoadingIntegrationStatus) {
    return <IntegrationSkelton />;
  }

  return (
    <div className="bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Integrations
          </h1>
          <p className="text-sm text-gray-600">
            Connect your favorite apps to bring all your data into one dashboard
          </p>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /> */}
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {categories?.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === category
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrationStatus &&
            filteredIntegrations?.map((integration) => {
              let status = false;

              if (integration?.id === "googleAdsInsight") {
                status = integrationStatus[integration?.id]?.status;
              } else {
                status = integrationStatus[integration?.id] ?? false;
              }

              return (
                <div
                  key={integration?.id}
                  className="bg-white rounded-sm border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                >
                  <div className="p-6">
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`${integration?.color} text-white  rounded-sm`}
                      >
                        <div>
                          {integration?.img ? (
                            <img
                              src={integration?.img}
                              className={`${
                                integration.id === "otp-less"
                                  ? "w-40 -ml-4"
                                  : "w-16 -ml-2"
                              }  object-contain`}
                            />
                          ) : (
                            integration?.icon
                          )}
                        </div>
                      </div>
                      {status && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-sm border border-green-200">
                          Connected
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed min-h-[40px]">
                      {integration.description}
                    </p>

                    {/* Action Button */}
                    <button
                      disabled={currentIntegrationId === integration.id}
                      onClick={() => {
                        if (!status) {
                          toggleIntegration(integration.id);
                        } else {
                          handleDisconnectIntegration(integration.id);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm text-sm font-medium transition-all ${
                        status
                          ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          : "bg-primary text-white hover:bg-primary/90"
                      } ${
                        currentIntegrationId === integration.id
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {currentIntegrationId === integration.id ? (
                        <>
                          <Loader color="#132e69" />
                          <span>Disconnecting...</span>
                        </>
                      ) : status ? (
                        "Disconnect"
                      ) : (
                        "Connect"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">
              No integrations found matching your search.
            </p>
          </div>
        )}
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Connect Your Account
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <IoIosClose size={30} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleConnect}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="text"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your API Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Auth Token
                </label>
                <input
                  type="password"
                  name="authToken"
                  value={formData.authToken}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Auth Token"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subdomain
                </label>
                <input
                  type="text"
                  name="subDomain"
                  value={formData.subDomain}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Subdomain"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account SID
                </label>
                <input
                  type="text"
                  name="accountSID"
                  value={formData.accountSID}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Account SID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exotel Phone Number
                </label>
                <input
                  type="text"
                  name="virtualNumber"
                  value={formData.virtualNumber}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Account SID"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition flex items-center justify-center gap-4"
                >
                  Connect {isCreateConnectLoading && <Loader color="#fff" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOtpLessSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Connect Your Account
              </h2>
              <button
                onClick={() => setOtpLessSidebar(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <IoIosClose size={30} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleOtpLessConnect}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Id
                </label>
                <input
                  type="text"
                  name="apiKey"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Client Id"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Secret
                </label>
                <input
                  type="password"
                  name="authToken"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Client Secret"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition flex items-center justify-center gap-4"
                >
                  Connect {isCreateConnectLoading && <Loader color="#fff" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Integration;

const MailIcon = () => {
  return (
    <svg
      width="45"
      height="45"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M34.909 448.047H116.364V250.229L63.026 157.091L0 162.956V413.138C0 432.425 15.622 448.047 34.909 448.047Z"
        fill="#0085F7"
      />
      <path
        d="M395.636 448.047H477.091C496.378 448.047 512 432.425 512 413.138V162.956L449.065 157.091L395.637 250.229V448.047H395.636Z"
        fill="#00A94B"
      />
      <path
        d="M395.636 98.956L347.789 190.259L395.636 250.229L512 162.956V116.411C512 73.269 462.749 48.629 428.218 74.52L395.636 98.956Z"
        fill="#FFBC00"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M116.364 250.229L70.771 153.919L116.364 98.956L256 203.683L395.636 98.956V250.229L256 354.956L116.364 250.229Z"
        fill="#FF4131"
      />
      <path
        d="M0 116.411V162.956L116.364 250.229V98.956L83.782 74.52C49.251 48.629 0 73.269 0 116.411Z"
        fill="#E51C19"
      />
    </svg>
  );
};

import { useContext, useEffect, useState } from "react";
import { MdMail, MdOutlineTrackChanges, MdSearch } from "react-icons/md";
import { SiAnalogue, SiGoogleanalytics } from "react-icons/si";
import { FaMeta } from "react-icons/fa6";
import { IoIosClose, IoLogoWhatsapp } from "react-icons/io";
import { BASE_PATH, BASE_URL, NEW_BASE_URL } from "../../data/constant";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import handleLocalStorage from "../../utils/handleLocalStorage";
import Loader from "../../components/Loader";
import DataContext from "../../context/DataContext";
import {
  connectMetaLead,
  connectWhatsapp,
  disconnectIntegration,
} from "../../services/api/Integration";
import IntegrationSkelton from "../../components/Skeltons/IntegrationSkelton";
import { useSelector } from "react-redux";
import { Lock } from "lucide-react";
import GscSettings from "../../components/GscSettings";

/* ── shared presentation tokens ─────────────────────────────── */
const MODAL_BACKDROP =
  "fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4";
const MODAL_PANEL =
  "w-full max-w-md rounded-xl bg-white dark:bg-app-surface-secondary p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto";
const MODAL_TITLE =
  "text-base sm:text-lg font-semibold text-gray-900 dark:text-app-text";
const MODAL_SUB = "mt-1 text-sm text-gray-600 dark:text-app-text-faint";
const SELECT =
  "w-full rounded-lg border border-gray-300 dark:border-app-text-faint/25 bg-white dark:bg-app-surface px-3 py-2.5 text-sm text-gray-800 dark:text-app-text-muted outline-none transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary [color-scheme:light] dark:[color-scheme:dark]";
/* <option> is drawn by the OS, so it needs its own explicit colors.
   Chrome/Edge/Firefox honour these; Safari falls back to color-scheme above. */
const OPTION = "bg-white dark:bg-[#1e293b]! text-gray-800 dark:text-gray-100 appearance-none";
const FIELD =
  "mt-1 w-full rounded-md border border-gray-300 dark:border-app-text-faint/25 bg-white dark:bg-app-surface px-3 py-2 text-sm text-gray-800 dark:text-app-text-muted placeholder:text-gray-400 dark:placeholder:text-app-text-faint outline-none transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary";
const FIELD_LABEL =
  "block text-sm font-medium text-gray-700 dark:text-app-text-muted";
const GHOST_BTN =
  "w-full rounded-lg border border-gray-300 dark:border-app-text-faint/25 px-4 py-2.5 text-sm text-gray-600 dark:text-app-text-faint hover:bg-gray-50 dark:hover:bg-app-surface transition-colors";

const mapIntegrationId = {
  metaWhatsapp: "whatsapp",
  exotel: "exotel",
  meta: "meta",
  googleadsinsights: "googleadsinsights",
  google_analytics: "google_analytics",
};

function Integration() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [gmbLocations, setGmbLocations] = useState([]);
  const [selectedGmbLocation, setSelectedGmbLocation] = useState("");
  const [showGmbModal, setShowGmbModal] = useState(false);
  const [gmbLoading, setGmbLoading] = useState(false);

  const fetchGmbLocations = async () => {
    try {
      setGmbLoading(true);
      const response = await axios.get(`${NEW_BASE_URL}/api/v1/gmb/locations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGmbLocations(response.data.locations || []);
    } catch (error) {
      console.error("Failed to fetch GMB locations:", error);
      alert("Failed to fetch locations. Please try again.");
    } finally {
      setGmbLoading(false);
    }
  };

  const handleSaveGmbLocation = async () => {
    if (!selectedGmbLocation) return alert("Please select a location");

    const locationData = gmbLocations.find(
      (loc) => loc.locationId === selectedGmbLocation,
    );

    try {
      await axios.post(
        `${NEW_BASE_URL}/api/v1/gmb/save-location`,
        {
          locationId: locationData.locationId,
          accountId: locationData.accountId,
          title: locationData.title,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      alert("GMB Connected Successfully!");
      setShowGmbModal(false);
      checkIntegrationStatus();
    } catch (error) {
      console.error("Failed to save GMB location", error);
      alert("Error saving location.");
    }
  };

  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const gaConnectedParam = searchParams.get("ga_connected");
  const emailParam = searchParams.get("email");
  const showPropertyModal = gaConnectedParam === "true" && !!emailParam;

  const [isGaConnected, setIsGaConnected] = useState(false);

  const handleDisconnectGA = async () => {
    setCurrentIntegrationId("google_analytics");
    try {
      const hid = localStorage.getItem("hid");
      await axios.post(`${BASE_URL}/google/disconnect`, { hid });
      setIsGaConnected(false);
      alert("Google Analytics disconnected!");
    } catch (error) {
      console.error("Failed to disconnect GA:", error);
      alert("Failed to disconnect. Please try again.");
    } finally {
      setCurrentIntegrationId(null);
    }
  };

  const checkGaStatus = async () => {
    try {
      const hid = localStorage.getItem("hid");
      if (!hid) return;
      const response = await axios.get(`${BASE_URL}/google/status/${hid}`);
      setIsGaConnected(response.data.connected);
    } catch (error) {
      console.error("Error checking GA status:", error);
    }
  };

  useEffect(() => {
    checkGaStatus();
  }, []);

  useEffect(() => {
    if (gaConnectedParam === "true" && emailParam && !googleEmail) {
      setGoogleEmail(emailParam);
      if (properties.length === 0 && !propertiesLoading) {
        setPropertiesLoading(true);
        fetchGoogleProperties(emailParam);
      }
    }
  }, [gaConnectedParam, emailParam]);

  const fetchGoogleProperties = async (email) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/google/properties?email=${email}`,
      );
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error("Failed to fetch GA properties:", error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const saveGoogleProperty = async () => {
    if (!selectedProperty) {
      alert("Please select a property first.");
      return;
    }

    try {
      const hid = localStorage.getItem("hid");

      await axios.post(`${BASE_URL}/google/save-property`, {
        hid,
        email: googleEmail,
        property_id: selectedProperty,
      });

      navigate(window.location.pathname, { replace: true });

      setProperties([]);
      setSelectedProperty("");
      setGoogleEmail("");

      checkIntegrationStatus();
      checkGaStatus();

      alert("Google Analytics connected successfully!");
    } catch (error) {
      console.error("Failed to save GA property:", error);
      alert("Failed to save property. Please try again.");
    }
  };

  const { subscription } = useSelector((state) => state?.subscription);

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
      onClick: () =>
        (window.location.href = `/api/local-seo/oauth/start?ndid=${ndid}`),
    },
    {
      id: "googleadsinsights",
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
      img: "/otp.png",
      status: "not-connected",
      category: "Analytics",
      color: "bg-white",
    },
    {
      id: "google_analytics",
      name: "Google Analytics",
      description:
        "Connect Google Analytics account to track website traffic and hotel performance insights.",
      icon: <SiGoogleanalytics className="w-10 h-10 text-orange-500" />,
      status: "not-connected",
      category: "Analytics",
      color: "",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Communication", "Analytics"];

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
    } catch (error) {}
  };

  const handleMetaLeadConnect = async () => {
    try {
      const response = await connectMetaLead();
      if (response?.success && response?.responseStatusCode) {
        window.open(response?.result?.docs?.authUrl, "_blank");
      }
    } catch (error) {}
  };

  const handleDisconnectIntegration = async (id) => {
    setCurrentIntegrationId(id);
    try {
      const response = await disconnectIntegration(id);
      if (response?.success && response?.responseStatusCode) {
        checkIntegrationStatus();
      }
    } catch (error) {
    } finally {
      setCurrentIntegrationId(null);
    }
  };

  const toggleIntegration = (id) => {
    if (id === "metaWhatsapp") {
      handleWhatsappConnect();
      return;
    } else if (id === "meta") {
      handleMetaLeadConnect();
      return;
    } else if (id === "exotel") {
      setShowSidebar(true);
      return;
    } else if (id === "otp-less") {
      setOtpLessSidebar(true);
      return;
    } else if (id === "gmail") {
      const handleConnection = async () => {
        try {
          const response = await axios.get(
            `${NEW_BASE_URL}/api/v1/emails/google/login?ndid=${localStorage.getItem(
              "ndid",
            )}`,
          );
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
            `${NEW_BASE_URL}/api/v1/gmb/connect?ndid=${localStorage.getItem("ndid")}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          const width = 500;
          const height = 600;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          window.open(
            response.data.url,
            "GMBAuth",
            `width=${width},height=${height},top=${top},left=${left}`,
          );

          const messageListener = (event) => {
            if (
              !event.origin.includes("localhost") &&
              !NEW_BASE_URL.includes(event.origin)
            )
              return;

            if (event.data?.type === "GMB_OAUTH_SUCCESS") {
              window.removeEventListener("message", messageListener);
              setShowGmbModal(true);
              fetchGmbLocations();
            }
          };

          window.addEventListener("message", messageListener);
        } catch (error) {
          console.error("Error connecting GMB:", error);
        }
      };
      handleConnection();
      return;
    } else if (id === "googleadsinsights") {
      const handleConnection = async () => {
        try {
          const { data } = await axios.get(
            `${NEW_BASE_URL}/api/v1/google-ads/auth/google/start?ndid=${localStorage.getItem("ndid")}`,
          );
          window.open(data.googleAuthUrl, "_blank");
        } catch (error) {
          console.error("Error connecting google:", error);
        }
      };
      handleConnection();
      return;
    } else if (id === "google_analytics") {
      const hid = localStorage.getItem("hid");
      const authUrl = `${BASE_URL}/google/auth?hid=${hid}`;

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        authUrl,
        "GoogleAnalyticsAuth",
        `width=${width},height=${height},top=${top},left=${left}`,
      );

      const messageListener = (event) => {
        if (
          !event.origin.includes("localhost") &&
          !BASE_URL.includes(event.origin)
        )
          return;

        if (event.data?.type === "GOOGLE_OAUTH_SUCCESS") {
          const newEmail = event.data.email;
          setGoogleEmail(newEmail);
          setPropertiesLoading(true);
          fetchGoogleProperties(newEmail);

          navigate(`?ga_connected=true&email=${newEmail}`, { replace: true });
          window.removeEventListener("message", messageListener);
        }
      };

      window.addEventListener("message", messageListener);
      return;
    }
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
      }
    } catch (error) {
    } finally {
      setIsCreateConnectLoading(false);
    }
  };

  const handleOtpLessConnect = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
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
    } catch (err) {}
  };

  const fetchForms = async () => {
    try {
      await fetch(
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
    } catch (error) {
      console.error(error);
    }
  };

  const fetchleads = async () => {
    try {
      await fetch(
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
    } catch (error) {
      console.error(error);
    }
  };

  console.log("Subscription", subscription);
  useEffect(() => {
    checkIntegrationStatus();
    fetchForms();
    fetchleads();
  }, []);

  if (isLoadingIntegrationStatus) {
    return <IntegrationSkelton />;
  }

  return (
    <div className="bg-app-surface min-h-full">
      {/* ── page header ─────────────────────────────────────── */}
      <div className="bg-app-surface-secondary">
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-app-text mb-1">
            Integrations
          </h1>
          <p className="text-sm text-gray-600 dark:text-app-text-faint">
            Connect your favorite apps to bring all your data into one dashboard
          </p>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ── search + category tabs ────────────────────────── */}
        <div className="bg-app-surface-secondary rounded-lg mb-6 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative min-w-0">
                <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 dark:text-app-text-faint" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-app-surface rounded-lg text-sm text-gray-800 dark:text-app-text-muted placeholder:text-gray-400 dark:placeholder:text-app-text-faint border border-gray-200 dark:border-app-text-faint/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto border-t border-gray-200 dark:border-app-text-faint/15">
            {categories?.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-5 sm:px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  selectedFilter === category
                    ? "border-primary text-primary dark:text-app-text bg-app-surface"
                    : "border-transparent text-gray-600 dark:text-app-text-faint hover:text-gray-900 dark:hover:text-app-text hover:bg-app-surface"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* ── integration cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {integrationStatus &&
            filteredIntegrations?.map((integration) => {
              let status = false;

              if (integration?.id === "googleadsinsights") {
                status = integrationStatus[integration?.id]?.status;
              } else if (integration?.id === "google_analytics") {
                status = isGaConnected;
              } else {
                status = integrationStatus[integration?.id] ?? false;
              }

              const mappedId = mapIntegrationId[integration?.id];

              return (
                <div
                  key={integration?.id}
                  className={`${subscription?.appAccess && mappedId && !subscription?.appAccess[mappedId] ? "opacity-60" : ""} relative flex flex-col bg-app-surface rounded-lg border border-gray-200 dark:border-app-text-faint/15 overflow-hidden transition-shadow hover:shadow-md`}
                >
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className={`${integration?.color} text-white rounded-lg shrink-0 overflow-hidden`}
                      >
                        <div>
                          {integration?.img ? (
                            <img
                              src={integration?.img}
                              alt={integration?.name}
                              className={`${
                                integration.id === "otp-less"
                                  ? "w-32 sm:w-40 -ml-3"
                                  : "w-16 -ml-2"
                              } max-w-full object-contain`}
                            />
                          ) : (
                            integration?.icon
                          )}
                        </div>
                      </div>
                      {status && (
                        <span className="shrink-0 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-md border border-green-200 dark:border-green-500/30">
                          Connected
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 dark:text-app-text mb-2">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-app-text-faint mb-4 leading-relaxed min-h-[40px]">
                      {integration.description}
                    </p>

                    {/* pushes the action button to the bottom of every card */}
                    <div className="mt-auto">
                      {integration.id === "google_analytics" &&
                        properties.length > 0 && (
                          <div className="mb-3">
                            <select
                              className={SELECT}
                              value={selectedProperty}
                              onChange={(e) =>
                                setSelectedProperty(e.target.value)
                              }
                            >
                              <option value="" className={OPTION}>
                                Select Property
                              </option>
                              {properties.map((property) => (
                                <option
                                  key={property.property_id}
                                  value={property.property_id}
                                  className={OPTION}
                                >
                                  {property.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                      {integration.id === "google_analytics" &&
                        properties.length > 0 &&
                        selectedProperty && (
                          <button
                            onClick={saveGoogleProperty}
                            className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            Save Property
                          </button>
                        )}
                      <button
                        disabled={
                          currentIntegrationId === integration.id ||
                          (subscription?.appAccess &&
                            mappedId &&
                            !subscription?.appAccess[mappedId])
                        }
                        onClick={() => {
                          if (!status) {
                            toggleIntegration(integration.id);
                          } else {
                            if (integration.id === "google_analytics") {
                              handleDisconnectGA();
                            } else {
                              handleDisconnectIntegration(integration.id);
                            }
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                          status
                            ? "bg-transparent border border-gray-300 dark:border-app-text-faint/25 text-gray-700 dark:text-app-text-muted hover:bg-gray-50 dark:hover:bg-app-surface-secondary"
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

                  {subscription?.appAccess &&
                    mappedId &&
                    !subscription?.appAccess[mappedId] && (
                      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-[2px]">
                        <Link
                          to="/plans"
                          className="px-4 py-2 bg-primary text-white shadow-md rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                          Upgrade <Lock size={18} />
                        </Link>
                      </div>
                    )}
                </div>
              );
            })}
          <GscSettings />
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="bg-app-surface rounded-lg border border-gray-200 dark:border-app-text-faint/15 p-8 sm:p-12 text-center">
            <p className="text-gray-600 dark:text-app-text-faint">
              No integrations found matching your search.
            </p>
          </div>
        )}

        <div className="py-3"></div>
      </div>

      {/* ── exotel sidebar ────────────────────────────────────── */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-app-surface-secondary h-full shadow-xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-app-text-faint/15">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-app-text">
                Connect Your Account
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-app-text-faint hover:bg-gray-100 dark:hover:bg-app-surface hover:text-gray-800 dark:hover:text-app-text transition-colors"
              >
                <IoIosClose size={28} />
              </button>
            </div>
            <form
              onSubmit={handleConnect}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5"
            >
              <div>
                <label className={FIELD_LABEL}>API Key</label>
                <input
                  type="text"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className={FIELD}
                  placeholder="Enter your API Key"
                  required
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Auth Token</label>
                <input
                  type="password"
                  name="authToken"
                  value={formData.authToken}
                  onChange={handleChange}
                  className={FIELD}
                  placeholder="Enter your Auth Token"
                  required
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Subdomain</label>
                <input
                  type="text"
                  name="subDomain"
                  value={formData.subDomain}
                  onChange={handleChange}
                  className={FIELD}
                  placeholder="Enter your Subdomain"
                  required
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Account SID</label>
                <input
                  type="text"
                  name="accountSID"
                  value={formData.accountSID}
                  onChange={handleChange}
                  className={FIELD}
                  placeholder="Enter your Account SID"
                  required
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Exotel Phone Number</label>
                <input
                  type="text"
                  name="virtualNumber"
                  value={formData.virtualNumber}
                  onChange={handleChange}
                  className={FIELD}
                  placeholder="Enter your Account SID"
                  required
                />
              </div>
              <div className="pt-4 sm:pt-6">
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

      {/* ── otp-less sidebar ──────────────────────────────────── */}
      {showOtpLessSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-app-surface-secondary h-full shadow-xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-app-text-faint/15">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-app-text">
                Connect Your Account
              </h2>
              <button
                onClick={() => setOtpLessSidebar(false)}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-app-text-faint hover:bg-gray-100 dark:hover:bg-app-surface hover:text-gray-800 dark:hover:text-app-text transition-colors"
              >
                <IoIosClose size={28} />
              </button>
            </div>
            <form
              onSubmit={handleOtpLessConnect}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5"
            >
              <div>
                <label className={FIELD_LABEL}>Client Id</label>
                <input
                  type="text"
                  name="apiKey"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={FIELD}
                  placeholder="Enter your Client Id"
                  required
                />
              </div>
              <div>
                <label className={FIELD_LABEL}>Client Secret</label>
                <input
                  type="password"
                  name="authToken"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className={FIELD}
                  placeholder="Enter your Client Secret"
                  required
                />
              </div>
              <div className="pt-4 sm:pt-6">
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

      {/* ── GA property modal ─────────────────────────────────── */}
      {showPropertyModal && (
        <div className={MODAL_BACKDROP}>
          <div className={MODAL_PANEL}>
            <h2 className={MODAL_TITLE}>Select Google Analytics Property</h2>
            <p className={`${MODAL_SUB} mb-5 break-words`}>
              Connected as{" "}
              <strong className="text-gray-800 dark:text-app-text-muted">
                {googleEmail || emailParam}
              </strong>
            </p>

            {propertiesLoading ? (
              <p className="py-5 text-center text-sm text-gray-600 dark:text-app-text-faint">
                Loading properties...
              </p>
            ) : properties.length === 0 ? (
              <p className="py-5 text-center text-sm text-red-500">
                No GA4 properties found for this account.
              </p>
            ) : (
              <>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className={SELECT}
                >
                  <option value="" className={OPTION}>
                    — Select a Property —
                  </option>
                  {properties.map((property) => (
                    <option
                      key={property.property_id}
                      value={property.property_id}
                      className={OPTION}
                    >
                      {property.name} ({property.account})
                    </option>
                  ))}
                </select>

                <button
                  onClick={saveGoogleProperty}
                  disabled={!selectedProperty}
                  className="mt-4 w-full rounded-lg bg-green-600 hover:bg-green-700 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:bg-gray-300 dark:disabled:bg-app-surface disabled:text-gray-500 dark:disabled:text-app-text-faint disabled:cursor-not-allowed"
                >
                  Save &amp; Connect
                </button>
              </>
            )}

            <button
              onClick={() =>
                navigate(window.location.pathname, { replace: true })
              }
              className={`${GHOST_BTN} mt-2.5`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── GMB location modal ────────────────────────────────── */}
      {showGmbModal && (
        <div className={MODAL_BACKDROP}>
          <div className={MODAL_PANEL}>
            <h2 className={MODAL_TITLE}>Select Google Business Profile</h2>
            <p className={`${MODAL_SUB} mb-5`}>
              Choose the hotel location to connect.
            </p>

            {gmbLoading ? (
              <p className="py-5 text-center text-sm text-gray-600 dark:text-app-text-faint">
                Loading your properties...
              </p>
            ) : gmbLocations.length === 0 ? (
              <p className="py-5 text-center text-sm text-red-500">
                No Google Business Profiles found for this account.
              </p>
            ) : (
              <>
                <select
                  value={selectedGmbLocation}
                  onChange={(e) => setSelectedGmbLocation(e.target.value)}
                  className={`${SELECT} mb-4`}
                >
                  <option value="" className={OPTION}>
                    — Select a Location —
                  </option>
                  {gmbLocations.map((loc) => (
                    <option
                      key={loc.locationId}
                      value={loc.locationId}
                      className={OPTION}
                    >
                      {loc.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSaveGmbLocation}
                  disabled={!selectedGmbLocation}
                  className="w-full rounded-lg bg-green-600 hover:bg-green-700 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:bg-gray-300 dark:disabled:bg-app-surface disabled:text-gray-500 dark:disabled:text-app-text-faint disabled:cursor-not-allowed"
                >
                  Save &amp; Connect
                </button>
              </>
            )}

            <button
              onClick={() => setShowGmbModal(false)}
              className={`${GHOST_BTN} mt-2.5`}
            >
              Cancel
            </button>
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
        fillRule="evenodd"
        clipRule="evenodd"
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

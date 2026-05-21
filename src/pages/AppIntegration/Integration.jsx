import { useContext, useEffect, useState } from "react";
import { MdMail, MdOutlineTrackChanges } from "react-icons/md";
import { SiAnalogue, SiGoogleanalytics } from "react-icons/si";
import { FaMeta } from "react-icons/fa6";
import { IoIosClose, IoLogoWhatsapp } from "react-icons/io";
import { BASE_PATH, BASE_URL, NEW_BASE_URL } from "../../data/constant";
import axios from "axios";
import { useNavigate,useSearchParams } from "react-router-dom";
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

// import { Mail, TrendingUp, Calendar, MessageSquare, Database, Cloud, Search, ChevronRight } from 'lucide-react';

const mapIntegrationId = {
  metaWhatsapp: "whatsapp",
  exotel: "exotel",
  meta: "meta",
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
      const response = await axios.get(`http://localhost:8000/api/v1/gmb/locations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
    
    // Find the full object from the array
    const locationData = gmbLocations.find(loc => loc.locationId === selectedGmbLocation);
    
    try {
      await axios.post(`http://localhost:8000/api/v1/gmb/save-location`, {
        locationId: locationData.locationId,
        accountId: locationData.accountId,
        title: locationData.title
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("GMB Connected Successfully!");
      setShowGmbModal(false);
      checkIntegrationStatus(); // Refresh cards
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
  setCurrentIntegrationId("googleAnalytics");
  try {
    const hid = localStorage.getItem("hid");
    await axios.post(`${BASE_URL}/google/disconnect`, { hid });
    setIsGaConnected(false); // UI ko turant 'not-connected' kar dega
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
      `${BASE_URL}/google/properties?email=${email}`
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
    {

      id: "googleAnalytics",
    
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
          // 1. Get the Google Auth URL from Backend (Yahan 8000 hai)
          const response = await axios.get(
            `http://localhost:8000/api/v1/gmb/connect?ndid=${localStorage.getItem("ndid")}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );

          // 2. Open Popup
          const width = 500;
          const height = 600;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          window.open(response.data.url, "GMBAuth", `width=${width},height=${height},top=${top},left=${left}`);

         
          const messageListener = (event) => {
            console.log("Message received from:", event.origin, event.data); 
            
            if (event.origin !== "http://localhost:8000") return;

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
      
    }
     else if (id === "googleAdsInsight") {
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
  
else if (id === "googleAnalytics") {
  const hid = localStorage.getItem("hid");
  const authUrl = `${BASE_URL}/google/auth?hid=${hid}`;

  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;


  const authWindow = window.open(
    authUrl,
    "GoogleAnalyticsAuth",
    `width=${width},height=${height},top=${top},left=${left}`
  );

  
  const messageListener = (event) => {
    
    if (event.origin !== "${BASE_URL}") return;

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
              } else if (integration?.id === "googleAnalytics") {
                status = isGaConnected; 
              }else {
                status = integrationStatus[integration?.id] ?? false;
              }

              const mappedId = mapIntegrationId[integration?.id];
              
             
              if (
                subscription?.appAccess &&
                mappedId && 
                !subscription?.appAccess[mappedId]
              ) {
                return null;
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
          {integration.id === "googleAnalytics" &&
        properties.length > 0 && (

          <div className="mb-4">

            <select
              className="w-full border rounded-md p-2 text-sm"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >

              <option value="">
                Select Property
              </option>

              {properties.map((property) => (
                <option
                  key={property.property_id}
                  value={property.property_id}
                >
                  {property.name}
                </option>
              ))}

            </select>

          </div>
        )}

                  {/* SAVE PROPERTY BUTTON */}

                      {integration.id === "googleAnalytics" &&

                      properties.length > 0 &&

                      selectedProperty && (

                      <button

                        onClick={saveGoogleProperty}

                        className="w-full mb-3 bg-green-600 text-white py-2 rounded-sm"

                      >

                        Save Property

                      </button>

                      )}
                    {/* Action Button */}
                    <button
                      disabled={currentIntegrationId === integration.id}
                      onClick={() => {
                        if (!status) {
                          toggleIntegration(integration.id);
                        } else {
                          if (integration.id === "googleAnalytics") {
                            handleDisconnectGA(); // Agar GA hai toh Python wala chalao
                          }
                          else {
                          handleDisconnectIntegration(integration.id);
                          }
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
      
{showPropertyModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 999999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        background: "white",
        padding: "32px",
        borderRadius: "12px",
        width: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      <h2 style={{ marginBottom: "8px", fontSize: "18px", fontWeight: 600 }}>
        Select Google Analytics Property
      </h2>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
        Connected as <strong>{googleEmail || emailParam}</strong>
      </p>

      {propertiesLoading ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          Loading properties...
        </p>
      ) : properties.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#e53e3e" }}>
          No GA4 properties found for this account.
        </p>
      ) : (
        <>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <option value="">— Select a Property —</option>
            {properties.map((property) => (
              <option key={property.property_id} value={property.property_id}>
                {property.name} ({property.account})
              </option>
            ))}
          </select>

          <button
            onClick={saveGoogleProperty}
            disabled={!selectedProperty}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "12px",
              background: selectedProperty ? "#16a34a" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: selectedProperty ? "pointer" : "not-allowed",
            }}
          >
            Save & Connect
          </button>
        </>
      )}

      <button
        onClick={() => navigate(window.location.pathname, { replace: true })}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "10px",
          background: "transparent",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: "14px",
          cursor: "pointer",
          color: "#666",
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
{showGmbModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ marginBottom: "8px", fontSize: "18px", fontWeight: 600 }}>Select Google Business Profile</h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>Choose the hotel location to connect.</p>

            {gmbLoading ? (
              <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>Loading your properties...</p>
            ) : gmbLocations.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px", color: "#e53e3e" }}>No Google Business Profiles found for this account.</p>
            ) : (
              <>
                <select
                  value={selectedGmbLocation}
                  onChange={(e) => setSelectedGmbLocation(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}
                >
                  <option value="">— Select a Location —</option>
                  {gmbLocations.map((loc) => (
                    <option key={loc.locationId} value={loc.locationId}>
                      {loc.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSaveGmbLocation}
                  disabled={!selectedGmbLocation}
                  style={{ width: "100%", padding: "12px", background: selectedGmbLocation ? "#16a34a" : "#ccc", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: selectedGmbLocation ? "pointer" : "not-allowed" }}
                >
                  Save & Connect
                </button>
              </>
            )}

            <button
              onClick={() => setShowGmbModal(false)}
              style={{ width: "100%", marginTop: "10px", padding: "10px", background: "transparent", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", cursor: "pointer", color: "#666" }}
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

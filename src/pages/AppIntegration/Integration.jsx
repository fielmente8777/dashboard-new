import { useEffect, useState } from "react";
import { MdMail } from "react-icons/md";
import { SiAnalogue } from "react-icons/si";
import { IoLogoWhatsapp } from "react-icons/io";
import { NEW_BASE_URL } from "../../data/constant";
// import { Mail, TrendingUp, Calendar, MessageSquare, Database, Cloud, Search, ChevronRight } from 'lucide-react';

function Integration() {
  const [integrationStatus, setIntegrationStauts] = useState({
    WebsiteTracking: false,
    gmail: false,
    google_analytics: false,
    meta: false,
  });
  const [integrations, setIntegrations] = useState([
    {
      id: "gmail",
      name: "Gmail",
      description:
        "Sync your inbox and manage emails directly from your dashboard.",
      icon: <MdMail className="w-10 h-10" />,
      status: "connected",
      category: "Communication",
      color: "bg-red-500",
    },
    {
      id: "google_analytics",
      name: "Google Analytics",
      description: "Track website metrics and user analytics in real time.",
      icon: <SiAnalogue className="w-10 h-10" />,
      status: "not-connected",
      category: "Analytics",
      color: "bg-orange-500",
    },
    // {
    //   id: "whatsapp",
    //   name: "WhatsApp Business",
    //   description:
    //     "Connect whatsapp to manage your business with our Hotelier WhatsApp Manager",
    //   icon: <IoLogoWhatsapp className="w-10 h-10" />,
    //   status: "not-connected",
    //   category: "Communication",
    //   color: "bg-green-500",
    // },
    {
      id: "WebsiteTracking",
      name: "Website Tracking",
      description:
        "Connect website tracking code to your website and get Website Engagement",
      icon: <IoLogoWhatsapp className="w-10 h-10" />,
      status: "not-connected",
      category: "Analytics",
      color: "bg-orange-500",
    },

    {
      id: "meta",
      name: "Meta Leads",
      description:
        "Connect website tracking code to your website and get Website Engagement",
      icon: <IoLogoWhatsapp className="w-10 h-10" />,
      status: "not-connected",
      category: "Analytics",
      color: "bg-orange-500",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Communication",
    "Analytics",
    "Productivity",
    "Storage",
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory =
      selectedFilter === "All" || integration.category === selectedFilter;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  console.log(filteredIntegrations);

  const toggleIntegration = (id) => {
    if (id === "meta") {
      const handleConnect = async () => {
        try {
          //   const { data } = await axios.get(
          //     `${NEW_BASE_URL}/api/v1/auth/meta/start`
          //   );

          //   console.log(data);

          window.open(
            `${NEW_BASE_URL}/api/v1/auth/meta/start/?ndid=${localStorage.getItem(
              "ndid"
            )}`,
            "MetaConnect"
          );

          // setConnected(true);
        } catch (error) {
          console.log(error);
        }
      };
      handleConnect();
      return;
    }
    setIntegrations(
      integrations.map((integration) => {
        if (integration.id === id) {
          return {
            ...integration,
            status:
              integration.status === "connected"
                ? "not-connected"
                : "connected",
          };
        }
        return integration;
      })
    );
  };

  const checkIntegrationStatus = async () => {
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/integration/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      console.log(data);
      setIntegrationStauts(data.result?.docs);
      return data; // assuming the API returns { status: 'connected' } or { status: 'not-connected' }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

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
            {categories.map((category) => (
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
          {filteredIntegrations?.map((integration) => {
            // console.log(integration)
            const status = integrationStatus[integration?.id] ?? false;

            console.log(status);

            return (
              <div
                key={integration?.id}
                className="bg-white rounded-sm border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
              >
                <div className="p-6">
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${integration?.color} text-white p-3 rounded-sm`}
                    >
                      {integration?.icon}
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
                    onClick={() => toggleIntegration(integration.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-sm text-sm font-medium transition-all ${
                      status
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {status ? "Disconnect" : "Connect"}
                    {/* <ChevronRight className="w-4 h-4" /> */}
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
    </div>
  );
}

export default Integration;

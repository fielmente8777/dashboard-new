import { useState } from "react";
import { accessScopeMap } from "../../pages/UserMgmt/UserMgmtPopup";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AppsPopup = ({ open, setOpen, authUser }) => {
  const [search, setSearch] = useState("");

  const peoplePlusServices = [
    { name: "Website Enquiries", icon: "🌐", key: "Enquiries Management", link: "enquiries-management/enquiries-analytics" },
    {
      name: "Lead Gen Form",
      icon: "📝",
      key: "Leads Form",
      link: "lead-form/lead-gen-form",
    },
    { name: "Eazobot", icon: "🤖", key: "Eazobot", link: "eazobot" },
    {
      name: "Conversational Tool",
      icon: "💬",
      key: "Conversational Tool",
      link: "conversational-tool",
    },
    {
      name: "Leads Management",
      icon: "📝",
      key: "Leads Management",
      link: "leads-management",
    },
    { name: "GRM", icon: "📊", key: "GRM", link: "grm/analytics" }, // Assuming GRM relates to reporting or analytics
  ];

  const otherServices = [
    {
      name: "Content Management",
      icon: "🗂️",
      key: "CMS",
      link: "cms/profile-and-links",
    },
    {
      name: "Human Resource",
      icon: "👥",
      key: "HRM",
      link: `human-resources-management/analytics`,
    },
    {
      name: "Payment Gateway",
      icon: "💳",
      key: "Payment Gateway",
      link: "payment-gateway",
    },
    {
      name: "User Management",
      icon: "👤",
      key: "User Management",
      link: `user-management/all-users`,
    },
    {
      name: "Booking Engine",
      icon: "🛎️",
      key: "Booking Engine",
      link: "booking-engine",
    },
    {
      name: "Social Media",
      icon: "📱",
      key: "Social Media",
      link: "social-media",
    },
    {
      name: "Channel Manager",
      icon: "📡",
      key: "Channel Manager",
      link: "channel-manager",
    },
    {
      name: "Email Marketing",
      icon: "📧",
      key: "Email Marketing",
      link: "email-marketing",
    },
    {
      name: "WhatsApp Marketing",
      icon: "💬",
      key: "WhatsApp Marketing",
      link: "whatsapp-marketing",
    },
    {
      name: "SMS Marketing",
      icon: "📲",
      key: "SMS Marketing",
      link: "sms-marketing",
    },
    {
      name: "Analytics & Reporting",
      icon: "📈",
      key: "Analytics Reporting",
      link: "analytics-and-reporting",
    },
  ];

  const navigate = useNavigate();

  const handleOpenService = (service) => {
    const key = service.key;

    if (!authUser.accessScope[accessScopeMap[key]]) {
      Swal.fire({
        title: "Access Denied",
        text: "You don't have access to this service",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    setOpen(false);
    navigate(service.link);
  };

  console.log(authUser);

  // 🔍 Filtered results
  const filteredPremium = peoplePlusServices.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOther = otherServices.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {open && (
        <div
          onClick={(e) => {
            if (e.currentTarget) {
              setOpen(false);
            }
          }}
          className="fixed top-0 left-0 z-20  bg-black/50 w-full h-[100dvh] flex justify-end "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-[#575757] bg-white  w-[400px] absolute h-[100vh] z-[99999999999999999]"
          >
            <input
              type="text"
              autoFocus
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              name="search"
              placeholder="Search Services"
              className="bg-white py-4 w-full px-5 outline-none border shadow-sm "
            />
            <div className="max-w-md mx-auto p-4 pb-20 bg-gray-100 scrollbar-hidden min-h-screen h-[98vh] overflow-y-auto">
              <div>
                <h2 className="font-semibold mb-2">Premium Services</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {filteredPremium.map((service) => (
                    <div
                      key={service.name}
                      className="relative group cursor-pointer shadow bg-white hover:bg-white duration-75 rounded-md"
                      onClick={() => {
                        handleOpenService(service);
                      }}
                    >
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="text-2xl mb-2">{service.icon}</div>
                        <span>{service.name}</span>
                      </div>

                      <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                        {service.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-2">
                <h2 className="text-gray-800 font-semibold">Other Services</h2>
                {/* <span className="text-blue-600 text-sm cursor-pointer">Preference</span> */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {filteredOther.map((service) => (
                  <div
                    key={service.name}
                    className=" relative group cursor-pointer shadow  bg-white hover:bg-white duration-300 rounded-md"
                    onClick={() => {
                      handleOpenService(service);
                    }}
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="text-2xl mb-2">{service.icon}</div>
                      <span className="text-center">{service.name}</span>
                    </div>
                    <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                      {service.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppsPopup;

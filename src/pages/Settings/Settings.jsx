import { useState } from "react";
import WhatsAppBusiness from "../Channels/Whatsapp/WhatsAppBusiness";
import Setting from "../Setting/Setting";
import Eazobot from "../Eazobot/Eazobot";
import Integration from "../AppIntegration/Integration";
import Usermanagement from "../UserMgmt/Usermanagement";
import Wallet from "../Wallet/Wallet";

const Settings = () => {
  // const tabs= ["Profile","WhatsApp","Lead","Google Ads","Eazbot","Integration"];
  const tabs = [
    "Profile",
    "WhatsApp",
    "Eazbot",
    "Integration",
    "Team Management",
    // "EazWallet",
  ];

  const [activeTab, setActiveTab] = useState("Profile");
  return (
    <div className="">
      <div className="flex border-b p-5">
        {tabs.map((item) => (
          <span
            onClick={() => setActiveTab(item)}
            className={`cursor-pointer ${activeTab === item ? "bg-gray-200" : "bg-white"} hover:bg-gray-200 px-5 transition-all duration-150 text-sm font-medium py-2 text-center  `}
          >
            {item}
          </span>
        ))}
      </div>

      {activeTab === "Profile" && (
        <div>
          <Setting />
        </div>
      )}
      {activeTab === "WhatsApp" && (
        <div>
          <WhatsAppBusiness />
        </div>
      )}
      {activeTab === "Lead" && <div></div>}
      {activeTab === "Google Ads" && <div></div>}
      {activeTab === "Eazbot" && (
        <div>
          <Eazobot />
        </div>
      )}
      {activeTab === "Integration" && (
        <div>
          <Integration />
        </div>
      )}
      {activeTab === "Team Management" && (
        <div>
          <Usermanagement />
        </div>
      )}
      {activeTab === "EazWallet" && (
        <div>
          <Wallet />
        </div>
      )}
    </div>
  );
};

export default Settings;

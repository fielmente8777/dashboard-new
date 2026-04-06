import { useState } from "react";
import WhatsAppBusiness from "../Channels/Whatsapp/WhatsAppBusiness";
import Setting from "../Setting/Setting";
import Eazobot from "../Eazobot/Eazobot";
import Integration from "../AppIntegration/Integration";
import Usermanagement from "../UserMgmt/Usermanagement";
import Wallet from "../Wallet/Wallet";
import Notification from "./Notification";

const Settings = () => {
  // ✅ Centralized config
  const TABS = [
    { key: "Profile", label: "Profile", component: <Setting /> },
    { key: "WhatsApp", label: "WhatsApp", component: <WhatsAppBusiness /> },
    { key: "Eazbot", label: "Eazbot", component: <Eazobot /> },
    { key: "Integration", label: "Integration", component: <Integration /> },
    {
      key: "Team Management",
      label: "Team Management",
      component: <Usermanagement />,
    },
    { key: "Notification", label: "Notification", component: <Notification /> },
    // { key: "EazWallet", label: "EazWallet", component: <Wallet /> },
  ];
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  // ✅ Find active component
  const activeComponent = TABS.find((tab) => tab.key === activeTab)?.component;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto p-2 border-b w-fit">
        {TABS.map((tab) => (
          <span
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex shrink-0 cursor-pointer ${
              activeTab === tab.key ? "bg-slate-700 text-white" : "bg-white"
            } hover:bg-gray-200 transition-all duration-150 text-sm font-medium p-2 text-center rounded-sm`}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 h-full overflow-y-auto scrollbar-hidden">
        {activeComponent}
      </div>
    </div>
  );
};

export default Settings;

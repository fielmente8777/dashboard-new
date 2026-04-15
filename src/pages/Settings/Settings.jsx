import { useState } from "react";
import WhatsAppBusiness from "../Channels/Whatsapp/WhatsAppBusiness";
import Setting from "../Setting/Setting";
import Eazobot from "../Eazobot/Eazobot";
import Integration from "../AppIntegration/Integration";
import Usermanagement from "../UserMgmt/Usermanagement";
import Wallet from "../Wallet/Wallet";
import Notification from "./Notification";
import Billing from "../Wallet/Billing";
import { useSearchParams } from "react-router-dom";

const Settings = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const template = searchParams.get("template");
  // ✅ Centralized config
  const TABS = [
    { key: "Profile", label: "Profile", component: <Setting /> },
    {
      key: "WhatsApp",
      label: "WhatsApp",
      component: <WhatsAppBusiness template={template} />,
    },
    { key: "Eazbot", label: "Eazbot", component: <Eazobot /> },
    { key: "Integration", label: "Integration", component: <Integration /> },
    {
      key: "Team Management",
      label: "Team Management",
      component: <Usermanagement />,
    },
    { key: "Notification", label: "Notification", component: <Notification /> },
    { key: "EazWallet", label: "EazWallet", component: <Wallet /> },
    { key: "Billing", label: "Billing", component: <Billing /> },
  ];
  const [activeTab, setActiveTab] = useState(tab || TABS[0].key);

  // ✅ Find active component
  const activeComponent = TABS.find(
    (tab) => tab.key?.toLowerCase() === activeTab?.toLowerCase(),
  )?.component;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto p-2 border-b w-fit">
        {TABS.map((tab) => (
          <span
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex shrink-0 cursor-pointer ${
              activeTab?.toLowerCase() === tab.key?.toLowerCase()
                ? "bg-primary text-white"
                : "bg-white"
            } hover:bg-gray-300 transition-all duration-150 text-sm font-medium p-2 text-center rounded-sm`}
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

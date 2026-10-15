import { useEffect, useState } from "react";
import WhatsAppBusiness from "../Channels/Whatsapp/WhatsAppBusiness";
import Setting from "../Setting/Setting";
import Eazobot from "../Eazobot/Eazobot";
import Integration from "../AppIntegration/Integration";
import Usermanagement from "../UserMgmt/Usermanagement";
import Wallet from "../Wallet/Wallet";
import Notification from "./Notification/Notification";
import Billing from "../Wallet/Billing";
import { useSearchParams } from "react-router-dom";
import Subscription from "../Wallet/Subscription";
import { useSelector } from "react-redux";
import Tabs from "../../components/ui/Tabs";

const Settings = () => {
  const { subscription } = useSelector((state) => state?.subscription);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const template = searchParams.get("template");
  const section = searchParams.get("section");
  // ✅ Centralized config
  const TABS = [
    { key: "Profile", label: "Profile", component: <Setting /> },
    {
      key: "WhatsApp",
      label: "WhatsApp",
      component: <WhatsAppBusiness template={template} section={section} />,
      // lays out its own side menu edge to edge
      fullBleed: true,
    },
    { key: "Eazbot", label: "Eazbot", component: <Eazobot /> },
    { key: "Integration", label: "Integration", component: <Integration /> },
    {
      key: "Team Management",
      label: "Team Management",
      component: <Usermanagement />,
    },
    { key: "Notification", label: "Notification", component: <Notification /> },
    // { key: "EazWallet", label: "EazWallet", component: <Wallet /> },
    // { key: "Billing", label: "Billing", component: <Billing /> },
    { key: "Subscription", label: "Subscription", component: <Subscription /> },
  ];
  const [activeTab, setActiveTab] = useState(tab || TABS[0].key);

  // follow ?tab= links while the page is open (e.g. Integration -> Eazbot)
  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const active = TABS.find(
    (tab) => tab.key?.toLowerCase() === activeTab?.toLowerCase(),
  );

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tabs (WhatsApp and Eazbot only with the matching app access) */}
      <div className="shrink-0 overflow-x-auto border-b border-app-border! px-3 py-2.5 sm:px-5 scrollbar-hidden">
        <Tabs
          tabs={TABS.filter(
            (t) =>
              !(t.key === "WhatsApp" && !subscription?.appAccess?.["whatsapp"]) &&
              !(t.key === "Eazbot" && !subscription?.appAccess?.["eazbot"]),
          ).map((t) => ({ value: t.key, label: t.label }))}
          value={active?.key}
          className="flex-nowrap!"
          onChange={setActiveTab}
        />
      </div>

      {/* Content */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto scrollbar-hidden ${
          active?.fullBleed ? "" : "px-3 py-4 sm:px-5 sm:py-5"
        }`}
      >
        {active?.fullBleed ? (
          active.component
        ) : (
          <div className="mx-auto w-full max-w-7xl">{active?.component}</div>
        )}
      </div>
    </div>
  );
};

export default Settings;

import {
  Bot,
  FilePlus2,
  LayoutDashboard,
  Library,
  MessageSquareReply,
  Reply,
  Wallet,
  Workflow,
  ListTree,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import WhatsappBusinessSkelton from "../../../components/Skeltons/WhatsappBusinessSkelton";
import { ErrorState } from "../../../components/ui/States";
import FlowBuilder from "../../../components/WhatsappFlow/FlowBuilder";
import { useIntegrationStatus } from "../../../hooks/useIntegrationStatus";
import { useToast } from "../../../context/ToastContext";
import {
  getWhatsappAccountDetails,
  getWhatsAppFlows,
  getWhatsAppMessageTemplates,
  getWhatsAppProfile,
  updateWhatsAppProfile,
} from "../../../redux/api/whatsappBusinessApi";
import AccountCard from "./components/AccountCard";
import AIConfigurationCard from "./components/AIConfigurationCard";
import AutoMessageCard from "./components/AutoMessageCard";
import ConnectWhatsApp from "./components/ConnectWhatsApp";
import CreateTemplate from "./components/CreateTemplate";
import Flows from "./components/Flows";
import QuickReplies from "./components/QuickReplies";
import TemplateLibrary from "./components/TemplateLibrary";
import WhatsAppMessageTemplate from "./components/Templates";
import WhatsAppMenu from "./components/WhatsAppMenu";
import WhatsAppProfileCard from "./components/WhatsAppProfileCard";
import WhatsappWidgetCard from "./components/WhatsappWidgetCard";
import WhatsAppCreditsCard from "./components/WhatsAppCredits/WhatsAppCreditsCard";
import WhatsappFlow from "./WhatsappFlow/WhatsappFlow";

// The menu, in groups. `section` in the URL (?tab=WhatsApp&section=credits)
// opens one directly.
const MENU = [
  { items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }] },
  {
    title: "Templates",
    items: [
      { id: "create-template", label: "Create template", icon: FilePlus2 },
      { id: "template-library", label: "Template library", icon: Library },
    ],
  },
  {
    title: "Automation",
    items: [
      { id: "auto-message", label: "Auto replies", icon: MessageSquareReply },
      { id: "quick-replies", label: "Quick replies", icon: Reply },
    ],
  },
  {
    title: "Flows",
    items: [
      { id: "whatsapp-flows", label: "Create flow", icon: Workflow },
      { id: "flows", label: "My flows", icon: ListTree },
      { id: "whatsapp-flow", label: "Chatbot builder", icon: Bot },
    ],
  },
  { items: [{ id: "credits", label: "Credits & usage", icon: Wallet }] },
];
const SECTION_IDS = MENU.flatMap((group) => group.items.map((item) => item.id));

// old links used other names for some sections
const ALIASES = { templates: "create-template", "create-flow": "whatsapp-flows" };
const toSection = (section, template) => {
  const id = ALIASES[section] || section;
  if (SECTION_IDS.includes(id)) return id;
  return template ? "create-template" : "overview";
};

const WhatsAppBusiness = ({ template = false, section = null }) => {
  const { showToast } = useToast();
  const { integrationStatus, checkIntegrationStatus, isLoadingIntegrationStatus } =
    useIntegrationStatus();

  const [active, setActive] = useState(() => toSection(section, template));
  const [statusChecked, setStatusChecked] = useState(false);
  const [account, setAccount] = useState({ data: null, loading: false, failed: false });
  const [templates, setTemplates] = useState([]);
  const [flows, setFlows] = useState({});
  const [profile, setProfile] = useState({});
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  // what "Create template" opens: blank, a library template, or one to edit
  const [templateDraft, setTemplateDraft] = useState({ data: null, mode: "create" });

  const isConnected = Boolean(integrationStatus?.metaWhatsapp);

  // follow links that change the section while the page is open
  useEffect(() => {
    setActive(toSection(section, template));
  }, [section, template]);

  const recheckStatus = useCallback(async () => {
    await checkIntegrationStatus();
    setStatusChecked(true);
  }, [checkIntegrationStatus]);

  useEffect(() => {
    recheckStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccount = useCallback(async () => {
    setAccount((prev) => ({ ...prev, loading: true, failed: false }));
    try {
      const response = await getWhatsappAccountDetails();
      const data = response?.result?.docs;
      setAccount({ data: data || null, loading: false, failed: !data });
    } catch {
      setAccount({ data: null, loading: false, failed: true });
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getWhatsAppProfile();
      if (response?.success) setProfile(response?.result?.doc || {});
    } catch {
      // the profile card stays empty
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    fetchAccount();
    fetchProfile();
    getWhatsAppMessageTemplates()
      .then((response) => {
        if (response?.success) setTemplates(response?.result?.docs?.data || []);
      })
      .catch(() => {});
    getWhatsAppFlows()
      .then((response) => {
        if (response?.success) setFlows(response?.result?.docs?.flow || {});
      })
      .catch(() => {});
  }, [isConnected, fetchAccount, fetchProfile]);

  const saveProfile = async (data) => {
    setIsProfileSaving(true);
    try {
      const formData = new FormData();
      if (data.about) formData.append("about", data.about);
      if (data.vertical) formData.append("vertical", data.vertical);
      if (data.email) formData.append("email", data.email);
      if (data.address) formData.append("address", data.address);
      if (data.websites) {
        const websites = Array.isArray(data.websites) ? data.websites : [data.websites];
        formData.append("websites", JSON.stringify(websites));
      }
      // a new picture is uploaded as `file`, an existing one is kept by URL
      if (data.image instanceof File) formData.append("file", data.image);
      else if (typeof data.image === "string") {
        formData.append("profile_picture_url", data.image);
      }

      const response = await updateWhatsAppProfile(formData);
      if (!response?.success) throw new Error(response?.responseMessage);
      showToast({ message: "Profile updated" });
      fetchProfile();
    } catch (error) {
      showToast({
        message: error?.message || "Could not update the profile.",
        type: "error",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  if (!statusChecked) return <WhatsappBusinessSkelton />;

  if (!isConnected) {
    return (
      <ConnectWhatsApp
        onRecheck={recheckStatus}
        rechecking={isLoadingIntegrationStatus}
      />
    );
  }

  if (account.failed) {
    return (
      <div className="px-3 py-4 sm:px-5 sm:py-5">
        <ErrorState
          message="Could not load your WhatsApp account."
          onRetry={fetchAccount}
        />
      </div>
    );
  }

  if (!account.data) return <WhatsappBusinessSkelton />;

  const { waba, business, phoneNumber } = account.data;

  const open = (id) => {
    if (id === "create-template") setTemplateDraft({ data: null, mode: "create" });
    setActive(id);
  };

  const editTemplate = (data, mode) => {
    setTemplateDraft({ data, mode });
    setActive("create-template");
  };

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <WhatsAppMenu groups={MENU} active={active} onSelect={open} />

      <div className="min-w-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-hidden sm:px-5 sm:py-5">
        {active === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <AccountCard waba={waba} business={business} phoneNumber={phoneNumber} />
              <WhatsappWidgetCard phoneNumber={phoneNumber} />
            </div>
            <WhatsAppProfileCard
              profile={profile}
              loading={isProfileSaving}
              onSave={saveProfile}
            />
            <div className="lg:col-span-2">
              <WhatsAppMessageTemplate
                onCreate={() => open("create-template")}
                onEdit={(t) => editTemplate(t, "edit")}
              />
            </div>
          </div>
        )}

        {active === "create-template" && (
          <CreateTemplate
            key={`${templateDraft.mode}-${templateDraft.data?.id ?? templateDraft.data?.name ?? "new"}`}
            initialData={templateDraft.data}
            mode={templateDraft.mode}
            onClose={() => open(templateDraft.mode === "edit" ? "overview" : "template-library")}
            onSaved={() => open("overview")}
          />
        )}

        {active === "template-library" && (
          <TemplateLibrary onSelectTemplate={(picked) => editTemplate(picked, "create")} />
        )}

        {active === "auto-message" && (
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <AutoMessageCard
              phoneNumberId={phoneNumber?.id}
              autoMessage={account.data.autoMessage}
              templates={templates}
              flows={flows || []}
              notification={account.data.notification}
            />
            <AIConfigurationCard phoneNumber={phoneNumber} ai={account.data.ai} />
          </div>
        )}

        {active === "quick-replies" && <QuickReplies />}
        {active === "whatsapp-flows" && <WhatsappFlow onPublished={() => setActive("flows")} />}
        {active === "flows" && <Flows onCreate={() => setActive("whatsapp-flows")} />}
        {active === "whatsapp-flow" && (
          <ReactFlowProvider>
            <FlowBuilder />
          </ReactFlowProvider>
        )}

        {active === "credits" && (
          <div className="w-full max-w-5xl">
            <WhatsAppCreditsCard />
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppBusiness;

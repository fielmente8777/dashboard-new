import {
  FileText,
  Info,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  FileSpreadsheet,
  Plug,
} from "lucide-react";

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { QuickActions } from "../../components/Marketing/MarketingParts";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import Card from "../../components/ui/Card";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";

import { useToast } from "../../context/ToastContext";
import { useIntegrationStatus } from "../../hooks/useIntegrationStatus";
import { hasTenant, useTenant } from "../../hooks/useTenant";

import { useGetCampaignsQuery } from "../../redux/api/broadcastApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";

import {
  PAGES,
  broadcastPath,
  dashboardPath,
  integrationPath,
} from "../../routes/paths";

import {
  DAILY_SEND_LIMIT,
  campaignStatus,
  formatNumber,
} from "./broadcastUtils";

import CampaignSummary from "./components/CampaignSummary";
import CampaignTable from "./components/CampaignTable";
import CreateCampaignDialog from "./components/CreateCampaignDialog";

import { importWhatsAppContacts } from "./utils/importWhatsAppContacts";
import WhatsAppImportPreview from "./components/WhatsAppImportPreview";

const whatsappSettings = (section) =>
  dashboardPath(PAGES.SETTINGS, {
    query: { tab: "WhatsApp", section },
  });

const WhatsappBroadcasting = () => {
  const navigate = useNavigate();
  const tenant = useTenant();
  const { showToast } = useToast();
  const { integrationStatus, isLoadingIntegrationStatus } = useIntegrationStatus();
  const whatsAppConnected = Boolean(integrationStatus?.metaWhatsapp);

  // Campaign states
  const [creating, setCreating] = useState(false);
  const [campaignMode, setCampaignMode] = useState("default");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Excel / CSV import states
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Normal campaign opening
  const openDefaultCampaign = () => {
    setSelectedContacts([]);
    setCampaignMode("default");
    setCreating(true);
  };

  // Fetch campaigns
  const {
    data: campaigns = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCampaignsQuery(tenant.hid, {
    skip: !hasTenant(tenant),
  });

  // Campaign status tabs
  const tabs = useMemo(() => {
    const counts = campaigns.reduce((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        value: "all",
        label: `All (${campaigns.length})`,
      },
      ...Object.keys(counts).map((value) => ({
        value,
        label: `${campaignStatus(value).label} (${counts[value]})`,
      })),
    ];
  }, [campaigns]);

  // Filter campaigns
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return campaigns.filter(
      (campaign) =>
        (status === "all" || campaign.status === status) &&
        (!term ||
          campaign.name?.toLowerCase().includes(term) ||
          campaign.templateName?.toLowerCase().includes(term))
    );
  }, [campaigns, status, search]);

  const openCampaign = (campaign) =>
    navigate(broadcastPath(campaign._id));

  // First-time campaign actions
  const firstSteps = [
    {
      icon: Megaphone,
      title: "New campaign",
      description: "Pick an approved template and who should get it.",
      onClick: openDefaultCampaign,
      primary: true,
    },
    {
      icon: FileText,
      title: "Message templates",
      description: "Create or check the templates Meta has approved.",
      onClick: () =>
        navigate(whatsappSettings("template-library")),
    },
    {
      icon: Wallet,
      title: "WhatsApp credits",
      description:
        "Each message is charged by Meta. Top up before a big send.",
      onClick: () => navigate(whatsappSettings("credits")),
    },
  ];

  // Import Excel / CSV contacts
  const handleImportContacts = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setImporting(true);

      const result = await importWhatsAppContacts(file);

      if (!result.contacts || result.contacts.length === 0) {
        showToast({
          message:
            "No valid contacts found. Please check your Excel file.",
          type: "error",
        });
        return;
      }

      setImportPreview(result);

      showToast({
        message: `${result.valid} valid contacts found.`,
        type: "success",
      });
    } catch (error) {
      console.error("Contact import error:", error);

      showToast({
        message:
          error.message || "Unable to import contacts.",
        type: "error",
      });
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  // Confirm imported contacts
  const handleConfirmImport = (contacts) => {
    if (!contacts?.length) return;

    setSelectedContacts(contacts);
    setCampaignMode("excel");
    setImportPreview(null);
    setCreating(true);
  };

  // Close campaign dialog
  const handleCloseCampaign = () => {
    setCreating(false);
    setSelectedContacts([]);
    setCampaignMode("default");
  };

  // campaigns go out from the hotel's own WhatsApp Business number: without
  // one connected there is nothing to set up here, only how to connect it
  if (!isLoadingIntegrationStatus && !whatsAppConnected) {
    return (
      <PageShell
        title="WhatsApp marketing"
        description="Broadcast offers and updates to your guests, then see who got and read them."
      >
        <Card>
          <EmptyState
            icon={Plug}
            title="Connect WhatsApp Business"
            description="Campaigns are sent from your own WhatsApp Business number. Connect it to create campaigns and import contacts here."
            action={
              <Button icon={Plug} onClick={() => navigate(integrationPath("whatsapp"))}>
                Go to Integrations
              </Button>
            }
          />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="WhatsApp marketing"
      description="Broadcast offers and updates to your guests, then see who got and read them."
      actions={
        <>
          {/* Import file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleImportContacts}
          />

          {/* Import Contacts */}
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            loading={importing}
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            Import contacts
          </Button>

          {/* Refresh */}
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={isFetching && !isLoading}
            onClick={refetch}
          >
            Refresh
          </Button>

          {/* New Campaign */}
          <Button
            icon={Plus}
            onClick={openDefaultCampaign}
          >
            New campaign
          </Button>
        </>
      }
    >
      {error ? (
        <ErrorState
          message={getApiErrorMessage(
            error,
            "Could not load campaigns."
          )}
          onRetry={refetch}
        />
      ) : !isLoading && campaigns.length === 0 ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-app-border! bg-app-surface p-5 sm:p-6">
            <h2 className="text-base font-semibold text-app-text">
              Send your first WhatsApp campaign
            </h2>

            <p className="mt-1 max-w-xl text-sm text-app-text-muted">
              WhatsApp messages are read far more than emails.
              Send festive offers, last-minute deals or a
              thank-you to past guests, using a template Meta
              has approved.
            </p>
          </div>

          <QuickActions actions={firstSteps} />
        </div>
      ) : (
        <>
          <CampaignSummary
            campaigns={campaigns}
            loading={isLoading}
            onOpen={openCampaign}
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
                <Tabs
                  tabs={tabs}
                  value={status}
                  onChange={setStatus}
                  className="w-max"
                />
              </div>

              <div className="relative w-full lg:w-64">
                <Icon
                  icon={Search}
                  size="sm"
                  tone="faint"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campaign or template"
                  aria-label="Search campaigns"
                  className="pl-9"
                />
              </div>
            </div>

            <CampaignTable
              campaigns={visible}
              loading={isLoading}
              onOpen={openCampaign}
              emptyMessage="No campaigns match these filters"
            />
          </section>
        </>
      )}

      {/* Daily WhatsApp limit information */}
      <p className="flex items-start gap-2 text-xs text-app-text-muted">
        <Icon
          icon={Info}
          size="sm"
          className="mt-px shrink-0"
        />

        Meta lets a new WhatsApp number message about{" "}
        {formatNumber(DAILY_SEND_LIMIT)} different people a day.
        The limit grows as guests read your messages and don't
        block you.
      </p>

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        open={creating}
        onClose={handleCloseCampaign}
        importedContacts={selectedContacts}
        campaignMode={campaignMode}
      />

      {/* Excel / CSV Import Preview */}
      <WhatsAppImportPreview
        data={importPreview}
        onClose={() => setImportPreview(null)}
        onConfirm={handleConfirmImport}
      />

      <div className="h-14" aria-hidden="true" />
    </PageShell>
  );
};

export default WhatsappBroadcasting;

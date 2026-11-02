import { FileText, Info, Megaphone, Plus, RefreshCw, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuickActions } from "../../components/Marketing/MarketingParts";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { useGetCampaignsQuery } from "../../redux/api/broadcastApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { PAGES, broadcastPath, dashboardPath } from "../../routes/paths";
import { DAILY_SEND_LIMIT, campaignStatus, formatNumber } from "./broadcastUtils";
import CampaignSummary from "./components/CampaignSummary";
import CampaignTable from "./components/CampaignTable";
import CreateCampaignDialog from "./components/CreateCampaignDialog";

const whatsappSettings = (section) =>
  dashboardPath(PAGES.SETTINGS, { query: { tab: "WhatsApp", section } });

// WhatsApp marketing: how campaigns did (as a funnel), the best one, and
// every campaign, with the first steps up front when there are none yet.
const WhatsappBroadcasting = () => {
  const navigate = useNavigate();
  const tenant = useTenant();
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: campaigns = [], isLoading, isFetching, error, refetch } =
    useGetCampaignsQuery(tenant.hid, { skip: !hasTenant(tenant) });

  // one tab per status the campaigns actually have
  const tabs = useMemo(() => {
    const counts = campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { value: "all", label: `All (${campaigns.length})` },
      ...Object.keys(counts).map((value) => ({
        value,
        label: `${campaignStatus(value).label} (${counts[value]})`,
      })),
    ];
  }, [campaigns]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return campaigns.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!term ||
          c.name?.toLowerCase().includes(term) ||
          c.templateName?.toLowerCase().includes(term)),
    );
  }, [campaigns, status, search]);

  const openCampaign = (campaign) => navigate(broadcastPath(campaign._id));
  const firstSteps = [
    {
      icon: Megaphone,
      title: "New campaign",
      description: "Pick an approved template and who should get it.",
      onClick: () => setCreating(true),
      primary: true,
    },
    {
      icon: FileText,
      title: "Message templates",
      description: "Create or check the templates Meta has approved.",
      onClick: () => navigate(whatsappSettings("template-library")),
    },
    {
      icon: Wallet,
      title: "WhatsApp credits",
      description: "Each message is charged by Meta. Top up before a big send.",
      onClick: () => navigate(whatsappSettings("credits")),
    },
  ];

  return (
    <PageShell
      title="WhatsApp marketing"
      description="Broadcast offers and updates to your guests, then see who got and read them."
      actions={
        <>
          <Button variant="secondary" icon={RefreshCw} loading={isFetching && !isLoading} onClick={refetch}>
            Refresh
          </Button>
          <Button icon={Plus} onClick={() => setCreating(true)}>
            New campaign
          </Button>
        </>
      }
    >
      {error ? (
        <ErrorState message={getApiErrorMessage(error, "Could not load campaigns.")} onRetry={refetch} />
      ) : !isLoading && campaigns.length === 0 ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-app-border! bg-app-surface p-5 sm:p-6">
            <h2 className="text-base font-semibold text-app-text">Send your first WhatsApp campaign</h2>
            <p className="mt-1 max-w-xl text-sm text-app-text-muted">
              WhatsApp messages are read far more than emails. Send festive offers, last-minute deals or a
              thank-you to past guests, using a template Meta has approved.
            </p>
          </div>
          <QuickActions actions={firstSteps} />
        </div>
      ) : (
        <>
          <CampaignSummary campaigns={campaigns} loading={isLoading} onOpen={openCampaign} />

          <section className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
                <Tabs tabs={tabs} value={status} onChange={setStatus} className="w-max" />
              </div>
              <div className="relative w-full lg:w-64">
                <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
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

      <p className="flex items-start gap-2 text-xs text-app-text-muted">
        <Icon icon={Info} size="sm" className="mt-px shrink-0" />
        Meta lets a new WhatsApp number message about {formatNumber(DAILY_SEND_LIMIT)} different people a day. The
        limit grows as guests read your messages and don&apos;t block you.
      </p>

      <CreateCampaignDialog open={creating} onClose={() => setCreating(false)} />
      <div className="h-14" aria-hidden="true" />
    </PageShell>
  );
};

export default WhatsappBroadcasting;

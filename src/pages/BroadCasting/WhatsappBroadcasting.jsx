import { Megaphone, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { useGetCampaignsQuery } from "../../redux/api/broadcastApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { broadcastPath } from "../../routes/paths";
import { campaignStatus } from "./broadcastUtils";
import CampaignSummary from "./components/CampaignSummary";
import CampaignTable from "./components/CampaignTable";
import CreateCampaignDialog from "./components/CreateCampaignDialog";

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
      { value: "all", label: "All" },
      ...Object.keys(counts).map((value) => ({
        value,
        label: campaignStatus(value).label,
        count: counts[value],
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

  const newCampaignButton = (
    <Button icon={Plus} onClick={() => setCreating(true)}>
      New campaign
    </Button>
  );

  return (
    <PageShell
      title="WhatsApp Campaigns"
      description="Broadcast approved templates to your contacts and follow delivery and reads."
      actions={
        <>
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={isFetching && !isLoading}
            onClick={refetch}
          >
            Refresh
          </Button>
          {newCampaignButton}
        </>
      }
    >
      {error ? (
        <ErrorState
          message={getApiErrorMessage(error, "Could not load campaigns.")}
          onRetry={refetch}
        />
      ) : !isLoading && campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Pick an approved template and an audience to send your first broadcast."
          action={newCampaignButton}
        />
      ) : (
        <>
          <CampaignSummary campaigns={campaigns} />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs tabs={tabs} value={status} onChange={setStatus} />
              <div className="relative w-full sm:w-64">
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
              onOpen={(campaign) => navigate(broadcastPath(campaign._id))}
              emptyMessage="No campaigns match these filters"
            />
          </section>
        </>
      )}

      <CreateCampaignDialog open={creating} onClose={() => setCreating(false)} />
    </PageShell>
  );
};

export default WhatsappBroadcasting;

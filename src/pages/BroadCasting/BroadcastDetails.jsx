import { ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useApiAction } from "../../hooks/useApiAction";
import { useTenant } from "../../hooks/useTenant";
import { useResendCampaignRecipientMutation } from "../../redux/api/broadcastApi";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { PAGES, dashboardPath } from "../../routes/paths";
import { formatDateTime } from "../../utils/formateDate";
import { campaignStatus } from "./broadcastUtils";
import CampaignStats from "./components/details/CampaignStats";
import RecipientsTable from "./components/details/RecipientsTable";
import { useCampaignDetails } from "./hooks/useCampaignDetails";

const BroadcastDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const details = useCampaignDetails(id);
  const { campaign } = details;
  const status = campaignStatus(campaign?.status);
  const { hid } = useTenant();
  const run = useApiAction();
  const [resendRecipient] = useResendCampaignRecipientMutation();
  const [resendingId, setResendingId] = useState(null);

  // sends again to one failed recipient; the list and stats refresh after
  const resend = async (row) => {
    setResendingId(row._id);
    await run(resendRecipient({ hid, campaignId: id, recipientId: row._id }), {
      success: `Sent again to ${row.name || row.phone}`,
      error: "Could not resend the message.",
    });
    setResendingId(null);
  };

  const back = (
    <Button
      variant="ghost"
      size="sm"
      icon={ArrowLeft}
      onClick={() => navigate(dashboardPath(PAGES.MARKETING_WHATSAPP))}
    >
      All campaigns
    </Button>
  );

  return (
    <PageShell
      title={
        <span className="flex flex-wrap items-center gap-2">
          {campaign?.name || "Campaign"}
          {campaign && <Badge tone={status.tone}>{status.label}</Badge>}
        </span>
      }
      description={
        campaign &&
        [
          campaign.templateName && `Template: ${campaign.templateName}`,
          campaign.createdAt && `Created ${formatDateTime(campaign.createdAt)}`,
        ]
          .filter(Boolean)
          .join(" · ")
      }
      actions={
        <>
          {back}
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={details.tableLoading && !details.loading}
            onClick={details.refetch}
          >
            Refresh
          </Button>
        </>
      }
    >
      {details.error && !campaign ? (
        <ErrorState
          message={getApiErrorMessage(details.error, "Could not load this campaign.")}
          onRetry={details.refetch}
        />
      ) : details.loading ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-28" />
          <Skeleton className="h-80" />
        </>
      ) : (
        <>
          {campaign && <CampaignStats campaign={campaign} />}
          <RecipientsTable
            tabs={details.tabs}
            status={details.status}
            onStatusChange={details.setStatus}
            search={details.search}
            onSearchChange={details.setSearch}
            recipients={details.recipients}
            loading={details.tableLoading}
            page={details.page}
            totalPages={details.totalPages}
            total={details.total}
            onPageChange={details.setPage}
            onOpen={(row) =>
              navigate(
                dashboardPath(PAGES.CHAT_WHATSAPP, {
                  query: `number=${row.phone}`,
                }),
              )
            }
            onResend={resend}
            resendingId={resendingId}
          />
        </>
      )}
    </PageShell>
  );
};

export default BroadcastDetails;

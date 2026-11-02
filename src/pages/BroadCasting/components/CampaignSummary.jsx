import { CheckCheck, Eye, Send, Users } from "lucide-react";
import FunnelCard from "../../../components/Marketing/FunnelCard";
import { TopCampaign } from "../../../components/Marketing/MarketingParts";
import { formatDateTime } from "../../../utils/formateDate";
import { formatNumber, percent } from "../broadcastUtils";

// a campaign needs this many delivered messages before its read rate counts
const MIN_DELIVERED_FOR_BEST = 20;

// Totals across every campaign as a funnel (audience -> sent -> delivered
// -> read), and the campaign with the best read rate.
const CampaignSummary = ({ campaigns, loading, onOpen }) => {
  const totals = campaigns.reduce(
    (sum, campaign) => ({
      audience: sum.audience + (campaign.totalRecipients || 0),
      sent: sum.sent + (campaign.sentCount || 0),
      delivered: sum.delivered + (campaign.deliveredCount || 0),
      read: sum.read + (campaign.readCount || 0),
      failed: sum.failed + (campaign.failedCount || 0),
    }),
    { audience: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
  );

  const best = campaigns
    .filter((c) => (c.deliveredCount || 0) >= MIN_DELIVERED_FOR_BEST)
    .sort((a, b) => percent(b.readCount, b.deliveredCount) - percent(a.readCount, a.deliveredCount))[0];

  return (
    <div className="space-y-3">
      <FunnelCard
        loading={loading}
        steps={[
          { label: "Audience", value: totals.audience, icon: Users },
          { label: "Sent", value: totals.sent, icon: Send },
          { label: "Delivered", value: totals.delivered, icon: CheckCheck },
          { label: "Read", value: totals.read, icon: Eye, rateLabel: "of delivered (read rate)" },
        ]}
        aside={{
          label: "messages failed",
          value: totals.failed,
          hint: "usually numbers not on WhatsApp, or Meta's daily limit",
        }}
      />
      {best && (
        <TopCampaign
          name={best.name || "Untitled"}
          metric={`${percent(best.readCount, best.deliveredCount)}% read`}
          detail={`${best.templateName || "Template"} · ${formatNumber(best.deliveredCount)} delivered${
            best.createdAt ? ` · ${formatDateTime(best.createdAt)}` : ""
          }`}
          onOpen={() => onOpen(best)}
        />
      )}
    </div>
  );
};

export default CampaignSummary;

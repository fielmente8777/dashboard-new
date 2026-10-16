import { CheckCheck, Eye, Megaphone, Send } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import { formatNumber, percent } from "../broadcastUtils";

// Totals across every campaign, above the list.
const CampaignSummary = ({ campaigns }) => {
  const totals = campaigns.reduce(
    (sum, campaign) => ({
      audience: sum.audience + (campaign.totalRecipients || 0),
      sent: sum.sent + (campaign.sentCount || 0),
      delivered: sum.delivered + (campaign.deliveredCount || 0),
      read: sum.read + (campaign.readCount || 0),
    }),
    { audience: 0, sent: 0, delivered: 0, read: 0 },
  );

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Campaigns"
        value={formatNumber(campaigns.length)}
        icon={Megaphone}
      />
      <StatCard
        label="Messages sent"
        value={formatNumber(totals.sent)}
        icon={Send}
      />
      <StatCard
        label="Delivery rate"
        value={`${percent(totals.delivered, totals.sent)}%`}
        icon={CheckCheck}
      />
      <StatCard
        label="Read rate"
        value={`${percent(totals.read, totals.delivered)}%`}
        icon={Eye}
      />
    </div>
  );
};

export default CampaignSummary;

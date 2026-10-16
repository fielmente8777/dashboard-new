import { MailOpen, MousePointerClick, Send, Megaphone } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import { formatNumber, percent } from "../emailUtils";

// Totals across every campaign, above the list.
const EmailCampaignSummary = ({ campaigns }) => {
  const totals = campaigns.reduce(
    (sum, c) => ({
      sent: sum.sent + (c.stats?.sent || 0),
      opened: sum.opened + (c.stats?.opened || 0),
      clicked: sum.clicked + (c.stats?.clicked || 0),
    }),
    { sent: 0, opened: 0, clicked: 0 },
  );

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Campaigns" value={formatNumber(campaigns.length)} icon={Megaphone} />
      <StatCard label="Emails sent" value={formatNumber(totals.sent)} icon={Send} />
      <StatCard label="Open rate" value={`${percent(totals.opened, totals.sent)}%`} icon={MailOpen} />
      <StatCard
        label="Click rate"
        value={`${percent(totals.clicked, totals.opened)}%`}
        icon={MousePointerClick}
      />
    </div>
  );
};

export default EmailCampaignSummary;

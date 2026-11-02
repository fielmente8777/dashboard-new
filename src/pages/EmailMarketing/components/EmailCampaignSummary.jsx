import { CheckCheck, MailOpen, MousePointerClick, Users } from "lucide-react";
import FunnelCard from "../../../components/Marketing/FunnelCard";
import { TopCampaign } from "../../../components/Marketing/MarketingParts";
import { formatDate, formatNumber, percent } from "../emailUtils";

// a campaign needs this many delivered emails before its open rate counts
const MIN_DELIVERED_FOR_BEST = 20;

// Totals across every campaign as a funnel (recipients -> delivered ->
// opened -> clicked), and the campaign with the best open rate.
const EmailCampaignSummary = ({ campaigns, loading, onOpen }) => {
  const totals = campaigns.reduce(
    (sum, c) => ({
      recipients: sum.recipients + (c.recipientCount || c.stats?.sent || 0),
      delivered: sum.delivered + (c.stats?.delivered || c.stats?.sent || 0),
      opened: sum.opened + (c.stats?.opened || 0),
      clicked: sum.clicked + (c.stats?.clicked || 0),
      failed: sum.failed + (c.stats?.failed || 0),
    }),
    { recipients: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
  );

  // gian does not record opens and clicks yet (no tracking pixel or click
  // links); until one is recorded, showing 0% opened would only mislead
  const tracked = totals.opened > 0 || totals.clicked > 0;

  const delivered = (c) => c.stats?.delivered || c.stats?.sent || 0;
  const best = !tracked ? null : campaigns
    .filter((c) => delivered(c) >= MIN_DELIVERED_FOR_BEST)
    .sort((a, b) => percent(b.stats?.opened, delivered(b)) - percent(a.stats?.opened, delivered(a)))[0];

  return (
    <div className="space-y-3">
      <FunnelCard
        title="How your emails did"
        loading={loading}
        steps={[
          { label: "Recipients", value: totals.recipients, icon: Users },
          { label: "Delivered", value: totals.delivered, icon: CheckCheck },
          ...(tracked
            ? [
                { label: "Opened", value: totals.opened, icon: MailOpen, rateLabel: "of delivered (open rate)" },
                { label: "Clicked", value: totals.clicked, icon: MousePointerClick, rateLabel: "of opened (click rate)" },
              ]
            : []),
        ]}
        note={tracked ? null : "Open and click tracking isn't switched on yet, so only delivery is shown."}
        aside={{ label: "emails bounced or failed", value: totals.failed, hint: "check those addresses" }}
      />
      {best && (
        <TopCampaign
          name={best.subject || best.name || "Untitled"}
          metric={`${percent(best.stats?.opened, delivered(best))}% opened`}
          detail={`${formatNumber(delivered(best))} delivered${best.createdAt ? ` · ${formatDate(best.createdAt)}` : ""}`}
          onOpen={() => onOpen?.(best)}
        />
      )}
    </div>
  );
};

export default EmailCampaignSummary;

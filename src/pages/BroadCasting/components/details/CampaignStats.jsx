import { AlertTriangle, CheckCheck, Eye, Send, Users } from "lucide-react";
import Card from "../../../../components/ui/Card";
import StatCard from "../../../../components/ui/StatCard";
import {
  RECIPIENT_STATUS,
  formatNumber,
  percent,
} from "../../broadcastUtils";

// The headline numbers and a bar showing where every message ended up.
const CampaignStats = ({ campaign }) => {
  const {
    totalRecipients: total = 0,
    sentCount: sent = 0,
    deliveredCount: delivered = 0,
    readCount: read = 0,
    failedCount: failed = 0,
  } = campaign;

  // delivered includes read, sent includes delivered: split them apart
  const segments = [
    { ...RECIPIENT_STATUS.read, value: read },
    { ...RECIPIENT_STATUS.delivered, value: Math.max(delivered - read, 0) },
    { ...RECIPIENT_STATUS.sent, label: "Sent, not delivered", value: Math.max(sent - delivered - failed, 0) },
    { ...RECIPIENT_STATUS.failed, value: failed },
  ];
  const pending = Math.max(total - sent, 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Audience" value={formatNumber(total)} icon={Users} />
        <StatCard label="Sent" value={formatNumber(sent)} icon={Send} />
        <StatCard
          label="Delivered"
          value={`${formatNumber(delivered)} · ${percent(delivered, sent)}%`}
          icon={CheckCheck}
        />
        <StatCard
          label="Read"
          value={`${formatNumber(read)} · ${percent(read, delivered)}%`}
          icon={Eye}
        />
        <StatCard
          label="Failed"
          value={formatNumber(failed)}
          icon={AlertTriangle}
        />
      </div>

      <Card title="Delivery" description={`${formatNumber(total)} recipients`}>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-app-surface-secondary">
          {segments.map(
            (segment) =>
              segment.value > 0 && (
                <div
                  key={segment.label}
                  title={`${segment.label}: ${formatNumber(segment.value)}`}
                  className="anim-grow-x h-full"
                  style={{
                    width: `${(segment.value / (total || 1)) * 100}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ),
          )}
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          {[...segments, { label: "Not sent yet", value: pending, color: "var(--chart-other)" }].map(
            (segment) => (
              <li key={segment.label} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-app-text-muted">{segment.label}</span>
                <span className="font-medium tabular-nums text-app-text">
                  {formatNumber(segment.value)}
                </span>
              </li>
            ),
          )}
        </ul>
      </Card>
    </>
  );
};

export default CampaignStats;

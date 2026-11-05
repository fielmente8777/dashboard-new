import { ReceiptText } from "lucide-react";
import {
  STATUS_TONES,
  capitalize,
  creditState,
  formatCredits,
  formatDate,
} from "../../../components/AiCredits/aiCredits";
import LowCreditBanner from "../../../components/AiCredits/LowCreditBanner";
import Badge from "../../../components/ui/Badge";
import Detail from "../../../components/ui/Detail";
import Drawer from "../../../components/ui/Drawer";
import { EmptyState } from "../../../components/ui/States";
import Tabs from "../../../components/ui/Tabs";

const TABS = [
  { value: "wallet", label: "Wallet" },
  { value: "transactions", label: "Transactions" },
];

// One tenant's wallet and the changes made to it.
// `adjustments`: the add / deduct entries made on this page (newest first).
// IN PROGRESS: the full history arrives with the wallet API.
const TenantWalletDrawer = ({ tenant, tab, onTabChange, adjustments, thresholds, onClose }) => {
  if (!tenant) return null;

  return (
    <Drawer
      open
      title={tenant.name}
      description={tenant.tenantId}
      header={<Tabs tabs={TABS} value={tab} onChange={onTabChange} className="mt-3" />}
      onClose={onClose}
    >
      {tab === "wallet" ? (
        <div className="space-y-4">
          <LowCreditBanner state={creditState(tenant.availableCredits, thresholds)} balance={tenant.availableCredits} />
          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-app-border! bg-app-surface p-4">
            <Detail label="Available credits">{formatCredits(tenant.availableCredits)}</Detail>
            <Detail label="Wallet status">
              <Badge tone={STATUS_TONES[tenant.walletStatus]}>{capitalize(tenant.walletStatus)}</Badge>
            </Detail>
            <Detail label="Total purchased">{formatCredits(tenant.totalPurchased)}</Detail>
            <Detail label="Total used">{formatCredits(tenant.totalUsed)}</Detail>
            <Detail label="Last recharge">{formatDate(tenant.lastRecharge)}</Detail>
          </dl>
        </div>
      ) : adjustments.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions to show yet"
          description="Credits you add or deduct here are listed. The full purchase and usage history will appear once the wallet API is live."
        />
      ) : (
        <ul className="space-y-2">
          {adjustments.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-app-border! bg-app-surface p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-app-text">{entry.reason}</p>
                <p className="mt-0.5 text-xs text-app-text-muted">
                  {formatDate(entry.date)} · Balance after {formatCredits(entry.balanceAfter)}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold tabular-nums ${
                  entry.credits >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {entry.credits >= 0 ? "+" : "−"}
                {formatCredits(Math.abs(entry.credits))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
};

export default TenantWalletDrawer;

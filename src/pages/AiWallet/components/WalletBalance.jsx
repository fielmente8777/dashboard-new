import { Zap } from "lucide-react";
import Button from "../../../components/ui/Button";
import { formatCredits, formatDate } from "../../../components/AiCredits/aiCredits";

const Stat = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</p>
    <p className="mt-1 truncate text-lg font-semibold tabular-nums text-white">{value}</p>
  </div>
);

// The balance hero at the top of the wallet.
const WalletBalance = ({ wallet, onRecharge }) => {
  const used = wallet.totalPurchased
    ? Math.min(100, Math.round((wallet.totalConsumed / wallet.totalPurchased) * 100))
    : 0;

  return (
    <section className="overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-700 p-5 text-white shadow-sm sm:p-6 dark:from-blue-700 dark:to-indigo-800">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/70">Available credits</p>
          <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
            {formatCredits(wallet.availableCredits)}
          </p>
        </div>
        <Button
          size="lg"
          icon={Zap}
          onClick={onRecharge}
          className="w-full bg-white text-primary! hover:bg-white/90 sm:w-auto dark:bg-white dark:hover:bg-white/90"
        >
          Recharge Wallet
        </Button>
      </div>

      <div className="mt-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${used}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-white/70">{used}% of purchased credits used</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 sm:grid-cols-3">
        <Stat label="Total purchased" value={formatCredits(wallet.totalPurchased)} />
        <Stat label="Total consumed" value={formatCredits(wallet.totalConsumed)} />
        <Stat label="Last recharge" value={formatDate(wallet.lastRecharge)} />
      </div>
    </section>
  );
};

export default WalletBalance;

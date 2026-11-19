import { AlertTriangle, Coins, IndianRupee, Activity, Wallet, Zap } from "lucide-react";
import { formatCredits, formatMoney } from "../../../components/AiCredits/aiCredits";
import StatCard from "../../../components/ui/StatCard";

const OverviewCards = ({ overview }) => {
  const cards = [
    { label: "Total credits sold", value: formatCredits(overview.totalCreditsSold), icon: Coins },
    { label: "Total credits used", value: formatCredits(overview.totalCreditsUsed), icon: Activity },
    { label: "Available credits", value: formatCredits(overview.totalAvailableCredits), icon: Zap },
    {
      label: "Recharge revenue",
      value: formatMoney(overview.totalRechargeRevenue, overview.currency),
      icon: IndianRupee,
    },
    { label: "Active wallets", value: formatCredits(overview.activeWallets), icon: Wallet },
    { label: "Low-credit tenants", value: formatCredits(overview.lowCreditTenants), icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default OverviewCards;

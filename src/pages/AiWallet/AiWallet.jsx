import { Zap } from "lucide-react";
import { useState } from "react";
import InProgressNotice from "../../components/AiCredits/InProgressNotice";
import LowCreditBanner from "../../components/AiCredits/LowCreditBanner";
import { creditState } from "../../components/AiCredits/aiCredits";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import Segmented from "../../components/ui/Segmented";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetAiWalletQuery } from "../../redux/api/aiCreditsApi";
import AllCredits, { AI_SECTION_ID } from "./components/AllCredits";
import CreditUsageChart from "./components/CreditUsageChart";
import RechargeDialog from "./components/RechargeDialog";
import RechargePackages from "./components/RechargePackages";
import TransactionHistory from "./components/TransactionHistory";
import UsageBreakdown from "./components/UsageBreakdown";
import WalletBalance from "./components/WalletBalance";

// while the page is in progress: show the banner in any state
const PREVIEW_STATES = [
  { value: "live", label: "Live" },
  { value: "healthy", label: "Healthy" },
  { value: "low", label: "Low" },
  { value: "critical", label: "Critical" },
  { value: "empty", label: "Empty" },
];
const PREVIEW_BALANCE = { healthy: 4200, low: 800, critical: 80, empty: 0 };

const LoadingWallet = () => (
  <>
    <Skeleton className="h-16" />
    <Skeleton className="h-52" />
    <Skeleton className="h-80" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-48" />
      ))}
    </div>
  </>
);

// Tenant > Credits & Wallet: every credit balance (AI, WhatsApp, calls, SEO),
// then the AI credits' usage and recharges.
const AiWallet = () => {
  const aiQuery = useGetAiWalletQuery();
  const { data, isLoading, error, refetch } = aiQuery;
  const { showToast } = useToast();
  const [preview, setPreview] = useState("live");
  const [recharge, setRecharge] = useState({ open: false, pack: null });

  const openRecharge = (pack = null) => setRecharge({ open: true, pack });
  const closeRecharge = () => setRecharge({ open: false, pack: null });
  const confirmRecharge = (pack) => {
    closeRecharge();
    showToast({
      message: `Online recharge is coming soon. Contact support to add the ${pack.name} package.`,
      type: "info",
    });
  };

  const liveBalance = data?.wallet?.availableCredits ?? 0;
  const liveState = creditState(liveBalance, data?.thresholds);
  const balance = preview === "live" ? liveBalance : PREVIEW_BALANCE[preview];
  const state = preview === "live" ? liveState : preview;

  return (
    <PageShell
      title="Credits & Wallet"
      description="All your credit balances, plus AI credit usage and recharges"
      actions={
        data && (
          <Button icon={Zap} onClick={() => openRecharge()}>
            Recharge AI credits
          </Button>
        )
      }
    >
      <InProgressNotice message="WhatsApp, calling and SEO balances are live. AI credits show demo data, and AI recharges are not charged yet.">
        {data && (
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="whitespace-nowrap text-xs text-app-text-muted">Preview AI alert:</span>
            <Segmented label="Preview AI alert state" options={PREVIEW_STATES} value={preview} onChange={setPreview} />
          </div>
        )}
      </InProgressNotice>

      <AllCredits aiQuery={aiQuery} aiLevel={data ? liveState : null} />

      <h2 id={AI_SECTION_ID} className="scroll-mt-4 pt-2 text-base font-semibold text-app-text">
        AI credits
      </h2>

      {isLoading && <LoadingWallet />}

      {error && (
        <ErrorState
          message={getApiErrorMessage(error, "Couldn't load your AI wallet.")}
          onRetry={refetch}
        />
      )}

      {data && (
        <>
          <LowCreditBanner state={state} balance={balance} onRecharge={() => openRecharge()} />
          <WalletBalance wallet={data.wallet} onRecharge={() => openRecharge()} />
          <CreditUsageChart dailyUsage={data.dailyUsage ?? []} />
          <RechargePackages packages={data.packages ?? []} onRecharge={openRecharge} />
          <UsageBreakdown usage={data.usage ?? []} />
          <TransactionHistory transactions={data.transactions ?? []} />

          <RechargeDialog
            open={recharge.open}
            packages={data.packages ?? []}
            initialPackage={recharge.pack}
            balance={data.wallet?.availableCredits ?? 0}
            onClose={closeRecharge}
            onConfirm={confirmRecharge}
          />
        </>
      )}
    </PageShell>
  );
};

export default AiWallet;

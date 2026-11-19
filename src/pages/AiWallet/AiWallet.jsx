import { Ban, Zap } from "lucide-react";
import { useState } from "react";
import LowCreditBanner from "../../components/AiCredits/LowCreditBanner";
import { creditState, formatCredits } from "../../components/AiCredits/aiCredits";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useCreateAiRechargeMutation,
  useGetAiWalletQuery,
  useVerifyAiRechargeMutation,
} from "../../redux/api/aiCreditsApi";
import { loadRazorpay } from "../../utils/razorpay";
import AllCredits, { AI_SECTION_ID } from "./components/AllCredits";
import CreditUsageChart from "./components/CreditUsageChart";
import RechargeDialog from "./components/RechargeDialog";
import RechargePackages from "./components/RechargePackages";
import TransactionHistory from "./components/TransactionHistory";
import UsageBreakdown from "./components/UsageBreakdown";
import WalletBalance from "./components/WalletBalance";

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
// then the AI credits' usage, recharges and history.
const AiWallet = () => {
  const aiQuery = useGetAiWalletQuery();
  const { data, isLoading, error, refetch } = aiQuery;
  const { showToast } = useToast();
  const [recharge, setRecharge] = useState({ open: false, pack: null });
  const [paying, setPaying] = useState(false);
  const [createRecharge] = useCreateAiRechargeMutation();
  const [verifyRecharge] = useVerifyAiRechargeMutation();

  const wallet = data?.wallet;
  const suspended = wallet?.status === "suspended";
  const available = wallet?.availableCredits ?? 0;
  const state = creditState(available, data?.thresholds);

  const openRecharge = (pack = null) => setRecharge({ open: true, pack });
  const closeRecharge = () => setRecharge({ open: false, pack: null });

  // Razorpay checkout. Credits are added by gian only after it has checked
  // the payment with Razorpay; the browser's success callback alone adds nothing.
  const confirmRecharge = async (pack) => {
    setPaying(true);
    try {
      if (!(await loadRazorpay())) {
        showToast({ type: "error", message: "Could not load the payment gateway. Check your connection." });
        return;
      }
      const order = await createRecharge(pack.id).unwrap();

      await new Promise((resolve) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: "Eazotel AI credits",
          description: `${order.packageName}: ${formatCredits(order.credits)} credits`,
          theme: { color: "#2563eb" },
          handler: async (response) => {
            try {
              const result = await verifyRecharge({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }).unwrap();
              showToast(
                result.pending
                  ? { type: "info", message: "Payment received. Your credits will be added as soon as it is confirmed." }
                  : { type: "success", message: `${formatCredits(result.credits)} AI credits added to your wallet` },
              );
            } catch {
              // the payment went through; the webhook still credits it
              showToast({ type: "info", message: "Payment received. Your balance will update shortly." });
            } finally {
              closeRecharge();
              refetch();
              resolve();
            }
          },
          modal: { ondismiss: () => resolve() },
        });
        rzp.on("payment.failed", (resp) =>
          showToast({ type: "error", message: resp?.error?.description || "Payment failed" }),
        );
        rzp.open();
      });
    } catch (err) {
      showToast({ type: "error", message: getApiErrorMessage(err, "Could not start the payment") });
    } finally {
      setPaying(false);
    }
  };

  return (
    <PageShell
      title="Credits & Wallet"
      description="All your credit balances, plus AI credit usage and recharges"
      actions={
        data &&
        !suspended && (
          <Button icon={Zap} onClick={() => openRecharge()}>
            Recharge AI credits
          </Button>
        )
      }
    >
      <AllCredits aiQuery={aiQuery} aiLevel={data ? state : null} />

      <h2 id={AI_SECTION_ID} className="scroll-mt-4 pt-2 text-base font-semibold text-app-text">
        AI credits
      </h2>

      {isLoading && <LoadingWallet />}

      {error && (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load your AI wallet.")} onRetry={refetch} />
      )}

      {data && (
        <>
          {suspended ? (
            <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-500/40! bg-red-500/5 p-4">
              <Icon icon={Ban} className="text-red-600 dark:text-red-400" />
              <p className="text-sm text-app-text">
                <span className="font-semibold">Your AI wallet is suspended.</span>{" "}
                <span className="text-app-text-muted">AI services and recharges are paused. Contact Eazotel support.</span>
              </p>
            </div>
          ) : (
            <LowCreditBanner state={state} balance={available} onRecharge={() => openRecharge()} />
          )}
          <WalletBalance wallet={wallet} onRecharge={suspended ? null : () => openRecharge()} />
          <CreditUsageChart />
          {!suspended && <RechargePackages packages={data.packages ?? []} onRecharge={openRecharge} />}
          <UsageBreakdown />
          <TransactionHistory />

          <RechargeDialog
            open={recharge.open}
            packages={data.packages ?? []}
            initialPackage={recharge.pack}
            balance={available}
            busy={paying}
            onClose={closeRecharge}
            onConfirm={confirmRecharge}
          />
        </>
      )}
    </PageShell>
  );
};

export default AiWallet;

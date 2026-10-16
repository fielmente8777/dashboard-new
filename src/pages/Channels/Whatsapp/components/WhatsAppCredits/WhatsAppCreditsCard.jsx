import { AlertCircle, Info, Plus, RefreshCw, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import IconButton from "../../../../../components/ui/IconButton";
import { ErrorState, Skeleton } from "../../../../../components/ui/States";
import Tabs from "../../../../../components/ui/Tabs";
import { RAZORPAY_CHECKOUT_SCRIPT_URL } from "../../../../../config/env";
import { useToast } from "../../../../../context/ToastContext";
import {
  createWhatsAppCreditOrder,
  getWhatsAppBilling,
  verifyWhatsAppCreditPayment,
} from "../../../../../services/api/whatsApp";
import AddCreditsModal from "./AddCreditsModal";
import ProgressBar from "./ProgressBar";
import UsageBreakdown from "./UsageBreakdown";
import { formatCount, formatDate, formatMoney, percent } from "./utils";
import WhatsAppTransactions from "./WhatsAppTransactions";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "transactions", label: "Transactions" },
];

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-app-border! bg-app-surface px-4 py-3">
    <p className="text-xs text-app-text-muted">{label}</p>
    <p className="mt-1 break-words text-xl font-semibold text-app-text">{value}</p>
  </div>
);

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// WhatsApp wallet balance, this month's usage and recharges.
// `billing` is optional; without it the card loads it from the API.
const WhatsAppCreditsCard = ({ billing: billingProp }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [billing, setBilling] = useState(billingProp || null);
  const [loading, setLoading] = useState(!billingProp);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const [tab, setTab] = useState("overview");
  const [txRefreshKey, setTxRefreshKey] = useState(0);

  const fetchBilling = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWhatsAppBilling();
      if (response?.success) {
        setBilling(response?.result?.docs || null);
      } else {
        setError(response?.message || "Couldn't load WhatsApp credits.");
      }
    } catch (err) {
      setError(err?.message || "Couldn't load WhatsApp credits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (billingProp) {
      setBilling(billingProp);
      setLoading(false);
      return;
    }
    fetchBilling();
  }, [billingProp, fetchBilling]);

  const handleAddCredits = async (amount) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      showToast({
        type: "error",
        message: "Could not load the payment gateway. Check your connection.",
      });
      return;
    }

    const orderRes = await createWhatsAppCreditOrder(amount);

    if (!orderRes?.success) {
      showToast({
        type: "error",
        message: orderRes?.responseMessage || "Could not start payment",
      });
      return;
    }

    const {
      orderId,
      amount: amountPaise,
      currency,
      keyId,
    } = orderRes.result.docs;

    // the modal awaits this, so it shows "Processing…" until checkout ends
    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount: amountPaise,
        currency,
        name: "Eazotel WhatsApp",
        description: "WhatsApp credits",
        theme: { color: "#00c853" },

        handler: async (response) => {
          const verifyRes = await verifyWhatsAppCreditPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes?.success) {
            showToast({
              type: "success",
              message: `₹${amount} added to your wallet`,
            });
          } else {
            // The payment went through. The webhook will still credit it.
            showToast({
              type: "info",
              message: "Payment received. Your balance will update shortly.",
            });
          }

          await fetchBilling();
          setTxRefreshKey((key) => key + 1);
          resolve();
        },

        modal: { ondismiss: () => resolve() },
      });

      rzp.on("payment.failed", (resp) => {
        showToast({
          type: "error",
          message: resp?.error?.description || "Payment failed",
        });
      });

      rzp.open();
    });
  };

  if (loading && !billing) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={fetchBilling} />;
  if (!billing) return null;

  const {
    currency = "INR",
    wallet = {},
    cycle = {},
    freeTier = {},
    usage = {},
    rates = {},
    recentTransactions = [],
  } = billing;

  const balance = wallet.balance || 0;
  const isLow = balance <= (wallet.lowBalanceThreshold ?? 0);
  const walletUsedPct = percent(wallet.totalUsed, wallet.totalLoaded);
  const freeUsed = Math.min(freeTier.serviceUsed || 0, freeTier.serviceLimit || 0);
  const freeLeft = Math.max((freeTier.serviceLimit || 0) - freeUsed, 0);
  const freePct = percent(freeUsed, freeTier.serviceLimit);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-app-text">
            <Wallet className="size-4 text-green-600 dark:text-green-400" />
            Credits &amp; usage
          </h2>
          <p className="text-xs text-app-text-muted">
            Your WhatsApp wallet pays for the messages Meta charges for.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!billingProp && (
            <IconButton icon={RefreshCw} label="Refresh" onClick={fetchBilling} disabled={loading} />
          )}
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Add credits
          </Button>
        </div>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "overview" && (
        <>
          {isLow && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30! bg-red-500/5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0 translate-y-0.5" />
              Low balance. Paid messages stop sending when the wallet reaches zero.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Available balance" value={formatMoney(balance, currency)} />
            <Stat label="Total loaded" value={formatMoney(wallet.totalLoaded, currency)} />
            <Stat label="Total used" value={formatMoney(wallet.totalUsed, currency)} />
          </div>

          <Card>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-app-text">Credits used</span>
                  <span className="text-app-text-muted">{walletUsedPct}%</span>
                </div>
                <ProgressBar
                  value={walletUsedPct}
                  colorClass={walletUsedPct > 85 ? "bg-red-500" : "bg-blue-500"}
                />
                <p className="text-xs text-app-text-faint">
                  Last recharge: {formatDate(wallet.lastRechargeAt)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-app-text">Free service messages</span>
                  <span className="text-app-text-muted">
                    {formatCount(freeUsed)} / {formatCount(freeTier.serviceLimit)}
                  </span>
                </div>
                <ProgressBar
                  value={freePct}
                  colorClass={freePct >= 100 ? "bg-amber-500" : "bg-green-500"}
                />
                <p className="text-xs text-app-text-faint">
                  {freeLeft > 0
                    ? `${formatCount(freeLeft)} free left this month`
                    : `Free limit reached: ${formatMoney(rates.service, currency, 4)} per service message`}
                </p>
              </div>
            </div>
          </Card>

          <UsageBreakdown usage={usage} rates={rates} currency={currency} cycleLabel={cycle.label} />

          <p className="flex items-start gap-1.5 text-xs text-app-text-faint">
            <Info className="size-3.5 shrink-0 translate-y-0.5" />
            From 1 Oct 2026, utility messages inside the 24-hour window are charged and are not
            covered by the 1,000 free service messages. Rates shown are for Indian numbers.
          </p>

          {recentTransactions.length > 0 && (
            <Card
              title="Recent transactions"
              actions={
                <Button size="sm" variant="ghost" onClick={() => setTab("transactions")}>
                  See all
                </Button>
              }
            >
              <ul className="-my-2 divide-y divide-app-border!">
                {recentTransactions.slice(0, 5).map((t) => {
                  const isCredit = t.type === "CREDIT" || t.type === "REFUND";
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate text-app-text">{t.note}</p>
                        <p className="text-xs text-app-text-faint">{formatDate(t.createdAt)}</p>
                      </div>
                      <span
                        className={`shrink-0 font-medium ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {isCredit ? "+" : "−"}
                        {formatMoney(t.amount, currency)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      {tab === "transactions" && (
        <WhatsAppTransactions refreshKey={txRefreshKey} currency={currency} />
      )}

      <AddCreditsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddCredits}
        currentBalance={balance}
        rates={rates}
        currency={currency}
      />
    </div>
  );
};

export default WhatsAppCreditsCard;

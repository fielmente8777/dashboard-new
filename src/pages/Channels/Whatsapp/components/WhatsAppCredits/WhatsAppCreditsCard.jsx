import React, { useCallback, useEffect, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdAdd,
  MdErrorOutline,
  MdInfoOutline,
  MdRefresh,
} from "react-icons/md";
// Adjust this path if your folder depth differs (same file WhatsAppBusiness.jsx imports from)
import {
  createWhatsAppCreditOrder,
  getWhatsAppBilling,
  verifyWhatsAppCreditPayment,
} from "../../../../../services/api/whatsApp";
import AddCreditsModal from "./AddCreditsModal";
import ProgressBar from "./ProgressBar";
import UsageBreakdown from "./UsageBreakdown";
import { formatCount, formatDate, formatMoney, percent } from "./utils";
import { useToast } from "../../../../../context/ToastContext";
import WhatsAppTransactions from "./WhatsAppTransactions";
import { RAZORPAY_CHECKOUT_SCRIPT_URL } from "../../../../../config/env";

const Stat = ({ label, value, highlight = false }) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
    <p className="text-xs text-gray-500 dark:text-app-text-faint">{label}</p>
    <p
      className={`mt-1 font-medium break-words ${
        highlight
          ? "text-2xl text-gray-800 dark:text-app-text"
          : "text-lg text-gray-700 dark:text-app-text-muted"
      }`}
    >
      {value}
    </p>
  </div>
);

const CardShell = ({ children }) => (
  <div className="w-full border border-gray-200 dark:border-primary/60! bg-app-surface px-4 sm:px-6 py-5">
    {children}
  </div>
);

const LoadingState = () => (
  <CardShell>
    <div className="animate-pulse space-y-5">
      <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
      <div className="h-2 w-full rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-48 w-full rounded-lg bg-gray-100 dark:bg-gray-800" />
    </div>
  </CardShell>
);

const ErrorState = ({ message, onRetry }) => (
  <CardShell>
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <MdErrorOutline className="w-8 h-8 text-red-500" />
      <p className="text-sm text-gray-600 dark:text-app-text-muted">
        {message || "Couldn't load WhatsApp credits."}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-app-text-muted hover:bg-primary/10"
      >
        <MdRefresh size={18} /> Try again
      </button>
    </div>
  </CardShell>
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

// `billing` prop is optional — if not passed, the card fetches it from the API.
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

  // After a recharge, refresh the numbers
  // const handleAddCredits = async (amount) => {
  //   await onAddCredits?.(amount);
  //   if (!billingProp) await fetchBilling();
  // };

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

    // The modal awaits this promise, so it stays on "Processing..." until checkout ends
    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount: amountPaise,
        currency,
        name: "Eazotel WhatsApp", // your brand name
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

          await fetchBilling(); // your existing refresh for the card
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

  if (loading) return <LoadingState />;
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

  const freeUsed = Math.min(
    freeTier.serviceUsed || 0,
    freeTier.serviceLimit || 0,
  );
  const freeLeft = Math.max((freeTier.serviceLimit || 0) - freeUsed, 0);
  const freePct = percent(freeUsed, freeTier.serviceLimit);

  return (
    <div className="w-full border border-gray-200 dark:border-primary/60! bg-app-surface px-4 sm:px-6 py-2 space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: "overview", label: "Overview" },
          { key: "transactions", label: "Transactions" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 dark:text-app-text-faint hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MdAccountBalanceWallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-app-text-faint">
                  WhatsApp Credits
                </p>
              </div>
              <h2 className="text-lg sm:text-xl font-medium text-gray-600 dark:text-app-text-muted">
                Wallet & Message Usage
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {!billingProp && (
                <button
                  onClick={fetchBilling}
                  aria-label="Refresh"
                  title="Refresh"
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-app-text-muted hover:bg-primary/10"
                >
                  <MdRefresh size={18} />
                </button>
              )}
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
              >
                <MdAdd size={18} /> Add Credits
              </button>
            </div>
          </div>

          {/* Low balance warning */}
          {isLow && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <MdErrorOutline className="w-5 h-5 shrink-0" />
              <span>
                Low balance. Paid messages will stop sending once the wallet
                reaches zero.
              </span>
            </div>
          )}

          {/* Wallet stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat
              label="Available balance"
              value={formatMoney(balance, currency)}
              highlight
            />
            <Stat
              label="Total loaded"
              value={formatMoney(wallet.totalLoaded, currency)}
            />
            <Stat
              label="Total used"
              value={formatMoney(wallet.totalUsed, currency)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wallet consumption */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-app-text-muted">
                  Credits used
                </span>
                <span className="text-gray-500 dark:text-app-text-faint">
                  {walletUsedPct}%
                </span>
              </div>
              <ProgressBar
                value={walletUsedPct}
                colorClass={walletUsedPct > 85 ? "bg-red-500" : "bg-primary"}
              />
              <p className="text-xs text-gray-400 dark:text-app-text-faint">
                Last recharge: {formatDate(wallet.lastRechargeAt)}
              </p>
            </div>

            {/* Free service tier */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-app-text-muted">
                  Free service messages
                </span>
                <span className="text-gray-500 dark:text-app-text-faint">
                  {formatCount(freeUsed)} / {formatCount(freeTier.serviceLimit)}
                </span>
              </div>
              <ProgressBar
                value={freePct}
                colorClass={freePct >= 100 ? "bg-amber-500" : "bg-green-500"}
              />
              <p className="text-xs text-gray-400 dark:text-app-text-faint">
                {freeLeft > 0
                  ? `${formatCount(freeLeft)} free left this month`
                  : `Free limit reached — ${formatMoney(rates.service, currency, 4)} per service message`}
              </p>
            </div>
          </div>

          <UsageBreakdown
            usage={usage}
            rates={rates}
            currency={currency}
            cycleLabel={cycle.label}
          />

          <p className="flex items-start gap-1.5 text-xs text-gray-400 dark:text-app-text-faint">
            <MdInfoOutline className="w-4 h-4 shrink-0" />
            From 1 Oct 2026, utility messages inside the 24-hour window are
            charged and are not covered by the 1,000 free service messages.
            Rates shown are for Indian numbers.
          </p>

          {/* Recent recharges */}
          {recentTransactions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-app-text-muted mb-2">
                Recent transactions
              </p>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {recentTransactions.slice(0, 5).map((t) => {
                  const isCredit = t.type === "CREDIT" || t.type === "REFUND";
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <div>
                        <p className="text-gray-700 dark:text-app-text-muted">
                          {t.note}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-app-text-faint">
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`font-medium ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {isCredit ? "+" : "−"}
                        {formatMoney(t.amount, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <AddCreditsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddCredits}
            currentBalance={balance}
            rates={rates}
            currency={currency}
          />
        </>
      )}

      {tab === "transactions" && (
        <WhatsAppTransactions refreshKey={txRefreshKey} currency={currency} />
      )}
    </div>
  );
};

export default WhatsAppCreditsCard;

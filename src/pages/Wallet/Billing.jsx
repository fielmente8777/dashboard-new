import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  ChartColumn,
  ChartLine,
  Check,
  ChevronDown,
  CircleCheck,
  Clock,
  Contact,
  Crown,
  Headphones,
  Hotel,
  Layers,
  LoaderCircle,
  Lock,
  Megaphone,
  MessageCircle,
  Minus,
  PhoneCall,
  Plug,
  Plus,
  Puzzle,
  Receipt,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { NEW_BASE_URL } from "../../data/constant";
import { useDispatch, useSelector } from "react-redux";
import { daysLeft } from "../../utils/daysLeft";
import { clearSubscriptionApps } from "../../redux/slice/subscriptionDataSlice";
import { refreshSubscription } from "../../redux/session";
import Navbar from "../../components/Navbar/Navbar";
import { RAZORPAY_BILLING_KEY_ID, RAZORPAY_CHECKOUT_SCRIPT_URL } from "../../config/env";

const GST_PERCENT = 18;
const TEAM_SEAT_PRICE = 500;
const SALES_WHATSAPP_URL = "https://wa.me/+919501868775";

// Billing cycles: months billed and discount applied for each.
const CYCLES = [
  { key: "month", label: "Monthly", months: 1, discount: 5 },
  { key: "quarter", label: "Quarterly", months: 3, discount: 10 },
  { key: "6month", label: "6 Months", months: 6, discount: 15 },
  { key: "year", label: "Yearly", months: 12, discount: 40 },
];

const PLAN_META = {
  BASIC: {
    icon: Rocket,
    tagline:
      "Perfect for small hotels starting their journey toward direct bookings and digital growth.",
  },
  PRO: {
    icon: Crown,
    tagline:
      "Best value for growing hotels with multichannel automation and advanced tools.",
  },
  ENTERPRISE: {
    icon: Building2,
    tagline:
      "Full-suite for large properties needing advanced integrations and dedicated support.",
  },
};

const MODULE_LABELS = {
  corePlatform: "Core Platform",
  aiLayer: "AI Layer",
  analytics: "Analytics",
  automation: "Automation",
  integrations: "Integrations",
  unlimitedLocation: "Unlimited Location",
};

const APP_ICONS = {
  "WhatsApp Chat": MessageCircle,
  "Lead Management": Target,
  "Exotel Integration": PhoneCall,
  CRM: Contact,
  "Booking Engine + Reservation Desk": Hotel,
  Eazbot: Bot,
  Webhook: Webhook,
  "WordPress Webhook": Puzzle,
  GRM: ChartColumn,
  "Meta Leads": ChartLine,
  "Google Ads Insights": Megaphone,
  "Social Media": Share2,
};

// Theme-neutral tones: derived from the text colour so they work in light and dark.
const BORDER = "border-app-text/10!";
const MUTED = "text-app-text/60";
const FAINT = "text-app-text/45";

const formatPrice = (num) =>
  `₹${Math.round(Number(num) || 0).toLocaleString("en-IN")}`;

const formatLimit = (value) =>
  value < 0 ? "Unlimited" : Number(value).toLocaleString("en-IN");

const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

// Load the Razorpay checkout script once and reuse it on later clicks.
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const SectionTitle = ({ icon, title, hint }) => {
  const Icon = icon;
  return (
  <div className="flex items-center gap-2 mb-5">
    <Icon className="w-4 h-4 text-ternary" />
    <span className="text-[11px] font-bold tracking-wider uppercase text-app-text/70">
      {title}
    </span>
    {hint && <span className={`text-[11px] ${FAINT}`}>· {hint}</span>}
    <div className="flex-1 h-px bg-app-text/10"></div>
  </div>
  );
};

// Individual Plan Card Component
const PlanCard = ({ plan, isSelected, onSelect, isPurchased }) => {
  const isEnterprise = plan.planName === "ENTERPRISE";
  const isPopular = plan.planName === "PRO";
  const canSelect = !isPurchased && !isEnterprise;
  const meta = PLAN_META[plan.planName] || { icon: Layers };
  const PlanIcon = meta.icon;

  const modules = Object.entries(plan.modules || {})
    .filter(([, value]) => value)
    .map(([key]) => ({ icon: Check, label: MODULE_LABELS[key] || key }));

  const limits = [
    plan.limits?.teamMembers != null && {
      icon: Users,
      label: `${formatLimit(plan.limits.teamMembers)} team members`,
    },
    plan.limits?.aiCreditsMonthly != null && {
      icon: Sparkles,
      label: `${formatLimit(plan.limits.aiCreditsMonthly)} AI credits / mo`,
    },
    plan.limits?.maxLeadsPerMonth != null && {
      icon: Target,
      label: `${formatLimit(plan.limits.maxLeadsPerMonth)} leads / mo`,
    },
    plan.support &&
      plan.support !== "none" && {
        icon: Headphones,
        label: `${capitalize(plan.support)} support`,
      },
  ].filter(Boolean);

  return (
    <div
      role={canSelect ? "button" : undefined}
      tabIndex={canSelect ? 0 : undefined}
      aria-pressed={canSelect ? isSelected : undefined}
      onClick={canSelect ? onSelect : undefined}
      onKeyDown={(e) => {
        if (canSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative flex flex-col rounded-2xl border p-6 bg-app-surface-secondary transition-all duration-200 ${
        isSelected
          ? "border-ternary! ring-1 ring-ternary shadow-lg"
          : isPopular && !isPurchased
            ? "border-ternary/50!"
            : BORDER
      } ${canSelect ? "cursor-pointer hover:border-ternary/70! hover:-translate-y-0.5" : ""}`}
    >
      {(isPurchased || isPopular) && (
        <div
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-wide uppercase px-3 py-0.5 rounded-full text-white ${
            isPurchased ? "bg-green-600" : "bg-ternary"
          }`}
        >
          {isPurchased ? "Current plan" : "Most popular"}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-ternary/10 text-ternary flex items-center justify-center">
            <PlanIcon className="w-4.5 h-4.5" />
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-app-text/70">
            {plan.planName}
          </span>
        </div>
        {isSelected && (
          <CircleCheck className="w-5 h-5 text-ternary shrink-0" aria-hidden />
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-4">
        <span className="text-3xl font-bold tracking-tight text-app-text">
          {isEnterprise ? "Custom" : formatPrice(plan.price)}
        </span>
        {!isEnterprise && <span className={`text-xs ${MUTED}`}>/mo</span>}
      </div>
      <p className={`text-[12.5px] leading-relaxed mt-1.5 ${MUTED}`}>
        {meta.tagline}
      </p>

      <div className="mt-4">
        {isEnterprise ? (
          <a
            href={SALES_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[13px] font-semibold border border-ternary! text-ternary hover:bg-ternary hover:text-white transition-colors"
          >
            Contact sales <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : isPurchased ? (
          <div className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[13px] font-semibold bg-green-500/10 text-green-600">
            <CircleCheck className="w-3.5 h-3.5" /> Active plan
          </div>
        ) : (
          <div
            className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[13px] font-semibold border transition-colors ${
              isSelected
                ? "bg-ternary border-ternary! text-white"
                : `${BORDER} text-app-text`
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" /> Selected
              </>
            ) : (
              "Select plan"
            )}
          </div>
        )}
      </div>

      {(modules.length > 0 || limits.length > 0) && (
        <div className={`mt-4 pt-4 border-t ${BORDER}`}>
          <div className={`text-[10.5px] font-bold tracking-wider uppercase mb-2 ${FAINT}`}>
            Includes
          </div>
          <ul className="space-y-1.5 text-[13px] text-app-text/85">
            {[...modules, ...limits].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${Icon === Check ? "text-green-500" : "text-ternary"}`}
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// App Card Component
const AppCard = ({ app, isSelected, onToggle, locked, isPurchased }) => {
  const AppIcon = APP_ICONS[app.name] || Plug;
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 bg-app-surface-secondary transition-colors duration-200 ${
        locked
          ? `opacity-50 ${BORDER}`
          : isSelected && !isPurchased
            ? "border-ternary!"
            : `${BORDER} hover:border-app-text/25!`
      }`}
    >
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isPurchased
            ? "bg-green-500/10 text-green-600"
            : isSelected
              ? "bg-ternary/15 text-ternary"
              : "bg-app-text/5 text-app-text/70"
        }`}
      >
        <AppIcon className="w-4.5 h-4.5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-app-text truncate" title={app.name}>
          {app.name}
        </div>
        <div className={`text-xs mt-0.5 ${MUTED}`}>{formatPrice(app.price)}/month</div>
      </div>
      {isPurchased ? (
        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-500/10 text-green-600">
          <Check className="w-3 h-3" />
          Active
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onToggle(app)}
          disabled={locked}
          aria-pressed={isSelected}
          className={`shrink-0 inline-flex items-center justify-center gap-1 w-19 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:cursor-not-allowed ${
            isSelected
              ? "bg-ternary border-ternary! text-white hover:opacity-90"
              : `${BORDER} text-app-text hover:border-ternary! hover:text-ternary`
          }`}
        >
          {isSelected ? (
            <>
              <X className="w-3 h-3" /> Remove
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" /> Add
            </>
          )}
        </button>
      )}
    </div>
  );
};

const SummaryRow = ({ label, value, valueClass = "text-app-text", labelClass = "text-app-text/80" }) => (
  <div className="flex justify-between items-center gap-3 py-1 text-[13px]">
    <span className={`truncate ${labelClass}`}>{label}</span>
    <span className={`font-semibold shrink-0 ${valueClass}`}>{value}</span>
  </div>
);

const SummaryLabel = ({ children }) => (
  <div className={`text-[10.5px] font-bold tracking-wider uppercase mt-5 mb-1.5 ${FAINT}`}>
    {children}
  </div>
);

const TrustNote = () => (
  <div className={`flex items-center justify-center gap-1.5 text-[11.5px] mt-3 ${FAINT}`}>
    <ShieldCheck className="w-3.5 h-3.5" />
    Secure payment via Razorpay · No contracts
  </div>
);

// Summary component
const BillingSummary = ({
  selectedPlan,
  selectedApps,
  teamCount,
  appInteracted,
  onRemoveApp,
  purchasedApps,
  activePlanId,
  daysLeft,
}) => {
  const monthLeft = Math.max(1, Math.floor(daysLeft / 30));

  const [validFor, setValidFor] = useState(
    monthLeft === 1 ? "month" : monthLeft === 3 ? "quarter" : "6month",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCurrentApps, setShowCurrentApps] = useState(false);
  const dispatch = useDispatch();

  const cycle = CYCLES.find((c) => c.key === validFor) || CYCLES[CYCLES.length - 1];
  const teamCost = teamCount * TEAM_SEAT_PRICE;
  const multiplyBy = cycle.months;
  const discount = cycle.discount;
  const gst = GST_PERCENT;

  const newApps = selectedApps?.filter(
    (app) =>
      !purchasedApps?.some((purchased) => purchased.appId?._id === app._id),
  );

  const handleUpgrade = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      setIsProcessing(false);
      alert("Could not load the payment gateway. Please check your connection and try again.");
      return;
    }

    const payload = {
      planId: selectedPlan?._id,
      appIds: newApps?.map((app) => app._id),
      validFor: multiplyBy,
      discount: discount,
      teamCount: teamCount,
      teamCost: teamCost,
      gst: gst,
    };

    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/subscription/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const order = await response.json().catch(() => null);
      if (!response.ok || order?.success === false || !order?.result?.doc?.orderId) {
        setIsProcessing(false);
        alert(
          order?.message || order?.error || "Could not create the order. Please try again.",
        );
        return;
      }

      // open razorpay checkout with order details
      const options = {
        key: RAZORPAY_BILLING_KEY_ID,
        amount: order.result.doc.amount, // Amount in paise
        currency: "INR",
        name: "Eazotel Technologies Pvt Ltd",
        description: `${selectedPlan.planName} plan`,
        order_id: order.result.doc.orderId,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${NEW_BASE_URL}/api/v1/subscription/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  ...response,
                  validFor: multiplyBy,
                  planId: selectedPlan?._id,
                  appIds: newApps?.map((app) => app._id),
                }),
              },
            );
            if (!verifyRes.ok) throw new Error(`Verify failed: ${verifyRes.status}`);

            alert("Payment successful");
            dispatch(refreshSubscription());
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert(
              `Your payment went through but we could not confirm it yet. Please contact support with payment ID ${response?.razorpay_payment_id || ""}.`,
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        theme: {
          color: "#152547",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", () => setIsProcessing(false));
      rzp1.open();
    } catch (error) {
      console.error("Error creating order:", error);
      setIsProcessing(false);
      alert("Something went wrong while starting the payment. Please try again.");
    }
  };

  const appsTotal = newApps?.reduce((sum, p) => sum + p.price, 0) || 0;
  const isCurrentPlan = selectedPlan && selectedPlan._id === activePlanId?._id;

  const subtotal = selectedPlan
    ? ((isCurrentPlan ? 0 : selectedPlan.price) + appsTotal + teamCost) *
      multiplyBy
    : 0;

  const discountAmount = (subtotal * discount) / 100;
  const amountAfterDiscount = subtotal - discountAmount;
  const gstAmount = (amountAfterDiscount * gst) / 100;
  const total = amountAfterDiscount + gstAmount;

  const prorateVisible = appInteracted && newApps?.length > 0;
  const canPay = newApps?.length > 0 && !isProcessing;

  const card = `bg-app-surface-secondary border ${BORDER} rounded-2xl p-6 lg:sticky lg:top-6`;
  const header = (
    <div className={`flex items-center gap-2 pb-4 border-b ${BORDER}`}>
      <Receipt className="w-4 h-4 text-ternary" />
      <span className="text-[15px] font-bold text-app-text">Billing summary</span>
    </div>
  );

  if (!selectedPlan) {
    return (
      <div className={card}>
        {header}
        <div className="text-center py-8">
          <Receipt className={`w-8 h-8 mx-auto mb-2 ${FAINT}`} />
          <div className={`text-[13px] leading-relaxed ${MUTED}`}>
            Select a plan to see
            <br />
            your billing summary
          </div>
        </div>
        <button
          disabled
          className={`w-full py-3 rounded-lg bg-app-text/10 font-semibold text-sm cursor-not-allowed ${FAINT}`}
        >
          Continue to payment
        </button>
        <TrustNote />
      </div>
    );
  }

  return (
    <div className={card}>
      {header}

      {/* Billing cycle */}
      <SummaryLabel>Billing cycle</SummaryLabel>
      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-app-text/5">
        {CYCLES.map((c) => {
          const active = c.key === validFor;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setValidFor(c.key)}
              aria-pressed={active}
              className={`rounded-lg py-2 text-center transition-colors ${
                active ? "bg-ternary text-white shadow-sm" : "text-app-text/70 hover:text-app-text"
              }`}
            >
              <div className="text-[11.5px] font-semibold leading-tight">{c.label}</div>
              <div
                className={`text-[10px] font-semibold leading-tight ${active ? "text-white/85" : "text-green-500"}`}
              >
                −{c.discount}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Plan */}
      <SummaryLabel>Plan</SummaryLabel>
      <SummaryRow
        label={`${selectedPlan.planName} plan`}
        value={isCurrentPlan ? "Active" : `${formatPrice(selectedPlan.price)}/mo`}
        valueClass={isCurrentPlan ? "text-green-600" : "text-app-text"}
      />

      {/* Current apps, collapsed by default */}
      {purchasedApps?.length > 0 && (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setShowCurrentApps((v) => !v)}
            aria-expanded={showCurrentApps}
            className="w-full flex justify-between items-center gap-3 py-1 text-[13px]"
          >
            <span className="text-app-text/80">
              Current apps ({purchasedApps.length})
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-green-600">
              Active
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showCurrentApps ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          {showCurrentApps && (
            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
              {purchasedApps.map((app) => (
                <span
                  key={app._id}
                  className={`text-[11px] px-2 py-0.5 rounded-md bg-app-text/5 ${MUTED}`}
                >
                  {app.appId?.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {newApps?.length > 0 && (
        <>
          <SummaryLabel>New add-on apps</SummaryLabel>
          {newApps.map((app) => (
            <div
              key={app._id}
              className="flex justify-between items-center gap-3 py-1 text-[13px]"
            >
              <span className="text-app-text/80 truncate">{app.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-app-text">
                  {formatPrice(app.price)}/mo
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveApp(app)}
                  aria-label={`Remove ${app.name}`}
                  className={`p-0.5 rounded hover:bg-ternary/10 hover:text-ternary transition-colors ${FAINT}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {teamCount > 0 && (
        <SummaryRow
          label={`Team seats (${teamCount} × ${formatPrice(TEAM_SEAT_PRICE)})`}
          value={`${formatPrice(teamCost)}/mo`}
        />
      )}

      {subtotal > 0 ? (
        <>
          <div className={`mt-4 pt-3 border-t border-dashed ${BORDER}`}>
            <SummaryRow
              label={`Subtotal · ${multiplyBy} ${multiplyBy === 1 ? "month" : "months"}`}
              value={formatPrice(subtotal)}
            />
            <SummaryRow
              label={`Discount (${discount}%)`}
              value={`− ${formatPrice(discountAmount)}`}
              valueClass="text-green-500"
            />
            <SummaryRow
              label={`GST (${gst}%)`}
              value={`+ ${formatPrice(gstAmount)}`}
              labelClass={MUTED}
              valueClass={MUTED}
            />
          </div>

          <div className={`mt-3 pt-3 border-t ${BORDER} flex justify-between items-end gap-3`}>
            <div>
              <div className="text-sm font-bold text-app-text">Total payable</div>
              <div className={`text-[11.5px] ${MUTED}`}>
                ≈ {formatPrice(total / multiplyBy)}/mo incl. GST
              </div>
            </div>
            <div className="text-2xl font-bold text-app-text tracking-tight">
              {formatPrice(total)}
            </div>
          </div>
        </>
      ) : (
        <div className={`mt-4 rounded-lg border border-dashed ${BORDER} p-3 text-center text-[12.5px] ${MUTED}`}>
          Everything you have is already active.
          <br />
          Add an app to see your total.
        </div>
      )}

      {prorateVisible && (
        <div className="mt-3 p-2.5 bg-ternary/10 border border-ternary/30! rounded-lg text-[11.5px] text-ternary leading-relaxed">
          Apps added mid-cycle are charged on a prorated basis.
        </div>
      )}

      <button
        type="button"
        disabled={!canPay}
        onClick={handleUpgrade}
        className="w-full mt-5 py-3 rounded-lg bg-ternary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            {canPay ? `Pay ${formatPrice(total)}` : "Continue to payment"}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      {!newApps?.length && (
        <p className={`text-[11.5px] text-center mt-2 ${FAINT}`}>
          Add at least one new app to continue.
        </p>
      )}
      <TrustNote />
    </div>
  );
};

const StatusChip = ({ subscription, remainingDays }) => {
  const planName = subscription?.planId?.planName;
  const endDate = new Date(subscription.endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const tone =
    remainingDays === 0
      ? { cls: "bg-red-500/10 border-red-500/30! text-red-500", Icon: TriangleAlert }
      : remainingDays <= 7
        ? { cls: "bg-amber-500/10 border-amber-500/30! text-amber-500", Icon: Clock }
        : { cls: "bg-green-500/10 border-green-500/25! text-green-500", Icon: CircleCheck };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] ${tone.cls}`}
    >
      <tone.Icon className="w-3.5 h-3.5 shrink-0" />
      {remainingDays === 0 ? (
        <span>
          Your <b className="font-semibold">{planName}</b> plan has expired — renew to continue
        </span>
      ) : (
        <span>
          <b className="font-semibold">{planName}</b> plan · {remainingDays}{" "}
          {remainingDays === 1 ? "day" : "days"} left · valid until {endDate}
        </span>
      )}
    </div>
  );
};

// Main App Component
const Billing = () => {
  const { subscription } = useSelector((state) => state?.subscription);
  const dispatch = useDispatch();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const [selectedApps, setselectedApps] = useState([]);
  const [teamCount, setTeamCount] = useState(0);
  const [appInteracted] = useState(false);
  const [plans, setPlans] = useState([]);
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handlePlanSelect = (plan) => {
    setselectedApps([]);
    setActivePlanId(null);
    setSelectedPlan(plan);
    dispatch(clearSubscriptionApps());
  };

  const handleToggleApp = (app) => {
    setselectedApps((prev) => {
      const alreadySelected = prev?.some((item) => item._id === app._id);

      if (alreadySelected) {
        return prev?.filter((item) => item?._id !== app?._id);
      }

      return [...prev, app];
    });
  };

  const handleTeamChange = (delta) => {
    setTeamCount((prev) => Math.max(0, prev + delta));
  };

  const isPlanSelected = (planId) => {
    if (selectedPlan && selectedPlan._id === planId) {
      return planId;
    }
    return false;
  };

  const isPurchasedApp = (appId) => {
    return subscription?.apps?.some((item) => item?.appId?._id === appId);
  };

  const isPurchasedPlan = (planId) => {
    return (
      subscription?.planId?._id === planId &&
      new Date(subscription?.endDate) > Date.now()
    );
  };

  const appsLocked = !selectedPlan;
  const remainingDays = daysLeft(subscription?.endDate);

  const fetchPlans = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/subscription/plans`,
      );
      const data = response.data;

      setPlans(data?.result?.data.plans || []);
      setApps(data?.result?.data.apps || []);
      setSelectedPlan(subscription?.planId);
      setActivePlanId(subscription?.planId);
      setselectedApps(() => subscription?.apps?.map((app) => app.appId) || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, []);

  const visiblePlans = plans?.filter((plan) => plan.price) || [];
  const planGridCols =
    visiblePlans.length >= 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className="bg-app-surface min-h-full">
      <div className="max-w-280 mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Navbar />

        {/* Header */}
        <header className="text-center mt-8 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-ternary/10 text-ternary text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full border border-ternary/30! mb-4">
            <Sparkles className="w-3 h-3" />
            Hotel Growth Platform
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-app-text tracking-tight leading-tight">
            Choose your plan &amp; customize your tools
          </h1>
          <p className={`text-[15px] max-w-md mx-auto leading-relaxed mt-2 ${MUTED}`}>
            Start with a base plan, then add only the tools you need.
            Transparent pricing, no surprises.
          </p>
          {subscription?.endDate && (
            <div className="mt-5">
              <StatusChip subscription={subscription} remainingDays={remainingDays} />
            </div>
          )}
        </header>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="space-y-12 min-w-0">
            {/* Plans Section */}
            <section>
              <SectionTitle icon={Layers} title="Base plan" hint="Required" />

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="h-80 rounded-2xl bg-app-text/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : loadError ? (
                <div className={`rounded-xl border border-dashed ${BORDER} p-6 text-center`}>
                  <div className="text-sm text-app-text mb-3">
                    We couldn't load the plans right now.
                  </div>
                  <button
                    type="button"
                    onClick={fetchPlans}
                    className="px-4 py-2 rounded-lg bg-ternary text-white text-sm font-semibold hover:opacity-90"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${planGridCols} gap-5 pt-2`}>
                  {visiblePlans.map((plan) => (
                    <PlanCard
                      key={plan._id}
                      plan={plan}
                      isSelected={Boolean(isPlanSelected(plan._id))}
                      onSelect={() => handlePlanSelect(plan)}
                      isPurchased={isPurchasedPlan(plan._id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Apps Section */}
            <section>
              <SectionTitle icon={Puzzle} title="Add apps to your plan" hint="Optional" />

              {appsLocked && !isLoading && (
                <div className={`flex items-center gap-2.5 bg-app-text/5 border border-dashed ${BORDER} rounded-xl px-3.5 py-3 mb-3 text-[13px] ${MUTED}`}>
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Select a base plan above to enable add-on apps</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {apps.map((app) => (
                  <AppCard
                    key={app._id}
                    app={app}
                    isSelected={selectedApps?.some(
                      (selectedApp) => selectedApp._id === app._id,
                    )}
                    isPurchased={isPurchasedApp(app._id)}
                    onToggle={() => handleToggleApp(app)}
                    locked={appsLocked}
                  />
                ))}
              </div>
            </section>

            {/* Team Section */}
            <section>
              <SectionTitle icon={Users} title="Team members" hint="Optional" />
              <div className={`bg-app-surface-secondary border ${BORDER} rounded-2xl px-5 py-4 flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-app-text/5 text-app-text/70 flex items-center justify-center shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-app-text">
                      Additional seats
                    </div>
                    <div className={`text-xs mt-0.5 ${MUTED}`}>
                      {formatPrice(TEAM_SEAT_PRICE)} per member / month
                    </div>
                  </div>
                </div>
                <div className={`flex items-center rounded-lg border ${BORDER} overflow-hidden`}>
                  <button
                    type="button"
                    onClick={() => handleTeamChange(-1)}
                    disabled={teamCount === 0}
                    aria-label="Remove a seat"
                    className="w-8 h-8 flex items-center justify-center text-app-text hover:bg-app-text/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className={`w-10 text-center text-sm font-semibold text-app-text border-x ${BORDER} leading-8`}>
                    {teamCount}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTeamChange(1)}
                    aria-label="Add a seat"
                    className="w-8 h-8 flex items-center justify-center text-app-text hover:bg-app-text/5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Billing Summary */}
          <BillingSummary
            selectedPlan={selectedPlan}
            selectedApps={selectedApps}
            teamCount={teamCount}
            appInteracted={appInteracted}
            onRemoveApp={handleToggleApp}
            purchasedApps={subscription?.apps || []}
            activePlanId={activePlanId}
            daysLeft={remainingDays}
          />
        </div>
      </div>
    </div>
  );
};

export default Billing;

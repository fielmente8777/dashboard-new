import { CalendarDays, Crown, Download, Headphones, Home, Lock, Package, RefreshCw, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Dialog from "../../components/ui/Dialog";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/ui/Icon";
import Switch from "../../components/ui/Switch";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { billingError, downloadInvoice, fromPaise, useGetBillingAccountQuery, useSetAutoRenewMutation } from "../../redux/api/billingApi";
import { plansPath } from "../../routes/paths";
import { formatDateTime } from "../../utils/formateDate";
import { appIcon, cycleWords, day, limitText, PHASE_LABELS, PHASE_TONES, SUPPORT_LABELS } from "../Billing/billingText";
import { usePlanCheckout } from "../Billing/usePlanCheckout";
import BillingDetailsCard from "./components/BillingDetailsCard";

const PAYMENT_TONE = { SUCCESS: "green", created: "amber", FAILED: "red" };
const PAYMENT_LABEL = { SUCCESS: "Paid", created: "Not completed", FAILED: "Failed" };
const KIND_LABEL = { new: "New plan", renew: "Renewal", change: "Plan change", auto_renew: "Auto-renewal" };
const DAY_MS = 86_400_000;

export const SubscriptionSkeleton = () => (
  <div className="space-y-4 p-1">
    <Skeleton className="h-44 rounded-2xl" />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
    <Skeleton className="h-48" />
  </div>
);

const Fact = ({ icon, label, value }) => (
  <div className="rounded-xl border border-app-border! bg-app-surface p-4">
    <p className="flex items-center gap-1.5 text-xs text-app-text-muted">
      <Icon icon={icon} size="sm" /> {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-app-text">{value || "—"}</p>
  </div>
);

// Settings > Subscription: the plan, auto-renew, which apps are on, the limits and every payment.
// Data from gian-new (/api/v1/billing/account); paying happens on /plans.
const Subscription = () => {
  const account = useGetBillingAccountQuery();
  const [setAutoRenew, autoRenewState] = useSetAutoRenewMutation();
  const checkout = usePlanCheckout({});
  const { showToast } = useToast();
  const [confirmingAutoRenew, setConfirmingAutoRenew] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const onDownload = async (invoice) => {
    setDownloading(invoice.id);
    try {
      await downloadInvoice(invoice.id);
    } catch (error) {
      showToast({ message: error.message, type: "error" });
    } finally {
      setDownloading(null);
    }
  };

  if (account.isLoading) return <SubscriptionSkeleton />;
  if (account.isError || !account.data) {
    return (
      <div className="p-1">
        <ErrorState message={billingError(account.error, "Could not load your subscription.")} onRetry={account.refetch} />
      </div>
    );
  }

  const data = account.data;
  const sub = data.subscription;
  if (!sub) {
    return (
      <Card title="No plan yet">
        <p className="text-sm text-app-text-muted">Choose a plan to unlock WhatsApp, Eazbot, the booking engine and more.</p>
        <Link to={plansPath()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600">
          <Crown className="size-4" /> See plans
        </Link>
      </Card>
    );
  }

  const plans = data.catalogue.plans;
  const plan = plans.find((p) => p.id === sub.planId);
  const start = new Date(sub.startDate).getTime();
  const end = new Date(sub.endDate).getTime();
  const usedPct = Math.min(100, Math.max(0, ((Date.now() - start) / Math.max(1, end - start)) * 100));
  const running = data.phase === "active" || data.phase === "ending" || data.phase === "trial";
  const paid = data.phase === "active" || data.phase === "ending";
  const onApps = new Set(data.entitlements.apps);
  const included = new Set(plan?.includedApps ?? []);
  const addons = new Set(data.current?.addonCodes ?? []);
  const renewal = sub.autoRenewal;

  const toggleAutoRenew = async (next) => {
    // turning it on opens a Razorpay window: explain it first
    if (next && !confirmingAutoRenew) {
      setConfirmingAutoRenew(true);
      return;
    }
    setConfirmingAutoRenew(false);
    try {
      if (next) {
        await checkout.authorizeAutoRenew();
        showToast({ message: "Auto-renew is on. We'll renew your plan before it ends.", type: "success" });
      } else {
        await setAutoRenew(false).unwrap();
        showToast({ message: "Auto-renew is off. Your plan stays active until its end date.", type: "info" });
      }
    } catch (error) {
      if (error?.name === "CheckoutClosedError") return;
      showToast({ message: billingError(error, error?.message), type: "error" });
    }
  };

  const paymentColumns = [
    { key: "createdAt", header: "Date", render: (p) => formatDateTime(p.paidAt || p.createdAt) },
    { key: "kind", header: "What", render: (p) => (p.kind ? KIND_LABEL[p.kind] : "Plan payment") + (p.offerCode ? ` · ${p.offerCode}` : "") },
    { key: "amount", header: "Amount", render: (p) => <span className="font-medium">{fromPaise(p.amount)}</span> },
    { key: "status", header: "Status", render: (p) => <Badge tone={PAYMENT_TONE[p.status] || "gray"}>{PAYMENT_LABEL[p.status] || p.status}</Badge> },
    { key: "period", header: "Covers", render: (p) => (p.periodEnd ? `until ${day(p.periodEnd)}` : "—") },
    {
      key: "invoice",
      header: "Invoice",
      render: (p) =>
        p.zohoInvoice ? (
          p.zohoInvoice.url ? (
            <a href={p.zohoInvoice.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline">
              <Download className="size-3.5" aria-hidden /> {p.zohoInvoice.number}
            </a>
          ) : (
            <span className="text-xs">{p.zohoInvoice.number}</span>
          )
        ) : p.invoice ? (
          <button
            type="button"
            onClick={() => onDownload(p.invoice)}
            disabled={downloading === p.invoice.id}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline disabled:opacity-60 dark:text-blue-400"
          >
            <Download className="size-3.5" aria-hidden /> {p.invoice.number}
          </button>
        ) : (
          <span className="text-xs text-app-text-muted">—</span>
        ),
    },
    { key: "paymentId", header: "Payment ID", render: (p) => <span className="font-mono text-xs">{p.paymentId || "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-white sm:p-6 dark:bg-blue-950">
        <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/70 uppercase">
              <Sparkles className="size-3.5" /> Your plan
            </p>
            <h2 className="mt-1 text-3xl font-bold">{sub.planName || "Plan"}</h2>
            {data.current && (
              <p className="mt-1 text-white/80">
                Billed every {cycleWords(data.current.cycleMonths)}
                {data.current.addonCodes.length ? ` · ${data.current.addonCodes.length} add-on apps` : ""}
                {data.current.seats ? ` · ${data.current.seats} extra seats` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{PHASE_LABELS[data.phase]}</span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${data.phase === "ending" || data.phase === "trial" ? "bg-orange-500" : "bg-white/15"}`}>
              <Crown className="size-3.5" />
              {running ? `${sub.daysLeft} ${sub.daysLeft === 1 ? "day" : "days"} left` : `Ended ${day(sub.endDate)}`}
            </span>
          </div>
        </div>
        <div className="relative mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${usedPct}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-white/70">
            <span>{day(sub.startDate)}</span>
            <span>{Math.round((end - start) / DAY_MS)}-day period</span>
            <span>{day(sub.endDate)}</span>
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link to={plansPath()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600">
            <Crown className="size-4" />
            {paid ? "Renew or upgrade" : "Choose a plan"}
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact icon={CalendarDays} label="Valid until" value={day(sub.endDate)} />
        <Fact icon={Users} label="Team members" value={limitText(data.entitlements.teamMembers, "")} />
        <Fact icon={Home} label="Properties" value={limitText(data.entitlements.properties, "")} />
        <Fact icon={Headphones} label="Support" value={SUPPORT_LABELS[plan?.support] || "—"} />
      </div>

      <Card
        title="Auto-renew"
        description={
          renewal?.status === "active"
            ? `Renews by itself on ${day(renewal.startAt)} for ${fromPaise(renewal.amountPaise)} every ${cycleWords(renewal.cycleMonths)}.`
            : renewal?.status === "halted"
              ? "The last automatic payment failed. Renew manually or turn auto-renew on again with another card or UPI."
              : paid
                ? "Off. Turn it on and we'll renew your plan at the end of each period with UPI AutoPay or your card."
                : "Available once you're on a paid plan."
        }
        actions={
          <Switch
            checked={Boolean(sub.autoRenew)}
            onChange={toggleAutoRenew}
            disabled={!paid || !data.canPay || !data.autoRenewReady || checkout.busy || autoRenewState.isLoading}
            label="Auto-renew"
          />
        }
      >
        <p className="flex items-center gap-1.5 text-xs text-app-text-muted">
          <RefreshCw className="size-3.5" aria-hidden />
          {data.canPay ? "You can turn it off any time; your plan stays active until its end date." : "Only the account owner can change this."}
        </p>
      </Card>

      <Card title="Apps" description={`${onApps.size} of ${data.catalogue.apps.length} apps are on for your hotel.`}>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.catalogue.apps.map((app) => {
            const on = onApps.has(app.code);
            const AppIcon = appIcon(app.code);
            const how = data.phase === "trial" ? "Free trial" : included.has(app.code) ? "In your plan" : addons.has(app.code) ? "Add-on" : null;
            return (
              <li key={app.code} className={`flex items-center gap-3 rounded-lg border border-app-border! px-3 py-2.5 ${on ? "" : "opacity-70"}`}>
                <span className={`grid size-8 place-content-center rounded-lg ${on ? "bg-emerald-500/10 text-emerald-600" : "bg-app-surface-secondary text-app-text-muted"}`}>
                  <AppIcon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-app-text">{app.name}</span>
                  <span className="block text-xs text-app-text-muted">{on ? how || "On" : "Not in your plan"}</span>
                </span>
                {on ? (
                  <Badge tone="green">On</Badge>
                ) : (
                  <Link to={plansPath()} className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline">
                    <Lock className="size-3" /> Add
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <BillingDetailsCard canEdit={data.canPay} />

      <Dialog
        open={confirmingAutoRenew}
        onClose={() => setConfirmingAutoRenew(false)}
        title="Turn on auto-renew"
        description="Your plan renews by itself, so the dashboard never locks."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmingAutoRenew(false)}>
              Cancel
            </Button>
            <Button onClick={() => toggleAutoRenew(true)}>Continue to Razorpay</Button>
          </>
        }
      >
        <ul className="space-y-2 text-sm text-app-text">
          <li>• Razorpay asks you to authorise UPI AutoPay or your card once.</li>
          <li>• To check it works, it may take a small amount (such as ₹5) and refund it. This is not a payment for your plan.</li>
          <li>• Your plan renews on {day(sub.endDate)}, and every {cycleWords(data.current?.cycleMonths ?? 1)} after that. You get an invoice each time.</li>
          <li>• Turn it off here any time; your plan stays active until its end date.</li>
        </ul>
      </Dialog>

      <Card title="Payments" description="Every payment for your plan, with its GST invoice.">
        {data.payments.length ? (
          <DataTable columns={paymentColumns} rows={data.payments} rowKey={(p) => p.id} />
        ) : (
          <p className="flex items-center justify-center gap-2 py-6 text-sm text-app-text-muted">
            <Package className="size-4" /> No payments yet{data.phase === "trial" ? ". You're on the free trial." : "."}
          </p>
        )}
      </Card>
    </div>
  );
};

export default Subscription;

import {
  CalendarDays,
  Crown,
  ExternalLink,
  Headphones,
  Package,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/ui/Icon";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { BILLING_PORTAL_URL } from "../../config/env";
import { NEW_BASE_URL } from "../../data/constant";
import { ROUTES } from "../../routes/paths";
import { formatDateTime } from "../../utils/formateDate";

const DAY = 1000 * 60 * 60 * 24;

const PAYMENT_TONE = { SUCCESS: "green", PAID: "green", CREATED: "amber", PENDING: "amber", FAILED: "red" };

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const formatPrice = (value) =>
  typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : null;

const humanize = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

// Placeholder in the shape of the page while it loads.
export const SubscriptionSkeleton = () => (
  <div className="space-y-4 p-1">
    <Skeleton className="h-44 rounded-2xl" />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
    <Skeleton className="h-48" />
    <Skeleton className="h-40" />
  </div>
);

const Fact = ({ icon, label, value }) => (
  <div className="rounded-xl border border-app-border! bg-app-surface p-4">
    <p className="flex items-center gap-1.5 text-xs text-app-text-muted">
      <Icon icon={icon} size="sm" /> {label}
    </p>
    <p className="mt-1 text-sm font-semibold capitalize text-app-text">{value || "—"}</p>
  </div>
);

// The account's plan, its apps and its payments.
const Subscription = () => {
  const [state, setState] = useState({ loading: true, failed: false, subscription: null, payments: [] });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, failed: false }));
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/subscription/my`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error();
      setState({
        loading: false,
        failed: false,
        subscription: result?.result?.docs || null,
        payments: result?.result?.payments || [],
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false, failed: true }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { loading, failed, subscription, payments } = state;

  if (loading && !subscription) return <SubscriptionSkeleton />;
  if (failed) {
    return (
      <div className="p-1">
        <ErrorState message="Could not load your subscription." onRetry={load} />
      </div>
    );
  }
  if (!subscription) {
    return (
      <div className="p-1">
        <EmptyState
          icon={Package}
          title="No active plan"
          description="Choose a plan to unlock WhatsApp, Eazbot, the booking engine and more."
          action={
            <Link to={ROUTES.PLANS}>
              <Button size="sm" icon={Crown}>
                See plans
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const plan = subscription.planId || {};
  const status = String(subscription.status || "").toUpperCase();
  const start = new Date(subscription.startDate).getTime();
  const end = new Date(subscription.endDate).getTime();
  const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / DAY));
  const totalDays = Math.max(1, Math.round((end - start) / DAY));
  const usedPct = Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
  const endingSoon = daysLeft <= 7;
  const limits = Object.entries(plan.features?.limits || plan.limits || {});
  const apps = subscription.apps || [];
  const price = formatPrice(plan.price);

  const paymentColumns = [
    { key: "createdAt", header: "Date", render: (p) => formatDateTime(p.createdAt) },
    {
      key: "amount",
      header: "Amount",
      render: (p) => (
        <span className="font-medium">
          {p.currency?.toUpperCase() === "INR" || !p.currency ? "₹" : `${p.currency} `}
          {(Number(p.amount) / 100).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge tone={PAYMENT_TONE[String(p.status).toUpperCase()] || "gray"}>
          {String(p.status).toLowerCase()}
        </Badge>
      ),
    },
    { key: "paymentId", header: "Payment ID", render: (p) => <span className="font-mono text-xs">{p.paymentId || "—"}</span> },
    { key: "orderId", header: "Order ID", render: (p) => <span className="font-mono text-xs">{p.orderId}</span> },
  ];

  return (
    <div className="space-y-4">
      {/* plan */}
      <section className="relative overflow-hidden rounded-2xl bg-primary p-5 text-white sm:p-6 dark:bg-blue-950">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-ternary/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
              <Sparkles className="size-3.5" /> Your plan
            </p>
            <h2 className="mt-1 text-3xl font-bold">{plan.planName || "Plan"}</h2>
            {price && (
              <p className="mt-1 text-white/80">
                <span className="text-xl font-semibold text-white">{price}</span> / month
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {status && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {status === "TRIAL" ? "Free trial" : status.toLowerCase()}
              </span>
            )}
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${endingSoon ? "bg-ternary" : "bg-white/15"}`}
            >
              <Crown className="size-3.5" />
              {daysLeft === 0 ? "Ends today" : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
            </span>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className={`h-full rounded-full ${endingSoon ? "bg-ternary" : "bg-white"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-white/70">
            <span>{formatDate(subscription.startDate)}</span>
            <span>{totalDays}-day period</span>
            <span>{formatDate(subscription.endDate)}</span>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link to={ROUTES.PLANS}>
            <Button className="bg-ternary! hover:bg-ternary/90!" icon={Crown}>
              {status === "TRIAL" ? "Choose a plan" : "Upgrade plan"}
            </Button>
          </Link>
          <a href={BILLING_PORTAL_URL} target="_blank" rel="noreferrer">
            <Button className="bg-white/15! hover:bg-white/25!" icon={ExternalLink}>
              Manage billing
            </Button>
          </a>
        </div>
      </section>

      {endingSoon && (
        <div className="rounded-lg border border-amber-500/30! bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          Your {status === "TRIAL" ? "trial" : "plan"} ends on {formatDate(subscription.endDate)}.
          Choose a plan before then to keep using the dashboard without interruption.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact icon={CalendarDays} label="Started" value={formatDate(subscription.startDate)} />
        <Fact icon={CalendarDays} label="Renews / ends" value={formatDate(subscription.endDate)} />
        <Fact icon={RefreshCw} label="Auto renew" value={subscription.autoRenew ? "On" : "Off"} />
        <Fact icon={Headphones} label="Support" value={plan.support || plan.features?.support} />
      </div>

      {limits.length > 0 && (
        <Card title="Plan limits">
          <dl className="grid gap-4 sm:grid-cols-3">
            {limits.map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs text-app-text-muted">{humanize(key)}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-app-text">
                  {typeof value === "number" ? value.toLocaleString("en-IN") : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {apps.length > 0 && (
        <Card
          title="Apps in your plan"
          description={`${apps.filter((a) => new Date(a.endDate) >= new Date()).length} of ${apps.length} active`}
        >
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => {
              const expired = new Date(app.endDate) < new Date();
              return (
                <li
                  key={app._id}
                  className={`flex items-center justify-between gap-3 rounded-lg border border-app-border! px-3 py-2.5 ${expired ? "opacity-60" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize text-app-text">
                      {app.appId?.name || "App"}
                    </p>
                    <p className="text-xs text-app-text-muted">
                      {app.isTrial ? "Trial · " : ""}until {formatDate(app.endDate)}
                    </p>
                  </div>
                  <Badge tone={expired ? "gray" : "green"}>{expired ? "Expired" : "Active"}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card title="Payments" description="Every payment for your plan.">
        {payments.length ? (
          <DataTable columns={paymentColumns} rows={payments} rowKey={(p) => p._id} />
        ) : (
          <p className="py-6 text-center text-sm text-app-text-muted">
            No payments yet{status === "TRIAL" ? ". You're on the free trial." : "."}
          </p>
        )}
      </Card>
    </div>
  );
};

export default Subscription;

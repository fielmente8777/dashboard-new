import React, { useEffect, useState } from "react";
import { NEW_BASE_URL } from "../../data/constant";
import {
  Badge,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Headphones,
  Receipt,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import { APPS } from "../../data/enum";
import { formatDateTime } from "../../utils/formateDate";

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const fetchMySubscription = async () => {
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/subscription/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      setSubscription(result?.result?.docs);
      setPayments(result?.result?.payments);
      console.log("My subscription:", result?.result?.docs);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(subscription?.endDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  useEffect(() => {
    fetchMySubscription();
  }, []);

  if (!subscription) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background ">
      <header
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative max-w-6xl text-white! mx-auto py-14 md:py-20">
          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            Your subscription
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight">
                {subscription?.planId?.planName}
              </h1>
              <p className="mt-3 text-primary-foreground/80 text-lg">
                <span className="text-3xl font-semibold text-primary-foreground">
                  ₹{subscription?.planId?.price.toLocaleString("en-IN")}
                </span>{" "}
                / month
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/15 text-green-500 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {subscription?.status.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-ternary text-accent-foreground px-4 py-1.5 text-sm font-semibold ">
                <Crown className="h-4 w-4" />
                {daysLeft} days left
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-10 space-y-8">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            icon={<Calendar className="h-5 w-5" />}
            label="Start date"
            value={new Date(subscription?.startDate).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              },
            )}
          />
          <InfoCard
            icon={<Calendar className="h-5 w-5" />}
            label="End date"
            value={new Date(subscription?.endDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
          <InfoCard
            icon={<RefreshCw className="h-5 w-5" />}
            label="Auto renew"
            value={subscription?.autoRenew ? "Enabled" : "Disabled"}
            highlight={subscription?.autoRenew}
          />
          <InfoCard
            icon={<Headphones className="h-5 w-5" />}
            label="Support"
            value={subscription?.planId?.support}
            capitalize
          />
        </section>

        {/* Features */}
        {/* <div className="rounded-md">
                    <h3 className="text-lg font-semibold mb-4">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid sm:grid-cols-2 gap-2">
                            {Object.entries(subscription?.planId?.features || {}).map(([k, v]) => (
                                <ToggleRow key={k} label={k} enabled={v} />
                            ))}
                        </div>
                    </div>
                </div> */}

        {/* Modules */}
        <div className="rounded-md">
          <div className="">
            <h3 className="text-lg font-semibold mb-4">Apps</h3>
            <div className="grid grid-cols-2 gap-2">
              {subscription?.apps?.map((app, index) => {
                const isExpired = new Date(app.endDate) < new Date();

                return (
                  <div
                    key={app._id}
                    className="flex gap-1 items-center justify-between text-sm bg-gray-100 rounded-lg p-3 px-4 border border-gray-200"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="capitalize font-medium">
                        {/* {APPS[app.appId]} */}
                        {app?.appId?.name}
                      </span>

                      <div className="text-xs text-gray-500">
                        <p>
                          Start Date:{" "}
                          {new Date(app.startDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          End Date:{" "}
                          {new Date(app.endDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-md ${
                        isExpired
                          ? "bg-gray-200 text-gray-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Limits */}
        {/* <div className="rounded-md">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Limits</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(subscription?.planId?.limits || {}).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-gray-500 capitalize">{key}</p>
                                    <p className="font-medium">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div> */}

        <section className="">
          {/* <div className="flex items-start gap-3 mb-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ternary/10 text-ternary/80">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Payment information
              </h2>
              <p className="text-sm text-muted-foreground">
                Latest billing references
              </p>
            </div>
          </div> */}
          {/* <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ternary/10 text-ternary/80">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Order ID
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {subscription?.currentOrderId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ternary/10 text-ternary/80">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Payment ID
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {subscription?.lastPaymentId}
                </p>
              </div>
            </div>
          </div> */}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/plans"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold bg-ternary text-white hover:scale-[1.02]"
            >
              <Crown className="h-4 w-4" />
              Upgrade plan
            </Link>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-secondary hover:text-white">
              Manage billing
            </button>
          </div>
        </section>
      </div>

      <div className="max-w-6xl mx-auto py-10 space-y-4">
        <div className="flex items-start gap-3 mb-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ternary/10 text-ternary/80">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Payment information
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest billing references
            </p>
          </div>
        </div>
        <PaymentTable payments={payments} />
      </div>
    </div>
  );
};

export default Subscription;

function InfoCard({ icon, label, value, highlight, capitalize }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5  hover:-translate-y-0.5 ">
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
          highlight
            ? "bg-ternary/15 text-ternary"
            : "bg-ternary/10 text-ternary/80"
        }`}
      >
        {icon}
      </div>
      <p className="mt-3 text-sm font-medium tracking-wider text-gray-600">
        {label}
      </p>
      <p
        className={`mt-1 text-md font-medium text-gray-900 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ToggleRow({ label, enabled }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/5 px-4 py-3 ">
      <span className="text-sm text-gray-800 capitalize">
        {label.replace(/([A-Z])/g, " $1")}
      </span>
      {enabled ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-green-500">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}

const PaymentTable = ({ payments }) => {
  return (
    <div className="overflow-x-auto border-gray-200">
      {payments && payments.length > 0 ? (
        <table className="w-full border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold">
                Order Id
              </th>
              {/* <th className="px-5 py-3 text-left text-sm font-semibold">
                Plan Id
              </th> */}
              <th className="px-5 py-3 text-left text-sm font-semibold">
                Payment Id
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold">
                Currency
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold">
                Status
              </th>
              {/* <th className="px-5 py-3 text-left text-sm font-semibold">
                Paid At
              </th> */}
              <th className="px-5 py-3 text-left text-sm font-semibold">
                Created At
              </th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment, index) => (
              <tr
                key={payment._id}
                className={`transition-all duration-200 hover:bg-primary/5
                  ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-5 py-3 text-sm text-gray-700">
                  {payment.orderId}
                </td>

                {/* <td className="px-5 py-3 text-sm text-gray-700">
                  {payment.planId}
                </td> */}

                <td className="px-5 py-3 text-sm text-gray-700">
                  {payment.paymentId}
                </td>

                <td className="px-5 py-3 font-semibold text-primary">
                  ₹{payment.amount / 100}
                </td>

                <td className="px-5 py-3 text-sm text-gray-700 uppercase text-center">
                  {payment.currency}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase
                      ${
                        payment.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "created"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                  >
                    {payment.status}
                  </span>
                </td>

                {/* <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDateTime(payment.paidAt)}
                </td> */}

                <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDateTime(payment.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center text-gray-500">No payments found</div>
      )}
    </div>
  );
};

import React from "react";
import { formatCount, formatMoney } from "./utils";

const CATEGORIES = [
  {
    key: "marketing",
    label: "Marketing",
    hint: "Promotional templates",
    dot: "bg-purple-500",
  },
  {
    key: "utility",
    label: "Utility",
    hint: "Incl. inside 24-hr window",
    dot: "bg-blue-500",
  },
  // { key: "authentication", label: "Authentication", hint: "OTP templates", dot: "bg-amber-500" },
  {
    key: "service",
    label: "Service",
    hint: "Replies to customers",
    dot: "bg-green-500",
  },
];

const UsageBreakdown = ({
  usage = {},
  rates = {},
  currency = "INR",
  cycleLabel,
}) => {
  const totals = CATEGORIES.reduce(
    (acc, c) => ({
      count: acc.count + (usage[c.key]?.count || 0),
      cost: acc.cost + (usage[c.key]?.cost || 0),
    }),
    { count: 0, cost: 0 },
  );

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-600 dark:text-app-text-muted">
          Usage this month
        </p>
        {cycleLabel && (
          <span className="text-xs text-gray-500 dark:text-app-text-faint">
            {cycleLabel}
          </span>
        )}
      </div>

      {/* Column headings */}
      <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_90px_90px_100px] gap-3 px-4 py-2 text-xs uppercase tracking-wide text-gray-400 dark:text-app-text-faint">
        <span>Type</span>
        <span className="text-right">Messages</span>
        <span className="hidden sm:block text-right">Rate</span>
        <span className="text-right">Cost</span>
      </div>

      {CATEGORIES.map((c) => {
        const row = usage[c.key] || {};
        return (
          <div
            key={c.key}
            className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_90px_90px_100px] gap-3 items-center px-4 py-2.5 text-sm border-t border-gray-50 dark:border-gray-800/60"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${c.dot}`} />
                <span className="font-medium text-gray-700 dark:text-app-text-muted">
                  {c.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-app-text-faint ml-4 truncate">
                {c.key === "service" && row.billableCount !== undefined
                  ? `${formatCount(row.billableCount)} billable`
                  : c.hint}
              </p>
            </div>
            <span className="text-right text-gray-700 dark:text-app-text">
              {formatCount(row.count)}
            </span>
            <span className="hidden sm:block text-right text-gray-500 dark:text-app-text-faint">
              {formatMoney(rates[c.key], currency, 4)}
            </span>
            <span className="text-right font-medium text-gray-700 dark:text-app-text">
              {formatMoney(row.cost, currency)}
            </span>
          </div>
        );
      })}

      {/* Totals */}
      <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_90px_90px_100px] gap-3 px-4 py-3 text-sm font-medium border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 rounded-b-lg">
        <span className="text-gray-700 dark:text-app-text-muted">Total</span>
        <span className="text-right text-gray-800 dark:text-app-text">
          {formatCount(totals.count)}
        </span>
        <span className="hidden sm:block" />
        <span className="text-right text-gray-800 dark:text-app-text">
          {formatMoney(totals.cost, currency)}
        </span>
      </div>
    </div>
  );
};

export default UsageBreakdown;

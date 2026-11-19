import { ArrowDownLeft, ArrowUpRight, Coins, Globe, Grid3x3, History, MapPin } from "lucide-react";
import { useState } from "react";
import { useGetSeoTokensQuery } from "../../redux/api/seoApi";
import {
  DEFAULT_SEO_PRICING,
  WEBSITE_PER_KW_IN,
  WEBSITE_PER_KW_INTL,
} from "../../utils/seoTokenPricing";
import Drawer from "../ui/Drawer";
import Icon from "../ui/Icon";
import { EmptyState, Skeleton } from "../ui/States";

const REASONS = {
  add_local_keywords: "Local SEO keywords added",
  refresh_local_keyword: "Local SEO keyword refreshed",
  add_website_keywords: "Website SEO keywords added",
  refresh_website_keyword: "Website SEO keyword refreshed",
  geo_grid_scan: "Map coverage scan",
  grid_scan_failed_refund: "Map scan refund",
  welcome_bonus: "Welcome credits",
};

const LOW_BALANCE = 10;

const formatWhen = (iso) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return `Today, ${time}`;
  return `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}, ${time}`;
};

const CreditsDrawer = ({ open, onClose, tokens, loading }) => {
  const balance = tokens?.balance ?? 0;
  const pricing = tokens?.pricing || DEFAULT_SEO_PRICING;
  const transactions = tokens?.transactions || [];
  const costs = [
    { icon: MapPin, label: "Local SEO keyword", hint: "Add or refresh one keyword", cost: pricing.localPerKeyword },
    { icon: Globe, label: "Website SEO keyword, India", hint: "Add or refresh one keyword", cost: WEBSITE_PER_KW_IN },
    { icon: Globe, label: "Website SEO keyword, other countries", hint: "Add or refresh one keyword", cost: WEBSITE_PER_KW_INTL },
    { icon: Grid3x3, label: "Map coverage scan", hint: "One full geo-grid scan", cost: pricing.geoGridScan },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="SEO credits" description="Balance, prices and recent usage">
      <div className="space-y-5">
        <div
          className={`rounded-xl border p-4 ${
            balance === 0
              ? "border-red-500/30! bg-red-500/5"
              : balance < LOW_BALANCE
                ? "border-amber-500/30! bg-amber-500/5"
                : "border-app-border! bg-app-surface"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
            Available credits
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-app-text">
            {loading ? "—" : balance.toLocaleString()}
          </p>
          {!loading && balance === 0 && (
            <p className="mt-2 text-xs text-red-500">No credits left. Contact support to recharge.</p>
          )}
          {!loading && balance > 0 && balance < LOW_BALANCE && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Running low.</p>
          )}
        </div>

        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            Credits per action
          </h3>
          <ul className="divide-y divide-app-border! overflow-hidden rounded-xl border border-app-border! bg-app-surface">
            {costs.map((item) => (
              <li key={item.label} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary text-app-text-muted">
                  <Icon icon={item.icon} size="sm" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-app-text">{item.label}</span>
                  <span className="block text-xs text-app-text-muted">{item.hint}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-app-text">
                  {item.cost}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-app-text-muted">
            Changing the map radius or keyword is free.
          </p>
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            <Icon icon={History} size="sm" /> Recent usage
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState title="No usage yet" description="Credits you spend on keywords and scans show up here." />
          ) : (
            <ul className="divide-y divide-app-border! overflow-hidden rounded-xl border border-app-border! bg-app-surface">
              {transactions.map((tx, i) => {
                const added = tx.type === "credit" || tx.type === "refund";
                return (
                  <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                        added ? "bg-emerald-500/10 text-emerald-500" : "bg-app-surface-secondary text-app-text-muted"
                      }`}
                    >
                      <Icon icon={added ? ArrowDownLeft : ArrowUpRight} size="sm" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-app-text">
                        {REASONS[tx.reason] || String(tx.reason || "").replace(/_/g, " ")}
                      </span>
                      <span className="block text-xs text-app-text-muted">{formatWhen(tx.createdAt)}</span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        added ? "text-emerald-600 dark:text-emerald-400" : "text-app-text"
                      }`}
                    >
                      {added ? "+" : "−"}
                      {tx.amount}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  );
};

// SEO credit balance for a page header; opens prices and usage history.
const CreditsButton = () => {
  const [open, setOpen] = useState(false);
  const { data: tokens, isLoading, refetch } = useGetSeoTokensQuery();
  const balance = tokens?.balance;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          refetch();
        }}
        title="SEO credits: prices and usage"
        className={`flex h-9 items-center gap-1.5 rounded-lg border bg-app-surface px-3 text-sm text-app-text-muted transition hover:bg-app-surface-secondary ${
          balance === 0 ? "border-red-500/40!" : "border-app-border!"
        }`}
      >
        <Icon icon={Coins} tone={balance === 0 ? "danger" : "warning"} />
        <span className="font-semibold tabular-nums text-app-text">
          {balance == null ? "—" : balance.toLocaleString()}
        </span>
        credits
      </button>
      <CreditsDrawer open={open} onClose={() => setOpen(false)} tokens={tokens} loading={isLoading} />
    </>
  );
};

export default CreditsButton;

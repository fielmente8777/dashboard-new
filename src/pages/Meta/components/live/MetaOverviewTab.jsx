import { Banknote, ExternalLink, Megaphone, MessageCircle, Target, Trophy, Users, Wallet } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CHART_COLORS,
  axisProps,
  formatCompact,
  formatDayLabel,
  gridProps,
  tooltipProps,
} from "../../../../components/Charts/chartTheme";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import StatCard from "../../../../components/ui/StatCard";
import { EmptyState } from "../../../../components/ui/States";
import MetaAlertsCard from "./MetaAlertsCard";
import { compact, cost, count, enquiries, growth, money } from "./metaFormat";

const trendOf = (g) =>
  g == null ? {} : { growth: g, trend: g > 0 ? "up" : g < 0 ? "down" : "flat", caption: "vs period before" };

const pointLabel = (value) =>
  /^\d{4}-\d{2}$/.test(value)
    ? new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
    : formatDayLabel(value);

// Spend per day or month (bars) and enquiries (line).
const SpendChart = ({ ads }) => {
  const rows = ads.timeline || [];
  return (
    <Card
      title="Spend and enquiries over time"
      description={`Per ${ads.timelineUnit === "month" ? "month" : "day"} · bars: spend, line: chats + form leads`}
    >
      <div className="h-72">
        {rows.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-app-text-muted">No spend in these dates.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tickFormatter={pointLabel} minTickGap={24} {...axisProps} />
              <YAxis yAxisId="spend" tickFormatter={formatCompact} width={48} {...axisProps} />
              <YAxis yAxisId="enq" orientation="right" tickFormatter={formatCompact} width={36} {...axisProps} />
              <Tooltip
                {...tooltipProps}
                labelFormatter={pointLabel}
                formatter={(value, name) =>
                  name === "spend" ? [money(value, ads.currency), "Spend"] : [count(value), "Enquiries"]
                }
              />
              <Bar yAxisId="spend" dataKey="spend" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Line yAxisId="enq" type="monotone" dataKey="enquiries" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

// Each ad account: status, spend, and the spending limit when one is set.
const AccountsCard = ({ ads }) => (
  <Card title="Ad accounts" description="Only the accounts that advertised this property's page">
    <ul className="divide-y divide-app-border!">
      {ads.accounts.map((account) => {
        const used =
          account.spendCap && account.lifetimeSpend != null ? Math.min(1, account.lifetimeSpend / account.spendCap) : null;
        return (
          <li key={account.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-app-text">
                <span className="truncate">{account.name}</span>
                <Badge tone={account.active ? "green" : "red"}>{account.status}</Badge>
              </p>
              <p className="mt-0.5 text-xs text-app-text-muted">
                {money(account.spendInPeriod, account.currency)} in these dates
                {/* Meta's amount spent restarts when the spending limit is reset */}
                {account.lifetimeSpend != null && !account.spendCap && ` · ${money(account.lifetimeSpend, account.currency)} all time`}
                {account.disableReason && ` · ${account.disableReason}`}
              </p>
              {used != null && (
                <div className="mt-2 max-w-sm">
                  <div className="h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
                    <div
                      className={`h-full rounded-full ${used >= 0.9 ? "bg-red-500" : used >= 0.7 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${used * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Spending limit {money(account.spendCap, account.currency)} · {money(account.lifetimeSpend, account.currency)} (
                    {Math.round(used * 100)}%) used since it was last reset
                  </p>
                </div>
              )}
            </div>
            <a
              href={account.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Ads Manager <Icon icon={ExternalLink} size="sm" />
            </a>
          </li>
        );
      })}
    </ul>
  </Card>
);

// Unpaid reach next to the paid numbers.
const OrganicStrip = ({ facebook, instagram }) => {
  const items = [
    facebook && {
      label: "Facebook page reach",
      value: compact(facebook.reach),
      change: growth(facebook.reach, facebook.previous?.reach),
    },
    facebook && { label: "New page followers", value: count(facebook.newFollowers) },
    instagram && { label: "Instagram followers", value: compact(instagram.account?.followers) },
    instagram && {
      label: "Instagram posts",
      value: count(instagram.published?.total),
      hint: `${count(instagram.likes)} likes · ${count(instagram.comments)} comments`,
    },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-app-border! bg-app-surface lg:grid-cols-4 lg:divide-x lg:divide-app-border!">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3" title={item.hint}>
          <dt className="text-xs font-medium text-app-text-muted">{item.label}</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-app-text">
            {item.value}
            {item.change != null && (
              <span
                className={`ml-2 text-xs font-medium ${item.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {item.change > 0 ? "+" : ""}
                {item.change}%
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// Overview: what needs attention, the headline numbers (paid, then unpaid), the spend line,
// the ad accounts and the findings.
const MetaOverviewTab = ({ data, onShowUtm }) => {
  const { snapshot, alerts } = data;
  const ads = snapshot.ads;
  const t = ads?.totals;
  const p = ads?.previousTotals;
  const currency = ads?.currency || "INR";
  const enq = t ? enquiries(t) : 0;
  const before = p ? enquiries(p) : 0;
  const won = snapshot.leads?.converted;

  const cards = ads
    ? [
        { label: "Ad spend", icon: Wallet, value: money(t.spend, currency), ...trendOf(growth(t.spend, p?.spend)) },
        { label: "People reached", icon: Users, value: compact(t.reach), ...trendOf(growth(t.reach, p?.reach)) },
        { label: "Enquiries", icon: MessageCircle, value: count(enq), ...trendOf(p ? growth(enq, before) : null) },
        {
          label: "Cost per enquiry",
          icon: Target,
          value: enq ? cost(t.spend / enq, currency) : "—",
          lowerIsBetter: true,
          ...trendOf(enq && before ? growth(t.spend / enq, p.spend / before) : null),
        },
        {
          label: "Leads won",
          icon: Trophy,
          value: won == null ? "—" : count(won),
          caption: snapshot.leads ? `of ${count(snapshot.leads.total)} form leads` : "Mark leads as converted to see this",
        },
        {
          label: "Ad spend per booking",
          icon: Banknote,
          value: won ? cost(t.spend / won, currency) : "—",
          caption: won ? "Ad spend ÷ leads won" : "No lead marked converted yet",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <MetaAlertsCard alerts={alerts} onShowUtm={onShowUtm} />

      {ads ? (
        <>
          <div className="anim-stagger grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
            {cards.map(({ label, ...card }) => (
              <StatCard key={label} label={label} {...card} />
            ))}
          </div>
          <SpendChart ads={ads} />
        </>
      ) : (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="No ads in these dates"
            description="No ad account that advertises this page spent money in these dates. The page and Instagram numbers are below."
          />
        </Card>
      )}

      <OrganicStrip facebook={snapshot.facebook} instagram={snapshot.instagram} />

      {ads?.accounts?.length > 0 && <AccountsCard ads={ads} />}

      {snapshot.highlights?.length > 0 && (
        <Card title="What the numbers say" description="Worked out from these dates, the same as in the PDF report">
          <ul className="space-y-2">
            {snapshot.highlights.map((h) => (
              <li key={h.title} className="text-sm">
                <span className="font-medium text-app-text">{h.title}: </span>
                <span className="text-app-text-muted">{h.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default MetaOverviewTab;

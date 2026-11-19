import { Activity, AlertTriangle, Coins, Info, Layers, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { costText, dayEndISO, dayStartISO, formatCredits, formatDate, formatTokens } from "../../../components/AiCredits/aiCredits";
import Card from "../../../components/ui/Card";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import Icon from "../../../components/ui/Icon";
import Segmented from "../../../components/ui/Segmented";
import StatCard from "../../../components/ui/StatCard";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetAdminAiAnalyticsQuery } from "../../../redux/api/aiCreditsApi";
import { addDays, toISODate } from "../../../utils/datePresets";
import {
  CostByProviderChart,
  CreditsByProviderChart,
  DailyTrendChart,
  ModelUsageChart,
  RequestsByProviderChart,
  SuccessFailureChart,
  TokensByProviderChart,
} from "./analyticsCharts";
import ClientUsageDrawer from "./ClientUsageDrawer";
import { ClientUsageTable, ModelUsageTable } from "./UsageTables";

const RANGES = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
  { value: "custom", label: "Custom" },
];

const ChartCard = ({ title, description, actions, children }) => (
  <Card title={title} description={description} actions={actions}>
    {children}
  </Card>
);

// Admin > AI Credit Management > API usage: how much each AI provider API is
// used across all clients. Built only from tracked provider calls
// (AiProviderCall) and the credits charged for them (AiUsageLog); nothing is
// estimated here beyond what the call records themselves mark as estimated.
const ApiUsageAnalytics = () => {
  const [rangeKey, setRangeKey] = useState(30);
  const [custom, setCustom] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [client, setClient] = useState(null);

  const today = toISODate(new Date());
  const { start, end } =
    rangeKey === "custom"
      ? { start: custom?.start || null, end: custom?.end || today }
      : { start: toISODate(addDays(new Date(), -(rangeKey - 1))), end: today };
  const range = useMemo(() => ({ from: dayStartISO(start), to: dayEndISO(end) }), [start, end]);

  const { data, isLoading, isFetching, error, refetch } = useGetAdminAiAnalyticsQuery(range, { skip: !start });

  const currencies = useMemo(() => Object.keys(data?.totals?.cost ?? {}), [data]);
  const activeCurrency = currency && currencies.includes(currency) ? currency : currencies[0];
  const t = data?.totals;

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented label="Period" options={RANGES} value={rangeKey} onChange={setRangeKey} />
      {rangeKey === "custom" && <DateRangePicker value={custom} onChange={setCustom} placeholder="Pick dates" className="h-8!" />}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-app-text">AI API usage</h2>
          <p className="text-sm text-app-text-muted">Every call to Sarvam, OpenAI, Claude, Groq and other AI providers, across all clients</p>
        </div>
        {filters}
      </div>

      {data?.trackingSince !== undefined && (
        <p className="flex items-start gap-2 rounded-xl border border-app-border! bg-app-surface px-4 py-3 text-sm text-app-text-muted">
          <Icon icon={Info} size="sm" className="mt-0.5 shrink-0" />
          {data.trackingSince
            ? `API calls are tracked since ${formatDate(data.trackingSince)}. Earlier usage was never recorded and can't be reconstructed.`
            : "No AI API calls have been tracked yet. Usage appears here from the first AI request after this update."}
        </p>
      )}

      {!start ? (
        <EmptyState icon={Activity} title="Pick a date range" description="Choose the days you want to see." />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      ) : error ? (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load API usage.")} onRetry={refetch} />
      ) : t.requests === 0 ? (
        <EmptyState icon={Activity} title="No AI API calls in this period" description="Pick a longer period, or check back after clients use AI." />
      ) : (
        <div className={`space-y-5 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="API requests"
              value={formatCredits(t.requests)}
              icon={Activity}
              caption={`${formatCredits(t.success)} successful · ${formatCredits(t.failed)} failed`}
            />
            <StatCard
              label="Tokens"
              value={formatTokens(t.totalTokens)}
              icon={Layers}
              caption={`${formatTokens(t.inputTokens)} in · ${formatTokens(t.outputTokens)} out · ${formatCredits(t.avgTokensPerRequest)} per request`}
            />
            <StatCard label="Provider cost" value={costText(t.cost)} icon={Coins} caption="At the prices set in AI provider pricing" />
            <StatCard
              label="Credits charged"
              value={formatCredits(t.credits)}
              icon={Coins}
              caption={t.uncollectedCredits ? `${formatCredits(t.uncollectedCredits)} more owed but not collected` : "From client wallets"}
            />
            <StatCard label="Clients using AI" value={formatCredits(t.clients)} icon={Users} caption={`${formatCredits(data.byProvider.length)} providers`} />
          </div>

          {(t.estimatedRequests > 0 || t.unpricedRequests > 0 || t.unattributedRequests > 0) && (
            <ul className="space-y-1 rounded-xl border border-amber-500/30! bg-amber-500/5 px-4 py-3 text-sm text-app-text">
              {t.estimatedRequests > 0 && (
                <li className="flex gap-2"><Icon icon={AlertTriangle} size="sm" className="mt-0.5 text-amber-600" />{formatCredits(t.estimatedRequests)} call(s) have estimated tokens: the provider reported no usage.</li>
              )}
              {t.unpricedRequests > 0 && (
                <li className="flex gap-2"><Icon icon={AlertTriangle} size="sm" className="mt-0.5 text-amber-600" />{formatCredits(t.unpricedRequests)} call(s) used a model without active pricing, so their cost is not counted.</li>
              )}
              {t.unattributedRequests > 0 && (
                <li className="flex gap-2"><Icon icon={AlertTriangle} size="sm" className="mt-0.5 text-amber-600" />{formatCredits(t.unattributedRequests)} call(s) ran outside any client&apos;s billed request.</li>
              )}
            </ul>
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard title="API usage by provider" description="Calls made to each provider (failed calls included)">
              <RequestsByProviderChart rows={data.byProvider} />
            </ChartCard>
            <ChartCard title="Token consumption by provider" description="Input and output tokens">
              <TokensByProviderChart rows={data.byProvider} />
            </ChartCard>
            <ChartCard
              title="API cost by provider"
              description="Provider cost, per billing currency"
              actions={
                currencies.length > 1 && (
                  <Segmented label="Currency" options={currencies.map((c) => ({ value: c, label: c }))} value={activeCurrency} onChange={setCurrency} />
                )
              }
            >
              {activeCurrency ? (
                <CostByProviderChart rows={data.byProvider} currency={activeCurrency} />
              ) : (
                <p className="py-16 text-center text-sm text-app-text-faint">No priced usage in this period</p>
              )}
            </ChartCard>
            <ChartCard title="Credit consumption by provider" description="Wallet credits charged to clients for each provider's usage">
              <CreditsByProviderChart rows={data.byProvider} />
            </ChartCard>
            <ChartCard title="Daily API requests" description="Calls per day">
              <DailyTrendChart rows={data.daily} dataKey="requests" label="Requests" />
            </ChartCard>
            <ChartCard title="Daily token consumption" description="Tokens per day">
              <DailyTrendChart rows={data.daily} dataKey="totalTokens" label="Tokens" format={formatTokens} />
            </ChartCard>
            <ChartCard title="Model-wise usage" description="Requests per model (top 10), coloured by provider">
              <ModelUsageChart rows={data.byModel} />
            </ChartCard>
            <ChartCard title="Success vs failure" description="Successful and failed calls per provider">
              <SuccessFailureChart rows={data.byProvider} />
            </ChartCard>
          </div>

          <ModelUsageTable range={range} />
          <ClientUsageTable range={range} onOpen={setClient} />
          <ClientUsageDrawer client={client} range={range} onClose={() => setClient(null)} />
        </div>
      )}
    </div>
  );
};

export default ApiUsageAnalytics;

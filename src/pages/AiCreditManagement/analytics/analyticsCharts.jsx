import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCredits, formatPrice, formatTokens, providerLabel } from "../../../components/AiCredits/aiCredits";
import { CHART_COLORS, CHART_OTHER, axisProps, formatCompact, formatDayLabel, gridProps, tooltipProps } from "../../../components/Charts/chartTheme";

// Charts of the admin API usage analytics. Colours follow the entity, never
// its rank: each provider keeps its own colour on every chart, so a filter
// that hides one never repaints the others.
const PROVIDER_COLOR = {
  sarvam: CHART_COLORS[0],
  openai: CHART_COLORS[1],
  anthropic: CHART_COLORS[2],
  groq: CHART_COLORS[3],
  gemini: CHART_COLORS[4],
};
const providerColor = (provider) => PROVIDER_COLOR[provider] ?? CHART_OTHER;

const TOKENS_COLOR = CHART_COLORS[6]; // input solid, output the same hue lighter
const SUCCESS_COLOR = CHART_COLORS[5];
const FAILED_COLOR = CHART_COLORS[7];

const BAR = { radius: [4, 4, 0, 0], maxBarSize: 40 };
const legendProps = { iconType: "circle", iconSize: 8, wrapperStyle: { fontSize: 12, color: "var(--app-text-muted)" } };

const Frame = ({ height = 260, children }) => (
  <div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

const ProviderLegend = ({ providers }) => (
  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-app-text-muted">
    {providers.map((p) => (
      <li key={p} className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: providerColor(p) }} aria-hidden="true" />
        {providerLabel(p)}
      </li>
    ))}
  </ul>
);

const providerTick = (p) => providerLabel(p);

/** 1. API requests per provider. */
export const RequestsByProviderChart = ({ rows }) => (
  <Frame>
    <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="provider" tickFormatter={providerTick} {...axisProps} />
      <YAxis {...axisProps} width={48} tickFormatter={formatCompact} allowDecimals={false} />
      <Tooltip
        {...tooltipProps}
        labelFormatter={providerTick}
        formatter={(value, _name, item) => [
          `${formatCredits(value)} requests (${formatCredits(item.payload.failed)} failed)`,
          "API calls",
        ]}
      />
      <Bar dataKey="requests" {...BAR}>
        {rows.map((r) => (
          <Cell key={r.provider} fill={providerColor(r.provider)} />
        ))}
      </Bar>
    </BarChart>
  </Frame>
);

/** 2. Input and output tokens per provider, stacked. */
export const TokensByProviderChart = ({ rows }) => (
  <Frame>
    <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="provider" tickFormatter={providerTick} {...axisProps} />
      <YAxis {...axisProps} width={48} tickFormatter={formatTokens} />
      <Tooltip {...tooltipProps} labelFormatter={providerTick} formatter={(value, name) => [`${formatTokens(value)} tokens`, name]} />
      <Legend {...legendProps} />
      <Bar dataKey="inputTokens" name="Input tokens" stackId="t" fill={TOKENS_COLOR} maxBarSize={40} stroke="var(--app-surface)" strokeWidth={2} />
      <Bar dataKey="outputTokens" name="Output tokens" stackId="t" fill={TOKENS_COLOR} fillOpacity={0.45} {...BAR} stroke="var(--app-surface)" strokeWidth={2} />
    </BarChart>
  </Frame>
);

/** 3. Provider cost in one currency (providers bill in different currencies). */
export const CostByProviderChart = ({ rows, currency }) => {
  const data = rows
    .map((r) => ({ provider: r.provider, cost: r.cost?.[currency] ?? 0 }))
    .filter((r) => r.cost > 0);
  if (!data.length) return <p className="py-16 text-center text-sm text-app-text-faint">No priced usage in {currency}</p>;
  return (
    <Frame>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="provider" tickFormatter={providerTick} {...axisProps} />
        <YAxis {...axisProps} width={64} tickFormatter={(v) => formatPrice(v, currency)} />
        <Tooltip {...tooltipProps} labelFormatter={providerTick} formatter={(value) => [formatPrice(value, currency), "Provider cost"]} />
        <Bar dataKey="cost" {...BAR}>
          {data.map((r) => (
            <Cell key={r.provider} fill={providerColor(r.provider)} />
          ))}
        </Bar>
      </BarChart>
    </Frame>
  );
};

/** 4. Daily trend of one measure (requests and tokens get separate charts: never two y-axes). */
export const DailyTrendChart = ({ rows, dataKey, label, format = formatCompact }) => (
  <Frame height={220}>
    <LineChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="date" tickFormatter={formatDayLabel} {...axisProps} minTickGap={16} />
      <YAxis {...axisProps} width={48} tickFormatter={format} allowDecimals={false} />
      <Tooltip {...tooltipProps} labelFormatter={formatDayLabel} formatter={(value) => [format(value), label]} />
      <Line type="monotone" dataKey={dataKey} stroke={TOKENS_COLOR} strokeWidth={2} dot={rows.length <= 1 ? { r: 4 } : false} activeDot={{ r: 5 }} />
    </LineChart>
  </Frame>
);

/** 5. Requests per model, coloured by provider. */
export const ModelUsageChart = ({ rows }) => {
  const data = rows.slice(0, 10).map((r) => ({ ...r, label: r.model }));
  return (
    <>
      <Frame height={Math.max(180, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid {...gridProps} horizontal={false} vertical />
          <XAxis type="number" {...axisProps} tickFormatter={formatCompact} allowDecimals={false} />
          <YAxis type="category" dataKey="label" {...axisProps} width={150} />
          <Tooltip
            {...tooltipProps}
            formatter={(value, _name, item) => [
              `${formatCredits(value)} requests · ${formatTokens(item.payload.totalTokens)} tokens`,
              `${providerLabel(item.payload.provider)} · ${item.payload.kind}`,
            ]}
          />
          <Bar dataKey="requests" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((r) => (
              <Cell key={`${r.provider}/${r.model}/${r.kind}`} fill={providerColor(r.provider)} />
            ))}
          </Bar>
        </BarChart>
      </Frame>
      <ProviderLegend providers={[...new Set(data.map((r) => r.provider))]} />
    </>
  );
};

/** 6. Wallet credits charged for each provider's usage. */
export const CreditsByProviderChart = ({ rows }) => (
  <Frame>
    <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="provider" tickFormatter={providerTick} {...axisProps} />
      <YAxis {...axisProps} width={48} tickFormatter={formatCompact} allowDecimals={false} />
      <Tooltip {...tooltipProps} labelFormatter={providerTick} formatter={(value) => [`${formatCredits(value)} credits`, "Charged to clients"]} />
      <Bar dataKey="credits" {...BAR}>
        {rows.map((r) => (
          <Cell key={r.provider} fill={providerColor(r.provider)} />
        ))}
      </Bar>
    </BarChart>
  </Frame>
);

/** 7. Successful vs failed calls per provider. */
export const SuccessFailureChart = ({ rows }) => (
  <Frame>
    <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="provider" tickFormatter={providerTick} {...axisProps} />
      <YAxis {...axisProps} width={48} tickFormatter={formatCompact} allowDecimals={false} />
      <Tooltip {...tooltipProps} labelFormatter={providerTick} formatter={(value, name) => [`${formatCredits(value)} calls`, name]} />
      <Legend {...legendProps} />
      <Bar dataKey="success" name="Successful" stackId="s" fill={SUCCESS_COLOR} maxBarSize={40} stroke="var(--app-surface)" strokeWidth={2} />
      <Bar dataKey="failed" name="Failed" stackId="s" fill={FAILED_COLOR} {...BAR} stroke="var(--app-surface)" strokeWidth={2} />
    </BarChart>
  </Frame>
);

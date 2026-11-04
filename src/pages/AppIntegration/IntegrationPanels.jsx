import {
  ExternalLink,
  KeyRound,
  PhoneCall,
  PhoneMissed,
  RefreshCw,
  Timer,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDuration } from "../../components/Charts/chartTheme";
import GscSettings from "../../components/GscSettings";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Detail from "../../components/ui/Detail";
import Icon from "../../components/ui/Icon";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useApiAction } from "../../hooks/useApiAction";
import { useTenant } from "../../hooks/useTenant";
import { useGetCallAnalyticsQuery } from "../../redux/api/callsApi";
import { useGetAdsAccountsQuery } from "../../redux/api/googleAdsApi";
import { useRefreshExotelOverviewMutation } from "../../redux/api/integrationsApi";
import { useSyncGbpLocationsMutation } from "../../redux/api/gbpApi";
import { useGetMetaLeadsTotalQuery } from "../../redux/api/metaApi";
import { dashboardPath } from "../../routes/paths";
import { getDateRange } from "../../utils/dateRange";
import { formatMoney } from "./integrationHealth";
import { CheckRow } from "./IntegrationParts";

const formatDate = (value, withTime = false) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

const ExternalButton = ({ href, children, variant = "secondary", size = "sm" }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <Button variant={variant} size={size} icon={ExternalLink} className="w-full sm:w-auto">
      {children}
    </Button>
  </a>
);

// "Connection health": every check, with a fix next to the ones that failed.
export const HealthCard = ({ checks, loading, actions = {}, description }) => (
  <Card title="Connection health" description={description || "Checked live against the app each time you open this page."}>
    {loading ? (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    ) : (
      <ul className="divide-y divide-app-border!">
        {checks.map((check) => (
          <CheckRow key={check.id} check={check} action={check.status !== "ok" ? actions[check.id] : null} />
        ))}
      </ul>
    )}
  </Card>
);

const MiniStat = ({ icon, label, value, loading }) => (
  <div className="min-w-0 rounded-xl bg-app-bg p-3">
    <p className="flex items-center gap-1.5 truncate text-[11px] font-medium uppercase tracking-wide text-app-text-muted">
      <Icon icon={icon} size="sm" tone="faint" />
      {label}
    </p>
    {loading ? (
      <Skeleton className="mt-2 h-6 w-16" />
    ) : (
      <p className="mt-1 text-lg font-semibold tabular-nums text-app-text">{value}</p>
    )}
  </div>
);

// ---------------------------------------------------------------- Exotel

const BALANCE_TONES = {
  ok: { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", label: "Healthy" },
  warn: { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", label: "Running low" },
  error: { text: "text-red-600 dark:text-red-400", bar: "bg-red-500", label: "Empty" },
};

const BalanceCard = ({ overview, onRefresh, refreshing, onEditKeys, providerUrl }) => {
  const { balance, balanceError } = overview;

  if (!balance) {
    return (
      <Card title="Calling balance">
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-red-500/40! bg-red-500/4 p-4 sm:flex-row sm:items-center">
          <Icon icon={Wallet} className="shrink-0 text-red-500" />
          <p className="flex-1 text-sm text-app-text">
            {balanceError?.message || "Exotel did not return a balance."}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button size="sm" variant="secondary" icon={RefreshCw} loading={refreshing} onClick={onRefresh} className="flex-1 sm:flex-none">
              Try again
            </Button>
            <Button size="sm" icon={KeyRound} onClick={onEditKeys} className="flex-1 sm:flex-none">
              Update keys
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // the server's forecast (days left at the current spend) decides when it has one
  const forecastLevel = { empty: "error", low: "warn", ok: "ok" }[balance.level];
  const level = forecastLevel ?? (balance.isEmpty ? "error" : balance.isLow ? "warn" : "ok");
  const daysLeft = typeof balance.daysLeft === "number" ? balance.daysLeft : null;
  const tone = BALANCE_TONES[level];
  // the bar is full at four times the warning level; the tick marks that level
  const full = balance.lowThreshold * 4;
  const filled = Math.max(2, Math.min(100, (balance.amount / full) * 100));

  return (
    <Card
      title="Calling balance"
      description={balance.pricingPlan ? `${balance.pricingPlan} plan` : "Your Exotel wallet"}
      actions={
        <Button size="sm" variant="ghost" icon={RefreshCw} loading={refreshing} onClick={onRefresh}>
          Refresh
        </Button>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-3xl font-semibold tabular-nums sm:text-4xl ${tone.text}`}>
            {formatMoney(balance.amount, balance.currency)}
          </p>
          <p className="mt-1 text-xs text-app-text-muted">
            <span className={`font-medium ${tone.text}`}>{tone.label}</span>
            {balance.updatedAt && ` · updated by Exotel ${formatDate(balance.updatedAt.replace(" ", "T"), true)}`}
          </p>
        </div>
        <ExternalButton href={providerUrl} variant={level === "ok" ? "secondary" : "primary"}>
          Recharge on Exotel
        </ExternalButton>
      </div>

      <div className="relative mt-5 h-2 rounded-full bg-app-surface-secondary">
        <div className={`h-full rounded-full transition-all ${tone.bar}`} style={{ width: `${filled}%` }} />
        <span className="absolute -top-1 h-4 w-0.5 rounded bg-app-text-faint" style={{ left: "25%" }} title="Low balance level" />
      </div>
      <p className="mt-2 text-[11px] text-app-text-faint">
        {daysLeft !== null
          ? `${daysLeft < 1 ? "Less than a day" : `About ${Math.floor(daysLeft)} day${Math.floor(daysLeft) === 1 ? "" : "s"}`} of calls left at your current usage` +
            (balance.dailySpend ? ` (about ${formatMoney(balance.dailySpend, balance.currency)} a day)` : "") +
            ". We warn admins 2 days before it runs out."
          : `We warn you below ${formatMoney(balance.lowThreshold, balance.currency)} until we have a day of usage to forecast from.`}{" "}
        When it reaches zero, calls from the dashboard fail.
      </p>
    </Card>
  );
};

export const ExotelPanel = ({ app, integrations }) => {
  const { hid } = useTenant();
  const run = useApiAction();
  const { query, checks } = integrations.health.exotel;
  const [refreshOverview, { isLoading: refreshing }] = useRefreshExotelOverviewMutation();
  const range = useMemo(() => getDateRange("30days"), []);
  const usage = useGetCallAnalyticsQuery({ hid, ...range }, { skip: !hid });
  const summary = usage.data?.summary || {};
  // gian sends each number as { value, previous, change, trend } (older
  // servers sent the plain number), so read either
  const count = (key) => {
    const metric = summary[key];
    return Number((metric !== null && typeof metric === "object" ? metric.value : metric) || 0);
  };

  const refresh = () =>
    run(refreshOverview(hid), { success: "Checked with Exotel", error: "Could not reach Exotel." });

  // 30-day usage comes from our own calls list, so it shows even when Exotel cannot be asked
  const usageCard = (
    <Card
      title="Calls in the last 30 days"
      actions={
        <Link to={dashboardPath(app.openPage)}>
          <Button size="sm" variant="ghost">View calls</Button>
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <MiniStat icon={PhoneCall} label="Total" value={count("totalCalls")} loading={usage.isLoading} />
        <MiniStat icon={PhoneCall} label="Answered" value={count("successfulCalls")} loading={usage.isLoading} />
        <MiniStat icon={PhoneMissed} label="Missed" value={count("missedCalls")} loading={usage.isLoading} />
        <MiniStat icon={Timer} label="Talk time" value={formatDuration(count("totalTalkTime"))} loading={usage.isLoading} />
      </div>
    </Card>
  );

  if (query.isError) {
    // 404: the server running is older than this page and has no overview yet
    const missing = query.error?.status === 404;
    return (
      <div className="space-y-5">
        {missing ? (
          <Card title="Calling balance">
            <p className="text-sm text-app-text-muted">
              Balance and health checks are not available on the server yet. They appear here
              after the next update. Calling keeps working as before.
            </p>
            <a href={app.providerUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
              <Button size="sm" variant="secondary" icon={ExternalLink}>See balance on Exotel</Button>
            </a>
          </Card>
        ) : (
          <ErrorState message="Couldn't load your Exotel account." onRetry={query.refetch} />
        )}
        {usageCard}
      </div>
    );
  }
  if (!query.data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  const overview = query.data;
  const config = overview.config || {};
  const editKeys = (
    <Button size="sm" variant="secondary" icon={KeyRound} onClick={integrations.editExotelKeys}>
      Update
    </Button>
  );

  return (
    <div className="space-y-5">
      <BalanceCard
        overview={overview}
        onRefresh={refresh}
        refreshing={refreshing}
        onEditKeys={integrations.editExotelKeys}
        providerUrl={app.providerUrl}
      />

      <HealthCard
        checks={checks}
        actions={{
          keys: editKeys,
          number: editKeys,
          balance: (
            <a href={app.providerUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary">Recharge</Button>
            </a>
          ),
        }}
        description={`Last checked ${formatDate(overview.checkedAt, true)}.`}
      />

      {usageCard}

      <Card
        title="Configuration"
        description="Saved encrypted. The API token is never shown."
        actions={
          <Button size="sm" variant="secondary" icon={KeyRound} onClick={integrations.editExotelKeys}>
            Update keys
          </Button>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Account SID">{config.accountSID}</Detail>
          <Detail label="Subdomain">{config.subDomain}</Detail>
          <Detail label="Exotel number (Caller ID)">{config.virtualNumber}</Detail>
          <Detail label="API key">{config.apiKey && <span className="font-mono">{config.apiKey}</span>}</Detail>
          <Detail label="API token">Saved (hidden)</Detail>
          <Detail label="Connected on">{formatDate(overview.connectedAt)}</Detail>
          <Detail label="Keys last changed">{formatDate(overview.updatedAt, true)}</Detail>
        </dl>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------- WhatsApp

const humanize = (value) =>
  value ? String(value).toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "";

export const WhatsAppPanel = ({ app, integrations }) => {
  const { query, checks } = integrations.health.metaWhatsapp;

  if (query.isError) {
    return (
      <ErrorState
        message="Couldn't load the WhatsApp account. If it was removed in Meta, reconnect it."
        onRetry={query.refetch}
      />
    );
  }

  const account = query.data;
  const phone = account?.phoneNumber || {};
  const business = account?.business || {};
  const waba = account?.waba || {};

  return (
    <div className="space-y-5">
      <HealthCard
        checks={checks}
        loading={!account}
        description="As Meta reports it for your number."
        actions={{
          name: <ExternalButton href={app.providerUrl}>Open in Meta</ExternalButton>,
          business: <ExternalButton href="https://business.facebook.com/settings/security">Verify</ExternalButton>,
          quality: <ExternalButton href={app.providerUrl}>Details</ExternalButton>,
        }}
      />

      <Card title="Account">
        {!account ? (
          <Skeleton className="h-40" />
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Phone number">{phone.displayPhoneNumber}</Detail>
            <Detail label="Display name">{phone.verifiedName}</Detail>
            <Detail label="Business">{business.name}</Detail>
            <Detail label="Business verification">{humanize(business.verificationStatus)}</Detail>
            <Detail label="Quality rating">{humanize(phone.qualityRating)}</Detail>
            <Detail label="Account mode">{humanize(phone.accountMode)}</Detail>
            <Detail label="WhatsApp Business account">{waba.name}</Detail>
            <Detail label="Marketing messages">{humanize(waba.marketingMessagesOnboardingStatus)}</Detail>
            <Detail label="Time zone">{waba.timezone}</Detail>
            <Detail label="Connected on">{formatDate(account.onboardingStatus?.createdAt)}</Detail>
            <Detail label="Phone number ID">
              {phone.id && <span className="font-mono text-xs">{phone.id}</span>}
            </Detail>
            <Detail label="Account ID">{waba.id && <span className="font-mono text-xs">{waba.id}</span>}</Detail>
          </dl>
        )}
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------- Google Ads

const DAY = 86_400_000;

export const GoogleAdsPanel = ({ app, integrations }) => {
  const accounts = useGetAdsAccountsQuery(undefined);
  const lastSync = integrations.integrationStatus?.googleAdsInsight?.lastSyncTime;
  const list = accounts.data || [];
  const syncAge = lastSync ? (Date.now() - new Date(lastSync).getTime()) / DAY : null;

  const checks = [
    accounts.isError
      ? { id: "accounts", label: "Ads accounts", status: "error", detail: "Google did not return your Ads accounts. Reconnect Google Ads." }
      : list.length
        ? { id: "accounts", label: "Ads accounts", status: "ok", detail: `${list.length} account${list.length > 1 ? "s" : ""} synced.` }
        : { id: "accounts", label: "Ads accounts", status: "warn", detail: "No accounts synced yet. Open Google Ads insights and sync once." },
    syncAge === null
      ? { id: "sync", label: "Last sync", status: "warn", detail: "Never synced." }
      : {
          id: "sync",
          label: "Last sync",
          status: syncAge > 3 ? "warn" : "ok",
          detail: `${formatDate(lastSync, true)}${syncAge > 3 ? " — numbers may be out of date. Sync again." : "."}`,
        },
  ];
  const openInsights = (
    <Link to={dashboardPath(app.openPage)}>
      <Button size="sm" variant="secondary">Sync</Button>
    </Link>
  );

  return (
    <div className="space-y-5">
      <HealthCard checks={checks} loading={accounts.isLoading} actions={{ accounts: openInsights, sync: openInsights }} />
      {list.length > 0 && (
        <Card title="Accounts">
          <ul className="divide-y divide-app-border!">
            {list.map((account) => (
              <li key={account.clientCustomerId || account.googleAccountId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="min-w-0 truncate text-sm font-medium text-app-text">
                  {account.accountName || account.clientCustomerId}
                </span>
                <span className="shrink-0 font-mono text-xs text-app-text-muted">{account.clientCustomerId}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- Meta lead ads

export const MetaLeadsPanel = ({ app }) => {
  const { hid } = useTenant();
  const total = useGetMetaLeadsTotalQuery(hid, { skip: !hid });

  const checks = [
    total.isError
      ? {
          id: "page",
          label: "Facebook page",
          status: "error",
          detail: "No Facebook page is linked for lead forms. Reconnect and allow access to your page.",
        }
      : { id: "page", label: "Facebook page", status: "ok", detail: "A page is linked and its lead forms are read." },
    ...(total.isError
      ? []
      : [
          {
            id: "leads",
            label: "Leads received",
            status: total.data ? "ok" : "info",
            detail: total.data ? `${total.data} leads saved so far.` : "No leads yet. They appear here as soon as a form is filled in.",
          },
        ]),
  ];

  return (
    <HealthCard
      checks={checks}
      loading={total.isLoading}
      actions={{ page: <ExternalButton href={app.providerUrl}>Open forms</ExternalButton> }}
    />
  );
};

// ---------------------------------------------------------------- Google Analytics

// The property is picked when connecting; Search Console uses the same sign-in.
export const AnalyticsPanel = ({ app }) => (
  <div className="space-y-5">
    <BasicPanel app={app} />
    <GscSettings />
  </div>
);

// ---------------------------------------------------------------- the rest

export const BasicPanel = ({ app }) => (
  <Card title="Connected">
    <p className="text-sm text-app-text-muted">
      {app.name} is connected and syncing. Its data shows up in the dashboard; there is nothing else to set up here.
    </p>
    {app.openPage && (
      <Link to={dashboardPath(app.openPage)} className="mt-4 inline-block">
        <Button size="sm" variant="secondary">{app.openLabel || `Open ${app.name}`}</Button>
      </Link>
    )}
  </Card>
);

// ---------------------------------------------------------------- Google Business Profile

export const GbpPanel = ({ app, integrations }) => {
  const run = useApiAction();
  const [syncLocations, { isLoading: syncing }] = useSyncGbpLocationsMutation();
  const locations = integrations.gbpLocations || [];
  const unverified = locations.filter((l) => !l.isVerified);

  const checks = [
    { id: "listings", label: "Listings", status: "ok", detail: `${locations.length} listing${locations.length === 1 ? "" : "s"} connected.` },
    unverified.length
      ? {
          id: "verified",
          label: "Verification",
          status: "warn",
          detail: `${unverified.map((l) => l.locationName).join(", ")} ${unverified.length === 1 ? "is" : "are"} not verified on Google, so replies and posts may not show.`,
        }
      : { id: "verified", label: "Verification", status: "ok", detail: "Every listing is verified on Google." },
  ];

  return (
    <div className="space-y-5">
      <HealthCard
        checks={checks}
        description="As Google reports it for your listings."
        actions={{ verified: <ExternalButton href={app.providerUrl}>Verify</ExternalButton> }}
      />
      <Card
        title="Listings"
        actions={
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            loading={syncing}
            onClick={() => run(syncLocations(), { success: "Listings are up to date", error: "Could not sync listings." })}
          >
            Sync now
          </Button>
        }
      >
        <ul className="divide-y divide-app-border!">
          {locations.map((l) => (
            <li key={l.locationId} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-app-text">{l.locationName}</p>
                <p className="truncate text-xs text-app-text-muted">
                  {[l.address?.locality, l.address?.administrativeArea].filter(Boolean).join(", ") || l.categories?.primaryCategory?.displayName || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-app-text-muted">
                <span className="font-semibold text-app-text">
                  ★ {l.averageRating ? l.averageRating.toFixed(1) : "–"}
                </span>
                <span>{l.totalReviewCount ?? 0} reviews</span>
                {l.lastSyncTime && <span>Synced {formatDate(l.lastSyncTime, true)}</span>}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

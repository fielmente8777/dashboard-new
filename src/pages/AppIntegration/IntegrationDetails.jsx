import { ArrowLeft, ArrowRight, Check, ExternalLink, Lock, Plug, PlugZap, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { PAGES, ROUTES, dashboardPath } from "../../routes/paths";
import { appState, isConnectedState } from "./integrationHealth";
import { AppLogo, StatusPill } from "./IntegrationParts";
import {
  AnalyticsPanel,
  BasicPanel,
  ExotelPanel,
  GbpPanel,
  GoogleAdsPanel,
  MetaLeadsPanel,
  WhatsAppPanel,
} from "./IntegrationPanels";
import { findIntegration } from "./integrationsData";
import { useIntegrations } from "./useIntegrations";

// the apps with more to show than "connected"
const PANELS = {
  exotel: ExotelPanel,
  metaWhatsapp: WhatsAppPanel,
  googleadsinsights: GoogleAdsPanel,
  meta: MetaLeadsPanel,
  google_analytics: AnalyticsPanel,
  gmb: GbpPanel,
};

const BackLink = () => (
  <Link
    to={dashboardPath(PAGES.INTEGRATION)}
    className="inline-flex items-center gap-1.5 text-sm text-app-text-muted transition hover:text-app-text"
  >
    <ArrowLeft className="size-4" />
    All integrations
  </Link>
);

const Steps = ({ steps }) => (
  <ol className="space-y-4">
    {steps.map((step, index) => (
      <li key={step} className="flex gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white dark:bg-blue-600">
          {index + 1}
        </span>
        <p className="pt-0.5 text-sm leading-relaxed text-app-text">{step}</p>
      </li>
    ))}
  </ol>
);

const DetailsSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-32 rounded-2xl" />
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-60 rounded-xl" />
    </div>
  </div>
);

// One app's own page: is it connected, is it working, how it is set up,
// and what to do when something is off (e.g. Exotel running out of balance).
function IntegrationDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const app = findIntegration(slug);
  const integrations = useIntegrations();

  if (!app) {
    return (
      <div className="space-y-5">
        <BackLink />
        <EmptyState icon={Search} title="No such integration" description="It may have been renamed. Pick it from the list." />
      </div>
    );
  }
  if (!integrations.loaded) return <DetailsSkeleton />;

  const state = appState(app, integrations);
  const connected = isConnectedState(state);
  const canDisconnect = connected && (app.statusKey || ["google_analytics", "gmb"].includes(app.id));
  const Panel = PANELS[app.id] || BasicPanel;
  const busy = integrations.busyId === app.id;

  const disconnect = async () => {
    if (await integrations.disconnect(app)) navigate(dashboardPath(PAGES.INTEGRATION));
  };

  return (
    <div className="space-y-5">
      <BackLink />

      <section className="relative overflow-hidden rounded-2xl border border-app-border! bg-app-surface p-4 sm:p-6">
        {/* soft wash of the state colour behind the header */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl ${
            state === "error"
              ? "bg-red-500/10"
              : state === "warn"
                ? "bg-amber-500/10"
                : connected
                  ? "bg-emerald-500/10"
                  : "bg-blue-500/10"
          }`}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <AppLogo app={app} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-app-text sm:text-xl">{app.name}</h2>
                <StatusPill state={state} />
              </div>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-app-text-faint">{app.category}</p>
              <p className="mt-1.5 max-w-xl text-sm text-app-text-muted">{app.description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
            {state === "available" && (
              <Button icon={Plug} loading={busy} onClick={() => integrations.connect(app)} className="w-full sm:w-auto">
                Connect {app.name}
              </Button>
            )}
            {state === "locked" && (
              <Link to={ROUTES.PLANS} className="w-full sm:w-auto">
                <Button icon={Lock} className="w-full">Upgrade to connect</Button>
              </Link>
            )}
            {state === "soon" && (
              <Button variant="secondary" disabled className="w-full sm:w-auto">
                Coming soon
              </Button>
            )}
            {connected && app.openPage && (
              <Link to={dashboardPath(app.openPage)} className="w-full sm:w-auto">
                <Button className="w-full">
                  {app.openLabel || `Open ${app.name}`} <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
            {canDisconnect && (
              <Button
                variant="ghost"
                icon={PlugZap}
                loading={busy}
                onClick={disconnect}
                className="w-full text-red-500! hover:bg-red-500/10! sm:w-auto"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {connected ? (
            <Panel app={app} integrations={integrations} />
          ) : (
            <Card title="How to connect" description={state === "soon" ? "Not available yet: we'll let you know when it is." : undefined}>
              {app.steps?.length ? (
                <Steps steps={app.steps} />
              ) : (
                <p className="text-sm text-app-text-muted">Nothing to set up yet.</p>
              )}
              {state === "available" && (
                <Button icon={Plug} loading={busy} onClick={() => integrations.connect(app)} className="mt-5 w-full sm:w-auto">
                  Connect {app.name}
                </Button>
              )}
            </Card>
          )}
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-4">
          {app.features?.length > 0 && (
            <Card title="What you get">
              <ul className="space-y-2.5">
                {app.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-app-text">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {connected && app.steps?.length > 0 && (
            <Card title="How it was set up">
              <Steps steps={app.steps} />
            </Card>
          )}

          {app.providerUrl && (
            <a
              href={app.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-app-border! bg-app-surface p-4 text-sm transition hover:bg-app-surface-secondary"
            >
              <span className="min-w-0">
                <span className="block font-medium text-app-text">{app.name} dashboard</span>
                <span className="block text-xs text-app-text-muted">Billing, numbers and settings only {app.name} can change.</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-app-text-faint" />
            </a>
          )}
        </aside>
      </div>

      {integrations.dialogs}
    </div>
  );
}

export default IntegrationDetails;

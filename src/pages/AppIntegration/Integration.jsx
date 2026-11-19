import { AlertTriangle, ArrowRight, ChevronRight, Lock, Plug, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import IntegrationSkelton from "../../components/Skeltons/IntegrationSkelton";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import { EmptyState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { ROUTES, dashboardPath, integrationPath } from "../../routes/paths";
import { appState, headlineCheck, isConnectedState } from "./integrationHealth";
import { AppLogo, StatusPill } from "./IntegrationParts";
import { CATEGORIES, INTEGRATIONS } from "./integrationsData";
import { useIntegrations } from "./useIntegrations";
import ContactSupportButton from "../../components/SubscriptionLock/ContactSupportButton";

// One app. The whole card opens the app's page; the button in the footer
// connects it (or opens it, once connected) without leaving the list.
const IntegrationCard = ({ app, state, problem, busy, onConnect }) => (
  <article className="group relative flex flex-col rounded-2xl border border-app-border! bg-app-surface p-4 transition hover:-translate-y-0.5 hover:border-app-text-faint/40! hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <AppLogo app={app} />
      <StatusPill state={state} />
    </div>

    <h3 className="mt-3 text-sm font-semibold text-app-text">
      {/* stretched over the card, so the card itself is the link */}
      <Link to={integrationPath(app.slug)} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
        {app.name}
      </Link>
    </h3>
    <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-faint">{app.category}</p>
    <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-app-text-muted">{app.description}</p>

    {problem && (
      <p
        className={`mt-3 flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-xs leading-snug ${
          problem.status === "error"
            ? "bg-red-500/10 text-red-700 dark:text-red-400"
            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        }`}
      >
        <AlertTriangle className="mt-px size-3.5 shrink-0" />
        <span className="line-clamp-2">{problem.detail}</span>
      </p>
    )}

    <div className="mt-4 flex items-center justify-between gap-2 border-t border-app-border! pt-3">
      <span className="flex items-center gap-1 text-xs font-medium text-app-text-muted transition group-hover:text-app-text">
        {isConnectedState(state) ? "Manage" : "Details"}
        <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
      </span>

      {/* above the stretched link */}
      <div className="relative z-10">
        {state === "available" ? (
          <Button size="sm" icon={Plug} onClick={onConnect} loading={busy}>
            Connect
          </Button>
        ) : state === "locked" ? (
          <ContactSupportButton size="sm" variant="secondary" icon={Lock}>
            Upgrade
          </ContactSupportButton>
        ) : isConnectedState(state) && app.openPage ? (
          <Link to={dashboardPath(app.openPage)}>
            <Button size="sm" variant="secondary">
              Open <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  </article>
);

const Summary = ({ label, value, tone }) => (
  <div className="min-w-0 rounded-xl border border-app-border! bg-app-surface px-3 py-3 sm:px-4">
    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-app-text-muted">{label}</p>
    <p className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${tone}`}>{value}</p>
  </div>
);

const Section = ({ title, count, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
      {title}
      <span className="rounded-full bg-app-surface-secondary px-2 py-0.5 text-[11px] tabular-nums">{count}</span>
    </h3>
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">{children}</div>
  </section>
);

function Integration() {
  const integrations = useIntegrations();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  if (!integrations.loaded) return <IntegrationSkelton />;

  const states = Object.fromEntries(INTEGRATIONS.map((app) => [app.id, appState(app, integrations)]));
  const problems = INTEGRATIONS.map((app) => ({
    app,
    check: headlineCheck(integrations.health[app.id]?.checks),
  })).filter((p) => p.check && isConnectedState(states[p.app.id]));

  const connectedCount = INTEGRATIONS.filter((app) => isConnectedState(states[app.id])).length;
  const availableCount = INTEGRATIONS.filter((app) => states[app.id] === "available").length;

  const term = search.trim().toLowerCase();
  const searched = INTEGRATIONS.filter(
    (app) => !term || `${app.name} ${app.description} ${app.category}`.toLowerCase().includes(term),
  );
  const shown = searched.filter((app) => category === "All" || app.category === category);
  const connected = shown.filter((app) => isConnectedState(states[app.id]));
  const others = shown.filter((app) => !isConnectedState(states[app.id]));

  const tabs = CATEGORIES.map((c) => ({
    value: c,
    label: `${c} (${c === "All" ? searched.length : searched.filter((a) => a.category === c).length})`,
  }));

  const card = (app) => (
    <IntegrationCard
      key={app.id}
      app={app}
      state={states[app.id]}
      problem={headlineCheck(integrations.health[app.id]?.checks)}
      busy={integrations.busyId === app.id}
      onConnect={() => integrations.connect(app)}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-app-text">Integrations</h2>
        <p className="mt-0.5 text-sm text-app-text-muted">
          Connect the apps you already use. Open one to see its setup and whether it is working.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Summary label="Connected" value={connectedCount} tone="text-emerald-600 dark:text-emerald-400" />
        <Summary
          label="Need attention"
          value={problems.length}
          tone={problems.length ? "text-amber-600 dark:text-amber-400" : "text-app-text"}
        />
        <Summary label="Available" value={availableCount} tone="text-app-text" />
      </div>

      {problems.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-amber-500/30! bg-amber-500/6">
          <p className="flex items-center gap-2 px-4 pt-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4" />
            {problems.length === 1 ? "1 integration needs attention" : `${problems.length} integrations need attention`}
          </p>
          <ul className="divide-y divide-amber-500/15! px-1 py-1">
            {problems.map(({ app, check }) => (
              <li key={app.id}>
                <Link
                  to={integrationPath(app.slug)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-amber-500/10"
                >
                  <span className="[&>span]:size-8 [&_svg]:size-4">
                    <AppLogo app={app} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-app-text">{app.name}</span>
                    <span className="block text-xs text-app-text-muted sm:truncate">{check.detail}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs font-medium text-amber-700 sm:inline dark:text-amber-400">
                    Fix it
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-app-text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
          <Tabs tabs={tabs} value={category} onChange={setCategory} className="w-max" />
        </div>
        <div className="relative lg:w-72">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps"
            className="pl-9"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Search} title="No apps match" description="Try another name or category." />
      ) : (
        <div className="space-y-8">
          {connected.length > 0 && (
            <Section title="Connected" count={connected.length}>
              {connected.map(card)}
            </Section>
          )}
          {others.length > 0 && (
            <Section title={connected.length ? "More apps" : "Apps"} count={others.length}>
              {others.map(card)}
            </Section>
          )}
        </div>
      )}

      {integrations.dialogs}
    </div>
  );
}

export default Integration;

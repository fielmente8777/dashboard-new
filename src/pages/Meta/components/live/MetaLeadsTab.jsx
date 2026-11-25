import { ArrowRight, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import { EmptyState } from "../../../../components/ui/States";
import { dashboardPath, PAGES } from "../../../../routes/paths";
import { cost, count, enquiries, money } from "./metaFormat";

const OPEN = new Set(["open", "new", "pending", "fresh"]);

// From ad to booking: what Meta counted, what reached Eazotel, what the team followed up and won.
const Funnel = ({ steps }) => {
  const top = Math.max(1, ...steps.map((s) => s.value || 0));
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.label} className="rounded-xl border border-app-border! bg-app-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
            {index + 1}. {step.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-app-text">{step.value == null ? "—" : count(step.value)}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${((step.value || 0) / top) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-app-text-muted">{step.hint}</p>
        </li>
      ))}
    </ol>
  );
};

const MetaLeadsTab = ({ data }) => {
  const navigate = useNavigate();
  const { ads, leads } = data.snapshot;
  const currency = ads?.currency || "INR";

  if (!leads) {
    return (
      <Card>
        <EmptyState
          icon={Inbox}
          title="Leads could not be counted"
          description="Try Refresh. If it keeps happening, the Meta lead form may not be connected in Integrations."
        />
      </Card>
    );
  }

  const open = leads.byStatus.filter((s) => OPEN.has(s.status.toLowerCase())).reduce((n, s) => n + s.count, 0);
  const won = leads.converted ?? leads.byStatus.find((s) => s.status === "Converted")?.count ?? 0;
  const spendOf = new Map((ads?.campaigns || []).map((c) => [c.name, c.metrics.spend]));

  const steps = [
    {
      label: "Enquiries from ads",
      value: ads ? enquiries(ads.totals) : null,
      hint: ads ? `${count(ads.totals.conversations)} chats + ${count(ads.totals.leads)} form leads (Meta's count)` : "No ads in these dates",
    },
    { label: "Form leads in Eazotel", value: leads.total, hint: "Saved from your Facebook lead forms" },
    { label: "Followed up", value: leads.total - open, hint: open ? `${count(open)} still marked new` : "Every lead was picked up" },
    {
      label: "Won",
      value: won,
      hint: leads.total ? `${Math.round((won / leads.total) * 100)}% of form leads became bookings` : "Mark leads converted when they book",
    },
  ];

  const rows = leads.byCampaign.map((c) => {
    const spend = spendOf.get(c.name);
    return { ...c, spend };
  });
  const columns = [
    { key: "name", header: "Campaign", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "spend", header: "Spend", className: "text-right tabular-nums", render: (r) => (r.spend == null ? "—" : money(r.spend, currency)) },
    { key: "count", header: "Leads", className: "text-right tabular-nums", render: (r) => count(r.count) },
    { key: "converted", header: "Won", className: "text-right tabular-nums", render: (r) => (r.converted == null ? "—" : count(r.converted)) },
    {
      key: "cpl",
      header: "Cost per lead",
      className: "text-right tabular-nums",
      render: (r) => (r.spend && r.count ? cost(r.spend / r.count, currency) : "—"),
    },
    {
      key: "cpb",
      header: "Cost per booking",
      className: "text-right tabular-nums",
      render: (r) => (r.spend && r.converted ? cost(r.spend / r.converted, currency) : "—"),
    },
  ];

  return (
    <div className="space-y-4">
      <Funnel steps={steps} />

      <Card
        title="Leads by campaign"
        description="Spend is matched by campaign name; leads from older ads have no spend in these dates"
        actions={
          <Button size="sm" variant="secondary" icon={ArrowRight} onClick={() => navigate(dashboardPath(PAGES.LEADS_META))}>
            Open Meta leads
          </Button>
        }
      >
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.name} emptyMessage="No form leads in these dates." />
      </Card>

      {leads.byStatus.length > 0 && (
        <Card title="Where the leads are now" description="The stage your team set on each lead">
          <ul className="flex flex-wrap gap-2">
            {leads.byStatus.map((s) => (
              <li key={s.status} className="rounded-lg border border-app-border! px-3 py-2 text-sm">
                <span className="font-semibold tabular-nums text-app-text">{count(s.count)}</span>{" "}
                <span className="text-app-text-muted">{s.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default MetaLeadsTab;

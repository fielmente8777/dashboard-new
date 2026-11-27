import { CheckCircle2, Copy, ExternalLink, Link2, Megaphone } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import Icon from "../../../../components/ui/Icon";
import Segmented from "../../../../components/ui/Segmented";
import { EmptyState } from "../../../../components/ui/States";
import { useToast } from "../../../../context/ToastContext";
import CreativesGrid from "../CreativesGrid";
import BreakdownList from "./BreakdownList";
import { compact, cost, count, money, RANKING, resultText, STATUS_TONE } from "./metaFormat";

// What we suggest for Meta's "URL parameters" box: Meta fills the {{…}} parts per ad, so one
// line works for every ad of the hotel.
export const UTM_TEMPLATE =
  "utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}";

const ExternalName = ({ name, link, sub }) => (
  <div className="max-w-[18rem] min-w-0">
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex max-w-full items-center gap-1 font-medium text-app-text hover:text-blue-600 dark:hover:text-blue-400"
      title={name}
    >
      <span className="truncate">{name}</span>
      <Icon icon={ExternalLink} size="sm" className="opacity-0 transition group-hover:opacity-100" />
    </a>
    {sub && <p className="truncate text-xs text-app-text-muted">{sub}</p>}
  </div>
);

const Ranking = ({ value, label }) => {
  const r = RANKING[value] || RANKING.UNKNOWN;
  return value && value !== "UNKNOWN" ? (
    <span title={`${label}: ${r.label}`}>
      <Badge tone={r.tone}>{r.label}</Badge>
    </span>
  ) : (
    <span className="text-app-text-faint">—</span>
  );
};

const CampaignsCard = ({ ads }) => {
  const [show, setShow] = useState("spent");
  const currency = ads.currency;
  const rows = useMemo(
    () => ads.campaigns.filter((c) => (show === "active" ? c.status === "Active" : c.metrics.spend > 0)),
    [ads.campaigns, show],
  );
  const columns = [
    {
      key: "name",
      header: "Campaign",
      render: (c) => <ExternalName name={c.name} link={c.link} sub={c.objectiveLabel} />,
    },
    { key: "status", header: "Status", render: (c) => <Badge tone={STATUS_TONE[c.status] || "gray"}>{c.status}</Badge> },
    {
      key: "budget",
      header: "Budget",
      className: "text-right tabular-nums",
      render: (c) => (c.budget ? `${money(c.budget.amount, currency)}${c.budget.period === "day" ? " / day" : " total"}` : "—"),
    },
    { key: "spend", header: "Spend", className: "text-right tabular-nums", render: (c) => money(c.metrics.spend, currency) },
    { key: "result", header: "Result", render: (c) => <span className="text-sm">{resultText(c.result, currency)}</span> },
    { key: "reach", header: "Reach", className: "text-right tabular-nums", render: (c) => compact(c.metrics.reach) },
    { key: "ctr", header: "CTR", className: "text-right tabular-nums", render: (c) => `${(c.metrics.ctr || 0).toFixed(2)}%` },
    {
      key: "frequency",
      header: "Frequency",
      className: "text-right tabular-nums",
      render: (c) => (
        <span className={c.metrics.frequency >= 4 ? "font-medium text-amber-600 dark:text-amber-400" : ""}>
          {(c.metrics.frequency || 0).toFixed(1)}
        </span>
      ),
    },
    { key: "cpm", header: "Cost / 1K views", className: "text-right tabular-nums", render: (c) => cost(c.metrics.cpm, currency) },
  ];
  return (
    <Card
      title="Campaigns"
      description={`${count(ads.campaignCount)} campaign${ads.campaignCount === 1 ? "" : "s"} spent in these dates · names open Ads Manager`}
      actions={
        <Segmented
          label="Show"
          options={[
            { value: "spent", label: "Spent money" },
            { value: "active", label: "Running now" },
          ]}
          value={show}
          onChange={setShow}
        />
      }
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        emptyMessage={show === "active" ? "No campaign is running now." : "No campaign spent money in these dates."}
      />
    </Card>
  );
};

const AdsCard = ({ ads }) => {
  const currency = ads.currency;
  const columns = [
    { key: "name", header: "Ad", render: (a) => <ExternalName name={a.name} link={a.previewLink || a.link} sub={a.campaignName} /> },
    { key: "spend", header: "Spend", className: "text-right tabular-nums", render: (a) => money(a.metrics.spend, currency) },
    { key: "result", header: "Result", render: (a) => <span className="text-sm">{resultText(a.result, currency)}</span> },
    { key: "ctr", header: "CTR", className: "text-right tabular-nums", render: (a) => `${(a.metrics.ctr || 0).toFixed(2)}%` },
    { key: "quality", header: "Quality", render: (a) => <Ranking value={a.quality} label="Quality" /> },
    { key: "engagement", header: "Engagement", render: (a) => <Ranking value={a.engagement} label="Engagement rate" /> },
    { key: "conversion", header: "Conversion", render: (a) => <Ranking value={a.conversion} label="Conversion rate" /> },
  ];
  return (
    <Card
      title="Ads"
      description="Most spend first. Quality, engagement and conversion are Meta's own ratings against ads for the same people."
    >
      <DataTable columns={columns} rows={ads.ads} rowKey={(a) => a.id} emptyMessage="No ad spent money in these dates." />
    </Card>
  );
};

// Which website ads carry UTM tags, and the line to paste into the ones that don't.
const UtmCard = ({ health, anchorRef }) => {
  const { showToast } = useToast();
  const utm = health?.utm;
  const missing = utm ? utm.websiteAds - utm.withUtm : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UTM_TEMPLATE);
      showToast({ message: "Copied. Paste it into the ad's URL parameters in Meta.", type: "success" });
    } catch {
      showToast({ message: "Could not copy. Select the text and copy it yourself.", type: "error" });
    }
  };

  return (
    <div ref={anchorRef} className="scroll-mt-24">
      <Card
        title="UTM check"
        description="UTM tags tell your website (and Google Analytics) that a visitor or booking came from a Meta ad."
      >
        {!utm ? (
          <p className="text-sm text-app-text-muted">Meta did not let us check the ads this time. Try Refresh later.</p>
        ) : utm.websiteAds === 0 ? (
          <p className="text-sm text-app-text-muted">
            None of the ads running now sends people to a website (they open chats, forms or your page), so no UTM is
            needed.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm text-app-text">
              {missing === 0 ? (
                <>
                  <Icon icon={CheckCircle2} tone="success" /> All {count(utm.websiteAds)} website ads carry UTM tags.
                </>
              ) : (
                <>
                  <Icon icon={Link2} tone="warning" />
                  <span>
                    <span className="font-semibold">{count(missing)}</span> of {count(utm.websiteAds)} website ads have no UTM
                    tags.
                  </span>
                </>
              )}
            </p>

            {utm.missing.length > 0 && (
              <ul className="divide-y divide-app-border! rounded-lg border border-app-border!">
                {utm.missing.map((ad) => (
                  <li key={ad.adId} className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-app-text">{ad.name}</p>
                      <p className="truncate text-xs text-app-text-muted" title={ad.url}>
                        {ad.campaignName ? `${ad.campaignName} · ` : ""}
                        {ad.url}
                      </p>
                    </div>
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit in Meta <Icon icon={ExternalLink} size="sm" />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {missing > 0 && (
              <div className="rounded-lg bg-app-surface-secondary p-3">
                <p className="text-xs font-medium text-app-text-muted">
                  In Meta, open the ad › Tracking › URL parameters, and paste:
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 break-all rounded-md bg-app-surface px-2 py-1.5 text-xs text-app-text">
                    {UTM_TEMPLATE}
                  </code>
                  <Button size="sm" variant="secondary" icon={Copy} onClick={copy}>
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-xs text-app-text-muted">
                  Meta fills in the parts in {"{{ }}"} by itself: facebook / instagram, the campaign name and the ad name.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// Issues Meta reports on ads that should be running.
const IssuesCard = ({ health }) =>
  health?.issues?.length > 0 && (
    <Card title="Ads Meta is holding back" description="Rejected, with issues, or still in review">
      <ul className="divide-y divide-app-border!">
        {health.issues.map((issue) => (
          <li key={issue.adId} className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-app-text">
                <span className="truncate">{issue.name}</span>
                <Badge tone={STATUS_TONE[issue.status] || "amber"}>{issue.status}</Badge>
              </p>
              {issue.reason && <p className="text-xs text-app-text-muted">{issue.reason}</p>}
            </div>
            <a
              href={issue.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Open in Meta <Icon icon={ExternalLink} size="sm" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );

// Ads: campaigns, ads, where the money went (splits), ads Meta holds back, and the UTM check.
const MetaAdsTab = ({ data, utmRef, hid, range }) => {
  const ads = data.snapshot.ads;
  if (!ads) {
    return (
      <Card>
        <EmptyState
          icon={Megaphone}
          title="No ads in these dates"
          description="No ad account that advertises this page spent money in these dates. Pick other dates, or check Ad accounts under Reports › Monthly report."
        />
      </Card>
    );
  }
  const currency = ads.currency;
  return (
    <div className="space-y-4">
      <IssuesCard health={ads.health} />
      <CampaignsCard ads={ads} />
      <AdsCard ads={ads} />
      {hid && range && <CreativesGrid hid={hid} range={range} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownList title="Facebook or Instagram" description="Where the ads were shown" rows={ads.platforms} currency={currency} />
        <BreakdownList
          title="Placement"
          description="Feed, Stories, Reels …"
          rows={ads.placements || []}
          currency={currency}
        />
        <BreakdownList title="Age and gender" rows={ads.ageGender} currency={currency} limit={10} />
        <BreakdownList title="Region" description="Where the people who saw the ads live" rows={ads.regions} currency={currency} />
        <BreakdownList title="Device" rows={ads.devices || []} currency={currency} />
      </div>
      <UtmCard anchorRef={utmRef} health={ads.health} />
    </div>
  );
};

export default MetaAdsTab;

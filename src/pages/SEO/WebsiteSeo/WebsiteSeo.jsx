import { Award, ExternalLink, Globe, Hash, Lock, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import AddKeywordsDialog from "../../../components/Seo/AddKeywordsDialog";
import CreditsButton from "../../../components/Seo/CreditsButton";
import { fmt, fmtRank } from "../../../components/Seo/seoUtils";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import PageShell from "../../../components/ui/PageShell";
import SelectMenu from "../../../components/ui/SelectMenu";
import StatCard from "../../../components/ui/StatCard";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import RankingsOverview from "./components/RankingsOverview";
import WebsiteKeywordTable from "./components/WebsiteKeywordTable";
import WebsiteSetup from "./components/WebsiteSetup";
import { useWebsiteSeo } from "./hooks/useWebsiteSeo";
import { COUNTRIES, websiteHref } from "./websiteSeoUtils";

const LoadingLayout = () => (
  <>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-56" />
      <Skeleton className="h-56" />
    </div>
    <Skeleton className="h-64" />
  </>
);

// Where the property's website ranks in Google search, keyword by keyword.
const WebsiteSeo = () => {
  const seo = useWebsiteSeo();
  const { website, country, keywords, stats, busy, actions } = seo;
  const [adding, setAdding] = useState(false);
  const countryName = COUNTRIES.find((c) => c.value === country)?.label || country;

  const description = website ? (
    <span className="flex flex-wrap items-center gap-1.5">
      <Icon icon={Lock} size="xs" tone="faint" />
      Tracking
      <a
        href={websiteHref(website)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {website}
        <Icon icon={ExternalLink} size="xs" />
      </a>
      in Google {country === "WORLD" ? "worldwide" : countryName}
    </span>
  ) : (
    "Where your website ranks in Google search."
  );

  return (
    <PageShell
      title="Website SEO"
      description={description}
      actions={
        <>
          <CreditsButton />
          {website && (
            <>
              <SelectMenu
                label="Country to check rankings in"
                icon={Globe}
                options={COUNTRIES}
                value={country}
                onChange={actions.changeCountry}
                disabled={busy.savingCountry}
                className="w-44"
              />
              <Button icon={Plus} onClick={() => setAdding(true)}>
                Add keywords
              </Button>
            </>
          )}
        </>
      }
    >
      {seo.isLoading ? (
        <LoadingLayout />
      ) : seo.isError && !seo.data ? (
        <ErrorState message="Couldn't load your website rankings." onRetry={seo.refetch} />
      ) : !website ? (
        <WebsiteSetup onLock={actions.lockWebsite} saving={busy.lockingWebsite} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Hash} label="Keywords tracked" value={fmt(keywords.length)} />
            <StatCard icon={Award} label="In the top 3" value={fmt(stats.top3)} />
            <StatCard icon={Globe} label="On page 1" value={fmt(stats.page1)} />
            <StatCard icon={TrendingUp} label="Avg position" value={fmtRank(stats.avg)} />
          </div>

          {keywords.length > 0 && <RankingsOverview keywords={keywords} />}

          <WebsiteKeywordTable
            keywords={keywords}
            refreshCost={seo.costPerKeyword}
            refreshingKeyword={busy.refreshingKeyword}
            onAdd={() => setAdding(true)}
            onRefresh={actions.refresh}
            onUntrack={actions.untrack}
          />
        </>
      )}

      <AddKeywordsDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={actions.addKeywords}
        saving={busy.tracking}
        description={`Google search position of ${website || "your website"} is checked in ${countryName}.`}
        placeholder={"best hotel in jaipur\nluxury resort near me"}
        balance={seo.balance}
        costPerKeyword={seo.costPerKeyword}
      />
    </PageShell>
  );
};

export default WebsiteSeo;

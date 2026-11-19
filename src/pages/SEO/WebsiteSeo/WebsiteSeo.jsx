import { Award, ExternalLink, FileText, Globe, Hash, Lock, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import AddKeywordsDialog from "../../../components/Seo/AddKeywordsDialog";
import CreditsButton from "../../../components/Seo/CreditsButton";
import SeoOverview from "../../../components/Seo/SeoOverview";
import SeoShell, { MetaItem } from "../../../components/Seo/SeoShell";
import { countByBand, fmt, fmtRank } from "../../../components/Seo/seoUtils";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import SelectMenu from "../../../components/ui/SelectMenu";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import RankingsOverview from "./components/RankingsOverview";
import WebsiteKeywordTable from "./components/WebsiteKeywordTable";
import WebsiteSetup from "./components/WebsiteSetup";
import { useWebsiteSeo } from "./hooks/useWebsiteSeo";
import { COUNTRIES, NOT_RANKED, ORGANIC_BANDS, organicBand, websiteHref } from "./websiteSeoUtils";

const BANDS = [...ORGANIC_BANDS, NOT_RANKED];

const LoadingLayout = () => (
  <>
    <Skeleton className="h-72 rounded-2xl" />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
    <Skeleton className="h-64" />
  </>
);

const share = (count, total) => (total ? (count / total) * 100 : 0);

// Where the property's website ranks in Google search, keyword by keyword.
const WebsiteSeo = () => {
  const seo = useWebsiteSeo();
  const { website, country, keywords, stats, busy, actions } = seo;
  const [adding, setAdding] = useState(false);
  const countryName = COUNTRIES.find((c) => c.value === country)?.label || country;
  const total = keywords.length;

  const meta = website ? (
    <>
      <MetaItem icon={Lock}>
        <a
          href={websiteHref(website)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          <span className="truncate">{website}</span>
          <Icon icon={ExternalLink} size="xs" />
        </a>
      </MetaItem>
      <MetaItem icon={Globe}>
        Google {country === "WORLD" ? "worldwide" : countryName}
      </MetaItem>
    </>
  ) : (
    "Where your website ranks in Google search."
  );

  const kpis = [
    {
      icon: Hash,
      tone: "blue",
      label: "Keywords tracked",
      value: fmt(total),
      hint: `${fmt(stats.volume)} searches / month`,
    },
    {
      icon: Award,
      tone: "green",
      label: "In the top 3",
      value: fmt(stats.top3),
      meter: share(stats.top3, total),
      hint: `of ${fmt(total)} keywords`,
    },
    {
      icon: FileText,
      tone: "sky",
      label: "On page 1",
      value: fmt(stats.page1),
      meter: share(stats.page1, total),
      hint: "Positions 1 – 10",
    },
    {
      icon: TrendingUp,
      tone: "violet",
      label: "Avg position",
      value: fmtRank(stats.avg),
      hint: "Lower is better",
    },
  ];

  return (
    <SeoShell
      title="Website SEO"
      meta={meta}
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
          <SeoOverview
            score={share(stats.page1, total)}
            scoreTitle="Search visibility"
            scoreText={
              <>
                <span className="font-semibold text-app-text">{stats.page1}</span> of{" "}
                <span className="font-semibold text-app-text">{total}</span> tracked
                keywords rank on page 1 of Google.
              </>
            }
            kpis={kpis}
            bands={countByBand(keywords, BANDS, (k) => organicBand(k.liveOrganicRank))}
            bandsTitle="Google position distribution"
          />

          {total > 0 && <RankingsOverview keywords={keywords} />}

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
    </SeoShell>
  );
};

export default WebsiteSeo;

import { ImageOff, Search } from "lucide-react";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { EmptyState } from "../../../components/ui/States";
import { formatCurrency, formatNumber, formatPercent } from "../googleAdsUtils";

const texts = (items) =>
  (items || []).map((item) => item?.text || item).filter(Boolean);

const hostOf = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

// the ad's numbers for the date range, under its preview
const AdStats = ({ stats }) => (
  <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-app-border! pt-3 text-xs">
    {[
      ["Clicks", formatNumber(stats?.clicks)],
      ["CTR", formatPercent(stats?.ctr)],
      ["Spend", formatCurrency(stats?.cost)],
    ].map(([label, value]) => (
      <div key={label}>
        <dt className="text-app-text-muted">{label}</dt>
        <dd className="font-semibold tabular-nums text-app-text">{value}</dd>
      </div>
    ))}
  </dl>
);

// How a text ad looks on Google Search. Colours follow Google's own.
const AdPreview = ({ ad, stats, selected, onSelect }) => {
  const headlines = texts(ad.headlines);
  const descriptions = texts(ad.descriptions);
  const url = ad.finalUrls?.[0];

  if (!headlines.length) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-app-border! p-4 text-center">
        <Icon icon={ImageOff} tone="faint" size="xl" />
        <p className="text-xs text-app-text-muted">
          Preview not available for image / display ads.
        </p>
        <div className="w-full text-left"><AdStats stats={stats} /></div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(ad.adId)}
      className={`anim-lift cursor-pointer rounded-xl border bg-app-surface p-4 transition-colors hover:border-blue-500! ${
        selected ? "border-blue-500! ring-1 ring-blue-500/30" : "border-app-border!"
      }`}
    >
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="font-semibold text-app-text">Sponsored</span>
        <span className="truncate text-app-text-muted">
          {hostOf(url) || "your website"}
        </span>
        {ad.paused && (
          <span className="ml-auto shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-400">
            Paused
          </span>
        )}
      </div>
      <a
        href={url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="line-clamp-2 text-base font-medium leading-snug text-[#1a0dab] hover:underline dark:text-[#8ab4f8]"
      >
        {headlines.slice(0, 3).join(" | ")}
      </a>
      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-app-text-muted">
        {descriptions.slice(0, 2).join(" - ")}
      </p>
      <AdStats stats={stats} />
    </div>
  );
};

// The ads of the selected ad group as they appear on Google, each with its
// numbers. Clicking one narrows the page to that ad.
const AdPreviews = ({ ads, statsById, selectedAd, onSelect }) =>
  ads.length ? (
    <Card title="Ad previews" description="How your ads appear on Google Search · click one to see its numbers">
      <div className="anim-stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((ad, i) => (
          <AdPreview
            key={ad.adId || i}
            ad={ad}
            stats={statsById.get(String(ad.adId))}
            selected={String(ad.adId) === String(selectedAd)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </Card>
  ) : (
    <Card title="Ad previews">
      <EmptyState icon={Search} title="No ads in this ad group" />
    </Card>
  );

export default AdPreviews;

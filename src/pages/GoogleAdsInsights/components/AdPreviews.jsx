import { ImageOff, Search } from "lucide-react";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { EmptyState } from "../../../components/ui/States";

const texts = (items) =>
  (items || []).map((item) => item?.text || item).filter(Boolean);

const hostOf = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

// How a text ad looks on Google Search. Colours follow Google's own.
const AdPreview = ({ ad }) => {
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
      </div>
    );
  }

  return (
    <div className="anim-lift rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="font-semibold text-app-text">Sponsored</span>
        <span className="truncate text-app-text-muted">
          {hostOf(url) || "your website"}
        </span>
      </div>
      <a
        href={url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="line-clamp-2 text-base font-medium leading-snug text-[#1a0dab] hover:underline dark:text-[#8ab4f8]"
      >
        {headlines.slice(0, 3).join(" | ")}
      </a>
      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-app-text-muted">
        {descriptions.slice(0, 2).join(" - ")}
      </p>
    </div>
  );
};

const AdPreviews = ({ ads, adGroupPicked }) => (
  <Card title="Ad previews" description="How your ads appear on Google Search">
    {ads.length ? (
      <div className="anim-stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.slice(0, 6).map((ad, i) => (
          <AdPreview key={ad.adId || i} ad={ad} />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Search}
        title={
          adGroupPicked ? "No enabled ads in this ad group" : "Pick an ad group"
        }
        description={
          adGroupPicked
            ? undefined
            : "Choose a campaign and an ad group above to preview their ads."
        }
      />
    )}
  </Card>
);

export default AdPreviews;

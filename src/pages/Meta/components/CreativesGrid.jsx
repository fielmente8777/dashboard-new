import { Megaphone, MessageCircle, Wallet } from "lucide-react";
import { useState } from "react";
import MediaTile from "../../../components/media/MediaTile";
import MediaViewer from "../../../components/media/MediaViewer";
import { usePagedFeed } from "../../../components/media/usePagedFeed";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetCreativePreviewQuery, useLazyGetMetaCreativesQuery } from "../../../redux/api/metaReportApi";
import { compact, cost, count, money } from "./live/metaFormat";

const FORMAT = { Video: "video", Image: "image", Carousel: "carousel" };

// The ad opened big: its video or Meta's ad preview is loaded only now (one or two Meta calls).
const CreativeViewer = ({ hid, ad, onClose }) => {
  const preview = useGetCreativePreviewQuery({ hid, adId: ad?.id }, { skip: !ad });
  if (!ad) return <MediaViewer view={null} onClose={onClose} />;
  const p = preview.data;
  const m = ad.metrics;
  const view = {
    title: ad.name,
    subtitle: `${ad.campaignName}${ad.format ? ` · ${ad.format}` : ""} · ${ad.status}`,
    loading: preview.isLoading,
    frame: p?.kind === "iframe" ? p.src : null,
    media:
      p?.kind === "video"
        ? [{ type: "video", url: p.src, poster: p.poster }]
        : p?.kind === "image" && p.src
          ? [{ type: "image", url: p.src }]
          : ad.thumbnail
            ? [{ type: "image", url: ad.thumbnail }]
            : [],
    stats: [
      { label: "Spend", value: money(m.spend) },
      { label: "Result", value: `${count(ad.result.count)} ${ad.result.label}` },
      { label: "Cost per result", value: ad.result.costPer == null ? null : `${cost(ad.result.costPer)}${ad.result.per === 1000 ? " / 1K" : ""}` },
      { label: "Impressions", value: count(m.impressions) },
      { label: "Reach", value: count(m.reach) },
      { label: "Frequency", value: m.frequency ? m.frequency.toFixed(2) : null },
      { label: "Clicks", value: count(m.clicks) },
      { label: "CTR", value: `${(m.ctr || 0).toFixed(2)}%` },
      { label: "Quality", value: ad.quality === "—" ? null : ad.quality },
    ],
    note: preview.isError ? "The ad could not be loaded from Meta; open the preview link instead." : null,
    links: [
      ...(ad.previewLink || p?.previewLink ? [{ label: "Ad preview link", url: ad.previewLink || p.previewLink }] : []),
      { label: "Ads Manager", url: ad.adsManager },
    ],
  };
  return <MediaViewer view={view} onClose={onClose} />;
};

// The ads that spent in the dates as equal squares, most spend first, 12 at a time.
// A tap plays the ad (its video, or Meta's own preview of it).
const CreativesGrid = ({ hid, range }) => {
  const [trigger] = useLazyGetMetaCreativesQuery();
  const feed = usePagedFeed(trigger, { hid, since: range.start, until: range.end }, `${hid}:${range.start}:${range.end}`, !hid);
  const [open, setOpen] = useState(null);

  return (
    <Card title="Ad creatives" description="The ads that spent in these dates, most spend first. Tap one to watch it.">
      {feed.loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : feed.error && feed.items.length === 0 ? (
        <ErrorState message={getApiErrorMessage(feed.error, "Could not load the ads.")} onRetry={feed.reload} />
      ) : feed.items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No ads spent in these dates" description={feed.note || "Pick other dates."} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {feed.items.map((ad) => (
              <div key={ad.id} className="min-w-0">
                <MediaTile
                  thumbnail={ad.thumbnail}
                  format={FORMAT[ad.format] || "image"}
                  caption={ad.name}
                  label={ad.status}
                  onClick={() => setOpen(ad)}
                  stats={[
                    { icon: Wallet, value: money(ad.metrics.spend), title: "Spend" },
                    { icon: MessageCircle, value: `${compact(ad.result.count)} ${ad.result.label}`, title: "Result" },
                  ]}
                />
                <p className="mt-1.5 truncate text-xs font-medium text-app-text" title={ad.name}>
                  {ad.name}
                </p>
                <p className="truncate text-[11px] text-app-text-muted" title={ad.campaignName}>
                  {ad.campaignName}
                </p>
              </div>
            ))}
          </div>
          {/* a failed "Load more" keeps what is already shown */}
          {feed.error && (
            <p className="mt-4 text-center text-sm text-red-500">
              {getApiErrorMessage(feed.error, "Could not load more.")}
            </p>
          )}
          {feed.hasMore && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" loading={feed.loadingMore} onClick={feed.loadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
      <CreativeViewer hid={hid} ad={open} onClose={() => setOpen(null)} />
    </Card>
  );
};

export default CreativesGrid;

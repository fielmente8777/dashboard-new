import { Eye, Heart, Images, MessageCircle, Repeat2 } from "lucide-react";
import { useState } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import MediaTile from "../../../components/media/MediaTile";
import MediaViewer from "../../../components/media/MediaViewer";
import { usePagedFeed } from "../../../components/media/usePagedFeed";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Segmented from "../../../components/ui/Segmented";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useLazyGetMetaPostsQuery } from "../../../redux/api/metaReportApi";

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const nf = new Intl.NumberFormat("en-IN");
const short = (n) => (n == null ? null : compact.format(n));
const full = (n) => (n == null ? null : nf.format(n));
const day = (iso) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const FORMAT_NAME = { reel: "Reel", video: "Video", carousel: "Carousel", image: "Photo", text: "Text post" };

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
];

const toView = (post) => ({
  title: `${FORMAT_NAME[post.format] || "Post"} · ${day(post.createdAt)}`,
  subtitle: post.platform === "instagram" ? "Instagram" : "Facebook page",
  caption: post.caption,
  media: post.media,
  stats: [
    { label: post.platform === "instagram" ? "Likes" : "Reactions", value: full(post.stats.likes) },
    { label: "Comments", value: full(post.stats.comments) },
    { label: "Shares", value: full(post.stats.shares) },
    { label: "Views", value: full(post.stats.views) },
    { label: "Reach", value: full(post.stats.reach) },
    ...(post.platform === "instagram" ? [{ label: "Saves", value: full(post.stats.saves) }] : []),
  ],
  links: post.permalink ? [{ label: post.platform === "instagram" ? "Open on Instagram" : "Open on Facebook", url: post.permalink }] : [],
});

// The page's / Instagram's posts as a grid of equal squares (like Instagram's profile),
// newest first, 12 at a time with "Load more". A tap opens the post: reels and videos play.
const PostsGrid = ({ hid }) => {
  const [platform, setPlatform] = useState("facebook");
  const [trigger] = useLazyGetMetaPostsQuery();
  const feed = usePagedFeed(trigger, { hid, platform }, `${hid}:${platform}`, !hid);
  const [open, setOpen] = useState(null);

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {platform === "instagram" ? <FaInstagram className="text-[#E1306C]" /> : <FaFacebook className="text-[#1877F2]" />}
          Posts
        </span>
      }
      description="Newest first. Tap a post to see it big; reels and videos play here."
      actions={<Segmented label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />}
    >
      {feed.loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : feed.error && feed.items.length === 0 ? (
        <ErrorState message={getApiErrorMessage(feed.error, "Could not load the posts.")} onRetry={feed.reload} />
      ) : feed.items.length === 0 ? (
        <EmptyState icon={Images} title="No posts" description={feed.note || "Posts published on this account show up here."} />
      ) : (
        <>
          {feed.note && <p className="mb-3 rounded-lg bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">{feed.note}</p>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {feed.items.map((post) => (
              <div key={post.id} className="min-w-0">
                <MediaTile
                  thumbnail={post.thumbnail}
                  format={post.format}
                  caption={post.caption}
                  onClick={() => setOpen(post)}
                  stats={[
                    { icon: Heart, value: short(post.stats.likes) ?? "—", title: "Likes / reactions" },
                    { icon: MessageCircle, value: short(post.stats.comments) ?? "—", title: "Comments" },
                    ...(post.stats.shares != null ? [{ icon: Repeat2, value: short(post.stats.shares), title: "Shares" }] : []),
                    ...(post.stats.views != null ? [{ icon: Eye, value: short(post.stats.views), title: "Views" }] : []),
                  ]}
                />
                <p className="mt-1.5 line-clamp-1 text-xs text-app-text-muted" title={post.caption}>
                  {day(post.createdAt)}
                  {post.caption ? ` · ${post.caption}` : ""}
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
      <MediaViewer view={open ? toView(open) : null} onClose={() => setOpen(null)} />
    </Card>
  );
};

export default PostsGrid;

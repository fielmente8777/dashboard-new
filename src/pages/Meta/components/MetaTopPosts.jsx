import { ExternalLink, FileText, Heart, ImageOff, MessageCircle, Repeat2, Users } from "lucide-react";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { EmptyState } from "../../../components/ui/States";
import { formatDateTime } from "../../../utils/formateDate";

const nf = new Intl.NumberFormat("en-IN");
const count = (n) => nf.format(Number(n) || 0);

const Stat = ({ icon, label, value }) => (
  <div className="flex items-center gap-1.5" title={label}>
    <Icon icon={icon} size="sm" tone="faint" />
    <span className="font-medium tabular-nums text-app-text">{count(value)}</span>
  </div>
);

// One post: picture, caption, when, and how it did.
const PostCard = ({ post, rank }) => {
  // gian sends these as numbers; Meta's raw shape is { summary: { total_count } } / { count }
  const amount = (v) => (typeof v === "number" ? v : v?.summary?.total_count ?? v?.count ?? 0);
  const reactions = amount(post.reactions ?? post.likes);
  const comments = amount(post.comments);
  const shares = amount(post.shares);
  const rate = post.reach ? (post.engagement / post.reach) * 100 : null;

  return (
    <article className="anim-lift flex min-w-0 flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="relative aspect-[16/9] bg-app-surface-secondary">
        {post.full_picture ? (
          <img src={post.full_picture} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-app-text-faint">
            <Icon icon={ImageOff} size="xl" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
          #{rank}
        </span>
        {rate != null && (
          <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {rate.toFixed(1)}% engaged
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm text-app-text">{post.message || "No caption"}</p>
          <p className="mt-1 text-xs text-app-text-muted">{formatDateTime(post.created_time)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-app-border! pt-3 text-xs">
          <Stat icon={Heart} label="Reactions" value={reactions} />
          <Stat icon={MessageCircle} label="Comments" value={comments} />
          <Stat icon={Repeat2} label="Shares" value={shares} />
          <Stat icon={Users} label="Reach" value={post.reach} />
          {post.permalink_url && (
            <a
              href={post.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Open <Icon icon={ExternalLink} size="sm" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

// The page's posts in the period, most engagement first.
const MetaTopPosts = ({ posts = [] }) => {
  const ranked = [...posts].sort((a, b) => (b.engagement || 0) - (a.engagement || 0));

  return (
    <Card
      title="Top posts"
      description={ranked.length ? "Posts from this period, most engagement first" : undefined}
    >
      {ranked.length ? (
        <div className="anim-stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranked.slice(0, 9).map((post, i) => (
            <PostCard key={post.id} post={post} rank={i + 1} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No posts in this period"
          description="Posts you publish on the page show up here with their reach and engagement."
        />
      )}
    </Card>
  );
};

export default MetaTopPosts;

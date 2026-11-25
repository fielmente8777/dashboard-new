import { ExternalLink, Heart, Lock, MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import { Skeleton } from "../../../../components/ui/States";
import { compact, count } from "./metaFormat";


// The property's Instagram for the same dates: followers and what was posted (the posts
// themselves are in the Posts grid).
// `instagram` comes from the live snapshot; null = not linked to the Facebook page.
const InstagramCard = ({ instagram, loading, error }) => {
  if (loading) return <Skeleton className="h-64" />;
  if (error) return null;

  if (!instagram) {
    return (
      <Card title="Instagram" description="Not linked">
        <p className="text-sm text-app-text-muted">
          No Instagram business account is linked to this Facebook page. Link it in the Instagram app (Settings › Account
          type and tools), then reconnect Meta in Integrations.
        </p>
      </Card>
    );
  }

  const a = instagram.account || {};
  const stats = [
    { label: "Followers", value: compact(a.followers) },
    { label: "Posts in these dates", value: count(instagram.published?.total) },
    { label: "Likes", value: compact(instagram.likes) },
    { label: "Comments", value: compact(instagram.comments) },
  ];

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <FaInstagram className="text-[#E1306C]" /> Instagram {a.username ? `@${a.username}` : ""}
        </span>
      }
      description={`${count(instagram.published?.reels)} reels · ${count(instagram.published?.posts)} posts · ${count(instagram.published?.carousels)} carousels`}
      actions={
        a.link && (
          <a
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Open Instagram <Icon icon={ExternalLink} size="sm" />
          </a>
        )
      }
    >
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-app-surface-secondary px-3 py-2">
            <dt className="text-xs text-app-text-muted">{s.label}</dt>
            <dd className="text-lg font-semibold tabular-nums text-app-text">{s.value}</dd>
          </div>
        ))}
      </dl>

      {!instagram.insightsAllowed && (
        <p className="mt-3 flex items-start gap-2 text-xs text-app-text-muted">
          <Icon icon={Lock} size="sm" className="mt-0.5" />
          Views, reach, saves and shares come once Meta approves the Instagram insights permission for Eazotel.
        </p>
      )}

    </Card>
  );
};

export default InstagramCard;

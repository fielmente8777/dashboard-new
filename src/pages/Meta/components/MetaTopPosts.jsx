import { Heart, ImageOff, MessageCircle } from "lucide-react";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { formatDateTime } from "../../../utils/formateDate";
import Icon from "../../../components/ui/Icon";

const numberClassName = "text-right tabular-nums";

const count = (value) => (value ?? 0).toLocaleString();

const COLUMNS = [
  {
    key: "post",
    header: "Post",
    render: (post) => (
      <div className="flex w-80 items-center gap-3">
        {post.full_picture ? (
          <img
            src={post.full_picture}
            alt=""
            loading="lazy"
            className="size-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary text-app-text-faint">
            <Icon icon={ImageOff} size="lg" />
          </div>
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 whitespace-normal text-sm font-medium">
            {post.message || "No caption"}
          </p>
          <p className="mt-0.5 text-xs text-app-text-muted">
            {formatDateTime(post.created_time)}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "reactions",
    header: "Reactions",
    className: numberClassName,
    render: (post) => (
      <span className="inline-flex items-center gap-1.5">
        <Icon icon={Heart} size="sm" className="text-red-500" />
        {count(post.likes?.summary?.total_count)}
      </span>
    ),
  },
  {
    key: "comments",
    header: "Comments",
    className: numberClassName,
    render: (post) => (
      <span className="inline-flex items-center gap-1.5">
        <Icon icon={MessageCircle} size="sm" className="text-app-text-muted" />
        {count(post.comments?.summary?.total_count)}
      </span>
    ),
  },
  {
    key: "reach",
    header: "Reach",
    className: numberClassName,
    render: (post) => count(post.reach),
  },
  {
    key: "engagement",
    header: "Engagement",
    className: `${numberClassName} font-semibold`,
    render: (post) => count(post.engagement),
  },
];

const MetaTopPosts = ({ posts = [], loading }) => (
  <Card title="Top posts" description="Best performing posts in this period">
    <DataTable
      columns={COLUMNS}
      rows={posts}
      rowKey={(post) => post.id}
      loading={loading}
      emptyMessage="No posts found for this period."
    />
  </Card>
);

export default MetaTopPosts;

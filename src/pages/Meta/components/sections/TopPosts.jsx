import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { formatDateTime } from "../../../../utils/formateDate";

const TopPosts = ({ data = [] }) => {
  const posts = data.map((post) => {
    const reactions = post?.likes?.summary?.total_count || 0;
    const comments = post?.comments?.summary?.total_count || 0;

    return {
      ...post,
      reactions,
      comments,
    };
  });

  if (!posts?.length) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Top Posts</h1>
        <p className="text-gray-600">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold">Top Posts</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-sm font-medium">Post</th>

              <th className="text-center px-4 py-3 text-sm font-medium">
                Reactions
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium">
                Comments
              </th>

              <th className="text-center px-4 py-3 text-sm font-medium">
                Reach
              </th>

              <th className="text-center px-4 py-3 text-sm font-medium">
                Engagement
              </th>
            </tr>
          </thead>

          <tbody>
            {posts?.map((post) => (
              <tr
                key={post.id}
                className="border-b border-border hover:bg-muted/30 transition"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-88">
                    <img
                      src={post.full_picture}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />

                    <div>
                      <p className="line-clamp-2 text-sm font-medium">
                        {post.message || "No caption"}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(post.created_time)}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="text-center px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <Heart size={14} color="red" />
                    {post.reactions}
                  </div>
                </td>

                <td className="text-center px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <MessageCircle size={14} />
                    {post.comments}
                  </div>
                </td>

                <td className="text-center px-4 py-4 text-sm">
                  {post.reach.toLocaleString()}
                </td>

                <td className="text-center px-4 py-4 font-semibold">
                  {post.engagement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPosts;

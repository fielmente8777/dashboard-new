const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-app-surface-secondary rounded ${className}`} />
);

export const MessageSkeleton = ({ align = "left" }) => (
  <div
    className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}
  >
    <Skeleton
      className={`h-10 w-55 rounded-t-lg ${
        align === "right" ? "rounded-l-lg" : "rounded-r-lg"
      }`}
    />
  </div>
);

const WhatesAppChatSkeleton = () => {
  return (
    <div className="flex h-screen bg-app-surface-secondary">
      {/* LEFT SIDEBAR */}
      <div className="w-[320px] bg-app-surface border-r">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b">
            {/* Avatar */}
            <Skeleton className="w-10 h-10 rounded-full" />

            {/* Name + phone */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>

            {/* Date */}
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div className="flex flex-col flex-1 bg-app-surface">
        {/* Header */}
        <div className="h-14 bg-green-600 flex items-center px-4 gap-3">
          <Skeleton className="w-8 h-8 rounded-full bg-green-500" />
          <Skeleton className="h-4 w-40 bg-green-500" />
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-hidden text-app-text dark:text-app-text-muted">
          <MessageSkeleton align="left" />
          <MessageSkeleton align="right" />
          <MessageSkeleton align="left" />
          <MessageSkeleton align="right" />
          <MessageSkeleton align="left" />
        </div>

        {/* Input */}
        <div className="p-4 bg-app-surface-secondary border-t flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
};

export default WhatesAppChatSkeleton;

import { Skeleton } from "../../../../components/ui/States";

// widths of the placeholder bubbles; `mine` ones sit on the right
const BUBBLES = [
  { width: "w-2/5", height: "h-14" },
  { width: "w-1/3", height: "h-10", mine: true },
  { width: "w-1/2", height: "h-20" },
  { width: "w-2/5", height: "h-12", mine: true },
  { width: "w-1/4", height: "h-10" },
];

const RowSkeleton = () => (
  <div className="flex items-center gap-3 border-b border-app-border! px-3 py-3">
    <Skeleton className="size-10 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex justify-between gap-6">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

// The chat page while it loads: the same three panes as the real page (list,
// chat, guest details), so nothing jumps when the conversations arrive.
const ChatSkeleton = () => (
  <div
    role="status"
    aria-label="Loading conversations"
    className="flex h-[calc(100dvh-8vh)] bg-app-surface"
  >
    <div className="flex w-full shrink-0 flex-col border-app-border! lg:w-80 lg:border-r xl:w-96">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! px-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="size-9 shrink-0" />
      </div>
      <div className="flex shrink-0 gap-2 border-b border-app-border! p-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {Array.from({ length: 9 }, (_, index) => (
          <RowSkeleton key={index} />
        ))}
      </div>
    </div>

    <div className="hidden min-w-0 flex-1 flex-col lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-app-border! px-5">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="chat-backdrop min-h-0 flex-1 space-y-4 overflow-hidden px-6 py-4">
        {BUBBLES.map((bubble, index) => (
          <Skeleton
            key={index}
            className={`rounded-2xl ${bubble.width} ${bubble.height} ${bubble.mine ? "ml-auto" : ""}`}
          />
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-app-border! bg-app-surface-secondary px-5 py-3">
        <Skeleton className="h-10 flex-1 rounded-2xl bg-app-surface!" />
        <Skeleton className="size-10 shrink-0 rounded-full bg-app-surface!" />
      </div>
    </div>

    <div className="hidden w-80 shrink-0 flex-col items-center gap-3 border-l border-app-border! px-4 py-6 xl:flex">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-6 h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

export default ChatSkeleton;

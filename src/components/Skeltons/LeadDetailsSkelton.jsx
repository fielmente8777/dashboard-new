import { Skeleton } from "../ui/States";

const CardSkeleton = ({ rows = 4 }) => (
  <div className="space-y-4 rounded-xl border border-app-border! bg-app-surface p-4 sm:p-5">
    <Skeleton className="h-4 w-36" />
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  </div>
);

// Placeholder in the shape of Lead details / Call details: the title and
// actions, the follow-up bar, and the two columns of cards.
export const LeadDetailsSkeleton = () => (
  <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-40" />
      </div>
    </div>

    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="grid items-start gap-5 md:grid-cols-2">
      <div className="space-y-5">
        <CardSkeleton rows={6} />
        <CardSkeleton rows={2} />
      </div>
      <div className="space-y-5">
        <CardSkeleton rows={2} />
        <div className="space-y-3 rounded-xl border border-app-border! bg-app-surface p-4 sm:p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  </div>
);

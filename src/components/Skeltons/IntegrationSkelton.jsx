import { Skeleton } from "../ui/States";

// Placeholder in the shape of Settings > Integration.
const IntegrationSkelton = () => (
  <div className="space-y-5 p-1">
    <div className="flex items-end justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-6 w-28" />
    </div>
    <div className="flex flex-col gap-3 lg:flex-row">
      <Skeleton className="h-9 lg:w-72" />
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-app-border! bg-app-surface p-4">
          <Skeleton className="size-11" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export default IntegrationSkelton;

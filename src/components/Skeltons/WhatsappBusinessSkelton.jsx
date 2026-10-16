import { Skeleton } from "../ui/States";

const CardSkeleton = ({ lines = 4 }) => (
  <div className="space-y-3 rounded-xl border border-app-border! bg-app-surface p-4 sm:p-5">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-3 w-64 max-w-full" />
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={`h-3.5 ${i % 2 ? "w-3/5" : "w-4/5"}`} />
    ))}
  </div>
);

// Placeholder in the shape of Settings > WhatsApp (menu + overview).
const WhatsappBusinessSkelton = () => (
  <div className="flex h-full min-h-0 flex-col md:flex-row">
    <div className="flex shrink-0 gap-1 border-b border-app-border! px-3 py-2 md:w-60 md:flex-col md:border-b-0 md:border-r md:px-2 md:py-3">
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} className="h-8 w-24 shrink-0 md:w-full" />
      ))}
    </div>
    <div className="grid flex-1 content-start gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:grid-cols-2">
      <div className="space-y-4">
        <CardSkeleton lines={5} />
        <CardSkeleton lines={3} />
      </div>
      <CardSkeleton lines={7} />
      <div className="lg:col-span-2">
        <CardSkeleton lines={4} />
      </div>
    </div>
  </div>
);

export default WhatsappBusinessSkelton;

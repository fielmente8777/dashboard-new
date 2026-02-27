const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const LeadDetailsSkeleton = () => {
  return (
    <div className="space-y-6 w-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Lead Header */}
      <div className="bg-white p-6 rounded-lg space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white p-6 rounded-lg space-y-6">
          <Skeleton className="h-5 w-48" />

          {/* Field rows */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}

          {/* Dropdown */}
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Notes Card */}
        <div className="bg-white p-6 rounded-lg space-y-6">
          <Skeleton className="h-5 w-48" />

          {/* Field rows */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}

          {/* Dropdown */}
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
};

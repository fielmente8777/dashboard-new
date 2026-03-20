import React from "react";

const IntegrationSkelton = () => {
  const skeletonItems = Array.from({ length: 8 }); // number of placeholder cards

  return (
    <div className="p-6">
      {/* Title Skeleton */}
      <div className="mb-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-1"></div>
        <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="mb-4">
        <div className="h-10 w-full max-w-md bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex space-x-4 mb-6">
        {["All", "Communication", "Analytics", "Productivity", "Storage"].map(
          (_, idx) => (
            <div
              key={idx}
              className="h-8 w-24 bg-gray-200 rounded animate-pulse"
            ></div>
          ),
        )}
      </div>

      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skeletonItems.map((_, idx) => (
          <div
            key={idx}
            className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white animate-pulse"
          >
            <div className="h-10 w-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded mb-4 w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationSkelton;

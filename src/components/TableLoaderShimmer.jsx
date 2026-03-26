import React from "react";

const TableLoaderShimmer = () => {
  return (
    <div className="animate-pulse p-6">
      {/* Header skeleton */}
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>

      {/* Table skeleton */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 border-b border-gray-100 pb-3"
          >
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="flex-1 grid grid-cols-6 gap-3">
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableLoaderShimmer;

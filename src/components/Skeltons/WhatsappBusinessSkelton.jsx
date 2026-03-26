const WhatsappBusinessSkelton = () => {
  return (
    <div className="w-full space-y-6 p-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
};

export default WhatsappBusinessSkelton;

const SkeletonCard = () => (
  <div className="w-full border border-gray-200 rounded-lg bg-white p-6 animate-pulse space-y-4">
    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
    <div className="h-6 bg-gray-300 rounded w-2/5"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div className="h-8 bg-gray-300 rounded"></div>
      <div className="h-8 bg-gray-300 rounded"></div>
      <div className="h-8 bg-gray-300 rounded"></div>
    </div>
  </div>
);

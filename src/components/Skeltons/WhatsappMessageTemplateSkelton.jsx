const WhatsappMessageTemplateSkelton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-64 rounded bg-gray-200" />
        <div className="h-10 w-40 rounded bg-gray-200" />
      </div>

      {/* Table container */}
      <div className="overflow-hidden rounded-lg border bg-white">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 border-b bg-gray-50 px-4 py-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>

        {/* Table rows */}
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-5 gap-4 border-b px-4 py-4 last:border-b-0"
          >
            {/* Name */}
            <div className="h-4 w-40 rounded bg-gray-200" />

            {/* Category */}
            <div className="h-4 w-28 rounded bg-gray-200" />

            {/* Language */}
            <div className="h-4 w-10 rounded bg-gray-200" />

            {/* Status pill */}
            <div className="h-6 w-24 rounded-full bg-gray-200" />

            {/* Action icon */}
            <div className="flex justify-end">
              <div className="h-8 w-8 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsappMessageTemplateSkelton;

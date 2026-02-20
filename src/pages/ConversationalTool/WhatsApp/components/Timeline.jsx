export default function Timeline({ items }) {
  if (!items?.length) {
    return (
      <p className="text-xs text-gray-400 text-center py-6">
        No notes added yet
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          {/* Dot */}
          <div className="w-3 h-3 mt-1 rounded-full bg-teal-500"></div>

          {/* Content */}
          <div>
            <p className="text-sm text-gray-800">{item.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

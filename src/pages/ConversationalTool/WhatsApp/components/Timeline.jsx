import { IoIosClose } from "react-icons/io";

export default function Timeline({ items, onEdit, onDelete }) {
  console.log(items);
  if (!items?.length) {
    return (
      <p className="text-xs text-gray-400 dark:text-app-text-faint text-center py-6">
        No notes added yet
      </p>
    );
  }

  return (
    <div className="space-y-2 relative">
      {items?.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 justify-between items-start bg-gray-100 dark:bg-app-surface border border-transparent dark:border-app-border p-2 rounded-lg"
        >
          <div className="flex gap-2 min-w-0 flex-1">
            {/* Dot */}
            <div className="w-3 h-3 mt-1.5 shrink-0 rounded-full bg-teal-500"></div>

            {/* Content */}
            <div className="min-w-0">
              <p className="text-xs font-bold capitalize text-gray-600 dark:text-app-text-muted">
                {item?.activitySource || ""}
              </p>
              <p className="text-sm text-gray-800 dark:text-app-text break-words">
                {item?.message}
              </p>
              <p className="text-xs text-gray-400 dark:text-app-text-faint mt-1">
                {new Date(item?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex shrink-0 items-center gap-2 bg-gray-200 dark:bg-app-surface-secondary px-2 py-1.5 rounded-full">
            <button
              onClick={() => onEdit(item, index)}
              className="text-xs font-semibold text-primary dark:text-app-text hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(item, index)}
              aria-label="Delete note"
              className="size-6 bg-red-500 hover:bg-red-600 rounded-full flex justify-center items-center cursor-pointer transition-colors"
            >
              <IoIosClose size={16} color="#fff" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
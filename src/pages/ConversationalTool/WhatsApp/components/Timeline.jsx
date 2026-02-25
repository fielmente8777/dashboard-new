import { IoIosClose } from "react-icons/io";

export default function Timeline({ items, onEdit, onDelete }) {
  if (!items?.length) {
    return (
      <p className="text-xs text-gray-400 text-center py-6">
        No notes added yet
      </p>
    );
  }

  return (
    <div className="space-y-2 relative">
      {items.map((item, index) => (
        <div
          key={index}
          className=" flex gap-2 justify-between items-start bg-gray-100 p-2 rounded-md"
        >
          <div className="flex gap-2">
            {/* Dot */}
            <div className="w-3 h-3 mt-1 rounded-full bg-teal-500"></div>

            {/* Content */}
            <div>
              <p className="text-xs font-bold text-gray-600">
                {item?.activitySource}
              </p>
              <p className="text-sm text-gray-800">{item.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex items-center gap-3 bg-gray-200 px-3 py-2 rounded-full">
            <button
              onClick={() => onEdit(item, index)}
              className="text-xs font-semibold text-primary hover:underline "
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(item, index)}
              className=" size-5 bg-red-500 rounded-full flex justify-center items-center cursor-pointer"
            >
              <IoIosClose size={14} color="#fff" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

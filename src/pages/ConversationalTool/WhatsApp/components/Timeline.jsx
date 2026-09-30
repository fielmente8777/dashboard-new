// src/components/Notes/Timeline.jsx
import { IoIosClose } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";

const SOURCE_LABELS = {
  phone_call: "Phone Call",
  message: "Message",
  note: "Note",
  email: "Email",
  whatsapp: "Whatsapp",
  other: "Other",
};

const formatSource = (s = "") =>
  SOURCE_LABELS[s] ||
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDuration = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function Timeline({ items, onEdit, onDelete }) {
  if (!items?.length) {
    return (
      <p className="text-xs text-gray-400 dark:text-app-text-faint text-center py-6">
        No notes added yet
      </p>
    );
  }

  return (
    <div className="space-y-2 relative">
      {items.map((item, index) => {
        const audioUrl = item?.audio?.url;

        return (
          <div
            key={item?._id || item?.createdAt || index}
            className="flex gap-2 justify-between items-start bg-gray-100 dark:bg-app-surface border border-transparent dark:border-app-border p-2 rounded-lg"
          >
            <div className="flex gap-2 min-w-0 flex-1">
              {/* Dot */}
              <div className="w-3 h-3 mt-1.5 shrink-0 rounded-full bg-teal-500" />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-600 dark:text-app-text-muted flex items-center gap-1.5">
                  {formatSource(item?.activitySource)}
                  {audioUrl && (
                    <span className="inline-flex items-center gap-1 font-medium text-primary bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded-full">
                      <FaMicrophone size={8} />
                      {item.audio.duration
                        ? formatDuration(item.audio.duration)
                        : "Voice"}
                    </span>
                  )}
                </p>

                {item?.message && (
                  <p className="text-sm text-gray-800 dark:text-app-text break-words">
                    {item.message}
                  </p>
                )}

                {audioUrl && (
                  <audio
                    controls
                    preload="metadata"
                    className="mt-1.5 h-8 w-full max-w-xs"
                  >
                    <source
                      src={audioUrl}
                      type={item.audio.mimeType || "audio/webm"}
                    />
                    <a
                      href={audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline"
                    >
                      Play voice note
                    </a>
                  </audio>
                )}

                <p className="text-xs text-gray-400 dark:text-app-text-faint mt-1">
                  {new Date(item?.createdAt).toLocaleString()}
                  {item?.updatedAt && " · edited"}
                </p>
              </div>
            </div>

            {/* Actions */}
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
        );
      })}
    </div>
  );
}

// import { IoIosClose } from "react-icons/io";

// export default function Timeline({ items, onEdit, onDelete }) {
//   if (!items?.length) {
//     return (
//       <p className="text-xs text-gray-400 dark:text-app-text-faint text-center py-6">
//         No notes added yet
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-2 relative">
//       {items?.map((item, index) => (
//         <div
//           key={index}
//           className="flex gap-2 justify-between items-start bg-gray-100 dark:bg-app-surface border border-transparent dark:border-app-border p-2 rounded-lg"
//         >
//           <div className="flex gap-2 min-w-0 flex-1">
//             {/* Dot */}
//             <div className="w-3 h-3 mt-1.5 shrink-0 rounded-full bg-teal-500"></div>

//             {/* Content */}
//             <div className="min-w-0">
//               <p className="text-xs font-bold capitalize text-gray-600 dark:text-app-text-muted">
//                 {item?.activitySource || ""}
//               </p>
//               <p className="text-sm text-gray-800 dark:text-app-text break-words">
//                 {item?.message}
//               </p>
//               <p className="text-xs text-gray-400 dark:text-app-text-faint mt-1">
//                 {new Date(item?.createdAt).toLocaleString()}
//               </p>
//             </div>
//           </div>

//           {/* Edit Button */}
//           <div className="flex shrink-0 items-center gap-2 bg-gray-200 dark:bg-app-surface-secondary px-2 py-1.5 rounded-full">
//             <button
//               onClick={() => onEdit(item, index)}
//               className="text-xs font-semibold text-primary dark:text-app-text hover:underline"
//             >
//               Edit
//             </button>

//             <button
//               onClick={() => onDelete(item, index)}
//               aria-label="Delete note"
//               className="size-6 bg-red-500 hover:bg-red-600 rounded-full flex justify-center items-center cursor-pointer transition-colors"
//             >
//               <IoIosClose size={16} color="#fff" />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

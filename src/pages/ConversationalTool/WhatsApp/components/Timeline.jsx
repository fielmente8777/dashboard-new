// src/components/Notes/Timeline.jsx
import { Clock, Mic, Pencil, Trash2 } from "lucide-react";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { getNoteActivity } from "./noteActivities";

const formatDuration = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const formatWhen = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// The notes on a lead or caller, oldest first, as a timeline: one icon per
// kind of note on a line down the left. Actions: onEdit(item, index),
// onDelete(item, index).
export default function Timeline({ items, onEdit, onDelete }) {
  if (!items?.length) {
    return (
      <p className="py-6 text-center text-xs text-app-text-faint">
        No notes added yet
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-4 before:top-3 before:w-px before:bg-app-text-faint/25">
      {items.map((item, index) => {
        const activity = getNoteActivity(item?.activitySource);
        const audioUrl = item?.audio?.url;

        return (
          <li
            key={item?._id || item?.createdAt || index}
            className="group relative flex gap-3"
          >
            {/* solid behind the tint, so the line does not show through */}
            <span className="relative z-1 size-8 shrink-0 rounded-full bg-app-surface ring-4 ring-app-surface">
              <span
                className={`flex size-full items-center justify-center rounded-full ${activity.tone}`}
              >
                <Icon icon={activity.icon} size="sm" />
              </span>
            </span>

            <div className="min-w-0 flex-1 rounded-xl border border-app-border! bg-app-surface-secondary/40 px-3.5 py-3 transition-colors group-hover:bg-app-surface-secondary/70">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-app-text">
                    {activity.label}
                  </span>
                  {audioUrl && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-300">
                      <Icon icon={Mic} size="xs" />
                      {item.audio.duration
                        ? formatDuration(item.audio.duration)
                        : "Voice"}
                    </span>
                  )}
                </div>
                <div className="-mr-1.5 -mt-1 flex shrink-0 items-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                  <IconButton
                    icon={Pencil}
                    label="Edit note"
                    size="sm"
                    className="size-7!"
                    onClick={() => onEdit(item, index)}
                  />
                  <IconButton
                    icon={Trash2}
                    label="Delete note"
                    size="sm"
                    tone="danger"
                    className="size-7!"
                    onClick={() => onDelete(item, index)}
                  />
                </div>
              </div>

              {item?.message && (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-app-text">
                  {item.message}
                </p>
              )}

              {audioUrl && (
                <audio
                  controls
                  preload="metadata"
                  className="mt-2 h-9 w-full max-w-sm"
                >
                  <source
                    src={audioUrl}
                    type={item.audio.mimeType || "audio/webm"}
                  />
                  <a
                    href={audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 underline"
                  >
                    Play voice note
                  </a>
                </audio>
              )}

              <p className="mt-2 flex items-center gap-1 text-xs text-app-text-faint">
                <Icon icon={Clock} size="xs" />
                {formatWhen(item?.createdAt)}
                {item?.updatedAt && " · edited"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
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

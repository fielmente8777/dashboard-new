import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import Icon from "../components/ui/Icon";

const ToastContext = createContext();

// Neutral cards: the colour is only in the icon and the countdown bar, so a
// toast never shouts over the page, in light or dark mode.
const TYPES = {
  success: {
    icon: CircleCheck,
    tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  error: {
    icon: CircleAlert,
    tile: "bg-red-500/12 text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  },
  warning: {
    icon: TriangleAlert,
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    tile: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
  },
};

const POSITIONS = {
  "top-left": "top-5 left-5 items-start",
  "bottom-left": "bottom-5 left-5 items-start",
  "bottom-right": "bottom-5 right-5 items-end",
};

// Shows a short message from anywhere:
//
//   const { showToast } = useToast();
//   showToast({ message: "Saved", type: "success" });
//
// type: "success" (default) | "error" | "warning" | "info"
// title: optional bold first line; duration: ms, 0 keeps it until closed.
// action: optional { label, onClick } button under the text (e.g. "View" on a notification);
//         clicking it also closes the toast.
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = "success", duration = 3000, position, action }) => {
      const id = ++nextId.current;
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          title,
          type: TYPES[type] ? type : "success",
          duration,
          action: action?.label && typeof action.onClick === "function" ? action : null,
          position: POSITIONS[position] ? position : "bottom-right",
        },
      ]);

      if (duration !== 0) setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const groupedToasts = toasts.reduce((acc, toast) => {
    acc[toast.position] = acc[toast.position] || [];
    acc[toast.position].push(toast);
    return acc;
  }, {});

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {Object.entries(groupedToasts).map(([position, list]) => (
        <div
          key={position}
          className={`pointer-events-none fixed z-99999 flex flex-col gap-2 ${POSITIONS[position]}`}
        >
          {list.map((toast) => {
            const style = TYPES[toast.type];

            return (
              <div
                key={toast.id}
                role={toast.type === "error" ? "alert" : "status"}
                className="anim-pop pointer-events-auto relative flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-xl border border-app-border! bg-app-surface py-3 pl-3 pr-2 text-app-text shadow-[0_10px_30px_-10px_rgba(15,23,42,0.35)]"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${style.tile}`}
                >
                  <Icon icon={style.icon} size="lg" />
                </span>

                <div className="min-w-0 flex-1 self-center py-0.5">
                  {toast.title && (
                    <p className="text-sm font-semibold leading-snug">
                      {toast.title}
                    </p>
                  )}
                  <p
                    className={`break-words text-sm leading-snug ${toast.title ? "mt-0.5 text-app-text-muted" : "font-medium"}`}
                  >
                    {toast.message}
                  </p>
                  {toast.action && (
                    <button
                      type="button"
                      onClick={() => {
                        removeToast(toast.id);
                        toast.action.onClick();
                      }}
                      className="mt-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => removeToast(toast.id)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-app-text-faint transition-colors hover:bg-app-surface-secondary hover:text-app-text"
                >
                  <Icon icon={X} size="sm" />
                </button>

                {/* time left before it closes */}
                {toast.duration > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      animation: `app-grow-x ${toast.duration}ms linear reverse forwards`,
                      transformOrigin: "left",
                    }}
                    className={`absolute inset-x-0 bottom-0 h-0.5 opacity-70 motion-reduce:hidden ${style.bar}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

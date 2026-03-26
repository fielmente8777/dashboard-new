import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({
    message,
    type = "success",
    duration = 3000,
    position = "top-bottom",
  }) => {
    const id = Date.now();

    const newToast = {
      id,
      message,
      type,
      position,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getPositionClasses = (position) => {
    switch (position) {
      case "top-left":
        return "top-5 left-5";
      case "bottom-right":
        return "bottom-5 right-5";
      case "bottom-left":
        return "bottom-5 left-5";
      default:
        return "bottom-5 right-5";
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-[#2b9a64]";
    }
  };

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
          className={`fixed z-9999 flex flex-col gap-3 ${getPositionClasses(position)}`}
        >
          {list.map((toast) => (
            <div
              key={toast.id}
              className={`relative px-4 py-3 rounded-lg shadow-lg text-white min-w-[260px] flex items-center justify-between animate-slideIn ${getBgColor(
                toast.type,
              )}`}
            >
              <span>{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

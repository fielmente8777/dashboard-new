import { createContext, useContext, useState } from "react";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = (message) => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        resolve,
      });
    });
  };

  const handleClose = () => {
    confirmState?.resolve(false);
    setConfirmState(null);
  };

  const handleConfirm = () => {
    confirmState?.resolve(true);
    setConfirmState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {confirmState && (
        <div className="fixed inset-0 z-9999999 flex items-start justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="mt-4 w-105 rounded-xl bg-white p-6 shadow-xl
            animate-[slideDown_.25s_ease]"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Action
            </h2>

            <p className="mt-2 text-sm text-gray-600">{confirmState.message}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

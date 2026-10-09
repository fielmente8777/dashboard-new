import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

// Asks "are you sure?" from anywhere:
//
//   const { confirm } = useConfirm();
//   const confirmed = await confirm("Delete this note?", {
//     title: "Delete note",   // default "Confirm Action"
//     confirmText: "Delete",  // default "Delete"
//     cancelText: "Cancel",
//     variant: "danger",      // "danger" (default) | "primary"
//   });
//
// Resolves true when confirmed, false when cancelled or dismissed.
export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = useCallback(
    (message, options = {}) =>
      new Promise((resolve) => {
        setConfirmState({
          message,
          title: options.title || "Confirm Action",
          confirmText: options.confirmText || "Delete",
          cancelText: options.cancelText || "Cancel",
          variant: options.variant === "primary" ? "primary" : "danger",
          resolve,
        });
      }),
    [],
  );

  const answer = (confirmed) => {
    confirmState?.resolve(confirmed);
    setConfirmState(null);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Dialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        onClose={() => answer(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => answer(false)}>
              {confirmState?.cancelText}
            </Button>
            <Button
              autoFocus
              variant={confirmState?.variant}
              onClick={() => answer(true)}
            >
              {confirmState?.confirmText}
            </Button>
          </>
        }
      >
        <p className="whitespace-pre-line text-sm text-app-text-muted">
          {confirmState?.message}
        </p>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

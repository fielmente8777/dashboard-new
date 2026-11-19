import { CircleHelp, Trash2, TriangleAlert } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

const DESTRUCTIVE_WORDS = /delete|remove|discard|clear/i;

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

  const answer = useCallback(
    (confirmed) => {
      confirmState?.resolve(confirmed);
      setConfirmState(null);
    },
    [confirmState],
  );

  useEffect(() => {
    if (!confirmState) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") answer(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmState, answer]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const isDanger = confirmState?.variant === "danger";
  const icon = !isDanger
    ? CircleHelp
    : DESTRUCTIVE_WORDS.test(`${confirmState?.title} ${confirmState?.confirmText}`)
      ? Trash2
      : TriangleAlert;

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {confirmState &&
        createPortal(
          <div
            onMouseDown={() => answer(false)}
            className="anim-fade fixed inset-0 z-[9996] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-message"
              onMouseDown={(e) => e.stopPropagation()}
              className="anim-pop w-full max-w-[420px] overflow-hidden rounded-2xl border border-app-border! bg-app-surface text-app-text shadow-2xl"
            >
              <div className="flex gap-4 p-5 sm:p-6">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full ring-8 ${
                    isDanger
                      ? "bg-red-500/12 text-red-600 ring-red-500/5 dark:text-red-400"
                      : "bg-blue-500/12 text-blue-600 ring-blue-500/5 dark:text-blue-400"
                  }`}
                >
                  <Icon icon={icon} size="xl" />
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 id="confirm-title" className="text-base font-semibold leading-snug">
                    {confirmState.title}
                  </h2>
                  <p
                    id="confirm-message"
                    className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-app-text-muted"
                  >
                    {confirmState.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-app-border! bg-app-bg/50 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
                {/* a destructive action never fires on a stray Enter: Cancel has focus */}
                <Button
                  variant="secondary"
                  autoFocus={isDanger}
                  onClick={() => answer(false)}
                  className="max-sm:w-full"
                >
                  {confirmState.cancelText}
                </Button>
                <Button
                  variant={confirmState.variant}
                  icon={isDanger && icon === Trash2 ? Trash2 : undefined}
                  autoFocus={!isDanger}
                  onClick={() => answer(true)}
                  className="max-sm:w-full"
                >
                  {confirmState.confirmText}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
};

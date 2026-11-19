import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton";

// A panel that slides in from the right, over the page.
// `header` goes under the title and stays in place while the body scrolls
// (a search box, tabs, ...).
const Drawer = ({ open, title, description, header, onClose, children }) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onMouseDown={onClose}
      className="anim-fade fixed inset-0 z-[9995] flex justify-end bg-black/50"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="anim-slide-in flex h-full w-full max-w-xl flex-col bg-app-bg text-app-text shadow-2xl"
      >
        <div className="shrink-0 border-b border-app-border! bg-app-surface p-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-app-text-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </div>
          {header && <div className="mt-3">{header}</div>}
        </div>

        <div className="scrollbar-hidden flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </aside>
    </div>,
    document.body,
  );
};

export default Drawer;

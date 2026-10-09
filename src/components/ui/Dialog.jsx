import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton";

const SIZES = { md: "max-w-md", lg: "max-w-3xl" };

const Dialog = ({
  open,
  title,
  description,
  onClose,
  footer,
  size = "md",
  children,
}) => {
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
      className="anim-fade fixed inset-0 z-[9995] flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={`anim-pop max-h-full w-full overflow-y-auto rounded-xl border border-app-border! bg-app-surface p-5 text-app-text shadow-xl ${SIZES[size]}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-app-text-muted">{description}</p>
            )}
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>

        {children}

        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Dialog;

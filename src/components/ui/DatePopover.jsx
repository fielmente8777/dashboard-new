import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsPhone, useLockBodyScroll } from "../../hooks/useIsPhone";
import IconButton from "./IconButton";

const GAP = 8;
const EDGE = 16;
const MIN_ROOM = 280; // with less room than this beside the field, use the whole window

// Where the date pickers open: beside their field on a computer, as a sheet
// from the bottom edge on a phone. Render it only while open. It is drawn at
// the end of <body>, above dialogs and drawers, so nothing can clip it, and it
// always stays inside the window: on a short screen its content shrinks.
//
// `children` is a function that gets `sheet` (true on a phone).
// `width` fixes the width of the popover; without it the content decides.
// `height` is the height it would like on a computer, for a calendar that
//   scrolls inside it; on a phone it makes the sheet tall.
// `showTitle` shows the title on a computer as well (a phone always does).
const DatePopover = ({
  triggerRef,
  title,
  align = "left",
  width,
  height,
  showTitle = false,
  onClose,
  children,
}) => {
  const panelRef = useRef(null);
  const sheet = useIsPhone();
  const [position, setPosition] = useState(null);

  useLockBodyScroll(sheet);

  // below the field, or above it when there is more room there
  useLayoutEffect(() => {
    if (sheet) return;

    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const panel = panelRef.current;
      const panelWidth = width ? Math.min(width, window.innerWidth - EDGE * 2) : panel.offsetWidth;
      const left = align === "right" ? rect.right - panelWidth : rect.left;

      const wanted = height ?? panel.scrollHeight;
      const roomBelow = window.innerHeight - rect.bottom - GAP - EDGE;
      const roomAbove = rect.top - GAP - EDGE;
      const up = roomBelow < wanted && roomAbove > roomBelow;
      const room = up ? roomAbove : roomBelow;
      const cramped = room < wanted && room < MIN_ROOM;
      const size = Math.min(wanted, cramped ? window.innerHeight - EDGE * 2 : room);

      setPosition({
        width: width ? panelWidth : undefined,
        left: Math.max(EDGE, Math.min(left, window.innerWidth - panelWidth - EDGE)),
        top: cramped ? EDGE : up ? rect.top - GAP - size : rect.bottom + GAP,
        ...(height ? { height: size } : { maxHeight: size }),
      });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [align, height, sheet, triggerRef, width]);

  useEffect(() => {
    // keyboard users land on the calendar; a tap shows no focus ring
    panelRef.current?.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        onClose();
      }
    };
    // capture, so Escape closes only the picker and not a dialog around it
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onClose, triggerRef]);

  return createPortal(
    <>
      {sheet && <div aria-hidden="true" className="anim-fade fixed inset-0 z-10000 bg-black/50" />}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={title}
        style={
          sheet ? undefined : { top: -9999, left: -9999, ...position }
        }
        className={`fixed z-10000 flex flex-col overflow-hidden border border-app-border! bg-app-surface text-app-text shadow-xl ${
          sheet
            ? `anim-sheet inset-x-0 bottom-0 rounded-t-2xl border-b-0 pb-[env(safe-area-inset-bottom)] ${
                height ? "h-[min(94dvh,640px)]" : "max-h-[90dvh]"
              }`
            : "anim-menu rounded-xl"
        }`}
      >
        {(sheet || showTitle) && (
          <div className="flex shrink-0 items-center justify-between border-b border-app-border! py-2 pr-2 pl-4">
            <span className="text-sm font-semibold">{title}</span>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </div>
        )}
        {children(sheet)}
      </div>
    </>,
    document.body,
  );
};

export default DatePopover;

import { FileCode2, ImagePlus, LayoutTemplate, Loader2, Paperclip, Plus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// The "+" in the compose window's bottom bar: everything that can go into an
// email, with what each one is for, in one small pop-up.
//
//   items: [{ key, onClick, disabled, busy }] for: files, photo, design, template, ai
export default function ComposeInsertMenu({ items, disabled }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    const esc = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc, true);
    };
  }, [open]);

  const ROWS = {
    files: { icon: Paperclip, title: "Attach files", sub: "PDF, Word, Excel, pictures · up to 10 MB each" },
    photo: { icon: ImagePlus, title: "Photo in the email", sub: "Shown inside the message, not as an attachment" },
    design: { icon: FileCode2, title: "Upload HTML design", sub: "A ready-made .html (pick its pictures with it)" },
    template: { icon: LayoutTemplate, title: "Templates", sub: "Your saved designs, or make one with AI" },
    ai: { icon: Sparkles, title: "Help me write", sub: "AI writes or improves the text, suggests subjects" },
  };

  const anyBusy = items.some((i) => i.busy);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Insert"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text disabled:opacity-50 ${
          open ? "bg-app-surface-secondary text-app-text" : ""
        }`}
      >
        {anyBusy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      </button>
      {open && (
        <div
          role="menu"
          className="anim-pop absolute bottom-10 left-0 z-30 w-72 overflow-hidden rounded-xl border border-app-border! bg-app-surface py-1 shadow-xl"
        >
          {items.map((item) => {
            const row = ROWS[item.key];
            const RowIcon = item.busy ? Loader2 : row.icon;
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled || item.busy}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className="flex w-full items-start gap-3 px-3 py-2 text-left transition hover:bg-app-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RowIcon className={`mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400 ${item.busy ? "animate-spin" : ""}`} />
                <span className="min-w-0">
                  <span className="block text-sm text-app-text">{row.title}</span>
                  <span className="block text-[11px] leading-snug text-app-text-muted">{item.hint || row.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

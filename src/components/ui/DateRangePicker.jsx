import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DATE_PRESETS,
  formatRange,
  parseISODate,
  presetRange,
  toISODate,
} from "../../utils/datePresets";
import Button from "./Button";
import Icon from "./Icon";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS_BACK = 24; // how far back the calendar scrolls
const MONTHS_AHEAD = 12; // and forward, when future dates are allowed
const PANEL_WIDTH = 672;
const GAP = 8;
const EMPTY = { start: null, end: null, preset: null, label: null };

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

// Days of one month, Monday first, with blanks before the 1st.
const monthCells = (year, month) => {
  const first = new Date(year, month, 1);
  const blanks = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: days }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ];
};

const dayCount = ({ start, end }) =>
  Math.round((parseISODate(end) - parseISODate(start)) / 86_400_000) + 1;

const DateBox = ({ label, value, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-left transition ${
      active ? "border-blue-500! ring-1 ring-blue-500" : "border-app-border! hover:border-app-text-faint!"
    }`}
  >
    <span className="block text-[11px] text-app-text-muted">{label}</span>
    <span className="block truncate text-sm text-app-text">
      {value ? parseISODate(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
    </span>
  </button>
);

// The calendar: a scrolling column of months. Clicking picks the start date,
// then the end date (`editing` says which one the next click sets).
const Calendar = ({ draft, editing, onPick, allowFuture }) => {
  const scrollRef = useRef(null);
  const monthRefs = useRef({});
  const [hover, setHover] = useState(null);
  const [visible, setVisible] = useState(null);
  const todayISO = toISODate(new Date());

  const months = useMemo(() => {
    const now = new Date();
    const ahead = allowFuture ? MONTHS_AHEAD : 0;
    return Array.from({ length: MONTHS_BACK + 1 + ahead }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - MONTHS_BACK + i, 1);
      return { date, key: monthKey(date), cells: monthCells(date.getFullYear(), date.getMonth()) };
    });
  }, [allowFuture]);

  const scrollTo = (key, behavior = "auto") => {
    const element = monthRefs.current[key];
    if (element) scrollRef.current.scrollTo({ top: element.offsetTop, behavior });
  };

  // open on the month of the start date (this month when nothing is picked)
  useLayoutEffect(() => {
    const key = monthKey(draft.start ? parseISODate(draft.start) : new Date());
    scrollTo(key);
    setVisible(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    const top = scrollRef.current.scrollTop + 8;
    const current = [...months].reverse().find((m) => monthRefs.current[m.key]?.offsetTop <= top);
    if (current) setVisible(current.key);
  };

  const step = (by) => {
    const index = months.findIndex((m) => m.key === visible);
    const next = months[Math.min(Math.max(index + by, 0), months.length - 1)];
    scrollTo(next.key, "smooth");
  };

  // while choosing the end date, show the range up to the hovered day
  const end =
    editing === "end" && hover && draft.start && hover >= draft.start ? hover : draft.end;
  const visibleMonth = months.find((m) => m.key === visible)?.date;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 pb-1">
        <span className="text-sm font-medium text-app-text">
          {visibleMonth?.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <div className="flex">
          <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="rounded-md p-1.5 text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text">
            <Icon icon={ChevronLeft} />
          </button>
          <button type="button" aria-label="Next month" onClick={() => step(1)} className="rounded-md p-1.5 text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text">
            <Icon icon={ChevronRight} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-app-border! px-2 pb-1.5 text-center text-[11px] font-medium text-app-text-muted">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        onMouseLeave={() => setHover(null)}
        className="relative h-72 overflow-y-auto px-2 pb-2"
      >
        {months.map((month) => (
          <div key={month.key} ref={(el) => (monthRefs.current[month.key] = el)} className="pt-2">
            <p className="px-1.5 pb-1 text-xs font-semibold uppercase text-app-text">
              {month.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
            <div className="grid grid-cols-7 gap-y-0.5">
              {month.cells.map((iso, i) => {
                if (!iso) return <span key={i} />;
                const future = !allowFuture && iso > todayISO;
                const isEdge = iso === draft.start || iso === end;
                const inRange = Boolean(draft.start && end && iso >= draft.start && iso <= end);
                const column = i % 7;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={future}
                    onClick={() => onPick(iso)}
                    onMouseEnter={() => setHover(iso)}
                    className={`relative flex h-8 items-center justify-center text-xs tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-app-text-faint/60 ${
                      inRange ? "bg-blue-500/10" : ""
                    } ${inRange && (iso === draft.start || column === 0) ? "rounded-l-full" : ""} ${
                      inRange && (iso === end || column === 6) ? "rounded-r-full" : ""
                    }`}
                  >
                    <span
                      className={`flex size-8 items-center justify-center rounded-full ${
                        isEdge
                          ? "bg-primary font-semibold text-white dark:bg-blue-600"
                          : iso === todayISO
                            ? "font-semibold text-blue-600 ring-1 ring-blue-500/40 dark:text-blue-400"
                            : future
                              ? ""
                              : "text-app-text hover:bg-app-surface-secondary"
                      }`}
                    >
                      {Number(iso.slice(8))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Google-style date range picker: quick presets and a calendar.
// `value` is { start, end, preset?, label? } with "YYYY-MM-DD" dates, or null
// for "no range" (the button then shows `placeholder`). onChange gets the
// same shape when the user presses Apply, or null after Clear (`clearable`).
// The panel is portalled to <body>, so it also works inside dialogs.
const DateRangePicker = ({
  value,
  onChange,
  placeholder = "Any date",
  clearable = false,
  allowFuture = false,
  align = "right",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || EMPTY);
  const [editing, setEditing] = useState("start");
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const openPicker = () => {
    setDraft(value || EMPTY);
    setEditing("start");
    setPosition(null);
    setOpen(true);
  };

  // below the button (or above it when there's no room), inside the window
  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
      const height = panelRef.current?.offsetHeight || 480;
      const below = window.innerHeight - rect.bottom;
      const up = below < height + GAP && rect.top > below;
      const left = align === "right" ? rect.right - width : rect.left;
      setPosition({
        width,
        left: Math.max(16, Math.min(left, window.innerWidth - width - 16)),
        top: up ? Math.max(16, rect.top - height - GAP) : rect.bottom + GAP,
      });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    // capture, so Escape closes only the picker and not a dialog around it
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  const pickDay = (iso) => {
    if (editing === "start" || !draft.start || iso < draft.start) {
      setDraft({ start: iso, end: iso, preset: null, label: null });
      setEditing("end");
    } else {
      setDraft({ start: draft.start, end: iso, preset: null, label: null });
      setEditing("start");
    }
  };

  const hasDraft = Boolean(draft.start && draft.end);

  const apply = () => {
    onChange({ ...draft, label: draft.label || formatRange(draft) });
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setOpen(false);
  };

  const presetButton = (active) =>
    `w-full px-4 py-2 text-left text-sm transition ${
      active
        ? "bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400"
        : "text-app-text hover:bg-app-surface-secondary"
    }`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex h-10 min-w-0 items-center gap-2.5 rounded-lg border bg-app-surface px-3 text-left transition hover:bg-app-surface-secondary ${
          open ? "border-blue-500! ring-1 ring-blue-500" : "border-app-border!"
        } ${className}`}
      >
        <Icon icon={CalendarDays} tone="primary" />
        <span className="min-w-0 flex-1 leading-tight">
          {value?.preset && (
            <span className="block text-[11px] text-app-text-muted">{value.label}</span>
          )}
          <span
            className={`block truncate text-sm ${value ? "font-medium text-app-text" : "text-app-text-faint"}`}
          >
            {value ? formatRange(value) : placeholder}
          </span>
        </span>
        <Icon icon={ChevronDown} size="sm" tone="muted" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Choose a date range"
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: position?.width,
            }}
            className="anim-menu fixed z-[9996] flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface text-app-text shadow-xl"
          >
            <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
              <div className="max-h-40 shrink-0 overflow-y-auto border-b border-app-border! py-2 sm:max-h-none sm:w-56 sm:border-b-0 sm:border-r">
                <button type="button" className={presetButton(!draft.preset)} onClick={() => setDraft({ ...draft, preset: null, label: null })}>
                  Custom
                </button>
                <div className="my-1 border-t border-app-border!" />
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={presetButton(draft.preset === preset.key)}
                    onClick={() => setDraft(presetRange(preset.key))}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 pt-3">
                <div className="flex items-center gap-2 px-3">
                  <DateBox label="Start date" value={draft.start} active={editing === "start"} onClick={() => setEditing("start")} />
                  <span className="text-app-text-faint">–</span>
                  <DateBox label="End date" value={draft.end} active={editing === "end"} onClick={() => setEditing("end")} />
                </div>
                <Calendar draft={draft} editing={editing} onPick={pickDay} allowFuture={allowFuture} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-app-border! px-4 py-3">
              <span className="truncate text-xs text-app-text-muted">
                {hasDraft ? `${formatRange(draft)} · ${dayCount(draft)} days` : "Pick a start and an end date"}
              </span>
              <div className="flex shrink-0 gap-2">
                {clearable && value && (
                  <Button variant="ghost" size="sm" onClick={clear}>
                    Clear
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={apply} disabled={!hasDraft}>
                  Apply
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default DateRangePicker;

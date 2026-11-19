import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseISODate } from "../../utils/datePresets";
import Calendar from "./Calendar";
import DatePopover from "./DatePopover";
import { inputClassName } from "./Field";
import Icon from "./Icon";

const pad = (number) => String(number).padStart(2, "0");

const formatDate = (iso) =>
  parseISODate(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// "14:30" -> "2:30 PM"
const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`;
};

const PLACEHOLDERS = { date: "Select date", range: "Select dates", time: "Select time" };
const TITLES = { date: "Choose a date", range: "Choose dates", time: "Choose a time" };

const displayValue = (mode, value) => {
  if (mode === "time") return value ? formatTime(value) : "";
  if (mode === "date") return value ? formatDate(value) : "";
  if (!value?.start) return "";
  return value.end ? `${formatDate(value.start)} - ${formatDate(value.end)}` : `${formatDate(value.start)} -`;
};

// Every time of the day, `step` minutes apart. On a computer a column that
// scrolls; on a phone a grid to tap.
const TimeList = ({ value, step, filterTime, sheet, onPick }) => {
  const listRef = useRef(null);

  const times = useMemo(() => {
    const list = Array.from({ length: Math.floor(1440 / step) }, (_, i) => {
      const minutes = i * step;
      return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
    });
    if (!filterTime) return list;
    return list.filter((time) => {
      const date = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
      return filterTime(date);
    });
    // the filter is a new function each render but only depends on today
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, Boolean(filterTime)]);

  // open on the picked time, or the one coming up next
  useEffect(() => {
    const list = listRef.current;
    if (!list || !times.length) return;
    const now = new Date();
    const upcoming = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const target = value || times.find((time) => time >= upcoming) || times[0];
    const element = list.querySelector(`[data-time="${target}"]`);
    if (!element) return;
    list.scrollTop = element.offsetTop - list.clientHeight / 2 + element.offsetHeight / 2;
    element.focus({ preventScroll: true });
    // only when it opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!times.length) {
    return <p className="p-4 text-center text-sm text-app-text-muted">No times left today.</p>;
  }

  return (
    <div
      ref={listRef}
      className={`relative min-h-0 overflow-y-auto overscroll-contain p-2 ${
        sheet ? "grid max-h-[60dvh] grid-cols-3 gap-2 p-3" : "max-h-64 w-36 space-y-0.5"
      }`}
    >
      {times.map((time) => {
        const active = time === value;
        return (
          <button
            key={time}
            type="button"
            data-time={time}
            onClick={() => onPick(time)}
            className={`w-full rounded-lg px-3 text-sm tabular-nums transition ${
              sheet ? "h-11 border border-app-border! text-center" : "h-8 text-left"
            } ${
              active
                ? "border-transparent! bg-primary font-semibold text-white dark:bg-blue-600"
                : "text-app-text hover:bg-app-surface-secondary"
            }`}
          >
            {formatTime(time)}
          </button>
        );
      })}
    </div>
  );
};

// Date, date range or time field with the app's calendar.
//
// The value is a plain string, the same one a native input would give:
//   mode="date"   "2026-10-08"
//   mode="time"   "14:30"
//   mode="range"  { start: "2026-10-08", end: "2026-10-11" } - the first click
//                 picks the start, the second the end
// `min` / `max` take "YYYY-MM-DD"; onChange gets the new value.
// `filterTime(date)` hides times in mode="time".
// With `inline` the calendar is shown in place instead of in a popup.
const DatePicker = ({
  value,
  onChange,
  mode = "date",
  min,
  max,
  placeholder,
  disabled = false,
  inline = false,
  timeStep = 15,
  filterTime,
  className = "",
  "aria-label": ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const isRange = mode === "range";
  const close = useCallback(() => setOpen(false), []);

  const calendarProps = {
    mode: isRange ? "range" : "single",
    value,
    min,
    max,
  };

  if (inline) {
    return (
      <div className="w-full sm:max-w-xs sm:rounded-xl sm:border sm:border-app-border! sm:p-3">
        <Calendar {...calendarProps} onChange={onChange} />
      </div>
    );
  }

  const shown = displayValue(mode, value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`${inputClassName} flex items-center justify-between gap-2 text-left ${
          open ? "border-blue-500! ring-1 ring-blue-500" : ""
        } ${className}`}
      >
        <span className={`truncate ${shown ? "" : "text-app-text-faint"}`}>
          {shown || placeholder || PLACEHOLDERS[mode]}
        </span>
        <Icon icon={mode === "time" ? Clock : CalendarIcon} tone="muted" />
      </button>

      {open && (
        <DatePopover
          triggerRef={triggerRef}
          title={ariaLabel || TITLES[mode]}
          height={mode === "time" ? undefined : 400}
          onClose={close}
        >
          {(sheet) =>
            mode === "time" ? (
              <TimeList
                value={value}
                step={timeStep}
                filterTime={filterTime}
                sheet={sheet}
                onPick={(time) => {
                  onChange(time);
                  close();
                }}
              />
            ) : (
              <div className="flex min-h-0 w-full flex-1 flex-col p-3 sm:w-80">
                <Calendar
                  {...calendarProps}
                  fill
                  onChange={(next) => {
                    onChange(next);
                    if (!isRange || next.end) close();
                  }}
                />
              </div>
            )
          }
        </DatePopover>
      )}
    </>
  );
};

export default DatePicker;

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { addDays, parseISODate, toISODate } from "../../utils/datePresets";
import Icon from "./Icon";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleDateString("en-IN", { month: "short" }),
);
const MONTHS_BACK = 24; // how far the calendar scrolls without a `min`
const MONTHS_AHEAD = 24; // and without a `max`
const STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

const navButtonClassName =
  "rounded-md p-1.5 text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text disabled:pointer-events-none disabled:opacity-30";

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

// Days of one month, with blanks before the 1st.
const monthCells = (date, weekStartsOn) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const blanks = (date.getDay() - weekStartsOn + 7) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: days }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ];
};

// The months to scroll through: from `min` to `max`, or a stretch around today
// when they are not set, always including the date already picked.
const buildMonths = (min, max, picked, weekStartsOn) => {
  const now = new Date();
  const dates = (iso) => {
    const date = parseISODate(iso);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  let first = min ? dates(min) : new Date(now.getFullYear(), now.getMonth() - MONTHS_BACK, 1);
  let last = max ? dates(max) : new Date(now.getFullYear(), now.getMonth() + MONTHS_AHEAD, 1);
  if (picked && dates(picked) < first) first = dates(picked);
  if (picked && dates(picked) > last) last = dates(picked);

  const list = [];
  for (let d = first; d <= last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    list.push({ date: d, key: monthKey(d), cells: monthCells(d, weekStartsOn) });
  }
  return list;
};

// The one calendar of the app, a scrolling column of months; DatePicker,
// DateRangePicker and the dialogs all draw this. It fills the width it is given.
//
//   mode="single"  value "2026-10-08", onChange gets the same
//   mode="range"   value { start, end }, onChange gets the same. The first click
//                  sets the start (end ""), the second the end.
//
// min / max        "YYYY-MM-DD"; days outside them cannot be picked
// isDisabled       (iso) => boolean, to block any other day
// weekStartsOn     0 = Sunday ... 6 = Saturday
// selecting        range only: force the next click to set "start" or "end"
// fill             take the parent's height instead of a fixed one (phone sheets)
const Calendar = ({
  mode = "single",
  value,
  onChange,
  min,
  max,
  isDisabled,
  weekStartsOn = 1,
  selecting,
  fill = false,
  className = "",
}) => {
  const isRange = mode === "range";
  const start = (isRange ? value?.start : value) || "";
  const end = (isRange && value?.end) || "";
  const today = toISODate(new Date());

  const scrollRef = useRef(null);
  const monthRefs = useRef({});
  const pendingMonth = useRef(null);
  const [hover, setHover] = useState(null);
  const [visible, setVisible] = useState(null);
  const [pickerYear, setPickerYear] = useState(null); // set while choosing a month

  const months = useMemo(
    () => buildMonths(min, max, start, weekStartsOn),
    // the list stays put while dates are picked, so the scroll doesn't jump
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, weekStartsOn],
  );

  const scrollToMonth = (key, behavior = "auto") => {
    const element = monthRefs.current[key];
    if (element) scrollRef.current.scrollTo({ top: element.offsetTop, behavior });
  };

  // open on the picked month, or this month when it can be picked
  useLayoutEffect(() => {
    const clamped = max && today > max ? max : min && today < min ? min : today;
    const key = monthKey(parseISODate(start || clamped));
    scrollToMonth(key);
    setVisible(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // a preset picked outside the calendar: bring its first day into view
  useEffect(() => {
    if (!start || !scrollRef.current) return;
    const day = scrollRef.current.querySelector(`[data-day="${start}"]`);
    if (!day) return;
    const box = scrollRef.current.getBoundingClientRect();
    const rect = day.getBoundingClientRect();
    if (rect.top < box.top || rect.bottom > box.bottom) {
      scrollToMonth(monthKey(parseISODate(start)), "smooth");
    }
     
  }, [start]);

  // a month chosen in the month grid: the days are back on screen now
  useLayoutEffect(() => {
    if (pickerYear !== null || !pendingMonth.current) return;
    scrollToMonth(pendingMonth.current);
    setVisible(pendingMonth.current);
    pendingMonth.current = null;
     
  }, [pickerYear]);

  const onScroll = () => {
    const top = scrollRef.current.scrollTop + 8;
    const current = [...months].reverse().find((m) => monthRefs.current[m.key]?.offsetTop <= top);
    if (current) setVisible(current.key);
  };

  const visibleIndex = months.findIndex((m) => m.key === visible);
  const visibleMonth = months[visibleIndex]?.date;

  const step = (by) => {
    const next = months[visibleIndex + by];
    if (next) scrollToMonth(next.key, "smooth");
  };

  const dayDisabled = (iso) =>
    Boolean((min && iso < min) || (max && iso > max) || isDisabled?.(iso));

  const pickingEnd = isRange && Boolean(start) && (selecting ? selecting === "end" : !end);

  const pick = (iso) => {
    if (!isRange) onChange(iso);
    else if (pickingEnd && iso >= start) onChange({ start, end: iso });
    else onChange({ start: iso, end: "" });
    setHover(null);
  };

  // while choosing the end, the range is previewed up to the hovered day
  const rangeEnd = pickingEnd && hover && hover >= start ? hover : end;

  // the one day the Tab key lands on; the arrow keys walk from there
  const tabDay =
    [start, today].find((iso) => iso && !dayDisabled(iso)) ||
    months.flatMap((m) => m.cells).find((iso) => iso && !dayDisabled(iso));

  const onDayKeyDown = (e, iso) => {
    const by = STEPS[e.key];
    if (!by) return;
    e.preventDefault();
    const next = toISODate(addDays(parseISODate(iso), by));
    if (!dayDisabled(next)) scrollRef.current.querySelector(`[data-day="${next}"]`)?.focus();
  };

  const renderDay = (iso, column) => {
    const disabled = dayDisabled(iso);
    const isEdge = iso === start || iso === rangeEnd;
    const inRange = isRange && Boolean(start && rangeEnd && iso >= start && iso <= rangeEnd);
    const multiDay = inRange && start !== rangeEnd;
    const isToday = iso === today;

    return (
      <button
        key={iso}
        type="button"
        data-day={iso}
        disabled={disabled}
        tabIndex={iso === tabDay ? 0 : -1}
        aria-pressed={inRange || iso === start}
        aria-current={isToday ? "date" : undefined}
        aria-label={parseISODate(iso).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        onClick={() => pick(iso)}
        onMouseEnter={() => pickingEnd && setHover(iso)}
        onKeyDown={(e) => onDayKeyDown(e, iso)}
        className={`group flex h-10 items-center justify-center p-0 text-sm tabular-nums outline-none transition-colors disabled:cursor-not-allowed sm:h-8 sm:text-xs ${
          multiDay ? "bg-blue-500/10" : ""
        } ${multiDay && (iso === start || column === 0) ? "rounded-l-full" : ""} ${
          multiDay && (iso === rangeEnd || column === 6) ? "rounded-r-full" : ""
        }`}
      >
        <span
          className={`flex size-8 items-center justify-center rounded-full group-focus-visible:ring-2 group-focus-visible:ring-blue-500 min-[360px]:size-9 sm:size-8! ${
            isEdge
              ? "bg-primary font-semibold text-white dark:bg-blue-600"
              : disabled
                ? "text-app-text-faint opacity-50"
                : isToday
                  ? "font-semibold text-blue-600 ring-1 ring-blue-500/40 group-hover:bg-app-surface-secondary dark:text-blue-400"
                  : "text-app-text group-hover:bg-app-surface-secondary"
          }`}
        >
          {Number(iso.slice(8))}
        </span>
      </button>
    );
  };

  const hasYear = (year) => months.some((m) => m.date.getFullYear() === year);
  const choosingMonth = pickerYear !== null;

  return (
    <div className={`flex min-h-0 flex-col ${fill ? "flex-1" : ""} ${className}`}>
      <div className="flex shrink-0 items-center justify-between pb-1">
        <button
          type="button"
          aria-expanded={choosingMonth}
          aria-label={choosingMonth ? "Back to the days" : "Choose month and year"}
          onClick={() => setPickerYear(choosingMonth ? null : visibleMonth.getFullYear())}
          className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-sm font-medium whitespace-nowrap text-app-text transition hover:bg-app-surface-secondary"
        >
          {choosingMonth
            ? pickerYear
            : visibleMonth?.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          <Icon
            icon={ChevronDown}
            size="sm"
            tone="muted"
            className={`transition-transform ${choosingMonth ? "rotate-180" : ""}`}
          />
        </button>
        <div className="flex">
          <button
            type="button"
            aria-label={choosingMonth ? "Previous year" : "Previous month"}
            disabled={choosingMonth ? !hasYear(pickerYear - 1) : visibleIndex <= 0}
            onClick={() => (choosingMonth ? setPickerYear(pickerYear - 1) : step(-1))}
            className={navButtonClassName}
          >
            <Icon icon={ChevronLeft} />
          </button>
          <button
            type="button"
            aria-label={choosingMonth ? "Next year" : "Next month"}
            disabled={choosingMonth ? !hasYear(pickerYear + 1) : visibleIndex >= months.length - 1}
            onClick={() => (choosingMonth ? setPickerYear(pickerYear + 1) : step(1))}
            className={navButtonClassName}
          >
            <Icon icon={ChevronRight} />
          </button>
        </div>
      </div>

      {choosingMonth && (
        <div className={`grid grid-cols-3 content-start gap-2 py-1 ${fill ? "min-h-0 flex-1" : "h-[19.5rem]"}`}>
          {MONTH_NAMES.map((name, month) => {
            const key = `${pickerYear}-${month}`;
            const disabled = !months.some((m) => m.key === key);
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => {
                  pendingMonth.current = key;
                  setPickerYear(null);
                }}
                className={`h-11 rounded-lg text-sm transition disabled:cursor-not-allowed disabled:text-app-text-faint disabled:opacity-50 ${
                  key === visible
                    ? "bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400"
                    : "text-app-text enabled:hover:bg-app-surface-secondary"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* kept in the page while choosing a month, so it keeps its scroll */}
      <div className={`flex min-h-0 flex-col ${fill ? "flex-1" : ""} ${choosingMonth ? "hidden" : ""}`}>
        <div className="grid shrink-0 grid-cols-7 border-b border-app-border! pb-1.5 text-center text-[11px] font-medium text-app-text-muted">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i}>{WEEKDAYS[(i + weekStartsOn) % 7]}</span>
          ))}
        </div>
        <div
          ref={scrollRef}
          onScroll={onScroll}
          onMouseLeave={() => setHover(null)}
          className={`relative overflow-y-auto overscroll-contain pb-2 ${fill ? "min-h-0 flex-1" : "h-72"}`}
        >
          {months.map((month, index) => (
            <div
              key={month.key}
              ref={(el) => (monthRefs.current[month.key] = el)}
              // the last month fills the view, so it too can scroll to the top
              className={`pt-2 ${index === months.length - 1 ? "min-h-full" : ""}`}
            >
              <p className="px-1.5 pb-1 text-xs font-semibold text-app-text uppercase">
                {month.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </p>
              <div className="grid grid-cols-7 gap-y-0.5">
                {month.cells.map((iso, i) => (iso ? renderDay(iso, i % 7) : <span key={i} />))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { forwardRef, useMemo } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { inputClassName } from "./Field";
import Icon from "./Icon";
import IconButton from "./IconButton";

const pad = (number) => String(number).padStart(2, "0");
const toDatePart = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toTimePart = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// How each mode shows the value, and how it turns the string the app keeps
// into a Date and back. All of them use the user's own timezone.
const MODES = {
  date: {
    icon: Calendar,
    display: "dd MMM yyyy",
    placeholder: "Select date",
    parse: (value) => new Date(`${value}T00:00:00`),
    format: toDatePart,
  },
  datetime: {
    icon: Calendar,
    display: "dd MMM yyyy, h:mm aa",
    placeholder: "Select date and time",
    parse: (value) => new Date(value),
    format: (date) => `${toDatePart(date)}T${toTimePart(date)}`,
  },
  time: {
    icon: Clock,
    display: "h:mm aa",
    placeholder: "Select time",
    parse: (value) => new Date(`${toDatePart(new Date())}T${value}:00`),
    format: toTimePart,
  },
};

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleDateString("en-US", { month: "long" }),
);

const headerSelectClassName =
  "rounded-md bg-transparent px-1 py-1 text-sm font-semibold text-app-text outline-none hover:bg-app-surface-secondary";

// The field itself: looks like the other inputs and opens the calendar.
const PickerField = forwardRef(function PickerField(
  { value, onClick, placeholder, disabled, icon, label, className = "" },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`${inputClassName} flex items-center justify-between gap-2 text-left ${className}`}
    >
      <span className={`truncate ${value ? "" : "text-app-text-faint"}`}>
        {value || placeholder}
      </span>
      <Icon icon={icon} tone="muted" />
    </button>
  );
});

// Date, date + time or time picker with the app's look.
//
// The value is a plain string, the same one a native input would give:
//   mode="date"      "2026-10-08"
//   mode="datetime"  "2026-10-08T14:30"
//   mode="time"      "14:30"
// `min` / `max` take the same kind of string. onChange gets the new string.
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
  className = "",
  "aria-label": ariaLabel,
  ...props
}) => {
  const config = MODES[mode];
  const selected = value ? config.parse(value) : null;
  const minDate = min ? config.parse(min) : undefined;
  const maxDate = max ? config.parse(max) : undefined;

  // years offered in the header: ten either side, widened to fit min / max
  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const first = Math.min(thisYear - 10, minDate?.getFullYear() ?? thisYear);
    const last = Math.max(thisYear + 10, maxDate?.getFullYear() ?? thisYear);
    return Array.from({ length: last - first + 1 }, (_, i) => first + i);
    // only the years matter, not the Date objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  return (
    <ReactDatePicker
      selected={selected && !Number.isNaN(selected.getTime()) ? selected : null}
      onChange={(date) => onChange(date ? config.format(date) : "")}
      minDate={mode === "time" ? undefined : minDate}
      maxDate={mode === "time" ? undefined : maxDate}
      // on the first allowed day, earlier times are not allowed either
      filterTime={
        mode === "datetime" && minDate
          ? (time) => time.getTime() >= minDate.getTime()
          : undefined
      }
      showTimeSelect={mode !== "date"}
      showTimeSelectOnly={mode === "time"}
      timeIntervals={timeStep}
      timeCaption="Time"
      dateFormat={config.display}
      placeholderText={placeholder || config.placeholder}
      disabled={disabled}
      inline={inline}
      showPopperArrow={false}
      popperPlacement="bottom-start"
      // drawn at the end of <body>, so tables and dialogs never clip it
      portalId="app-datepicker-portal"
      popperClassName="app-datepicker-popper"
      calendarClassName="app-datepicker"
      wrapperClassName="w-full"
      customInput={
        <PickerField
          icon={config.icon}
          label={ariaLabel}
          className={className}
        />
      }
      renderCustomHeader={({
        date,
        changeMonth,
        changeYear,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex items-center justify-between gap-1">
          <IconButton
            icon={ChevronLeft}
            label="Previous month"
            disabled={prevMonthButtonDisabled}
            onClick={decreaseMonth}
          />
          <div className="flex items-center gap-1">
            <select
              aria-label="Month"
              value={date.getMonth()}
              onChange={(e) => changeMonth(Number(e.target.value))}
              className={headerSelectClassName}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={date.getFullYear()}
              onChange={(e) => changeYear(Number(e.target.value))}
              className={headerSelectClassName}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <IconButton
            icon={ChevronRight}
            label="Next month"
            disabled={nextMonthButtonDisabled}
            onClick={increaseMonth}
          />
        </div>
      )}
      {...props}
    />
  );
};

export default DatePicker;

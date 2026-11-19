import { CalendarDays, ChevronDown } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { DATE_PRESETS, formatRange, toISODate } from "../../utils/datePresets";
import DatePopover from "./DatePopover";
import DateRangePanel from "./DateRangePanel";
import Icon from "./Icon";

const PANEL_WIDTH = 576;
const PANEL_HEIGHT = 500;

// Date range picker: quick presets and the calendar.
// `value` is { start, end, preset?, label? } with "YYYY-MM-DD" dates, or null
// for "no range" (the button then shows `placeholder`). onChange gets the
// same shape when the user presses Apply, or null after Clear (`clearable`).
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
  const triggerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
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

      {open && (
        <DatePopover
          triggerRef={triggerRef}
          title="Choose dates"
          align={align}
          width={PANEL_WIDTH}
          height={PANEL_HEIGHT}
          onClose={close}
        >
          {(sheet) => (
            <DateRangePanel
              sheet={sheet}
              presets={DATE_PRESETS}
              initial={value}
              max={allowFuture ? undefined : toISODate(new Date())}
              onCancel={close}
              onClear={
                clearable && value
                  ? () => {
                      onChange(null);
                      close();
                    }
                  : undefined
              }
              onSubmit={(range) => {
                onChange({ ...range, label: range.label || formatRange(range) });
                close();
              }}
            />
          )}
        </DatePopover>
      )}
    </>
  );
};

export default DateRangePicker;

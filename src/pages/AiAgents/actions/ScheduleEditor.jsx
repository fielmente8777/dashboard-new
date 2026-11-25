import { CalendarOff, Copy, Plus, Sun, Trash2 } from "lucide-react";
import { useMemo } from "react";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import { Field, Input, Select } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Segmented from "../../../components/ui/Segmented";
import Switch from "../../../components/ui/Switch";
import { DAY_NAMES, MAX_RANGES_PER_DAY, MONDAY_FIRST, allTimezones, copyDayToAll, crossesMidnight } from "./scheduleCore";

// One weekly schedule: time zone, 24/7, days with one or more time ranges,
// holidays / exceptions. Used for the agent's working hours and for an
// action's own availability (same rules: scheduleCore.validateSchedule).

const ALL_DAY = { from: "00:00", to: "24:00" };
const isAllDay = (ranges) => ranges.length === 1 && ranges[0].from === "00:00" && ranges[0].to === "24:00";

const RangeRow = ({ range, label, onChange, onRemove }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="w-32">
      <DatePicker mode="time" aria-label={`${label} from`} value={range.from} onChange={(from) => onChange({ ...range, from })} />
    </div>
    <span className="text-xs text-app-text-muted">to</span>
    <div className="w-32">
      <DatePicker mode="time" aria-label={`${label} to`} value={range.to === "24:00" ? "00:00" : range.to} onChange={(to) => onChange({ ...range, to })} />
    </div>
    {crossesMidnight(range) && <span className="text-xs text-app-text-muted">runs past midnight</span>}
    <IconButton icon={Trash2} size="sm" tone="danger" label={`Remove ${label} ${range.from}-${range.to}`} onClick={onRemove} />
  </div>
);

const RangesEditor = ({ ranges, label, onChange }) => (
  <div className="space-y-2">
    {ranges.map((range, i) => (
      <RangeRow
        key={i}
        range={range}
        label={label}
        onChange={(next) => onChange(ranges.map((r, j) => (j === i ? next : r)))}
        onRemove={() => onChange(ranges.filter((_, j) => j !== i))}
      />
    ))}
    {ranges.length < MAX_RANGES_PER_DAY && (
      <button
        type="button"
        onClick={() => {
          const last = ranges[ranges.length - 1];
          onChange([...ranges, last ? { from: last.to === "24:00" ? "18:00" : last.to, to: "22:00" } : { from: "09:00", to: "18:00" }]);
        }}
        className="inline-flex items-center gap-1 rounded text-xs font-medium text-app-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-app-focus"
      >
        <Plus className="size-3.5" aria-hidden="true" /> Add hours
      </button>
    )}
  </div>
);

const DayRow = ({ day, onChange, onCopyToAll }) => {
  const name = DAY_NAMES[day.day];
  const allDay = isAllDay(day.ranges);
  return (
    <div className="grid gap-3 rounded-lg border border-app-border! bg-app-surface px-3 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-start">
      <div className="flex items-center gap-2 pt-1">
        <Switch label={`${name} open`} checked={day.enabled} onChange={(enabled) => onChange({ ...day, enabled, ranges: enabled && !day.ranges.length ? [{ from: "09:00", to: "18:00" }] : day.ranges })} />
        <span className="text-sm font-medium text-app-text">{name}</span>
      </div>
      <div className="min-w-0">
        {!day.enabled ? (
          <p className="pt-1.5 text-xs text-app-text-muted">Closed</p>
        ) : allDay ? (
          <p className="pt-1.5 text-xs text-app-text">Open all day</p>
        ) : (
          <RangesEditor ranges={day.ranges} label={name} onChange={(ranges) => onChange({ ...day, ranges })} />
        )}
      </div>
      {day.enabled && (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon={Sun} aria-pressed={allDay} onClick={() => onChange({ ...day, ranges: allDay ? [{ from: "09:00", to: "18:00" }] : [ALL_DAY] })}>
            {allDay ? "Set hours" : "All day"}
          </Button>
          <IconButton icon={Copy} size="sm" label={`Copy ${name}'s hours to every day`} onClick={onCopyToAll} />
        </div>
      )}
    </div>
  );
};

const ExceptionRow = ({ exception, onChange, onRemove }) => {
  const label = exception.label || "Exception";
  return (
    <div className="space-y-3 rounded-lg border border-app-border! bg-app-surface p-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-end">
        <Field label="Dates" as="div">
          <DatePicker
            mode="range"
            aria-label={`${label} dates`}
            value={{ start: exception.from, end: exception.to }}
            onChange={(range) => onChange({ ...exception, from: range?.start || "", to: range?.end || range?.start || "" })}
          />
        </Field>
        <Field label="Label">
          <Input value={exception.label} maxLength={60} placeholder="e.g. Diwali" onChange={(e) => onChange({ ...exception, label: e.target.value })} />
        </Field>
        <IconButton icon={Trash2} tone="danger" label={`Remove ${label}`} onClick={onRemove} />
      </div>
      <Segmented
        label={`${label} hours`}
        options={[{ value: "closed", label: "Closed" }, { value: "custom", label: "Custom hours" }]}
        value={exception.closed ? "closed" : "custom"}
        onChange={(v) => onChange({ ...exception, closed: v === "closed", ranges: v === "custom" && !exception.ranges?.length ? [{ from: "10:00", to: "16:00" }] : exception.ranges || [] })}
      />
      {!exception.closed && <RangesEditor ranges={exception.ranges || []} label={label} onChange={(ranges) => onChange({ ...exception, ranges })} />}
    </div>
  );
};

// Holidays / special dates of a schedule (also shown on its own card)
export const ExceptionsEditor = ({ value, onChange, showHeading = true }) => {
  const set = (changes) => onChange({ ...value, ...changes });
  return (
        <div className="space-y-2" role="group" aria-label="Holidays and exceptions">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={showHeading ? "" : "sr-only"}>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-app-text"><CalendarOff className="size-4" aria-hidden="true" /> Holidays and exceptions</h3>
              <p className="text-xs text-app-text-muted">These dates replace the weekly hours. A closed day also ends the night before at midnight.</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={Plus}
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                set({ exceptions: [...(value.exceptions || []), { from: today, to: today, closed: true, ranges: [], label: "" }] });
              }}
            >
              Add date
            </Button>
          </div>
          {(value.exceptions || []).map((exception, i) => (
            <ExceptionRow
              key={i}
              exception={exception}
              onChange={(next) => set({ exceptions: value.exceptions.map((e, j) => (j === i ? next : e)) })}
              onRemove={() => set({ exceptions: value.exceptions.filter((_, j) => j !== i) })}
            />
          ))}
          {!value.exceptions?.length && <p className="text-xs text-app-text-muted">No holidays or special days yet.</p>}
        </div>
  );
};

const ScheduleEditor = ({ value, onChange, errors = [], showExceptions = true }) => {
  // the saved zone may be an alias the browser lists under another name (Asia/Kolkata vs Asia/Calcutta)
  const timezones = useMemo(() => [...new Set([value.timezone, ...allTimezones()])].filter(Boolean).map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") })), [value.timezone]);
  const set = (changes) => onChange({ ...value, ...changes });
  const setDay = (next) => set({ weekly: value.weekly.map((d) => (d.day === next.day ? next : d)) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Time zone" as="div" className="w-full sm:w-72">
          <Select options={timezones} value={value.timezone} onChange={(e) => set({ timezone: e.target.value })} aria-label="Time zone" />
        </Field>
        <div className="flex items-center gap-2 pb-2 text-sm text-app-text">
          <Switch label="Open 24/7" checked={value.alwaysOpen} onChange={(alwaysOpen) => set({ alwaysOpen })} />
          <span aria-hidden="true">Open 24/7</span>
        </div>
      </div>

      {!value.alwaysOpen && (
        <div className="space-y-2" role="group" aria-label="Weekly hours">
          {MONDAY_FIRST.map((dayNumber) => {
            const day = value.weekly.find((d) => d.day === dayNumber) || { day: dayNumber, enabled: false, ranges: [] };
            return <DayRow key={dayNumber} day={day} onChange={setDay} onCopyToAll={() => set({ weekly: copyDayToAll(value.weekly, dayNumber) })} />;
          })}
          <Button size="sm" variant="ghost" icon={Copy} onClick={() => set({ weekly: copyDayToAll(value.weekly, 1) })}>Copy Monday to all days</Button>
        </div>
      )}

      {showExceptions && <ExceptionsEditor value={value} onChange={onChange} />}

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-lg bg-app-danger-soft p-3 text-xs text-app-danger">
          {errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      )}
    </div>
  );
};

export default ScheduleEditor;

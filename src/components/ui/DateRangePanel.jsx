import { useState } from "react";
import { formatRange, parseISODate } from "../../utils/datePresets";
import Button from "./Button";
import Calendar from "./Calendar";

const EMPTY = { start: null, end: null, preset: null, label: null };

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

// What opens inside a DatePopover to choose a range: quick presets, start and
// end boxes, the calendar and the action buttons. Render it only while open.
//
// presets        [{ key, label, get() -> { start, end } }]
// initial        { start, end, preset?, label? } to start from, or null
// min / max      "YYYY-MM-DD" limits of the calendar
// onSubmit       gets { start, end, preset, label }
// onCancel       the Cancel button
// onClear        shows a Clear button
// submitLabel, submitIcon, loading    the main button
// hint           a line of help above the buttons
// sheet          true on a phone, as DatePopover says
const DateRangePanel = ({
  presets,
  initial,
  min,
  max,
  onSubmit,
  onCancel,
  onClear,
  submitLabel = "Apply",
  submitIcon,
  loading = false,
  hint,
  sheet,
}) => {
  const [draft, setDraft] = useState(initial || EMPTY);
  const [editing, setEditing] = useState("start");

  const pickDays = ({ start, end }) => {
    setDraft({ start, end, preset: null, label: null });
    setEditing(end ? "start" : "end");
  };

  const pickPreset = (preset) => {
    setDraft({ ...preset.get(), preset: preset.key, label: preset.label });
    setEditing("start");
  };

  // one click is enough for a single day
  const picked = draft.start ? { ...draft, end: draft.end || draft.start } : null;

  // a list down the side of the popover; a row of chips in the sheet
  const presetButton = (active) =>
    sheet
      ? `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
          active
            ? "border-blue-500! bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "border-app-border! text-app-text"
        }`
      : `w-full px-4 py-2 text-left text-sm transition ${
          active
            ? "bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400"
            : "text-app-text hover:bg-app-surface-secondary"
        }`;

  const buttonSize = sheet ? "md" : "sm";

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div
          className={
            sheet
              ? "hide-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 py-3"
              : "w-52 shrink-0 overflow-y-auto border-r border-app-border! py-2"
          }
        >
          <button
            type="button"
            className={presetButton(!draft.preset)}
            onClick={() => setDraft({ ...draft, preset: null, label: null })}
          >
            Custom
          </button>
          {!sheet && <div className="my-1 border-t border-app-border!" />}
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={presetButton(draft.preset === preset.key)}
              onClick={() => pickPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3">
          <div className="flex shrink-0 items-center gap-2">
            <DateBox label="Start date" value={draft.start} active={editing === "start"} onClick={() => setEditing("start")} />
            <span className="text-app-text-faint">–</span>
            <DateBox label="End date" value={draft.end} active={editing === "end"} onClick={() => setEditing("end")} />
          </div>
          <Calendar
            mode="range"
            value={draft}
            onChange={pickDays}
            selecting={editing}
            min={min}
            max={max}
            fill
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-app-border! px-4 py-3">
        <div className={`text-xs ${sheet ? "w-full" : "min-w-0 flex-1"}`}>
          <p className="truncate text-app-text-muted">
            {picked
              ? `${formatRange(picked)} · ${dayCount(picked)} ${dayCount(picked) === 1 ? "day" : "days"}`
              : "Pick a start and an end date"}
          </p>
          {/* on a short screen the calendar needs the room more */}
          {hint && (
            <p className="mt-0.5 text-[11px] text-app-text-faint [@media(max-height:640px)]:hidden">
              {hint}
            </p>
          )}
        </div>
        <div className={`flex gap-2 ${sheet ? "w-full *:flex-1" : "shrink-0"}`}>
          {onClear && (
            <Button variant="ghost" size={buttonSize} onClick={onClear}>
              Clear
            </Button>
          )}
          <Button variant="ghost" size={buttonSize} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size={buttonSize}
            icon={submitIcon}
            loading={loading}
            disabled={!picked}
            onClick={() => onSubmit(picked)}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DateRangePanel;

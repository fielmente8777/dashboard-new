import { X } from "lucide-react";
import DatePicker from "./ui/DatePicker";
import { Field } from "./ui/Field";
import IconButton from "./ui/IconButton";
import { getFollowUpError, todayValue, toFollowUpValue } from "./followUp";

const formatReminder = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

// The date (required) and time (optional) of a follow-up, kept as
// { date: "2026-11-05", time: "14:30" | "" }. Turn it into the saved value
// with toFollowUpValue; getFollowUpError says whether it can be saved.
// `inline` shows the calendar in place (in a dialog) instead of a field.
//
// Date and time are two pickers on purpose: one calendar with the time list
// beside it is wider than a phone.
const FollowUpFields = ({ value, onChange, inline = false }) => {
  const today = todayValue();
  const set = (field) => (next) => onChange({ ...value, [field]: next });
  const error = value.date ? getFollowUpError(value) : "";
  const isToday = value.date === today;

  const datePicker = (
    <DatePicker
      inline={inline}
      mode="date"
      min={today}
      value={value.date}
      onChange={set("date")}
      aria-label="Follow-up date"
    />
  );

  return (
    <div className="space-y-3">
      <div
        className={
          inline
            ? "space-y-3"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        }
      >
        {inline ? (
          <div className="flex justify-center">{datePicker}</div>
        ) : (
          <Field label="Date" as="div">
            {datePicker}
          </Field>
        )}

        <Field label="Time (optional)" as="div">
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <DatePicker
                mode="time"
                timeStep={5}
                value={value.time}
                onChange={set("time")}
                placeholder="Any time"
                aria-label="Follow-up time"
                // today, only the times still ahead
                filterTime={isToday ? (time) => time > new Date() : undefined}
              />
            </div>
            {value.time && (
              <IconButton
                icon={X}
                label="Clear the time"
                onClick={() => onChange({ ...value, time: "" })}
              />
            )}
          </div>
        </Field>
      </div>

      <p
        className={`text-xs ${error ? "text-red-500" : "text-app-text-faint"}`}
        role={error ? "alert" : undefined}
      >
        {error ||
          (value.date
            ? `Reminder on ${formatReminder(toFollowUpValue(value))}${
                value.time ? "" : " (no time picked)"
              }.`
            : "Pick a date to set the follow-up. The time is optional.")}
      </p>
    </div>
  );
};

export default FollowUpFields;

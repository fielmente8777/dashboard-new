import { Clock } from "lucide-react";
import Card from "../../../../components/ui/Card";
import DatePicker from "../../../../components/ui/DatePicker";
import { Field, Select } from "../../../../components/ui/Field";
import Segmented from "../../../../components/ui/Segmented";
import Switch from "../../../../components/ui/Switch";
import { DAY_LABELS, DAY_ORDER, TIMEZONE_OPTIONS } from "../../agentOptions";
import { SectionTitle } from "./PersonaSection";

// When the agent replies: always, or set hours per day. Hours that end before
// they start run past midnight (e.g. 20:00 to 08:00 = nights).
const ScheduleSection = ({ draft, set }) => {
  const { schedule } = draft;

  const setDay = (day, changes) =>
    set(
      "schedule.days",
      schedule.days.map((item) => (item.day === day ? { ...item, ...changes } : item)),
    );

  const copyMondayToAll = () => {
    const monday = schedule.days.find((item) => item.day === 1);
    set(
      "schedule.days",
      schedule.days.map((item) => ({ ...item, from: monday.from, to: monday.to, enabled: monday.enabled })),
    );
  };

  return (
    <Card
      title={<SectionTitle icon={Clock}>Working hours</SectionTitle>}
      description="When the agent answers. Outside these hours, messages wait for your team."
    >
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Replies" as="div">
          <Segmented
            options={[
              { value: "always", label: "24/7" },
              { value: "custom", label: "Set hours" },
            ]}
            value={schedule.mode}
            onChange={(value) => set("schedule.mode", value)}
          />
        </Field>
        <Field label="Time zone" as="div" className="w-56">
          <Select
            options={TIMEZONE_OPTIONS}
            value={schedule.timezone}
            onChange={(e) => set("schedule.timezone", e.target.value)}
            aria-label="Time zone"
          />
        </Field>
      </div>

      {schedule.mode === "custom" && (
        <div className="mt-4 space-y-2">
          {DAY_ORDER.map((dayNumber) => {
            const day = schedule.days.find((item) => item.day === dayNumber);
            if (!day) return null;
            const overnight = day.enabled && day.from > day.to;
            return (
              <div
                key={dayNumber}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-app-border! px-3 py-2"
              >
                <div className="flex w-36 items-center gap-2">
                  <Switch
                    label={`${DAY_LABELS[dayNumber]} on`}
                    checked={day.enabled}
                    onChange={(value) => setDay(dayNumber, { enabled: value })}
                  />
                  <span className="text-sm text-app-text">{DAY_LABELS[dayNumber]}</span>
                </div>
                {day.enabled ? (
                  <>
                    <div className="w-32">
                      <DatePicker
                        mode="time"
                        aria-label={`${DAY_LABELS[dayNumber]} from`}
                        value={day.from}
                        onChange={(value) => setDay(dayNumber, { from: value })}
                      />
                    </div>
                    <span className="text-xs text-app-text-muted">to</span>
                    <div className="w-32">
                      <DatePicker
                        mode="time"
                        aria-label={`${DAY_LABELS[dayNumber]} to`}
                        value={day.to}
                        onChange={(value) => setDay(dayNumber, { to: value })}
                      />
                    </div>
                    {overnight && (
                      <span className="text-xs text-app-text-faint">runs past midnight</span>
                    )}
                    {day.from === day.to && (
                      <span className="text-xs text-app-text-faint">all day</span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-app-text-muted">AI off — your team replies</span>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={copyMondayToAll}
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Copy Monday's hours to every day
          </button>
        </div>
      )}
    </Card>
  );
};

export default ScheduleSection;

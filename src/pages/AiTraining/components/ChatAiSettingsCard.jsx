import { CalendarCheck, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";
import { useApiAction } from "../../../hooks/useApiAction";
import { hasTenant } from "../../../hooks/useTenant";
import {
  useGetChatAiSettingsQuery,
  useUpdateChatAiSettingsMutation,
} from "../../../redux/api/aiTrainingApi";

const MESSAGE_LIMIT = 500;
// Monday first, as people read a week; `day` is 0 = Sunday like the server
const WEEK = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
  day,
  label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
}));
const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Europe/London",
  "UTC",
];

const SettingRow = ({ title, hint, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="min-w-0">
      <p className="text-sm font-medium text-app-text">{title}</p>
      <p className="mt-0.5 text-xs text-app-text-muted">{hint}</p>
    </div>
    <Switch label={title} checked={checked} onChange={onChange} />
  </div>
);

// The form edits one set of hours for every selected day.
const toForm = (settings) => {
  const days = settings.teamHours.days;
  const first = days.find((d) => d.enabled) || days[0];
  return {
    liveAvailability: settings.liveAvailability,
    hoursOn: settings.teamHours.enabled,
    timezone: settings.teamHours.timezone,
    activeDays: days.filter((d) => d.enabled).map((d) => d.day),
    from: first?.from || "09:00",
    to: first?.to || "18:00",
    unknownInfoMessage: settings.unknownInfoMessage,
    afterHoursMessage: settings.afterHoursMessage,
  };
};

const toSettings = (form) => ({
  liveAvailability: form.liveAvailability,
  teamHours: {
    enabled: form.hoursOn,
    timezone: form.timezone,
    days: WEEK.map(({ day }) => ({
      day,
      enabled: form.activeDays.includes(day),
      from: form.from,
      to: form.to,
    })),
  },
  unknownInfoMessage: form.unknownInfoMessage.trim(),
  afterHoursMessage: form.afterHoursMessage.trim(),
});

// What the WhatsApp / website AI does when it can't answer, by time of day,
// and whether it may check availability itself.
const ChatAiSettingsCard = ({ tenant }) => {
  const run = useApiAction();
  const settings = useGetChatAiSettingsQuery(tenant, { skip: !hasTenant(tenant) });
  const [update, { isLoading: saving }] = useUpdateChatAiSettingsMutation();
  const [form, setForm] = useState(null);

  const saved = useMemo(() => (settings.data ? toForm(settings.data) : null), [settings.data]);
  useEffect(() => {
    if (saved) setForm(saved);
  }, [saved]);

  if (settings.error?.status === 404) {
    return (
      <Card title="When the AI doesn't know">
        <p className="text-sm text-app-text-muted">These settings arrive with the next server update.</p>
      </Card>
    );
  }
  if (!form) return <Skeleton className="h-72 rounded-xl" />;

  const set = (changes) => setForm((current) => ({ ...current, ...changes }));
  const changed = JSON.stringify(form) !== JSON.stringify(saved);
  const messagesFilled = form.unknownInfoMessage.trim() && form.afterHoursMessage.trim();
  const toggleDay = (day) =>
    set({
      activeDays: form.activeDays.includes(day)
        ? form.activeDays.filter((d) => d !== day)
        : [...form.activeDays, day],
    });

  const save = () =>
    run(update({ ...tenant, ...toSettings(form) }), {
      success: "Settings saved",
      error: "Could not save the settings.",
    });

  const timezones = TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES];

  return (
    <Card
      title="When the AI doesn't know"
      description="How your WhatsApp and website AI hands a question to your team, depending on the time of day."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-app-surface-secondary px-2.5 py-1 text-[11px] font-medium text-app-text-muted">
          <Icon icon={Clock} size="sm" />
          {form.hoursOn ? `Calls ${form.from}–${form.to}` : "Calls any time"}
        </span>
      }
    >
      <div className="divide-y divide-app-border!">
        <SettingRow
          title="Booking engine connected"
          hint="On: the AI checks live availability for the guest's dates. Off: it never says dates are available or takes bookings. It notes the request and hands it to your team."
          checked={form.liveAvailability}
          onChange={(on) => set({ liveAvailability: on })}
        />

        <div className="py-3">
          <SettingRow
            title="Team phone hours"
            hint="Inside these hours the AI offers a Call button. Outside them it sends the after-hours message instead. Off: the Call button is offered at any time."
            checked={form.hoursOn}
            onChange={(on) => set({ hoursOn: on })}
          />

          {form.hoursOn && (
            <div className="mt-1 space-y-3">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days">
                {WEEK.map(({ day, label }) => {
                  const on = form.activeDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleDay(day)}
                      className={`h-8 min-w-11 rounded-full border px-3 text-xs font-medium transition-colors ${
                        on
                          ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
                          : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="From">
                  <Input type="time" value={form.from} onChange={(e) => set({ from: e.target.value })} />
                </Field>
                <Field label="To">
                  <Input type="time" value={form.to} onChange={(e) => set({ to: e.target.value })} />
                </Field>
                <Field label="Time zone">
                  <Select
                    aria-label="Time zone"
                    value={form.timezone}
                    onChange={(e) => set({ timezone: e.target.value })}
                    options={timezones.map((tz) => ({ value: tz, label: tz }))}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 grid gap-4 md:grid-cols-2">
        <Field
          label={form.hoursOn ? "Message with the Call button (team hours)" : "Message with the Call button"}
          hint={`${form.unknownInfoMessage.length}/${MESSAGE_LIMIT}`}
        >
          <Textarea
            rows={3}
            maxLength={MESSAGE_LIMIT}
            value={form.unknownInfoMessage}
            onChange={(e) => set({ unknownInfoMessage: e.target.value })}
          />
        </Field>
        <Field
          label="Message outside team hours"
          hint={
            form.hoursOn
              ? `${form.afterHoursMessage.length}/${MESSAGE_LIMIT}`
              : "Used only when team phone hours are on."
          }
        >
          <Textarea
            rows={3}
            maxLength={MESSAGE_LIMIT}
            value={form.afterHoursMessage}
            disabled={!form.hoursOn}
            onChange={(e) => set({ afterHoursMessage: e.target.value })}
          />
        </Field>
      </div>

      {!form.liveAvailability && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-app-text-muted">
          <Icon icon={CalendarCheck} size="xs" className="mt-0.5" />
          Availability, rates for dates, bookings and payments go to your team the same way.
        </p>
      )}

      {changed && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setForm(saved)}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={saving}
            disabled={!messagesFilled || (form.hoursOn && form.activeDays.length === 0)}
            onClick={save}
          >
            Save settings
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ChatAiSettingsCard;

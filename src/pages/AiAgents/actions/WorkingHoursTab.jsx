import { CalendarClock, Clock, MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Dialog from "../../../components/ui/Dialog";
import { Field, Select, Textarea } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Segmented from "../../../components/ui/Segmented";
import { Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useBulkScheduleAiAgentActionsMutation, useGetAiAgentActionsAvailabilityQuery, useGetAiAgentActionsQuery } from "../../../redux/api/aiAgentsApi";
import { LANGUAGE_OPTIONS } from "../agentOptions";
import { SCHEDULE_MODES, typeLabel } from "./actionModel";
import ScheduleEditor, { ExceptionsEditor } from "./ScheduleEditor";
import { formatInZone, officeHours, summarizeWeekly, validateSchedule } from "./scheduleCore";

const OUT_OF_HOURS = [
  { value: "silent", label: "Stay quiet", hint: "Your team replies when they're back (how it worked before)." },
  { value: "auto_message", label: "Send an away message", hint: "Once per chat every 12 hours. No AI credits." },
  { value: "collect_lead", label: "Collect lead details only", hint: "The AI answers simple questions and takes name, phone and dates. Uses AI credits." },
  { value: "handoff", label: "Hand off to your team", hint: "The chat goes to your team's queue and they're notified." },
];

const NowStatus = ({ status }) => {
  if (!status) return <span className="text-xs text-app-text-muted">—</span>;
  return status.open ? (
    <span className="text-xs font-medium text-app-success">Open now</span>
  ) : (
    <span className="text-xs text-app-warning">
      <span className="font-medium">Closed</span>
      {status.nextOpenAt && <span className="block text-app-text-muted">Next opens {formatInZone(status.nextOpenAt, status.timezone)}</span>}
    </span>
  );
};

// Edit one or several actions' schedule (mode + hours)
const ActionScheduleDialog = ({ open, title, initial, onClose, onSave, saving }) => {
  const [value, setValue] = useState(initial);
  const errors = value.mode === "custom" ? validateSchedule(value) : [];
  return (
    <Dialog open={open} title={title} description="Saved as a draft right away. Guests get it after you publish." onClose={onClose} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={saving} disabled={errors.length > 0} onClick={() => onSave(value)}>Save schedule</Button></>}>
      <div className="space-y-4">
        <Segmented label="When it can run" options={SCHEDULE_MODES} value={value.mode} onChange={(mode) => setValue({ ...value, mode })} />
        {value.mode === "custom" && <ScheduleEditor value={value} onChange={(next) => setValue({ ...next, mode: "custom" })} errors={errors} />}
        {value.mode === "inherit" && <p className="text-sm text-app-text-muted">Runs whenever the agent is working.</p>}
        {value.mode === "always" && <p className="text-sm text-app-text-muted">Runs any time, also outside the agent&apos;s hours (when the agent replies out of hours).</p>}
      </div>
    </Dialog>
  );
};

const WorkingHoursTab = ({ agent, channel, hid }) => {
  const { showToast } = useToast();
  const hours = agent.draft.workingHours;
  const set = (next) => agent.set("workingHours", next);
  const errors = validateSchedule(hours);
  const { data: actionsData } = useGetAiAgentActionsQuery({ channel, hid });
  const { data: availability } = useGetAiAgentActionsAvailabilityQuery({ channel, hid }, { pollingInterval: 60000 });
  const [bulkSchedule, { isLoading: saving }] = useBulkScheduleAiAgentActionsMutation();
  const [selected, setSelected] = useState([]);
  const [dialog, setDialog] = useState(null); // { ids, title, initial }

  const actions = actionsData?.actions || [];
  const statusOf = useMemo(() => Object.fromEntries((availability?.actions || []).map((a) => [a.id, a])), [availability]);
  const nextOpen = availability?.agent?.nextOpenAt ? formatInZone(availability.agent.nextOpenAt, availability.timezone) : "tomorrow at 09:00";
  const previewText = (hours.outOfHours.message || "").replace(/\{\{\s*nextOpen\s*\}\}/g, nextOpen);

  const saveSchedule = async (ids, schedule) => {
    try {
      await bulkSchedule({ channel, hid, ids, schedule }).unwrap();
      showToast({ message: ids.length > 1 ? `Schedule applied to ${ids.length} actions. Publish to make it live.` : "Schedule saved. Publish to make it live." });
      setDialog(null);
      setSelected([]);
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not save the schedule."), type: "error" });
    }
  };

  const setMode = (action, mode) => {
    if (mode === "custom") {
      setDialog({ ids: [action.id], title: `When "${action.draft.name}" can run`, initial: { ...officeHours(hours.timezone), ...action.draft.schedule, mode } });
    } else saveSchedule([action.id], { ...action.draft.schedule, mode });
  };

  const translations = hours.outOfHours.translations || [];
  const setOoh = (changes) => set({ ...hours, outOfHours: { ...hours.outOfHours, ...changes } });

  return (
    <div className="min-w-0 space-y-4">
      <Card
        title={<span className="flex items-center gap-2"><Clock className="size-4" aria-hidden="true" /> Agent hours</span>}
        description="When the agent replies. Part of the agent's draft: Save draft, then Publish."
        actions={availability?.agent && <NowStatus status={{ ...availability.agent, timezone: availability.timezone }} />}
      >
        <ScheduleEditor value={hours} onChange={set} errors={errors} showExceptions={false} />
      </Card>

      <Card title={<span className="flex items-center gap-2"><CalendarClock className="size-4" aria-hidden="true" /> Holidays and exceptions</span>} description="Closed days or special hours on specific dates, e.g. Diwali or New Year's Eve.">
        <ExceptionsEditor value={hours} onChange={set} showHeading={false} />
      </Card>

      <Card title={<span className="flex items-center gap-2"><MessageSquareText className="size-4" aria-hidden="true" /> Outside working hours</span>} description="What happens when a guest writes while the agent is off.">
        <div role="radiogroup" aria-label="Outside working hours" className="grid gap-2 md:grid-cols-2">
          {OUT_OF_HOURS.map((option) => {
            const checked = hours.outOfHours.mode === option.value;
            return (
              <button key={option.value} type="button" role="radio" aria-checked={checked} onClick={() => setOoh({ mode: option.value })}
                className={`rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus ${checked ? "border-app-accent! bg-app-accent-soft" : "border-app-border! hover:bg-app-surface-secondary"}`}>
                <span className={`block text-sm font-medium ${checked ? "text-app-accent-text" : "text-app-text"}`}>{option.label}</span>
                <span className="mt-0.5 block text-xs text-app-text-muted">{option.hint}</span>
              </button>
            );
          })}
        </div>
        {hours.outOfHours.mode === "auto_message" && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
            <div className="space-y-3">
              <Field label="Away message" hint="{{nextOpen}} becomes e.g. “tomorrow at 09:00”.">
                <Textarea rows={3} maxLength={1000} value={hours.outOfHours.message} onChange={(e) => setOoh({ message: e.target.value })} />
              </Field>
              {translations.map((t, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-start">
                  <Select aria-label={`Translation ${i + 1} language`} options={LANGUAGE_OPTIONS} value={t.language} onChange={(e) => setOoh({ translations: translations.map((x, j) => (j === i ? { ...x, language: e.target.value } : x)) })} />
                  <Textarea rows={2} aria-label={`${t.language} message`} value={t.message} onChange={(e) => setOoh({ translations: translations.map((x, j) => (j === i ? { ...x, message: e.target.value } : x)) })} />
                  <IconButton icon={Trash2} tone="danger" label={`Remove ${t.language} message`} onClick={() => setOoh({ translations: translations.filter((_, j) => j !== i) })} />
                </div>
              ))}
              <Button size="sm" variant="dashed" icon={Plus} onClick={() => setOoh({ translations: [...translations, { language: "Hindi", message: "" }] })} disabled={translations.length >= 12}>Add a language</Button>
              <p className="text-xs text-app-text-muted">An agent set to one fixed language sends that language&apos;s message; otherwise the main message is sent.</p>
            </div>
            <div aria-label="Preview" className="rounded-xl bg-app-surface-secondary p-3">
              <p className="mb-2 text-xs font-medium text-app-text-muted">Preview</p>
              <p className="ml-auto w-fit max-w-full rounded-2xl rounded-br-sm bg-app-accent-soft px-3 py-2 text-sm text-app-text">{previewText || "…"}</p>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="When each action can run"
        description="Actions follow the agent's hours unless you set their own. Saved as drafts right away; live after Publish."
        actions={selected.length > 0 && (
          <Button size="sm" onClick={() => setDialog({ ids: selected, title: `Schedule for ${selected.length} action${selected.length > 1 ? "s" : ""}`, initial: { mode: "custom", ...officeHours(hours.timezone) } })}>
            Apply a schedule to {selected.length}
          </Button>
        )}
      >
        {!actionsData ? <Skeleton className="h-40" /> : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Action schedules</caption>
              <thead className="text-xs text-app-text-muted">
                <tr className="border-b border-app-border">
                  <th scope="col" className="w-10 px-3 py-2">
                    <input type="checkbox" aria-label="Select all actions" className="size-4 accent-app-accent" checked={selected.length === actions.length && actions.length > 0} onChange={(e) => setSelected(e.target.checked ? actions.map((a) => a.id) : [])} />
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">Action</th>
                  <th scope="col" className="px-3 py-2 font-medium">Mode</th>
                  <th scope="col" className="px-3 py-2 font-medium">Hours</th>
                  <th scope="col" className="px-3 py-2 font-medium">Now</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => {
                  const mode = action.draft.schedule?.mode || "inherit";
                  const summary = mode === "inherit" ? `Agent hours (${summarizeWeekly(hours)})` : mode === "always" ? "Any time" : summarizeWeekly(action.draft.schedule);
                  return (
                    <tr key={action.id} className={`border-b border-app-border last:border-0 ${selected.includes(action.id) ? "bg-app-accent-soft" : ""}`}>
                      <td className="px-3 py-2">
                        <input type="checkbox" aria-label={`Select ${action.draft.name}`} className="size-4 accent-app-accent" checked={selected.includes(action.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, action.id] : selected.filter((id) => id !== action.id))} />
                      </td>
                      <td className="px-3 py-2">
                        <span className="block font-medium text-app-text">{action.draft.name}</span>
                        <span className="text-xs text-app-text-muted">{typeLabel(action.draft.executor?.type)}{!action.draft.enabled && " · off"}{action.status === "draft" && <Badge tone="amber" className="ml-1.5">unpublished</Badge>}</span>
                      </td>
                      <td className="w-48 px-3 py-2">
                        <Select aria-label={`${action.draft.name} schedule mode`} options={SCHEDULE_MODES} value={mode} onChange={(e) => setMode(action, e.target.value)} />
                      </td>
                      <td className="max-w-64 px-3 py-2 text-xs text-app-text-muted">{summary}</td>
                      <td className="px-3 py-2"><NowStatus status={statusOf[action.id]} /></td>
                      <td className="px-3 py-2 text-right">
                        <IconButton icon={Pencil} label={`Edit when ${action.draft.name} can run`} onClick={() => setDialog({ ids: [action.id], title: `When "${action.draft.name}" can run`, initial: { ...officeHours(hours.timezone), ...action.draft.schedule } })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-app-text-muted">“Now” uses your saved settings and the hotel&apos;s time zone ({availability?.timezone || hours.timezone}).</p>
      </Card>

      {dialog && (
        <ActionScheduleDialog key={dialog.ids.join(",")} open title={dialog.title} initial={dialog.initial} saving={saving} onClose={() => setDialog(null)} onSave={(schedule) => saveSchedule(dialog.ids, schedule)} />
      )}
    </div>
  );
};

export default WorkingHoursTab;

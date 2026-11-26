import { ArrowDown, ArrowUp, Clock3, KeyRound, Lock, Plus, Trash2 } from "lucide-react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Segmented from "../../../components/ui/Segmented";
import Switch from "../../../components/ui/Switch";
import TagInput from "../../../components/ui/TagInput";
import {
  CATEGORIES, CHANNELS, CONDITION_FIELDS, CONDITION_OPS, CONTEXT_VARS, EXECUTOR_TYPES, INPUT_TYPES, MASK, METHODS, RISK_LEVELS, SCHEDULE_MODES,
} from "./actionModel";
import ScheduleEditor from "./ScheduleEditor";
import { formatInZone, summarizeWeekly, validateSchedule } from "./scheduleCore";

// The six tabs of the action editor. Each gets the form, `set(path, value)`
// (dot path, numbers index arrays), the field errors and `meta`.

const mono = "font-mono text-xs";
const err = (errors, key) => errors[key];

const Locked = ({ children }) => (
  <p className="flex items-start gap-2 rounded-lg bg-app-surface-secondary p-3 text-xs text-app-text-muted">
    <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> <span>{children}</span>
  </p>
);

// --- General --------------------------------------------------------------

export const GeneralPanel = ({ form, set, errors, meta }) => (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
      <Field label="Name *" error={err(errors, "name")}>
        <Input value={form.name} maxLength={60} disabled={meta.isBuiltIn} aria-invalid={Boolean(errors.name)} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Book spa slot" />
      </Field>
      <Field label="Category" as="div">
        <Select options={CATEGORIES} value={form.category} disabled={meta.isBuiltIn} onChange={(e) => set("category", e.target.value)} aria-label="Category" />
      </Field>
    </div>
    <Field label="Description *" hint="The AI reads this to decide when to use the action. Say when to use it and when not to." error={err(errors, "description")}>
      <Textarea rows={3} maxLength={1000} value={form.description} aria-invalid={Boolean(errors.description)} onChange={(e) => set("description", e.target.value)} placeholder="Books a spa treatment when the guest asks for a massage or the spa. Not for room bookings." />
    </Field>

    <Field label="Action type" as="div" error={err(errors, "executor.type")}>
      {meta.isBuiltIn ? (
        <Locked>Built-in action: Eazotel runs it with the {form.executor.handlerKey} handler. You can change the description, intents, confirmation and availability.</Locked>
      ) : (
        <div role="radiogroup" aria-label="Action type" className="grid gap-2 sm:grid-cols-2">
          {EXECUTOR_TYPES.map((type) => {
            const disabled = type.value === "code" && !meta.customCodeEnabled;
            const checked = form.executor.type === type.value;
            return (
              <button
                key={type.value}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => set("executor.type", type.value)}
                className={`rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "border-app-accent! bg-app-accent-soft" : "border-app-border! hover:bg-app-surface-secondary"}`}
              >
                <span className={`flex items-center gap-2 text-sm font-medium ${checked ? "text-app-accent-text" : "text-app-text"}`}>
                  {type.label} {disabled && <Badge tone="gray">Coming soon</Badge>}
                </span>
                <span className="mt-0.5 block text-xs text-app-text-muted">{type.hint}</span>
              </button>
            );
          })}
        </div>
      )}
    </Field>

    <Field label="What guests might say (intents)" as="div" hint="Examples help the AI pick this action. Add a few, in the languages your guests use.">
      <TagInput value={form.intents} onChange={(intents) => set("intents", intents.slice(0, 20))} placeholder="e.g. Can I book a massage?" />
    </Field>

    <div className="space-y-3 rounded-lg border border-app-border! p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-app-text">Ask the guest to confirm first</p>
          <p className="text-xs text-app-text-muted">{form.riskLevel === "high" ? "Always on for high-risk actions." : "The AI asks this question and runs the action only after the guest says yes."}</p>
        </div>
        <Switch label="Ask the guest to confirm first" checked={form.requiresConfirmation || form.riskLevel === "high"} disabled={form.riskLevel === "high"} onChange={(on) => set("requiresConfirmation", on)} />
      </div>
      {(form.requiresConfirmation || form.riskLevel === "high") && (
        <Field label="Question" error={err(errors, "confirmationText")}>
          <Input value={form.confirmationText} maxLength={300} onChange={(e) => set("confirmationText", e.target.value)} placeholder="Shall I go ahead and book this for you?" />
        </Field>
      )}
    </div>
  </div>
);

// --- Inputs & mapping -------------------------------------------------------

const blankInput = () => ({ name: "", type: "text", required: false, description: "", enumValues: [], default: null });

export const InputsPanel = ({ form, set, errors, meta }) => {
  const inputs = form.inputs;
  const move = (i, d) => {
    const next = [...inputs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set("inputs", next);
  };
  if (meta.isBuiltIn) {
    return (
      <div className="space-y-3">
        <Locked>The details this built-in action collects are fixed.</Locked>
        <ul className="divide-y divide-app-border rounded-lg border border-app-border!">
          {inputs.map((input) => (
            <li key={input.name} className="flex flex-wrap items-baseline gap-2 px-3 py-2 text-sm">
              <code className={`${mono} text-app-text`}>{input.name}</code>
              <Badge tone="gray">{input.type}</Badge>
              {input.required && <Badge tone="amber">required</Badge>}
              <span className="text-xs text-app-text-muted">{input.description}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-app-text-muted">The details the AI must collect from the guest before running the action. Use them as {"{{input.name}}"} in the URL, body and messages.</p>
      {inputs.map((input, i) => (
        <fieldset key={i} className="space-y-3 rounded-lg border border-app-border! p-3">
          <legend className="sr-only">Input {i + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto] sm:items-end">
            <Field label="Name" error={err(errors, `inputs[${i}].name`)}>
              <Input className={mono} value={input.name} maxLength={40} onChange={(e) => set(`inputs.${i}.name`, e.target.value)} placeholder="checkIn" />
            </Field>
            <Field label="Type" as="div">
              <Select options={INPUT_TYPES} value={input.type} onChange={(e) => set(`inputs.${i}.type`, e.target.value)} aria-label={`Type of input ${i + 1}`} />
            </Field>
            <div className="flex items-center gap-2 pb-2 text-sm text-app-text">
              <Switch label={`Input ${input.name || i + 1} required`} checked={input.required} onChange={(on) => set(`inputs.${i}.required`, on)} />
              <span aria-hidden="true">Required</span>
            </div>
            <div className="flex gap-1 pb-1">
              <IconButton icon={ArrowUp} size="sm" label={`Move ${input.name || "input"} up`} disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon={ArrowDown} size="sm" label={`Move ${input.name || "input"} down`} disabled={i === inputs.length - 1} onClick={() => move(i, 1)} />
              <IconButton icon={Trash2} size="sm" tone="danger" label={`Remove ${input.name || "input"}`} onClick={() => set("inputs", inputs.filter((_, j) => j !== i))} />
            </div>
          </div>
          <Field label="What to ask for (the AI reads this)">
            <Input value={input.description} maxLength={300} onChange={(e) => set(`inputs.${i}.description`, e.target.value)} placeholder="Check-in date" />
          </Field>
          {input.type === "enum" && (
            <Field label="Choices" as="div" error={err(errors, `inputs[${i}].enumValues`)}>
              <TagInput value={input.enumValues || []} onChange={(values) => set(`inputs.${i}.enumValues`, values)} placeholder="Add a choice" />
            </Field>
          )}
          {input.type !== "boolean" && (
            <Field label="Default (optional)" error={err(errors, `inputs[${i}].default`)}>
              <Input value={input.default ?? ""} onChange={(e) => set(`inputs.${i}.default`, e.target.value === "" ? null : e.target.value)} placeholder={input.type === "date" ? "YYYY-MM-DD" : ""} />
            </Field>
          )}
        </fieldset>
      ))}
      <Button variant="dashed" icon={Plus} onClick={() => set("inputs", [...inputs, blankInput()])} disabled={inputs.length >= 20}>Add input</Button>
    </div>
  );
};

// --- Execution --------------------------------------------------------------

const SecretInput = ({ label, value, hasSecret, onChange, error }) => (
  <Field label={label} hint={hasSecret ? "Saved and encrypted. Leave empty to keep it." : "Stored encrypted. Never shown again or sent to the AI."} error={error}>
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-muted" aria-hidden="true" />
      <Input className="pl-9" type="password" autoComplete="new-password" value={value || ""} placeholder={hasSecret ? MASK : ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  </Field>
);

export const ExecutionPanel = ({ form, set, errors, meta }) => {
  const { executor } = form;
  if (meta.isBuiltIn) return <Locked>Runs Eazotel&apos;s built-in <code className={mono}>{executor.handlerKey}</code> handler. Nothing to set up.</Locked>;

  if (executor.type === "builtin") {
    // send_quick_reply is only used by Simple "Reply with a message"
    const handlers = [...meta.handlers, ...(executor.handlerKey === "send_quick_reply" ? [{ key: "send_quick_reply", name: "Reply with a message", description: "Sends the guest the message from the settings below." }] : [])];
    const config = executor.config;
    return (
      <div className="space-y-3">
        <Field label="Built-in handler" as="div" error={err(errors, "executor.handlerKey")} hint={handlers.find((h) => h.key === executor.handlerKey)?.description}>
          <Select options={[{ value: "", label: "Choose…" }, ...handlers.map((h) => ({ value: h.key, label: h.name }))]} value={executor.handlerKey || ""} onChange={(e) => set("executor.handlerKey", e.target.value)} aria-label="Built-in handler" />
        </Field>
        {config && (
          <div className="rounded-lg border border-app-border! p-3">
            <p className="mb-1.5 text-xs font-medium text-app-text-muted">Handler settings (from the Simple form; the model fills the inputs, never these). Edit them in Simple mode.</p>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
              {Object.entries(config).filter(([, v]) => v !== "" && v !== undefined).map(([k, v]) => (
                <Fragment key={k}><dt className="font-mono text-app-text-muted">{k}</dt><dd className="break-words font-mono text-app-text">{String(v)}</dd></Fragment>
              ))}
            </dl>
            {(err(errors, "executor.config.to") || err(errors, "executor.config.text") || err(errors, "executor.config.templateName") || err(errors, "executor.config.messageTemplate")) && (
              <p className="mt-1.5 text-xs text-app-danger">{err(errors, "executor.config.to") || err(errors, "executor.config.text") || err(errors, "executor.config.templateName") || err(errors, "executor.config.messageTemplate")}</p>
            )}
          </div>
        )}
      </div>
    );
  }
  if (executor.type === "code") {
    return meta.customCodeEnabled ? (
      <div className="space-y-2">
        <Locked>Custom code can be saved but is not executed yet: it needs a secure sandbox first.</Locked>
        <Textarea className={mono} rows={10} value={executor.code?.source || ""} onChange={(e) => set("executor.code.source", e.target.value)} aria-label="Code" />
      </div>
    ) : (
      <Locked>Custom code actions are coming soon. Use an API / Webhook or an n8n workflow meanwhile.</Locked>
    );
  }
  if (executor.type === "n8n") {
    return (
      <div className="space-y-4">
        <Field label="n8n webhook URL" hint="We POST { action, input, context } as JSON." error={err(errors, "executor.n8n.webhookUrl")}>
          <Input className={mono} value={executor.n8n?.webhookUrl || ""} onChange={(e) => set("executor.n8n.webhookUrl", e.target.value)} placeholder="https://n8n.example.com/webhook/…" />
        </Field>
        <SecretInput label="Webhook secret (optional, sent as X-Webhook-Secret)" value={executor.n8n?.secret} hasSecret={executor.n8n?.hasSecret} onChange={(v) => set("executor.n8n.secret", v)} />
      </div>
    );
  }

  const http = executor.http;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
        <Field label="Method" as="div">
          <Select options={METHODS} value={http.method} onChange={(e) => set("executor.http.method", e.target.value)} aria-label="Method" />
        </Field>
        <Field label="URL" error={err(errors, "executor.http.url")} hint="Public https addresses only. Variables like {{input.date}} work in the path and query.">
          <Input className={mono} value={http.url} onChange={(e) => set("executor.http.url", e.target.value)} placeholder="https://api.example.com/bookings/{{input.date}}" aria-invalid={Boolean(errors["executor.http.url"])} />
        </Field>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-app-text-muted">Headers</p>
        {http.headers.map((header, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto_auto] sm:items-start">
            <Field error={err(errors, `executor.http.headers[${i}].name`)}>
              <Input className={mono} aria-label={`Header ${i + 1} name`} value={header.name} onChange={(e) => set(`executor.http.headers.${i}.name`, e.target.value)} placeholder="X-Api-Key" />
            </Field>
            <Field error={err(errors, `executor.http.headers[${i}].value`)}>
              <Input className={mono} type={header.secret ? "password" : "text"} autoComplete="new-password" aria-label={`Header ${i + 1} value`} value={header.value} placeholder={header.secret && header.hasSecret ? MASK : ""} onChange={(e) => set(`executor.http.headers.${i}.value`, e.target.value)} />
            </Field>
            <div className="flex items-center gap-1.5 pt-2 text-xs text-app-text">
              <Switch label={`Header ${header.name || i + 1} is secret`} checked={header.secret} onChange={(on) => set(`executor.http.headers.${i}.secret`, on)} />
              <span aria-hidden="true">Secret</span>
            </div>
            <IconButton icon={Trash2} tone="danger" label={`Remove header ${header.name || i + 1}`} onClick={() => set("executor.http.headers", http.headers.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button size="sm" variant="dashed" icon={Plus} onClick={() => set("executor.http.headers", [...http.headers, { name: "", value: "", secret: false }])} disabled={http.headers.length >= 15}>Add header</Button>
      </div>

      {http.method !== "GET" && (
        <Field label="Body (JSON)" error={err(errors, "executor.http.bodyTemplate")} hint={`"{{input.guests}}" alone keeps the number type. Context: ${CONTEXT_VARS.map((v) => `{{context.${v}}}`).join(", ")}`}>
          <Textarea className={mono} rows={6} spellCheck={false} value={http.bodyTemplate} onChange={(e) => set("executor.http.bodyTemplate", e.target.value)} placeholder={'{\n  "date": "{{input.date}}",\n  "guests": "{{input.guests}}"\n}'} />
        </Field>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Timeout (seconds)">
          <Input type="number" min={1} max={15} value={Math.round(http.timeoutMs / 1000)} onChange={(e) => set("executor.http.timeoutMs", Math.min(15, Math.max(1, Number(e.target.value) || 8)) * 1000)} />
        </Field>
        <Field label="Retries" hint="On network errors, 429 and 5xx.">
          <Input type="number" min={0} max={2} value={http.retries} onChange={(e) => set("executor.http.retries", Math.min(2, Math.max(0, Number(e.target.value) || 0)))} />
        </Field>
        <Field label="Authentication" as="div">
          <Segmented label="Authentication" options={[{ value: "none", label: "None" }, { value: "bearer", label: "Bearer" }, { value: "header", label: "Key header" }]} value={http.auth.type} onChange={(v) => set("executor.http.auth.type", v)} />
        </Field>
      </div>
      {http.auth.type === "header" && (
        <Field label="Header name" error={err(errors, "executor.http.auth.headerName")}>
          <Input className={mono} value={http.auth.headerName} onChange={(e) => set("executor.http.auth.headerName", e.target.value)} placeholder="X-Api-Key" />
        </Field>
      )}
      {http.auth.type !== "none" && (
        <SecretInput label={http.auth.type === "bearer" ? "Token" : "Key"} value={http.auth.token} hasSecret={http.auth.hasSecret} onChange={(v) => set("executor.http.auth.token", v)} error={err(errors, "executor.http.auth.token")} />
      )}
    </div>
  );
};

// --- Response ---------------------------------------------------------------

export const ResponsePanel = ({ form, set, errors, meta }) => {
  if (meta.isBuiltIn) return <Locked>Built-in actions answer the AI in a fixed format.</Locked>;
  const { response } = form;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-app-text-muted">Values to read from the response</p>
        {response.mappings.map((m, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_8rem_auto] sm:items-start">
            <Field error={err(errors, `response.mappings[${i}].name`)}>
              <Input className={mono} aria-label={`Output ${i + 1} name`} value={m.name} onChange={(e) => set(`response.mappings.${i}.name`, e.target.value)} placeholder="ref" />
            </Field>
            <Field error={err(errors, `response.mappings[${i}].path`)}>
              <Input className={mono} aria-label={`Output ${i + 1} JSON path`} value={m.path} onChange={(e) => set(`response.mappings.${i}.path`, e.target.value)} placeholder="data.booking.id" />
            </Field>
            <Select options={INPUT_TYPES.filter((t) => t.value !== "enum")} value={m.type} onChange={(e) => set(`response.mappings.${i}.type`, e.target.value)} aria-label={`Output ${i + 1} type`} />
            <IconButton icon={Trash2} tone="danger" label={`Remove output ${m.name || i + 1}`} onClick={() => set("response.mappings", response.mappings.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button size="sm" variant="dashed" icon={Plus} onClick={() => set("response.mappings", [...response.mappings, { name: "", path: "", type: "text" }])}>Add output</Button>
        {!response.mappings.length && <p className="text-xs text-app-text-muted">Without outputs, the AI gets the first 2,000 characters of the response.</p>}
      </div>
      <Field label="Message on success" hint="Optional. Use {{output.name}} and {{input.name}}." error={err(errors, "response.successTemplate")}>
        <Textarea rows={2} maxLength={1000} value={response.successTemplate} onChange={(e) => set("response.successTemplate", e.target.value)} placeholder="Booked! Your reference is {{output.ref}}." />
      </Field>
      <Field label="Message on failure" error={err(errors, "response.failureTemplate")}>
        <Textarea rows={2} maxLength={1000} value={response.failureTemplate} onChange={(e) => set("response.failureTemplate", e.target.value)} placeholder="Sorry, the spa couldn't be booked right now." />
      </Field>
      <Field label="What the AI should say" hint="Instructions for using the result in its reply.">
        <Textarea rows={2} maxLength={1000} value={response.aiInstructions} onChange={(e) => set("response.aiInstructions", e.target.value)} placeholder="Share the reference and the time. Don't share the price unless asked." />
      </Field>
    </div>
  );
};

// --- Conditions & availability ---------------------------------------------

export const ConditionsPanel = ({ form, set, errors, meta }) => {
  const scheduleErrors = form.schedule.mode === "custom" ? validateSchedule(form.schedule) : [];
  const live = meta.availability;
  return (
    <div className="space-y-5">
      {!meta.isBuiltIn && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-app-text-muted">Only offer this action when…</p>
          {form.conditions.map((c, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_minmax(0,1fr)_auto] sm:items-start">
              <div className="flex gap-2">
                <Select options={CONDITION_FIELDS} value={c.field} onChange={(e) => set(`conditions.${i}.field`, e.target.value)} aria-label={`Condition ${i + 1} field`} />
                {c.field === "input" && (
                  <Field error={err(errors, `conditions[${i}].inputName`)}>
                    <Select options={[{ value: "", label: "Input…" }, ...form.inputs.map((input) => ({ value: input.name, label: input.name }))]} value={c.inputName || ""} onChange={(e) => set(`conditions.${i}.inputName`, e.target.value)} aria-label={`Condition ${i + 1} input`} />
                  </Field>
                )}
              </div>
              <Select options={CONDITION_OPS} value={c.op} onChange={(e) => set(`conditions.${i}.op`, e.target.value)} aria-label={`Condition ${i + 1} operator`} />
              {["exists", "not_exists"].includes(c.op) ? <span /> : (
                <Field error={err(errors, `conditions[${i}].value`)}>
                  <Input aria-label={`Condition ${i + 1} value`} value={c.value} onChange={(e) => set(`conditions.${i}.value`, e.target.value)} placeholder={c.op === "in" ? "a, b, c" : c.field.startsWith("lead.has") ? "true" : ""} />
                </Field>
              )}
              <IconButton icon={Trash2} tone="danger" label={`Remove condition ${i + 1}`} onClick={() => set("conditions", form.conditions.filter((_, j) => j !== i))} />
            </div>
          ))}
          <Button size="sm" variant="dashed" icon={Plus} onClick={() => set("conditions", [...form.conditions, { field: "lead.hasPhone", op: "equals", value: "true" }])} disabled={form.conditions.length >= 10}>Add rule</Button>
        </div>
      )}

      <section aria-labelledby="availability-title" className="space-y-3 rounded-lg border border-app-border! p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 id="availability-title" className="flex items-center gap-1.5 text-sm font-semibold text-app-text"><Clock3 className="size-4" aria-hidden="true" /> Availability</h3>
            <p className="text-xs text-app-text-muted">
              {form.schedule.mode === "inherit" ? `Same as the agent: ${summarizeWeekly(meta.agentHours)}` : form.schedule.mode === "always" ? "Any time, even outside the agent's hours." : summarizeWeekly(form.schedule)}
            </p>
            {live && (
              <p className={`mt-1 text-xs font-medium ${live.open ? "text-app-success" : "text-app-warning"}`}>
                {live.open ? "Open now" : `Closed now${live.nextOpenAt ? ` · opens ${formatInZone(live.nextOpenAt, live.timezone)}` : ""}`} <span className="font-normal text-app-text-muted">(saved settings, {live.timezone})</span>
              </p>
            )}
          </div>
          <Link to={meta.workingHoursLink} className="rounded text-xs font-medium text-app-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-app-focus">Open Working Hours</Link>
        </div>
        <Segmented label="Availability" options={SCHEDULE_MODES} value={form.schedule.mode} onChange={(mode) => set("schedule.mode", mode)} />
        {form.schedule.mode === "custom" && (
          <ScheduleEditor value={form.schedule} onChange={(schedule) => set("schedule", { ...schedule, mode: "custom" })} errors={scheduleErrors} />
        )}
      </section>
    </div>
  );
};

// --- Advanced ---------------------------------------------------------------

const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export const AdvancedPanel = ({ form, set, errors, meta }) => (
  <div className="space-y-4">
    <Field label="Key (the tool name the AI calls)" hint={meta.isNew ? "Fixed once saved." : "Can't be changed after creation."} error={err(errors, "key")}>
      <Input className={mono} value={form.key} readOnly={!meta.isNew} disabled={!meta.isNew} onChange={(e) => set("key", e.target.value)} placeholder="book_spa_slot" />
    </Field>
    {!meta.isBuiltIn && (
      <>
        <Field label="Risk level" as="div" hint={RISK_LEVELS.find((r) => r.value === form.riskLevel)?.hint}>
          <Segmented label="Risk level" options={RISK_LEVELS} value={form.riskLevel} onChange={(v) => set("riskLevel", v)} />
        </Field>
        <Field label="Limit per conversation (per 24 hours)" hint="0 = no limit.">
          <Input type="number" min={0} max={50} value={form.rateLimitPerConversation} onChange={(e) => set("rateLimitPerConversation", Math.min(50, Math.max(0, Number(e.target.value) || 0)))} />
        </Field>
        <Field label="Channels" as="div" hint="None selected = every channel.">
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map((c) => (
              <div key={c.value} className="flex items-center gap-2 text-sm text-app-text">
                <Switch label={`Allow in ${c.label}`} checked={form.channels.includes(c.value)} onChange={(on) => set("channels", on ? [...form.channels, c.value] : form.channels.filter((v) => v !== c.value))} />
                <span aria-hidden="true">{c.label}</span>
              </div>
            ))}
          </div>
        </Field>
      </>
    )}
    <dl className="grid gap-x-4 gap-y-2 rounded-lg bg-app-surface-secondary p-3 text-xs sm:grid-cols-2">
      {[
        ["Published version", meta.view?.version ? `v${meta.view.version}` : "Not published yet"],
        ["Status", meta.view ? (meta.view.status === "draft" ? "Changes not published" : "Published") : "New"],
        ["Created", `${when(meta.view?.createdAt)}${meta.view?.createdBy ? ` by ${meta.view.createdBy}` : ""}`],
        ["Updated", `${when(meta.view?.updatedAt)}${meta.view?.updatedBy ? ` by ${meta.view.updatedBy}` : ""}`],
        ["Published", `${when(meta.view?.publishedAt)}${meta.view?.publishedBy ? ` by ${meta.view.publishedBy}` : ""}`],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-app-text-muted">{label}</dt>
          <dd className="text-app-text">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

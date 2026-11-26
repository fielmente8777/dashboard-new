import { Bell, BedDouble, Check, Copy, CreditCard, Download, Headset, MessageSquareText, Play, Plus, Sparkles, Trash2, UserRoundPlus, Wrench, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Chip from "../../../components/ui/Chip";
import { Field, FieldError, Input, Textarea, inputClassName } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import Notice from "../../../components/ui/Notice";
import SaveBar from "../../../components/ui/SaveBar";
import Segmented from "../../../components/ui/Segmented";
import Switch, { SwitchTrack } from "../../../components/ui/Switch";
import { useConfirm } from "../../../context/ConfirmContext";
import ChoiceCard from "../components/ChoiceCard";
import RowMenu from "./RowMenu";
import { QUESTION_PRESETS, askFirstDefault, askFirstLocked, autoTeamMessage, plainSubtitle, questionKey, questionLabel } from "./simpleModel";
import { fill } from "./simpleCopy";

// The Simple form: a header card, then one card per step, then the save bar.
// Edits go up as a whole new simple config (onChange); ActionsTab compiles it.

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus";
const linkButton = `inline-flex items-center gap-1 rounded text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 ${focusRing}`;

// A whole labelled row that switches, like the rows on the Knowledge tab
export const SwitchRow = ({ checked, onChange, label, help, disabled = false }) => {
  const helpId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={help ? helpId : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-lg border border-app-border! p-3 text-left hover:bg-app-surface-secondary disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-app-text">{label}</span>
        {help && <span id={helpId} className="block text-xs text-app-text-muted">{help}</span>}
      </span>
      <SwitchTrack checked={checked} />
    </button>
  );
};

const StepTitle = ({ number, id, children }) => (
  <span id={id} className="flex items-center gap-2">
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-app-accent-soft text-xs font-semibold text-app-accent-text" aria-hidden="true">{number}</span>
    {children}
  </span>
);

const Step = ({ number, title, help, children, id }) => (
  <Card aria-labelledby={id} title={<StepTitle number={number} id={id}>{title}</StepTitle>} description={help}>
    <div className="space-y-4">{children}</div>
  </Card>
);

// Arrow keys inside a group of radio cards
const radioKeys = (e) => {
  if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll('[role="radio"]:not([aria-disabled="true"])')];
  const index = items.indexOf(document.activeElement);
  if (index === -1) return;
  e.preventDefault();
  const next = items[(index + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1) + items.length) % items.length];
  next.focus();
  next.click();
};

// Tap a detail to put {{key}} into a message at the cursor
const FieldChips = ({ questions, copy, onInsert }) =>
  questions.length ? (
    <div className="mt-2 flex flex-wrap gap-2">
      {questions.map((q) => (
        <Chip key={q.key} aria-pressed={undefined} onClick={() => onInsert(q.key)} aria-label={fill(copy.step3.insert, { field: questionLabel(q, copy) })}>
          <Icon icon={Plus} size="xs" /> {questionLabel(q, copy)}
        </Chip>
      ))}
    </div>
  ) : null;

const insertAt = (el, text, token) => {
  const start = el?.selectionStart ?? text.length;
  const end = el?.selectionEnd ?? text.length;
  return `${text.slice(0, start)}{{${token}}}${text.slice(end)}`;
};

// Radio buttons in a short list (who to tell, where the reply comes from)
const RadioList = ({ legend, name, options, value, onChange }) => (
  <fieldset>
    <legend className="mb-1.5 text-xs font-medium text-app-text-muted">{legend}</legend>
    <div className="space-y-1">
      {options.map(([optionValue, label]) => (
        <label key={optionValue} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-app-text">
          <input type="radio" name={name} value={optionValue} checked={value === optionValue} onChange={() => onChange(optionValue)} className="size-4 accent-app-accent" />
          {label}
        </label>
      ))}
    </div>
  </fieldset>
);

const subPanel = "space-y-4 rounded-lg border border-app-border! p-3 sm:p-4";

// --- Create with AI ---------------------------------------------------------

const AiBox = ({ copy, ai, hasContent }) => {
  const { confirm } = useConfirm();
  const [text, setText] = useState("");
  const [problem, setProblem] = useState("");
  const id = useId();
  const run = async () => {
    if (text.trim().length < 10) return setProblem(copy.ai.tooShort);
    setProblem("");
    if (hasContent && !(await confirm(copy.ai.replace, { title: copy.ai.button, confirmText: copy.ai.replaceYes }))) return;
    const ok = await ai.run(text.trim());
    if (ok) setText("");
  };
  return (
    <Card aria-labelledby={`${id}-t`} title={<span id={`${id}-t`} className="flex items-center gap-2"><Icon icon={Sparkles} tone="muted" />{copy.ai.title}</span>}>
      <Field label={copy.ai.label} error={problem} hintId={`${id}-e`}>
        <Textarea rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.ai.placeholder} aria-describedby={`${id}-h`} />
      </Field>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="secondary" icon={Sparkles} loading={ai.loading} onClick={run}>
          {ai.loading ? copy.ai.working : copy.ai.button}
        </Button>
        <p id={`${id}-h`} className="min-w-0 flex-1 basis-56 text-xs text-app-text-faint">
          {copy.ai.helper} {ai.costText}
        </p>
      </div>
      {ai.message && <Notice tone="accent" role="status" className="mt-3">{ai.message}</Notice>}
    </Card>
  );
};

// --- Step 2: questions --------------------------------------------------------

const Questions = ({ config, onChange, copy, errors }) => {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [required, setRequired] = useState(true);
  const [problem, setProblem] = useState("");
  const id = useId();
  const chosen = (preset) => config.questions.some((q) => q.preset === preset);
  const togglePreset = (preset) =>
    onChange({
      ...config,
      questions: chosen(preset) ? config.questions.filter((q) => q.preset !== preset) : [...config.questions, { preset, key: preset, text: "", required: true }],
    });
  const addOwn = () => {
    if (text.trim().length < 2) return setProblem(copy.errors.question);
    const key = questionKey(text, [...config.questions.map((q) => q.key), ...QUESTION_PRESETS]);
    onChange({ ...config, questions: [...config.questions, { preset: "custom", key, text: text.trim(), required }] });
    setAdding(false);
    setText("");
    setRequired(true);
    setProblem("");
  };
  const custom = config.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.preset === "custom");

  return (
    <>
      <div role="group" aria-label={copy.step2.title} className="flex flex-wrap gap-2">
        {QUESTION_PRESETS.map((preset) => (
          <Chip key={preset} selected={chosen(preset)} onClick={() => togglePreset(preset)}>
            {copy.presets[preset]}
          </Chip>
        ))}
        {!adding && (
          <Chip aria-pressed={undefined} className="border-dashed" onClick={() => setAdding(true)}>
            {copy.step2.own}
          </Chip>
        )}
      </div>

      {custom.length > 0 && (
        <ul className="space-y-2">
          {custom.map(({ q, i }) => (
            <li key={q.key} className="flex items-center gap-2 rounded-lg border border-app-border! py-1 pl-3 pr-1">
              <span className="min-w-0 flex-1 text-sm text-app-text">
                {q.text || "…"} {!q.required && <span className="text-xs text-app-text-muted">({copy.step2.optional})</span>}
                <FieldError>{errors[`simple.questions[${i}].text`]}</FieldError>
              </span>
              <IconButton icon={X} tone="danger" label={fill(copy.step2.remove, { q: q.text })} onClick={() => onChange({ ...config, questions: config.questions.filter((_, j) => j !== i) })} />
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className={subPanel}>
          <Field label={copy.step2.ownLabel} error={problem}>
            <Input id={`${id}-q`} autoFocus value={text} maxLength={200} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOwn(); } if (e.key === "Escape") setAdding(false); }} placeholder={copy.step2.ownPh} />
          </Field>
          <label className="flex min-h-9 items-center gap-2.5 text-sm text-app-text">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="size-4 accent-app-accent" />
            {copy.step2.mustAnswer}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={Plus} onClick={addOwn}>{copy.step2.add}</Button>
            <Button variant="ghost" onClick={() => { setAdding(false); setProblem(""); }}>{copy.step2.cancel}</Button>
          </div>
        </div>
      )}
    </>
  );
};

// --- Step 3: what happens next ----------------------------------------------

const KIND_ICONS = { tell_team: Bell, save_lead: UserRoundPlus, reply: MessageSquareText, feature: BedDouble };
const FEATURE_ICONS = { check_rooms: BedDouble, make_booking: Check, payment_link: CreditCard, handoff: Headset };

const NextStep = ({ config, onChange, copy, errors, extras }) => {
  const id = useId();
  const messageRef = useRef(null);
  const replyRef = useRef(null);
  const { next } = config;
  const setNext = (patch) => onChange({ ...config, next: { ...next, ...patch } });
  const choose = (kind) => {
    if (kind === next.kind) return;
    const nextNext = { ...next, kind, feature: kind === "feature" ? next.feature || "check_rooms" : next.feature };
    onChange({ ...config, next: nextNext, askFirst: askFirstDefault(nextNext) });
  };
  const t = next.tellTeam;
  const setTeam = (patch) => setNext({ tellTeam: { ...t, ...patch } });
  const members = (extras.teamUsers || []).filter((u) => u.phone);
  const templates = (extras.templates || []).filter((tpl) => !tpl.status || tpl.status === "APPROVED");

  return (
    <>
      <div role="radiogroup" aria-label={copy.step3.title} onKeyDown={radioKeys} className="grid gap-2 sm:grid-cols-2">
        {["tell_team", "save_lead", "reply", "feature"].map((kind) => (
          <ChoiceCard key={kind} type="radio" icon={KIND_ICONS[kind]} label={copy.step3.kinds[kind].title} hint={copy.step3.kinds[kind].desc} checked={next.kind === kind} onChange={() => choose(kind)} />
        ))}
      </div>
      <FieldError>{errors["simple.next.kind"]}</FieldError>

      {next.kind === "tell_team" && (
        <div className={subPanel}>
          <RadioList legend={copy.step3.who} name={`${id}-who`} options={[["in_app", copy.step3.everyone], ["whatsapp", copy.step3.onWhatsapp]]} value={t.channel} onChange={(channel) => setTeam({ channel })} />
          {t.channel === "whatsapp" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {members.length > 0 && (
                <Field label={copy.step3.pickMember} className="sm:col-span-2">
                  <select className={inputClassName} value={members.find((u) => u.phone === t.to)?.phone || ""} onChange={(e) => { const user = members.find((u) => u.phone === e.target.value); if (user) setTeam({ to: user.phone, toLabel: user.displayName || user.userName || "" }); }}>
                    <option value="">{copy.step3.pickMemberNone}</option>
                    {members.map((u) => <option key={u.emailId || u.phone} value={u.phone}>{u.displayName || u.userName || u.emailId} ({u.phone})</option>)}
                  </select>
                </Field>
              )}
              <Field label={copy.step3.number} hint={copy.step3.numberHelp} error={errors["executor.config.to"]} hintId={`${id}-nh`}>
                <Input type="tel" inputMode="tel" autoComplete="off" value={t.to} onChange={(e) => setTeam({ to: e.target.value })} placeholder={copy.step3.numberPh} aria-invalid={Boolean(errors["executor.config.to"])} aria-describedby={`${id}-nh`} />
              </Field>
              <Field label={copy.step3.whoName}>
                <Input value={t.toLabel} maxLength={60} onChange={(e) => setTeam({ toLabel: e.target.value })} placeholder={copy.step3.whoNamePh} />
              </Field>
            </div>
          )}
          <div>
            <Field label={copy.step3.message} hint={copy.step3.messageHelp} error={errors["simple.next.tellTeam.message"]} hintId={`${id}-mh`}>
              <Textarea ref={messageRef} rows={3} maxLength={1000} value={t.message} onChange={(e) => setTeam({ message: e.target.value })} placeholder={autoTeamMessage(config)} aria-describedby={`${id}-mh`} />
            </Field>
            <FieldChips questions={config.questions} copy={copy} onInsert={(key) => setTeam({ message: insertAt(messageRef.current, t.message || autoTeamMessage(config), key) })} />
          </div>
        </div>
      )}

      {next.kind === "save_lead" && (
        <div className={subPanel}>
          <Field label={copy.step3.status} hint={copy.step3.statusHelp} error={errors["simple.next.saveLead.status"]} hintId={`${id}-sth`}>
            <Input value={next.saveLead.status} maxLength={40} onChange={(e) => setNext({ saveLead: { status: e.target.value } })} placeholder={copy.step3.statusPh} aria-describedby={`${id}-sth`} className="sm:max-w-xs" />
          </Field>
        </div>
      )}

      {next.kind === "reply" && (
        <div className={subPanel}>
          <RadioList legend={copy.step3.replySource} name={`${id}-src`} options={[["text", copy.step3.typeNew], ["template", copy.step3.savedMsg]]} value={next.reply.source} onChange={(source) => setNext({ reply: { ...next.reply, source } })} />
          {next.reply.source === "text" ? (
            <div>
              <Field label={copy.step3.replyText} error={errors["simple.next.reply.text"]}>
                <Textarea ref={replyRef} rows={4} maxLength={1000} value={next.reply.text} onChange={(e) => setNext({ reply: { ...next.reply, text: e.target.value } })} placeholder={copy.step3.replyPh} aria-invalid={Boolean(errors["simple.next.reply.text"])} />
              </Field>
              <FieldChips questions={config.questions} copy={copy} onInsert={(key) => setNext({ reply: { ...next.reply, text: insertAt(replyRef.current, next.reply.text, key) } })} />
            </div>
          ) : (
            <Field label={copy.step3.pickTemplate} as="div" hint={templates.length ? null : copy.step3.noTemplates} error={errors["simple.next.reply.templateName"]}>
              {templates.length > 0 && (
                <select aria-label={copy.step3.pickTemplate} value={next.reply.templateName} onChange={(e) => setNext({ reply: { ...next.reply, templateName: e.target.value } })} className={inputClassName}>
                  <option value="">{copy.step3.pickMemberNone}</option>
                  {templates.map((tpl) => <option key={tpl.name} value={tpl.name}>{tpl.name.replace(/_/g, " ")}</option>)}
                </select>
              )}
            </Field>
          )}
        </div>
      )}

      {next.kind === "feature" && (
        <div role="radiogroup" aria-label={copy.step3.kinds.feature.title} onKeyDown={radioKeys} className="grid gap-2 sm:grid-cols-2">
          {["check_rooms", "make_booking", "payment_link", "handoff"].map((feature) => (
            <ChoiceCard
              key={feature}
              type="radio"
              icon={FEATURE_ICONS[feature]}
              label={copy.step3.features[feature].title}
              hint={copy.step3.features[feature].desc}
              checked={next.feature === feature}
              disabled={feature === "payment_link"}
              badge={feature === "payment_link" ? copy.step3.soon : null}
              onChange={() => { const nextNext = { ...next, feature }; onChange({ ...config, next: nextNext, askFirst: askFirstDefault(nextNext) }); }}
            />
          ))}
          <div className="sm:col-span-2"><FieldError>{errors["simple.next.feature"]}</FieldError></div>
        </div>
      )}

      <button type="button" onClick={() => extras.onOwnSoftware()} className={linkButton} aria-describedby={`${id}-own`}>
        <Icon icon={Wrench} size="xs" /> {copy.step3.ownSoftware}
      </button>
      <span id={`${id}-own`} className="sr-only">{copy.step3.ownSoftwareHelp}</span>
    </>
  );
};

// --- views for actions Simple can't fully edit ----------------------------------

// "Check-in date, YYYY-MM-DD" -> "Check-in date": plain words only
const askLabel = (input, copy) => copy.presets[input.name] || String(input.description || input.name).split(/[,(]/)[0].trim();

const Asks = ({ form, copy }) => (
  <div>
    <p className="mb-1.5 text-xs font-medium text-app-text-muted">{copy.readonly.asks}</p>
    {form.inputs?.length ? (
      <ul className="flex flex-wrap gap-2">
        {form.inputs.map((input) => <li key={input.name}><Badge>{askLabel(input, copy)}</Badge></li>)}
      </ul>
    ) : (
      <p className="text-sm text-app-text-muted">{copy.readonly.nothing}</p>
    )}
  </div>
);

const BuiltInView = ({ form, setForm, copy, errors }) => {
  const id = useId();
  const locked = form.riskLevel === "high";
  return (
    <div className="space-y-4">
      <Notice>{copy.readonly.builtInBody}</Notice>
      <Field label={copy.step1.when} hint={copy.step1.whenHelp} error={errors.description ? copy.errors.whenToUse : null} hintId={`${id}-dh`}>
        <Textarea rows={4} maxLength={1000} value={form.description} onChange={(e) => setForm("description", e.target.value)} aria-describedby={`${id}-dh`} />
      </Field>
      <Asks form={form} copy={copy} />
      <SwitchRow
        checked={locked || form.requiresConfirmation}
        disabled={locked}
        onChange={(on) => { setForm("requiresConfirmation", on); if (on && !form.confirmationText) setForm("confirmationText", "Shall I go ahead?"); }}
        label={copy.askFirst.label}
        help={locked ? copy.askFirst.locked : copy.askFirst.help}
      />
    </div>
  );
};

const AdvancedOnlyView = ({ form, copy, onEditAdvanced }) => (
  <div className="space-y-4">
    <Notice title={copy.readonly.title} actions={<Button variant="secondary" size="sm" onClick={onEditAdvanced}>{copy.readonly.button}</Button>}>
      {copy.readonly.body}
    </Notice>
    <div>
      <p className="mb-1.5 text-xs font-medium text-app-text-muted">{copy.step1.when}</p>
      <p className="text-sm text-app-text">{form.description}</p>
    </div>
    <Asks form={form} copy={copy} />
  </div>
);

// --- the editor -----------------------------------------------------------------

const SimpleEditor = ({
  copy, lang, setLang, mode, onMode,
  view, config, onChange, form, setForm, errors, enabled, onToggle,
  dirty, saving, tried, isNew, ai, extras,
  onTry, onSave, onDelete, onDuplicate, onExport, draftNotice,
}) => {
  const id = useId();
  const [warn, setWarn] = useState(false);
  const isBuiltIn = Boolean(view?.isBuiltIn);
  const editable = !view.readOnly && !isBuiltIn;
  const status = isNew ? copy.header.notSaved : dirty ? copy.header.unsaved : view.status === "draft" ? copy.header.notLive : copy.header.saved;
  const name = (isBuiltIn ? form.name : config.name) || copy.header.newAction;
  const locked = askFirstLocked(config.next);
  // "3 easy steps" is for a new action; a saved one says what it does
  const subtitle = isNew ? copy.header.subtitle : plainSubtitle({ ...view, draft: form }, copy) || copy.header.subtitle;

  const save = (force = false) => {
    if (editable && !tried && !force) return setWarn(true);
    setWarn(false);
    onSave();
  };

  const message = Object.keys(errors).length ? <span className="text-red-500">{copy.footer.fix}</span> : dirty || isNew ? (isNew ? copy.footer.notSaved : copy.footer.unsaved) : copy.footer.saved;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Card
        aria-label={name}
        title={
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 break-words">{name}</span>
            <Badge tone={isNew || dirty ? "purple" : view.status === "draft" ? "amber" : "green"}>{status}</Badge>
            {isBuiltIn && <Badge>{copy.header.builtIn}</Badge>}
            {view.readOnly && <Badge tone="amber">{copy.header.editedAdvanced}</Badge>}
          </span>
        }
        description={subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2">
              <Switch checked={enabled} onChange={onToggle} label={fill(copy.header.toggle, { name })} />
              <span className="text-xs text-app-text-muted" aria-hidden="true">{enabled ? copy.header.on : copy.header.off}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "hi" ? "en" : "hi")} aria-label={copy.lang.label} lang={lang === "hi" ? "en" : "hi"}>{copy.lang.switchTo}</Button>
            <Segmented label={copy.mode.label} options={[{ value: "simple", label: copy.mode.simple }, { value: "advanced", label: copy.mode.advanced }]} value={mode} onChange={onMode} />
            {!isNew && (
              <RowMenu
                label={copy.header.more}
                items={[
                  { label: copy.list.duplicate, icon: Copy, onSelect: onDuplicate },
                  { label: copy.list.export, icon: Download, onSelect: onExport },
                  { label: copy.list.delete, icon: Trash2, danger: true, hidden: isBuiltIn, onSelect: onDelete },
                ]}
              />
            )}
          </div>
        }
      >
        {(draftNotice || !editable) && (
          <div className="space-y-4">
            {draftNotice && (
              <Notice
                tone="warning"
                role="status"
                actions={
                  <>
                    <Button size="sm" variant="secondary" onClick={draftNotice.onKeep}>{copy.footer.keep}</Button>
                    <Button size="sm" variant="ghost" onClick={draftNotice.onDiscard}>{copy.footer.discard}</Button>
                  </>
                }
              >
                {copy.footer.draftKept}
              </Notice>
            )}
            {!editable && (
              <fieldset disabled={saving} className="min-w-0">
                {isBuiltIn ? <BuiltInView form={form} setForm={setForm} copy={copy} errors={errors} /> : <AdvancedOnlyView form={form} copy={copy} onEditAdvanced={() => onMode("advanced")} />}
              </fieldset>
            )}
          </div>
        )}
      </Card>

      {editable && (
        <fieldset disabled={saving} className="min-w-0 space-y-4">
          <AiBox copy={copy} ai={ai} hasContent={Boolean(config.name || config.whenToUse || config.questions.length || config.next.kind)} />

          <Step number={1} id={`${id}-s1`} title={copy.step1.title}>
            <Field label={copy.step1.name} hint={copy.step1.nameHelp} error={errors["simple.name"]} hintId={`${id}-nameh`}>
              <Input value={config.name} maxLength={60} onChange={(e) => onChange({ ...config, name: e.target.value })} placeholder={copy.step1.namePh} aria-invalid={Boolean(errors["simple.name"])} aria-describedby={`${id}-nameh`} />
            </Field>
            <Field label={copy.step1.when} hint={copy.step1.whenHelp} error={errors["simple.whenToUse"]} hintId={`${id}-whenh`}>
              <Textarea rows={3} maxLength={1000} value={config.whenToUse} onChange={(e) => onChange({ ...config, whenToUse: e.target.value })} placeholder={copy.step1.whenPh} aria-invalid={Boolean(errors["simple.whenToUse"])} aria-describedby={`${id}-whenh`} />
            </Field>
            <Button variant="dashed" size="sm" icon={Sparkles} onClick={() => onChange({ ...config, name: copy.step1.exampleName, whenToUse: copy.step1.exampleWhen })}>
              {copy.step1.example}: <span className="font-semibold">{copy.step1.exampleName}</span>
            </Button>
          </Step>

          <Step number={2} id={`${id}-s2`} title={copy.step2.title} help={config.next.kind === "feature" ? null : copy.step2.help}>
            {config.next.kind === "feature" ? (
              <Notice>
                {copy.step2.featureNote} <span className="font-semibold">{copy.step2.featureAsks[config.next.feature]}</span>
              </Notice>
            ) : (
              <Questions config={config} onChange={onChange} copy={copy} errors={errors} />
            )}
          </Step>

          <Step number={3} id={`${id}-s3`} title={copy.step3.title} help={copy.step3.help}>
            <NextStep config={config} onChange={onChange} copy={copy} errors={errors} extras={extras} />
            <SwitchRow checked={locked || config.askFirst} disabled={locked} onChange={(askFirst) => onChange({ ...config, askFirst })} label={copy.askFirst.label} help={locked ? copy.askFirst.locked : copy.askFirst.help} />
          </Step>
        </fieldset>
      )}

      <SaveBar
        show
        message={message}
        saveLabel={copy.footer.save}
        saveIcon={Check}
        onSave={view.readOnly ? undefined : () => save()}
        saving={saving}
        actions={editable && <Button variant="secondary" icon={Play} onClick={onTry} disabled={saving}>{copy.footer.tryIt}</Button>}
      >
        {warn && (
          <Notice
            tone="warning"
            role="alert"
            actions={
              <>
                <Button size="sm" variant="secondary" onClick={() => { setWarn(false); onTry(); }}>{copy.footer.goBack}</Button>
                <Button size="sm" variant="ghost" onClick={() => save(true)}>{copy.footer.saveAnyway}</Button>
              </>
            }
          >
            {copy.footer.notTried}
          </Notice>
        )}
      </SaveBar>
    </div>
  );
};

export default SimpleEditor;

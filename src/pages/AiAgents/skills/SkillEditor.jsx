import { AtSign, Check, Plus, RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";
import { SKILL_LIMITS } from "./skillModel";

const Label = ({ title, hint }) => (
  <span className="block">
    <span className="block text-sm font-semibold text-app-text">{title}</span>
    {hint && <span className="block text-xs font-normal text-app-text-muted">{hint}</span>}
  </span>
);

// The skill on screen: the AI box, the fields, and the actions it works with.
const SkillEditor = ({ form, set, errors, view, actions, dirty, saving, onSave, onDelete, onReset, onToggle, ai }) => {
  const stepsRef = useRef(null);
  const [aiText, setAiText] = useState("");
  const isBuiltIn = Boolean(view?.isBuiltIn);
  const linked = new Set(form.actionKeys);
  const byKey = new Map(actions.map((a) => [a.key, a]));

  const toggleAction = (key) =>
    set("actionKeys", linked.has(key) ? form.actionKeys.filter((k) => k !== key) : [...form.actionKeys, key]);

  // puts "@key" where the cursor is in the steps (or on a new line)
  const insertMention = (key) => {
    const el = stepsRef.current;
    const text = form.steps;
    const at = el && document.activeElement === el ? el.selectionStart : text.length;
    const before = text.slice(0, at);
    const insert = `${before && !/\s$/.test(before) ? " " : ""}@${key} `;
    set("steps", `${before}${insert}${text.slice(at)}`);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + insert.length, at + insert.length);
    });
  };

  const runAi = async () => {
    if (await ai.run(aiText)) setAiText("");
  };

  return (
    <section aria-labelledby="skill-editor-title" className="min-w-0 rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="skill-editor-title" className="flex flex-wrap items-center gap-2 text-base font-semibold text-app-text">
            {form.name || (view ? "Untitled skill" : "New skill")}
            {isBuiltIn && <Badge tone="purple">Built-in</Badge>}
            {view && view.status === "draft" && <Badge tone="amber">Not published</Badge>}
            {!view && <Badge>Not saved</Badge>}
          </h2>
          <p className="text-xs text-app-text-muted">{form.summary || "Tell the assistant how to handle one kind of conversation."}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-app-text-muted">
          {form.enabled ? "On" : "Off"}
          <Switch label={form.enabled ? "Turn this skill off" : "Turn this skill on"} checked={Boolean(form.enabled)} onChange={onToggle} />
        </label>
      </div>

      {/* the easiest way: own words -> AI fills the form */}
      <div className="mt-4 rounded-xl border border-purple-500/30! bg-purple-500/5 p-3">
        <p className="text-sm font-semibold text-app-text">Easiest way: tell us what you want in your own words</p>
        <Textarea
          rows={2}
          maxLength={1500}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="Hamesha pehle guest ka budget poochho, phir sasta room suggest karo, aur last mein spa ka offer do."
          aria-label="Describe the skill in your own words"
          className="mt-2"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button size="sm" icon={Sparkles} loading={ai.loading} disabled={aiText.trim().length < 10} onClick={runAi}>Create with AI</Button>
          <span className="text-xs text-app-text-muted" role="status">{ai.message || "AI writes the skill. You check and save. It uses AI credits."}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={<Label title="Name" />} error={errors.name}>
          <Input value={form.name} maxLength={SKILL_LIMITS.name} onChange={(e) => set("name", e.target.value)} placeholder="Sell rooms & upsell" />
        </Field>
        <Field label={<Label title="Short description" />} error={errors.summary} hint="Shown in the list.">
          <Input value={form.summary} maxLength={SKILL_LIMITS.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Guides guests to book, offers extras" />
        </Field>
      </div>

      <Field className="mt-4" label={<Label title="When should it use this skill?" hint="Guest messages that start this skill, one per line." />} error={errors.triggers}>
        <Textarea rows={2} value={form.triggers} onChange={(e) => set("triggers", e.target.value)} placeholder={"Room available hai?\nPrice for 2 nights"} />
      </Field>

      <Field className="mt-4" label={<Label title="Goal of this skill" hint="One line. What should happen in the end?" />} error={errors.goal}>
        <Input value={form.goal} maxLength={SKILL_LIMITS.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Help the guest pick a room and book directly with us." />
      </Field>

      <Field
        as="div"
        className="mt-4"
        label={<Label title="What should the assistant do?" hint="Simple steps, one per line, in order. Use an action in a step with @, e.g. Run @check_room_availability." />}
        error={errors.steps}
      >
        <Textarea
          ref={stepsRef}
          rows={5}
          value={form.steps}
          onChange={(e) => set("steps", e.target.value)}
          aria-label="Steps, one per line"
          placeholder={"Ask how many guests and which dates.\nRun @check_room_availability\nSuggest 2 rooms that fit the budget.\nAfter the guest picks a room, offer one extra, like breakfast or spa."}
        />
        {form.actionKeys.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-app-text-faint">Insert:</span>
            {form.actionKeys.map((key) => (
              <button key={key} type="button" onClick={() => insertMention(key)} className="inline-flex items-center gap-1 rounded-md bg-app-surface-secondary px-2 py-0.5 font-mono text-xs text-app-text-muted hover:text-app-text">
                <AtSign className="size-3" aria-hidden="true" />{key}
              </button>
            ))}
          </div>
        )}
      </Field>

      <Field className="mt-4" label={<Label title="What should it NOT do?" hint="One per line." />} error={errors.donts}>
        <Textarea rows={2} value={form.donts} onChange={(e) => set("donts", e.target.value)} placeholder={"Never promise a discount.\nNever push more than one extra."} />
      </Field>

      <Field className="mt-4" label={<Label title="Example chat (optional)" hint='Shows the assistant the style you like. Start lines with "Guest:" or "Assistant:". Used for style only, never as facts.' />} error={errors.example}>
        <Textarea rows={3} value={form.example} onChange={(e) => set("example", e.target.value)} placeholder={"Guest: Room for 2 this weekend?\nAssistant: Yes! We have a Deluxe at Rs 4,500 and a Suite at Rs 6,000. Which suits you?"} />
      </Field>

      <Field as="div" className="mt-4" label={<Label title="Works together with these actions" hint="The assistant can use these while following this skill. Set up actions in the Actions tab." />} error={errors.actionKeys}>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Actions this skill uses">
          {actions.map((action) => {
            const on = linked.has(action.key);
            return (
              <button
                key={action.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleAction(action.key)}
                title={action.draft.description}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
                  on ? "border-app-accent! bg-app-accent-soft text-app-accent-text" : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
                }`}
              >
                {on ? <Check className="size-3" aria-hidden="true" /> : <Plus className="size-3" aria-hidden="true" />}
                {action.draft.name}
                {!action.draft.enabled && <span className="text-app-warning">· off</span>}
              </button>
            );
          })}
          {/* a linked action that was removed in the meantime */}
          {form.actionKeys.filter((k) => !byKey.has(k)).map((key) => (
            <button key={key} type="button" onClick={() => toggleAction(key)} className="inline-flex items-center gap-1 rounded-full border border-app-danger! bg-app-danger-soft px-3 py-1 text-xs text-app-danger">
              {key} · missing (remove)
            </button>
          ))}
        </div>
        {form.actionKeys.some((k) => byKey.get(k) && !byKey.get(k).draft.enabled) && (
          <p className="mt-1.5 text-xs text-app-warning">An action marked "off" is not used until you switch it on in the Actions tab.</p>
        )}
      </Field>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-app-border! pt-4">
        <Button icon={Save} loading={saving} disabled={!dirty && Boolean(view)} onClick={onSave}>{view ? "Save skill" : "Create skill"}</Button>
        {isBuiltIn && <Button variant="secondary" icon={RotateCcw} disabled={saving} onClick={onReset}>Reset to default</Button>}
        {view && !isBuiltIn && <Button variant="ghost" icon={Trash2} disabled={saving} onClick={onDelete} className="text-app-danger!">Delete</Button>}
        <span className="text-xs text-app-text-muted">{dirty ? "Unsaved changes." : view ? "Saved. Publish the agent to make it live." : ""}</span>
      </div>
    </section>
  );
};

export default SkillEditor;

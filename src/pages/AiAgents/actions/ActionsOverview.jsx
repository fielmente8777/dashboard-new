import { Check, CircleAlert, CircleDashed, Folder, Pencil, Plus, Puzzle, Settings2, Sparkles, Target, Trash2, Workflow } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import IconButton from "../../../components/ui/IconButton";
import Switch from "../../../components/ui/Switch";
import { connectionOf, groupActions } from "./intentModel";

const STATUS_STYLE = {
  connected: { icon: Check, className: "bg-app-success-soft text-app-success" },
  failed: { icon: CircleAlert, className: "bg-app-danger-soft text-app-danger" },
  checked: { icon: Check, className: "bg-app-surface-secondary text-app-text-muted" },
  untested: { icon: CircleDashed, className: "bg-app-surface-secondary text-app-text-muted" },
};
const METHOD_STYLE = { GET: "text-app-success", POST: "text-sky-600 dark:text-sky-400", PUT: "text-app-warning", PATCH: "text-app-warning", DELETE: "text-app-danger" };

const SectionLabel = ({ children, note }) => (
  <p className="mb-2 text-xs font-semibold tracking-wide text-app-text-muted uppercase">
    {children}{note && <span className="ml-1.5 font-normal normal-case tracking-normal">— {note}</span>}
  </p>
);

const ConnectionChip = ({ action }) => {
  const { state, label } = connectionOf(action);
  const { icon: StatusIcon, className } = STATUS_STYLE[state];
  const when = action.lastTest?.at ? new Date(action.lastTest.at).toLocaleString() : null;
  return (
    <span title={action.lastTest?.error || (when ? `Last tested ${when}` : "Test it from the edit dialog")} className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      <StatusIcon className="size-3" aria-hidden="true" /> {label}
    </span>
  );
};

// Which skills use the action, and whether it waits for one ("Only with skills")
export const SkillUse = ({ action, skills = [], onOpenSkills }) => {
  if (!skills.length && !action.draft.onlyWithSkills) return null;
  const anyOn = skills.some((s) => s.enabled);
  return (
    <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-app-text-muted">
      <Target className="size-3 shrink-0" aria-hidden="true" />
      {skills.length ? (
        <>
          <span>Used by</span>
          {skills.map((s) => (
            <button key={s.key} type="button" onClick={() => onOpenSkills?.(s.key)} className={`rounded-full px-2 py-0.5 font-medium hover:underline ${s.enabled ? "bg-app-accent-soft text-app-accent-text" : "bg-app-surface-secondary text-app-text-muted"}`} title={s.enabled ? "Skill is on" : "Skill is off"}>
              {s.name}{!s.enabled && " (off)"}
            </button>
          ))}
        </>
      ) : (
        <span>No skill uses it yet</span>
      )}
      {action.draft.onlyWithSkills && (
        <Badge tone={anyOn ? "purple" : "amber"}>{anyOn ? "Only with skills" : "Only with skills · not used now"}</Badge>
      )}
    </p>
  );
};

// One custom API action: name + method, the tool name the agent sees, URL, status
const ApiActionRow = ({ action, skills, onOpenSkills, onEdit, onToggle, onDelete }) => {
  const http = action.draft.executor?.http || {};
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-3 sm:flex-nowrap">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-app-accent-soft text-app-accent-text" aria-hidden="true"><Puzzle className="size-5" /></span>
      <div className="min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-app-text">
          {action.draft.name}
          <span className={`rounded bg-app-surface-secondary px-1.5 py-0.5 font-mono text-[11px] font-bold ${METHOD_STYLE[http.method] || ""}`}>{http.method}</span>
          {action.status === "draft" && <Badge tone="purple">Not published</Badge>}
        </p>
        <p className="truncate font-mono text-xs text-app-text-muted" title={action.toolName}>{action.toolName || action.key}</p>
        <p className="truncate font-mono text-xs text-app-text-muted" title={http.url}>{http.url}</p>
        <SkillUse action={action} skills={skills} onOpenSkills={onOpenSkills} />
      </div>
      <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto">
        <IconButton icon={Pencil} label={`Edit ${action.draft.name}`} onClick={() => onEdit(action)} />
        <ConnectionChip action={action} />
        <Switch label={`${action.draft.enabled ? "Turn off" : "Turn on"} ${action.draft.name}`} checked={Boolean(action.draft.enabled)} onChange={(enabled) => onToggle(action, enabled)} />
        <IconButton icon={Trash2} tone="danger" label={`Delete ${action.draft.name}`} onClick={() => onDelete(action)} />
      </div>
    </li>
  );
};

// A business action (Simple actions, n8n, built-in handlers with your settings)
// or a predefined (system) action
const BusinessRow = ({ action, skills, onOpenSkills, onOpen, onToggle, system = false }) => (
  <li className="flex items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-3">
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-app-surface-secondary text-app-text-muted" aria-hidden="true">{system ? <Settings2 className="size-4" /> : <Workflow className="size-4" />}</span>
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-app-text">
        {action.draft.name}
        {system && <span className="font-mono text-xs font-normal text-app-text-muted">{action.toolName || action.key}</span>}
        {action.draft.requiresConfirmation && <Badge tone="sky">Asks the guest first</Badge>}
        {action.status === "draft" && <Badge tone="purple">Not published</Badge>}
      </p>
      <p className="truncate text-xs text-app-text-muted" title={action.draft.description}>{action.draft.description}</p>
      <SkillUse action={action} skills={skills} onOpenSkills={onOpenSkills} />
    </div>
    <IconButton icon={Pencil} label={`Edit ${action.draft.name}`} onClick={() => onOpen(action.id)} />
    <Switch label={`${action.draft.enabled ? "Turn off" : "Turn on"} ${action.draft.name}`} checked={Boolean(action.draft.enabled)} onChange={(enabled) => onToggle(action, enabled)} />
  </li>
);

// The Actions tab's home (AiSensy-style): business actions, custom API actions
// grouped into intents, and the built-in system actions.
const ActionsOverview = ({ actions, usedBySkills = {}, unpublished, onAddApi, onEditApi, onOpen, onOpenSkills, onNewBusiness, onCreateWithAi, onToggle, onDelete }) => {
  const { business, intents, system } = groupActions(actions);

  return (
    <Card
      title={<span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-app-accent-soft text-app-accent-text" aria-hidden="true"><Puzzle className="size-5" /></span><span><span className="block text-base">Actions</span><span className="block text-xs font-normal text-app-text-muted">Tools and custom API calls the agent can use.</span></span></span>}
      actions={<Button variant="secondary" size="sm" icon={Sparkles} onClick={onCreateWithAi}>Create with AI</Button>}
    >
      {unpublished > 0 && <p className="mb-4 rounded-lg bg-app-warning-soft px-3 py-2 text-xs text-app-warning" role="status">{unpublished} action change{unpublished > 1 ? "s are" : " is"} saved but not live yet. Publish the agent to apply {unpublished > 1 ? "them" : "it"}.</p>}

      <section aria-labelledby="business-actions" className="border-b border-app-border! pb-4">
        <div id="business-actions"><SectionLabel>Business actions</SectionLabel></div>
        {business.length ? (
          <ul className="space-y-2">{business.map((a) => <BusinessRow key={a.id} action={a} skills={usedBySkills[a.key]} onOpenSkills={onOpenSkills} onOpen={onOpen} onToggle={onToggle} />)}</ul>
        ) : (
          <p className="text-sm text-app-text-muted">No actions yet. Tell your team, reply with a template or save lead details, no API needed.</p>
        )}
        <Button variant="ghost" size="sm" icon={Plus} className="mt-2" onClick={onNewBusiness}>Add business action</Button>
      </section>

      <section aria-labelledby="api-actions" className="border-b border-app-border! py-4">
        <div id="api-actions"><SectionLabel note="grouped into intents">Custom API actions</SectionLabel></div>
        <div className="space-y-4">
          {intents.map(({ group, actions: items }) => (
            <div key={group || "ungrouped"}>
              <p className="mb-2 flex items-center gap-1.5 font-mono text-xs font-semibold text-app-text">
                <Folder className="size-3.5 fill-current text-app-text-muted" aria-hidden="true" />
                {group ? group.toUpperCase() : "NO INTENT GROUP"}
                <span className="font-sans font-normal text-app-text-muted">{items.length} action{items.length > 1 ? "s" : ""}</span>
              </p>
              <ul className="space-y-2">{items.map((a) => <ApiActionRow key={a.id} action={a} skills={usedBySkills[a.key]} onOpenSkills={onOpenSkills} onEdit={onEditApi} onToggle={onToggle} onDelete={onDelete} />)}</ul>
            </div>
          ))}
          <button type="button" onClick={onAddApi} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-app-accent/40! bg-app-accent-soft/40 py-4 text-sm font-semibold text-app-accent-text transition hover:bg-app-accent-soft focus-visible:outline-2 focus-visible:outline-app-focus">
            <Plus className="size-4" aria-hidden="true" /> Add custom API action
          </button>
        </div>
      </section>

      <section aria-labelledby="system-actions" className="pt-4">
        <div id="system-actions"><SectionLabel note="ready to use, no setup needed">Predefined actions</SectionLabel></div>
        <ul className="space-y-2">
          {system.map((a) => (
            <BusinessRow key={a.id} system action={a} skills={usedBySkills[a.key]} onOpenSkills={onOpenSkills} onOpen={onOpen} onToggle={onToggle} />
          ))}
        </ul>
        <p className="mt-2 text-xs text-app-text-muted">Built in: the agent can use one while it is switched on. Link them to skills in the Skills tab so the agent knows when to use them.</p>
      </section>
    </Card>
  );
};

export default ActionsOverview;

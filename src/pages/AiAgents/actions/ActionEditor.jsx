import { Copy, Download, Play, Save, Sparkles, Trash2 } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Switch from "../../../components/ui/Switch";
import Tabs from "../../../components/ui/Tabs";
import { TAB_OF_FIELD } from "./actionModel";
import { iconFor } from "./actionIcons";
import { AdvancedPanel, ConditionsPanel, ExecutionPanel, GeneralPanel, InputsPanel, ResponsePanel } from "./EditorPanels";
import RowMenu from "./RowMenu";

const EDITOR_TABS = [
  { value: "general", label: "General", Panel: GeneralPanel },
  { value: "inputs", label: "Inputs & Mapping", Panel: InputsPanel },
  { value: "execution", label: "Execution", Panel: ExecutionPanel },
  { value: "response", label: "Response", Panel: ResponsePanel },
  { value: "conditions", label: "Conditions", Panel: ConditionsPanel },
  { value: "advanced", label: "Advanced", Panel: AdvancedPanel },
];

// Center column: the selected action's form.
const ActionEditor = ({ form, set, errors, tab, onTab, meta, dirty, saving, onToggle, onSave, onSaveAndTest, onDelete, onDuplicate, onExport }) => {
  const { Panel } = EDITOR_TABS.find((t) => t.value === tab) || EDITOR_TABS[0];
  const errorCount = Object.keys(errors).reduce((acc, field) => ({ ...acc, [TAB_OF_FIELD(field)]: (acc[TAB_OF_FIELD(field)] || 0) + 1 }), {});
  const HeaderIcon = iconFor({ key: form.key, draft: form });

  return (
    <section aria-label="Edit action" className="flex min-w-0 flex-col rounded-xl border border-app-border! bg-app-surface">
      <header className="flex flex-wrap items-start gap-3 border-b border-app-border! p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-app-accent-soft text-app-accent-text"><HeaderIcon className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-app-text">
            {form.name || "New action"}
            {meta.isBuiltIn && <Badge tone="gray">Built-in</Badge>}
            {meta.isNew && <Badge tone="purple">Not saved</Badge>}
            {!meta.isNew && meta.view?.status === "draft" && <Badge tone="amber">Unpublished changes</Badge>}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-xs text-app-text-muted">{form.description || "Describe when the AI should use this action."}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-app-text-muted" aria-hidden="true">{form.enabled ? "Enabled" : "Disabled"}</span>
          <Switch label={`${form.name || "Action"} enabled`} checked={form.enabled} onChange={onToggle} />
          {!meta.isNew && (
            <RowMenu
              label="More for this action"
              items={[
                { label: "Duplicate", icon: Copy, onSelect: onDuplicate },
                { label: "Export JSON", icon: Download, onSelect: onExport },
                { label: "Delete", icon: Trash2, danger: true, hidden: meta.isBuiltIn, onSelect: onDelete },
              ]}
            />
          )}
        </div>
      </header>

      {meta.aiDraft && (
        <p role="status" className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-app-accent! bg-app-accent-soft p-3 text-xs text-app-text">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-app-accent-text" aria-hidden="true" />
          <span><span className="font-semibold text-app-accent-text">AI draft - review before saving.</span> Check every tab, enter any API keys, and test it. It stays off until you enable it, and goes live only after Publish.{meta.scheduleReason ? ` Schedule: ${meta.scheduleReason}` : ""}</span>
        </p>
      )}

      <div className="border-b border-app-border! px-4 pt-3">
        <Tabs tabs={EDITOR_TABS.map((t) => ({ value: t.value, label: t.label, count: errorCount[t.value] || 0 }))} value={tab} onChange={onTab} className="flex-nowrap overflow-x-auto pb-2" />
      </div>

      <div className="min-w-0 flex-1 p-4" role="tabpanel" aria-label={EDITOR_TABS.find((t) => t.value === tab)?.label}>
        <fieldset disabled={saving} className="min-w-0">
          <Panel form={form} set={set} errors={errors} meta={meta} />
        </fieldset>
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-app-border! p-4">
        {!meta.isBuiltIn && !meta.isNew && <Button variant="ghost" className="text-app-danger hover:bg-app-danger-soft" icon={Trash2} onClick={onDelete} disabled={saving}>Delete</Button>}
        <p className="min-w-0 flex-1 text-xs text-app-text-muted" aria-live="polite">
          {dirty ? "You have unsaved changes." : meta.isNew ? "Not saved yet." : "Saved to database. Goes live after Publish."}
        </p>
        <Button variant="secondary" icon={Play} onClick={onSaveAndTest} loading={saving} disabled={!dirty && meta.isNew}>Save &amp; Test</Button>
        <Button icon={Save} onClick={onSave} loading={saving} disabled={!dirty && !meta.isNew}>Save Changes</Button>
      </footer>
    </section>
  );
};

export default ActionEditor;

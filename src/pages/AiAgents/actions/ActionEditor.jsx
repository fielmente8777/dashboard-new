import { Copy, Download, Play, Save, Trash2 } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import Notice from "../../../components/ui/Notice";
import SaveBar from "../../../components/ui/SaveBar";
import Segmented from "../../../components/ui/Segmented";
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
const ActionEditor = ({ form, set, errors, tab, onTab, meta, dirty, saving, onToggle, onSave, onSaveAndTest, onDelete, onDuplicate, onExport, mode, onMode, copy }) => {
  const { Panel } = EDITOR_TABS.find((t) => t.value === tab) || EDITOR_TABS[0];
  const errorCount = Object.keys(errors).reduce((acc, field) => ({ ...acc, [TAB_OF_FIELD(field)]: (acc[TAB_OF_FIELD(field)] || 0) + 1 }), {});
  const HeaderIcon = iconFor({ key: form.key, draft: form });

  return (
    <div className="flex min-w-0 flex-col gap-4">
    <section aria-label="Edit action" className="flex min-w-0 flex-col rounded-xl border border-app-border! bg-app-surface">
      <header className="flex flex-wrap items-start gap-3 border-b border-app-border! p-4 sm:p-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent-text"><Icon icon={HeaderIcon} /></span>
        <div className="min-w-0 flex-1 basis-48">
          <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-app-text">
            {form.name || "New action"}
            {meta.isBuiltIn && <Badge tone="gray">Built-in</Badge>}
            {meta.isNew && <Badge tone="purple">Not saved</Badge>}
            {form.editedInAdvanced && <Badge tone="amber">Edited in Advanced</Badge>}
            {!meta.isNew && meta.view?.status === "draft" && <Badge tone="amber">Unpublished changes</Badge>}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-xs text-app-text-muted">{form.description || "Describe when the AI should use this action."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {copy && <Segmented label={copy.mode.label} options={[{ value: "simple", label: copy.mode.simple }, { value: "advanced", label: copy.mode.advanced }]} value={mode} onChange={onMode} />}
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
        <Notice tone="accent" role="status" title="AI draft - review before saving." className="mx-4 mt-4 sm:mx-5">
          Check every tab, enter any API keys, and test it. It stays off until you enable it, and goes live only after Publish.{meta.scheduleReason ? ` Schedule: ${meta.scheduleReason}` : ""}
        </Notice>
      )}

      <div className="border-b border-app-border! px-4 pt-3 sm:px-5">
        <Tabs tabs={EDITOR_TABS.map((t) => ({ value: t.value, label: t.label, count: errorCount[t.value] || 0 }))} value={tab} onChange={onTab} className="flex-nowrap overflow-x-auto pb-2" />
      </div>

      <div className="min-w-0 flex-1 p-4 sm:p-5" role="tabpanel" aria-label={EDITOR_TABS.find((t) => t.value === tab)?.label}>
        <fieldset disabled={saving} className="min-w-0">
          <Panel form={form} set={set} errors={errors} meta={meta} />
        </fieldset>
      </div>

    </section>

    <SaveBar
      show
      message={dirty ? "You have unsaved changes." : meta.isNew ? "Not saved yet." : "Saved to database. Goes live after Publish."}
      saveLabel="Save Changes"
      saveIcon={Save}
      onSave={onSave}
      saving={saving}
      disabled={!dirty && !meta.isNew}
      actions={
        <>
          {!meta.isBuiltIn && !meta.isNew && <Button variant="ghost" className="text-app-danger hover:bg-app-danger-soft" icon={Trash2} onClick={onDelete} disabled={saving}>Delete</Button>}
          <Button variant="secondary" icon={Play} onClick={onSaveAndTest} loading={saving} disabled={!dirty && meta.isNew}>Save &amp; Test</Button>
        </>
      }
    />
    </div>
  );
};

export default ActionEditor;

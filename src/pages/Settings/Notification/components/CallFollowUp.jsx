import { PhoneMissed } from "lucide-react";
import Icon from "../../../../components/ui/Icon";
import SelectMenu from "../../../../components/ui/SelectMenu";
import Switch from "../../../../components/ui/Switch";
import TemplatePreview from "../../../Channels/Whatsapp/components/TemplatePreview";
import { CALL_STATUSES, templateMeta } from "../notificationUtils";

// The WhatsApp template sent to a caller when a call is not answered,
// missed or busy. One template per call outcome.
const CallFollowUp = ({ callConfig, templates, disabled, onToggle, onChange }) => {
  const options = templates.map((template) => ({
    value: template.name,
    label: template.name,
  }));

  const chooseTemplate = (status, name) => {
    const template = templates.find((item) => item.name === name);
    if (!template) return;
    onChange(status, { type: "template", templateName: name, templateMeta: templateMeta(template) });
  };

  return (
    <div className="rounded-lg border border-app-border! bg-app-surface-secondary/40">
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon icon={PhoneMissed} tone="muted" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">Follow up on calls</p>
          <p className="text-xs text-app-text-muted">
            Message the caller on WhatsApp when you could not take their call.
          </p>
        </div>
        <Switch
          label="Follow up on calls"
          checked={callConfig.enabled}
          disabled={disabled}
          onChange={onToggle}
        />
      </div>

      {callConfig.enabled && !disabled && (
        <div className="grid gap-3 border-t border-app-border! p-4 md:grid-cols-3">
          {CALL_STATUSES.map((status) => {
            const config = callConfig.configs[status.key];
            const template = templates.find((item) => item.name === config.templateName);

            return (
              <div key={status.key} className="space-y-2 rounded-lg border border-app-border! bg-app-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                  {status.label}
                </p>
                <SelectMenu
                  label={`Template for ${status.label}`}
                  placeholder={options.length ? "Choose a template" : "No templates yet"}
                  options={options}
                  value={config.templateName}
                  disabled={!options.length}
                  onChange={(name) => chooseTemplate(status.key, name)}
                  className="w-full"
                />
                {template ? (
                  <TemplatePreview components={template.components || []} />
                ) : (
                  config.templateName && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      “{config.templateName}” is no longer available. Choose another template.
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallFollowUp;

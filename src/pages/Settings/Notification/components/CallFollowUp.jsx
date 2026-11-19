import { PhoneMissed } from "lucide-react";
import SelectMenu from "../../../../components/ui/SelectMenu";
import SettingsCard from "../../../../components/ui/SettingsCard";
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

  const open = callConfig.enabled && !disabled;

  return (
    <SettingsCard
      icon={PhoneMissed}
      title="Missed-call follow-up"
      description="Message the caller on WhatsApp when you could not take their call."
      actions={
        <Switch
          label="Follow up on calls"
          checked={callConfig.enabled}
          disabled={disabled}
          onChange={onToggle}
        />
      }
      footer={
        <span>
          {options.length
            ? "Choose one WhatsApp template for each call outcome."
            : "No WhatsApp templates yet. Create one under Settings → WhatsApp."}
        </span>
      }
    >
      {open ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CALL_STATUSES.map((status, index) => {
            const config = callConfig.configs[status.key];
            const template = templates.find((item) => item.name === config.templateName);

            return (
              <div
                key={status.key}
                className="flex min-w-0 flex-col gap-3 rounded-lg border border-app-border! bg-app-surface-secondary/30 p-3"
              >
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
                  <span className="flex size-5 items-center justify-center rounded-full bg-app-surface-secondary text-[11px] text-app-text">
                    {index + 1}
                  </span>
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
                ) : config.templateName ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    “{config.templateName}” is no longer available. Choose another template.
                  </p>
                ) : (
                  <p className="rounded-md border border-dashed border-app-border! px-3 py-6 text-center text-xs text-app-text-faint">
                    The message preview appears here.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg bg-app-surface-secondary/60 px-3 py-2.5 text-sm text-app-text-muted">
          {disabled
            ? "Turn on WhatsApp alerts above to send follow-up messages."
            : "Off. Turn it on to choose the message sent for each call outcome."}
        </p>
      )}
    </SettingsCard>
  );
};

export default CallFollowUp;

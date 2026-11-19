import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import Dialog from "../../../../components/ui/Dialog";
import { Field, Input } from "../../../../components/ui/Field";
import {
  getTemplateDefaults,
  isTemplateFilled,
} from "../../../../components/WhatsApp/templateValues";
import TemplatePreview from "../../../Channels/Whatsapp/components/TemplatePreview";

// Fills in a template's {{1}}, {{2}}... for this one message, with a live
// preview. `template` is the one being edited, or null when closed;
// `values` ({ header, body }) are the ones already chosen for it, if any.
// onSave(values) keeps them; the message is sent from the composer.
const TemplateValuesDialog = ({ template, values, onSave, onClose }) => {
  const [draft, setDraft] = useState({ header: [], body: [] });

  useEffect(() => {
    if (template) setDraft(values || getTemplateDefaults(template));
  }, [template, values]);

  const setValue = (group, index, value) =>
    setDraft((prev) => ({
      ...prev,
      [group]: prev[group].map((item, i) => (i === index ? value : item)),
    }));

  const filled = isTemplateFilled(draft);

  return (
    <Dialog
      open={Boolean(template)}
      onClose={onClose}
      size="lg"
      title={`Edit values${template ? `: ${template.name}` : ""}`}
      description="Only this message changes. The approved template stays as it is."
    >
      <form
        className="grid gap-5 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (filled) onSave(draft);
        }}
      >
        <div className="min-w-0 space-y-3">
          {draft.header.map((value, index) => (
            <Field key={`header-${index}`} label={`Header {{${index + 1}}}`}>
              <Input
                value={value}
                onChange={(e) => setValue("header", index, e.target.value)}
              />
            </Field>
          ))}
          {draft.body.map((value, index) => (
            <Field key={`body-${index}`} label={`Value for {{${index + 1}}}`}>
              <Input
                autoFocus={index === 0 && !draft.header.length}
                value={value}
                onChange={(e) => setValue("body", index, e.target.value)}
              />
            </Field>
          ))}
          {!filled && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Every value needs some text before the template can be sent.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            Preview
          </p>
          {template && (
            <TemplatePreview
              components={template.components}
              headerVariables={draft.header}
              bodyVariables={draft.body}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-app-border! pt-4 md:col-span-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!filled}>
            Use these values
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default TemplateValuesDialog;

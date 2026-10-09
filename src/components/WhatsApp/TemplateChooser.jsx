import TemplatePreview from "../../pages/Channels/Whatsapp/components/TemplatePreview";
import { Field, Input } from "../ui/Field";
import { EmptyState } from "../ui/States";

// Picks an approved WhatsApp template and fills in its {{1}}, {{2}}...
// The list is on the left; the chosen template's preview and values are on
// the right. `values` is { body, header } (see templateValues.js).
//   onSelect(template)  onValuesChange(values)
const TemplateChooser = ({
  templates,
  selected,
  values,
  onSelect,
  onValuesChange,
}) => {
  if (templates.length === 0) {
    return (
      <EmptyState
        title="No approved templates yet"
        description="Create a template in Settings → WhatsApp. It can be used here once WhatsApp approves it."
      />
    );
  }

  const setValue = (group, index, value) =>
    onValuesChange({
      ...values,
      [group]: values[group].map((item, i) => (i === index ? value : item)),
    });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ul className="max-h-80 overflow-y-auto rounded-lg border border-app-border!">
        {templates.map((template) => {
          const active = selected?.id === template.id;
          return (
            <li
              key={template.id}
              className="border-b border-app-border! last:border-b-0"
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(template)}
                className={`block w-full px-3 py-2.5 text-left transition-colors ${
                  active ? "bg-blue-500/10" : "hover:bg-app-surface-secondary"
                }`}
              >
                <span className="block truncate text-sm font-medium text-app-text">
                  {template.name}
                </span>
                <span className="block text-xs text-app-text-muted">
                  {[template.category, template.language]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div className="min-w-0 space-y-3">
          <TemplatePreview
            components={selected.components}
            headerVariables={values.header}
            bodyVariables={values.body}
          />

          {values.header.map((value, index) => (
            <Field
              key={`header-${index}`}
              label={`Header value {{${index + 1}}}`}
            >
              <Input
                value={value}
                onChange={(e) => setValue("header", index, e.target.value)}
              />
            </Field>
          ))}
          {values.body.map((value, index) => (
            <Field key={`body-${index}`} label={`Value for {{${index + 1}}}`}>
              <Input
                value={value}
                onChange={(e) => setValue("body", index, e.target.value)}
              />
            </Field>
          ))}
        </div>
      ) : (
        <p className="flex items-center justify-center rounded-lg border border-dashed border-app-border! p-6 text-center text-sm text-app-text-muted">
          Choose a template to preview it.
        </p>
      )}
    </div>
  );
};

export default TemplateChooser;

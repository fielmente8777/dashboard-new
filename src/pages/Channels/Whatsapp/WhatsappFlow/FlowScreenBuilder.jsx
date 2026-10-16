import { ArrowLeft, Plus, Rocket, Trash2 } from "lucide-react";
import { useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input, inputClassName } from "../../../../components/ui/Field";
import IconButton from "../../../../components/ui/IconButton";
import SelectMenu from "../../../../components/ui/SelectMenu";
import Switch from "../../../../components/ui/Switch";
import { useToast } from "../../../../context/ToastContext";
import { createWhatAppFlow } from "../../../../services/api/whatsApp";
import { FIELD_TYPES, flowProblem, newScreen } from "./flowUtils";

// What a guest sees for one field in the preview.
const PreviewField = ({ field }) => {
  const label = `${field.label || "Untitled field"}${field.required ? " *" : ""}`;
  if (field.type === "textarea") {
    return <textarea disabled rows={2} placeholder={label} className={inputClassName} />;
  }
  return (
    <input
      disabled
      type={field.type === "date" ? "text" : field.type}
      placeholder={field.type === "date" ? `${label} (date)` : label}
      className={inputClassName}
    />
  );
};

// Screens of a new flow (each a page of fields), with a live preview.
const FlowScreenBuilder = ({ flowMeta, onBack, onPublished }) => {
  const { showToast } = useToast();
  const [screens, setScreens] = useState(() => [
    newScreen(flowMeta?.template?.screen || "Your details", flowMeta?.template?.fields || []),
  ]);
  const [active, setActive] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const screen = screens[active];
  const isLast = active === screens.length - 1;

  const updateScreen = (changes) =>
    setScreens((prev) => prev.map((s, i) => (i === active ? { ...s, ...changes } : s)));

  const updateField = (index, changes) =>
    updateScreen({
      fields: screen.fields.map((f, i) => (i === index ? { ...f, ...changes } : f)),
    });

  const addField = () =>
    updateScreen({ fields: [...screen.fields, { label: "", type: "text", required: false }] });

  const removeField = (index) =>
    updateScreen({ fields: screen.fields.filter((_, i) => i !== index) });

  const addScreen = () => {
    setScreens((prev) => [...prev, newScreen()]);
    setActive(screens.length);
  };

  const removeScreen = (index) => {
    setScreens((prev) => prev.filter((_, i) => i !== index));
    setActive((current) => Math.max(0, current >= index ? current - 1 : current));
  };

  const publish = async () => {
    const problem = flowProblem(screens);
    if (problem) {
      showToast({ message: problem, type: "error" });
      return;
    }

    setIsPublishing(true);
    try {
      const response = await createWhatAppFlow({
        flowName: flowMeta?.name,
        category: flowMeta?.category,
        screens: screens.map((s) => ({
          ...s,
          title: s.title.trim(),
          fields: s.fields.map((f) => ({ ...f, label: f.label.trim() })),
        })),
      });
      if (!response?.success) throw new Error(response?.responseMessage);

      showToast({ message: "Flow published" });
      onPublished?.();
    } catch (error) {
      showToast({
        message: error?.message || "Could not publish the flow.",
        type: "error",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <IconButton icon={ArrowLeft} label="Back to templates" onClick={onBack} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-app-text">{flowMeta?.name}</h2>
          <p className="text-xs text-app-text-muted">
            {screens.length} {screens.length === 1 ? "screen" : "screens"}
          </p>
        </div>
        <Badge tone="green">{flowMeta?.template?.title || flowMeta?.category}</Badge>
        <Button icon={Rocket} onClick={publish} loading={isPublishing}>
          Publish flow
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[13rem_1fr_18rem]">
        {/* screens */}
        <Card title="Screens">
          <ol className="space-y-1">
            {screens.map((s, index) => (
              <li key={s.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    index === active
                      ? "bg-primary font-medium text-white dark:bg-blue-600"
                      : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
                  }`}
                >
                  {index + 1}. {s.title || "Untitled"}
                </button>
                {screens.length > 1 && (
                  <IconButton
                    icon={Trash2}
                    label={`Remove ${s.title || "screen"}`}
                    tone="danger"
                    size="sm"
                    onClick={() => removeScreen(index)}
                  />
                )}
              </li>
            ))}
          </ol>
          <Button variant="dashed" size="sm" icon={Plus} onClick={addScreen} className="mt-3 w-full">
            Add screen
          </Button>
        </Card>

        {/* fields of the selected screen */}
        <Card title={`Screen ${active + 1}`} description="What this page of the form asks.">
          <div className="space-y-4">
            <Field label="Screen title">
              <Input
                value={screen.title}
                onChange={(e) => updateScreen({ title: e.target.value })}
                placeholder="e.g. Your details"
              />
            </Field>

            <div className="space-y-2">
              <p className="text-xs font-medium text-app-text-muted">Fields</p>
              {screen.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-app-border! px-4 py-6 text-center text-sm text-app-text-muted">
                  No fields yet. Add the first question guests should answer.
                </p>
              )}
              {screen.fields.map((field, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border border-app-border! p-3 sm:grid-cols-[1fr_10rem_auto]"
                >
                  <Input
                    aria-label="Field label"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Question, e.g. Full name"
                  />
                  <SelectMenu
                    label="Field type"
                    options={FIELD_TYPES}
                    value={field.type}
                    onChange={(type) => updateField(index, { type })}
                    className="w-full"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-app-text-muted">Required</span>
                    <Switch
                      label="Required"
                      checked={field.required}
                      onChange={(required) => updateField(index, { required })}
                    />
                    <IconButton
                      icon={Trash2}
                      label="Remove field"
                      tone="danger"
                      onClick={() => removeField(index)}
                    />
                  </div>
                </div>
              ))}
              <Button variant="dashed" size="sm" icon={Plus} onClick={addField}>
                Add field
              </Button>
            </div>
          </div>
        </Card>

        {/* preview */}
        <div className="lg:sticky lg:top-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            Preview
          </p>
          <div className="overflow-hidden rounded-2xl border border-app-border! bg-app-surface shadow-sm">
            <div className="bg-[#075E54] px-4 py-3 text-center text-sm font-semibold text-white">
              {screen.title || "Untitled screen"}
            </div>
            <div className="space-y-2 p-4">
              {screen.fields.length ? (
                screen.fields.map((field, index) => <PreviewField key={index} field={field} />)
              ) : (
                <p className="py-4 text-center text-xs text-app-text-faint">
                  Fields you add show up here.
                </p>
              )}
              <button
                type="button"
                disabled
                className="mt-2 w-full rounded-full bg-[#25D366] py-2 text-sm font-semibold text-white"
              >
                {isLast ? "Submit" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowScreenBuilder;

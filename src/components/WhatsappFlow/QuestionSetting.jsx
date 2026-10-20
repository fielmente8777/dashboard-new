import { useState } from "react";
import { Field, Input, Select } from "../ui/Field";
import Switch from "../ui/Switch";
import { SettingsFooter, SettingsSection } from "./SettingsParts";

export default function QuestionSettings({ data, onSave, onCancel }) {
  const [question, setQuestion] = useState(data?.question || "");
  const [variable, setVariable] = useState(data?.variable || "");
  const [type, setType] = useState(data?.type || "text");
  const [required, setRequired] = useState(data?.required || false);

  const handleSave = () => {
    onSave({
      question,
      variable,
      type,
      required,
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title="Question">
        <Field label="What to ask">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is your name?"
          />
        </Field>

        <Field label="Save the answer in" hint="A name to use the answer later, e.g. user_name">
          <Input
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            placeholder="example: user_name"
          />
        </Field>

        <Field as="div" label="Answer type">
          <Select
            aria-label="Answer type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "text", label: "Text" },
              { value: "number", label: "Number" },
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
            ]}
          />
        </Field>

        <div className="flex items-center justify-between gap-3 rounded-lg bg-app-surface-secondary px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-app-text">Required</p>
            <p className="text-xs text-app-text-muted">The guest has to answer before moving on.</p>
          </div>
          <Switch checked={required} onChange={setRequired} label="Required" />
        </div>
      </SettingsSection>

      <SettingsFooter onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}

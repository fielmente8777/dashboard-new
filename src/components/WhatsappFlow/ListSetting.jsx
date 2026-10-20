import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";
import IconButton from "../ui/IconButton";
import { charHint } from "./blockStyles";
import { SettingsFooter, SettingsSection } from "./SettingsParts";
import { v4 as uuidv4 } from "uuid";

const MAX_MESSAGE_BODY_TEXT = 4096;
const MAX_MESSAGE_FOOTER_TEXT = 60;
const MAX_MESSAGE_HEADER_TEXT = 60;
const MAX_SECTION_TITLE_TEXT = 24;
const MAX_ROW_TITLE_TEXT = 24;
const MAX_BUTTON_TEXT = 20;

export default function ListSetting({ data, onSave, onCancel }) {
  const [header, setHeader] = useState(data?.interactive?.header?.text || "");
  const [body, setBody] = useState(
    data?.interactive?.body?.text || "Select an option",
  );
  const [footer, setFooter] = useState(data?.interactive?.footer?.text || "");
  const [buttonText, setButtonText] = useState("Choose");

  const [sections, setSections] = useState(
    data?.interactive?.action?.sections || [
      {
        title: "Section 1",
        rows: [
          {
            id: "row_1_1",
            title: "Option 1",
          },
        ],
      },
    ],
  );

  const [variable, setVariable] = useState(data?.variable || "");

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "New Section",
        rows: [
          {
            id: `row_1_1_${uuidv4()}`,
            title: "New Option",
          },
        ],
      },
    ]);
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const updateSectionTitle = (index, value) => {
    const updated = [...sections];
    updated[index].title = value;
    setSections(updated);
  };

  const addRow = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].rows.push({
      id: `row_1_1_${uuidv4()}`,
      title: "New Option",
    });
    setSections(updated);
  };

  const removeRow = (sectionIndex, rowIndex) => {
    const updated = [...sections];
    updated[sectionIndex].rows = updated[sectionIndex].rows.filter(
      (_, i) => i !== rowIndex,
    );
    setSections(updated);
  };

  const updateRow = (sectionIndex, rowIndex, value) => {
    const updated = [...sections];
    updated[sectionIndex].rows[rowIndex] = {
      id: `row_${sectionIndex + 1}_${rowIndex + 1}_${uuidv4()}`,
      title: value,
    };
    setSections(updated);
  };

  const handleSave = () => {
    const interactiveMessage = {
      type: "interactive",
      interactive: {
        type: "list",
        header: header ? { type: "text", text: header } : undefined,
        body: { text: body },
        footer: footer ? { text: footer } : undefined,
        action: {
          button: buttonText,
          sections: sections.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row?.title,
            })),
          })),
        },
      },
      variable,
    };

    onSave(interactiveMessage);
  };

  return (
    <div className="space-y-4">
      <SettingsSection title="Message">
        <Field label="Header (optional)" hint={charHint(header, MAX_MESSAGE_HEADER_TEXT)}>
          <Input
            value={header}
            maxLength={MAX_MESSAGE_HEADER_TEXT}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Optional header"
          />
        </Field>

        <Field label="Body" hint={charHint(body, MAX_MESSAGE_BODY_TEXT)}>
          <Textarea
            value={body}
            maxLength={MAX_MESSAGE_BODY_TEXT}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
        </Field>

        <Field label="Footer (optional)" hint={charHint(footer, MAX_MESSAGE_FOOTER_TEXT)}>
          <Input
            value={footer}
            maxLength={MAX_MESSAGE_FOOTER_TEXT}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Optional footer"
          />
        </Field>

        <Field
          label="Menu button"
          hint={`The button that opens the list - ${charHint(buttonText, MAX_BUTTON_TEXT)}`}
        >
          <Input
            value={buttonText}
            maxLength={MAX_BUTTON_TEXT}
            onChange={(e) => setButtonText(e.target.value)}
          />
        </Field>
      </SettingsSection>

      {sections.map((section, sIndex) => (
        <SettingsSection
          key={sIndex}
          title={`Section ${sIndex + 1}`}
          actions={
            sections.length > 1 && (
              <IconButton
                icon={Trash2}
                label="Remove section"
                tone="danger"
                onClick={() => removeSection(sIndex)}
              />
            )
          }
        >
          <Field label="Section title" hint={charHint(section.title, MAX_SECTION_TITLE_TEXT)}>
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
              placeholder="Section title"
              maxLength={MAX_SECTION_TITLE_TEXT}
            />
          </Field>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-app-text-muted">Options</span>
            {section.rows.map((row, rIndex) => (
              <div key={rIndex} className="flex items-center gap-2">
                <Input
                  value={row?.title}
                  maxLength={24}
                  onChange={(e) => updateRow(sIndex, rIndex, e.target.value)}
                  aria-label={`Option ${rIndex + 1}`}
                />

                {section.rows.length > 1 && (
                  <IconButton
                    icon={Trash2}
                    label="Remove option"
                    tone="danger"
                    onClick={() => removeRow(sIndex, rIndex)}
                  />
                )}
              </div>
            ))}
          </div>

          <Button variant="dashed" size="sm" icon={Plus} className="w-full" onClick={() => addRow(sIndex)}>
            Add option
          </Button>
        </SettingsSection>
      ))}

      <Button variant="dashed" icon={Plus} className="w-full" onClick={addSection}>
        Add section
      </Button>

      <SettingsFooter onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}

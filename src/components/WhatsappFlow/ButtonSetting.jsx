import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";
import { charHint } from "./blockStyles";
import { SettingsFooter, SettingsSection } from "./SettingsParts";
import { v4 as uuidv4 } from "uuid";

export default function ButtonsSettings({ onSave, onCancel, data }) {
  const interactive = data?.interactive || {};

  const [header, setHeader] = useState(interactive?.header?.text || "");

  const [body, setBody] = useState(
    interactive?.body?.text || "Ask a question here",
  );

  const [footer, setFooter] = useState(interactive?.footer?.text || "");

  const [buttons, setButtons] = useState(
    interactive?.action?.buttons?.map((btn) => btn.reply.title) || ["Answer 1"],
  );

  const [variable, setVariable] = useState(data?.variable || "");

  const [newButton, setNewButton] = useState("");

  const addButton = () => {
    if (!newButton.trim()) return;
    if (buttons.length >= 3) return;

    setButtons((prev) => [...prev, newButton.trim()]);
    setNewButton("");
  };

  const updateButton = (index, value) => {
    const updated = [...buttons];
    updated[index] = value;
    setButtons(updated);
  };

  const handleSave = () => {
    const interactiveMessage = {
      type: "interactive",
      interactive: {
        type: "button",

        header: header
          ? {
              type: "text",
              text: header,
            }
          : undefined,

        body: {
          text: body,
        },

        footer: footer
          ? {
              text: footer,
            }
          : undefined,

        action: {
          buttons: buttons.map((btn, index) => ({
            type: "reply",
            reply: {
              id: `btn_${index + 1}_${uuidv4()}`,
              title: btn,
            },
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
        <Field label="Header (optional)" hint={charHint(header, 60)}>
          <div className="flex gap-2">
            <Input
              value={header}
              maxLength={60}
              onChange={(e) => setHeader(e.target.value)}
              placeholder="e.g. Welcome to our hotel"
            />
            <Button variant="secondary" className="shrink-0">
              Variables
            </Button>
          </div>
        </Field>

        <Field label="Body" hint={charHint(body, 1024)}>
          <Textarea
            value={body}
            maxLength={1024}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
        </Field>
        <div className="-mt-1 flex justify-end">
          <Button variant="secondary" size="sm">
            Variables
          </Button>
        </div>

        <Field label="Footer (optional)" hint={charHint(footer, 60)}>
          <Input
            value={footer}
            maxLength={60}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="e.g. Reply anytime"
          />
        </Field>
      </SettingsSection>

      <SettingsSection
        title="Reply buttons"
        description={`${buttons.length} of 3 - each one can lead to a different next step.`}
      >
        {buttons.map((btn, index) => (
          <Field key={index} label={`Button ${index + 1}`} hint={charHint(btn, 20)}>
            <Input
              value={btn}
              maxLength={20}
              onChange={(e) => updateButton(index, e.target.value)}
            />
          </Field>
        ))}

        {buttons.length < 3 && (
          <Field label="New button" hint="Press Enter or click Add">
            <div className="flex gap-2">
              <Input
                value={newButton}
                maxLength={20}
                onChange={(e) => setNewButton(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addButton();
                  }
                }}
                placeholder="e.g. Book a room"
              />
              <Button variant="secondary" icon={Plus} onClick={addButton} className="shrink-0">
                Add
              </Button>
            </div>
          </Field>
        )}
      </SettingsSection>

      <SettingsFooter onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}

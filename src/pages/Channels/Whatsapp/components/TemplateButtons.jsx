import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input } from "../../../../components/ui/Field";
import IconButton from "../../../../components/ui/IconButton";
import SelectMenu from "../../../../components/ui/SelectMenu";
import { BUTTON_TYPES } from "./templateUtils";

const MAX_BUTTONS = 3;

// Up to three buttons under the message.
const TemplateButtons = () => {
  const { control, register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "buttons" });
  const buttons = watch("buttons") || [];

  return (
    <Card
      title="Buttons (optional)"
      description="Let guests open a link, call you or reply with one tap."
    >
      <div className="space-y-3">
        {fields.map((field, index) => {
          const type = buttons[index]?.type || "URL";
          return (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-app-border! p-3 sm:grid-cols-[11rem_1fr_auto]"
            >
              <Field as="div" label="Action">
                <Controller
                  name={`buttons.${index}.type`}
                  control={control}
                  render={({ field: typeField }) => (
                    <SelectMenu
                      label="Button action"
                      options={BUTTON_TYPES}
                      value={typeField.value}
                      onChange={typeField.onChange}
                      className="w-full"
                    />
                  )}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={`Label (${buttons[index]?.text?.length || 0}/25)`}>
                  <Input
                    {...register(`buttons.${index}.text`)}
                    maxLength={25}
                    placeholder={type === "PHONE_NUMBER" ? "Call us" : type === "URL" ? "View booking" : "Yes, please"}
                  />
                </Field>
                {type === "URL" && (
                  <Field label="Website address">
                    <Input
                      {...register(`buttons.${index}.url`)}
                      type="url"
                      maxLength={2000}
                      placeholder="https://yourhotel.com"
                    />
                  </Field>
                )}
                {type === "PHONE_NUMBER" && (
                  <Field label="Phone number">
                    <Input
                      {...register(`buttons.${index}.phone_number`)}
                      type="tel"
                      placeholder="+919876543210"
                    />
                  </Field>
                )}
              </div>

              <IconButton
                icon={Trash2}
                label="Remove button"
                tone="danger"
                onClick={() => remove(index)}
                className="self-end"
              />
            </div>
          );
        })}

        {fields.length < MAX_BUTTONS ? (
          <Button
            variant="dashed"
            size="sm"
            icon={Plus}
            onClick={() => append({ type: "URL", text: "", url: "", phone_number: "" })}
          >
            Add button
          </Button>
        ) : (
          <p className="text-xs text-app-text-muted">WhatsApp allows up to {MAX_BUTTONS} buttons.</p>
        )}
      </div>
    </Card>
  );
};

export default TemplateButtons;

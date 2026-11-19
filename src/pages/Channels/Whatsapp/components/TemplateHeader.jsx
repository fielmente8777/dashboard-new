import { Controller, useFormContext } from "react-hook-form";
import Card from "../../../../components/ui/Card";
import { Field, Input } from "../../../../components/ui/Field";
import SelectMenu from "../../../../components/ui/SelectMenu";
import { CATEGORIES, LANGUAGES, toTemplateName } from "./templateUtils";

// Name, category and language. Meta does not allow changing them after
// the template is created, so they are read-only when editing.
const TemplateHeader = ({ mode }) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const isEdit = mode === "edit";
  const category = CATEGORIES.find((c) => c.value === watch("category"));

  return (
    <Card
      title="Basics"
      description={isEdit ? "Meta does not allow changing these after creation." : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Template name"
          className="sm:col-span-2"
          error={errors.name?.message}
          hint="Lowercase letters, numbers and _ only. Guests never see it."
        >
          <Input
            disabled={isEdit}
            placeholder="e.g. booking_confirmation"
            {...register("name", {
              // typing "Booking Confirmed" becomes booking_confirmed
              setValueAs: (value) => toTemplateName(value),
              onChange: (e) => {
                e.target.value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]+/g, "_")
                  .slice(0, 50);
              },
            })}
          />
        </Field>

        <Field as="div" label="Category" hint={category?.hint}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <SelectMenu
                label="Category"
                options={CATEGORIES}
                value={field.value}
                onChange={field.onChange}
                disabled={isEdit}
                className="w-full"
              />
            )}
          />
        </Field>

        <Field as="div" label="Language" error={errors.language?.message}>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <SelectMenu
                label="Language"
                options={LANGUAGES}
                value={field.value}
                onChange={field.onChange}
                disabled={isEdit}
                className="w-full"
              />
            )}
          />
        </Field>
      </div>
    </Card>
  );
};

export default TemplateHeader;

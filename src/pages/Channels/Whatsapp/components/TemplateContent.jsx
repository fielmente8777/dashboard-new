import { ImagePlus, Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input, Textarea } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import Segmented from "../../../../components/ui/Segmented";
import { extractVariables, HEADER_TYPES } from "./templateUtils";
import VariableSamples from "./VariableSample";

const Counter = ({ value = "", max }) => (
  <span className={value.length > max * 0.9 ? "text-amber-500" : ""}>
    {value.length}/{max}
  </span>
);

// The header, body and footer of the message.
const TemplateContent = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const headerType = watch("headerType") || "NONE";
  const header = watch("header") || "";
  const body = watch("body") || "";
  const footer = watch("footer") || "";
  const headerImage = watch("headerImage");

  // a header of another type is cleared
  useEffect(() => {
    if (headerType !== "TEXT") setValue("header", "");
    if (headerType !== "IMAGE") setValue("headerImage", null);
  }, [headerType, setValue]);

  const addVariable = (name, text, limit) => {
    if (limit && extractVariables(text).length >= limit) return;
    const next = extractVariables(text).length + 1;
    const spacer = text && !text.endsWith(" ") ? " " : "";
    setValue(name, `${text}${spacer}{{${next}}}`, { shouldValidate: true });
  };

  const imageUrl = useMemo(
    () => (headerImage instanceof File ? URL.createObjectURL(headerImage) : headerImage),
    [headerImage],
  );

  return (
    <Card
      title="Message"
      description="Use variables like {{1}} for details that change, such as the guest's name."
    >
      <div className="space-y-5">
        <Field as="div" label="Header (optional)">
          <Segmented
            label="Header type"
            options={HEADER_TYPES}
            value={headerType}
            onChange={(value) => setValue("headerType", value)}
          />
        </Field>

        {headerType === "TEXT" && (
          <Field
            label={
              <span className="flex items-center justify-between">
                Header text
                <Counter value={header} max={60} />
              </span>
            }
            hint="Up to one variable."
          >
            <div className="flex gap-2">
              <Input {...register("header")} maxLength={60} placeholder="e.g. Booking confirmed" />
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => addVariable("header", header, 1)}
                disabled={extractVariables(header).length >= 1}
              >
                Variable
              </Button>
            </div>
          </Field>
        )}

        {headerType === "IMAGE" && (
          <Field as="div" label="Header image" hint="JPG or PNG, up to 5 MB.">
            {imageUrl ? (
              <div className="relative w-fit">
                <img
                  src={imageUrl}
                  alt="Header"
                  className="h-40 max-w-xs rounded-lg border border-app-border! object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setValue("headerImage", null)}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <Icon icon={X} size="sm" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-app-border! p-6 text-sm text-app-text-muted transition hover:border-blue-500! hover:text-blue-500">
                <Icon icon={ImagePlus} size="2xl" />
                Click to upload an image
                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) =>
                    setValue("headerImage", e.target.files?.[0] || null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </label>
            )}
          </Field>
        )}

        <Field
          label={
            <span className="flex items-center justify-between">
              Body
              <Counter value={body} max={1024} />
            </span>
          }
          error={errors.body?.message}
        >
          <Textarea
            {...register("body")}
            rows={6}
            maxLength={1024}
            placeholder="Hi {{1}}, your booking at {{2}} is confirmed."
          />
        </Field>
        <Button
          variant="dashed"
          size="sm"
          icon={Plus}
          onClick={() => addVariable("body", body)}
          className="-mt-3"
        >
          Add variable
        </Button>

        <Field
          label={
            <span className="flex items-center justify-between">
              Footer (optional)
              <Counter value={footer} max={60} />
            </span>
          }
        >
          <Input {...register("footer")} maxLength={60} placeholder="e.g. Reply STOP to opt out" />
        </Field>

        <VariableSamples />
      </div>
    </Card>
  );
};

export default TemplateContent;

import { ArrowLeft, Eye, EyeOff, ImageUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import {
  Field,
  Input,
  Textarea,
  inputClassName,
} from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import PageShell from "../../../components/ui/PageShell";
import { EmptyState, Skeleton } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";
import { useConfirm } from "../../../context/ConfirmContext";
import { useApiAction } from "../../../hooks/useApiAction";
import { useImageUpload } from "../../../hooks/useImageUpload";
import {
  useGetLeadFormFieldTypesQuery,
  useUpdateLeadFormMutation,
} from "../../../redux/api/leadFormsApi";

// A button that picks one image file. onPick gets the File.
const ImageButton = ({ label, loading, onPick }) => {
  const inputRef = useRef(null);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={ImageUp}
        loading={loading}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
};

// How one field looks to the visitor (not editable here), with its controls.
const FieldPreview = ({ field, selected, onEdit, onToggle, onDelete }) => {
  const controlProps = {
    disabled: true,
    placeholder: field.field_placeholder,
    className: inputClassName,
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        selected ? "border-blue-500! bg-blue-500/5" : "border-app-border!"
      } ${field.status ? "" : "opacity-60"}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium text-app-text">
          {field.field_label}
          {field.is_required && <span className="ml-0.5 text-red-500">*</span>}
          {!field.status && (
            <span className="ml-2 text-xs font-normal text-app-text-muted">
              Hidden
            </span>
          )}
        </span>
        <span className="flex shrink-0 gap-0.5">
          <IconButton
            icon={field.status ? EyeOff : Eye}
            label={field.status ? "Hide field" : "Show field"}
            onClick={onToggle}
          />
          <IconButton icon={Pencil} label="Edit field" onClick={onEdit} />
          <IconButton
            icon={Trash2}
            label="Remove field"
            tone="danger"
            onClick={onDelete}
          />
        </span>
      </div>

      {field.field_type === "textarea" && <textarea rows={3} {...controlProps} />}
      {field.field_type === "select" && (
        <select {...controlProps}>
          <option>{field.field_placeholder || "Select an option"}</option>
        </select>
      )}
      {!["textarea", "select"].includes(field.field_type) && (
        <input
          type={field.field_type === "phone" ? "tel" : field.field_type}
          {...controlProps}
        />
      )}
    </div>
  );
};

// Edits one form: its heading and images, and its fields. Nothing is saved
// until Publish.
const LeadFormEditor = ({ form, onClose }) => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const { upload } = useImageUpload();
  const fieldTypes = useGetLeadFormFieldTypesQuery();
  const [updateForm, { isLoading: isSaving }] = useUpdateLeadFormMutation();

  const [draft, setDraft] = useState(form);
  // position of the field open in the settings panel
  const [selectedIndex, setSelectedIndex] = useState(null);
  // "logo_url" | "banner_image_url" while that image is uploading
  const [uploading, setUploading] = useState(null);

  const fields = draft.form_fields || [];
  const selectedField = fields[selectedIndex];
  const isDirty = draft !== form;

  const setFields = (form_fields) => setDraft({ ...draft, form_fields });

  const updateField = (index, changes) =>
    setFields(
      fields.map((field, i) => (i === index ? { ...field, ...changes } : field)),
    );

  const addField = (fieldType) => {
    setFields([
      ...fields,
      {
        ...fieldType,
        field_label: "Label",
        field_placeholder: "Placeholder",
        index: fields.length + 1,
      },
    ]);
    // open the new field straight away, since it needs a real label
    setSelectedIndex(fields.length);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
    setSelectedIndex(null);
  };

  const handleImage = async (key, file) => {
    setUploading(key);
    const url = await upload(file);
    setUploading(null);
    if (!url) return;

    setDraft((current) => ({
      ...current,
      form_cms: { ...current.form_cms, [key]: url },
    }));
  };

  const handlePublish = async () => {
    const saved = await run(updateForm(draft), {
      success: "Form published",
      error: "Could not publish the form.",
    });
    if (saved) onClose();
  };

  const handleClose = async () => {
    if (isDirty) {
      const leave = await confirm("Leave without publishing your changes?", {
        title: "Unpublished changes",
        confirmText: "Leave",
      });
      if (!leave) return;
    }
    onClose();
  };

  return (
    <PageShell
      title={form.title}
      description="Changes go live when you publish."
      actions={
        <>
          <Button variant="secondary" icon={ArrowLeft} onClick={handleClose}>
            Back
          </Button>
          <Button
            disabled={!isDirty || Boolean(uploading)}
            loading={isSaving}
            onClick={handlePublish}
          >
            Publish changes
          </Button>
        </>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-12">
        <Card
          title="Add a field"
          description="Click a type to add it to the form."
          className="lg:col-span-3"
        >
          {fieldTypes.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-2">
              {(fieldTypes.data || []).map((fieldType) => (
                <Button
                  key={fieldType.id ?? fieldType.field_type}
                  variant="dashed"
                  icon={Plus}
                  className="w-full justify-start! capitalize"
                  onClick={() => addField(fieldType)}
                >
                  {fieldType.field_type}
                </Button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Form" className="lg:col-span-5">
          <div
            className="relative overflow-hidden rounded-lg bg-app-surface-secondary bg-cover bg-center"
            style={{
              backgroundImage: draft.form_cms?.banner_image_url
                ? `url(${draft.form_cms.banner_image_url})`
                : undefined,
            }}
          >
            {/* keeps the white text readable over any cover image */}
            <div className="flex items-center gap-4 bg-black/55 p-4">
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  aria-label="Form heading"
                  value={draft.title || ""}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Form heading"
                  className="w-full rounded border border-transparent bg-transparent px-1 text-lg font-semibold text-white outline-none placeholder:text-white/60 hover:border-white/40! focus:border-white!"
                />
                <input
                  aria-label="Form description"
                  value={draft.description || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Add a short description"
                  className="w-full rounded border border-transparent bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/60 hover:border-white/40! focus:border-white!"
                />
              </div>
              {draft.form_cms?.logo_url && (
                <img
                  src={draft.form_cms.logo_url}
                  alt="Logo"
                  className="size-16 shrink-0 rounded-full border border-white/40! object-cover"
                  style={{ backgroundColor: draft.form_cms?.bg_color }}
                />
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <ImageButton
              label="Change logo"
              loading={uploading === "logo_url"}
              onPick={(file) => handleImage("logo_url", file)}
            />
            <ImageButton
              label="Change cover"
              loading={uploading === "banner_image_url"}
              onPick={(file) => handleImage("banner_image_url", file)}
            />
          </div>

          <div className="mt-5 space-y-3">
            {fields.length === 0 && (
              <EmptyState
                title="This form has no fields yet"
                description="Add the first one from the list on the left."
              />
            )}
            {fields.map((field, index) => (
              <FieldPreview
                // fields have no id of their own; they are told apart by position
                key={index}
                field={field}
                selected={index === selectedIndex}
                onEdit={() => setSelectedIndex(index)}
                onToggle={() => updateField(index, { status: !field.status })}
                onDelete={() => removeField(index)}
              />
            ))}
          </div>
        </Card>

        <Card
          title="Field settings"
          description={
            selectedField
              ? `${selectedField.field_type} field`
              : "Click the pencil on a field to change it."
          }
          className="lg:col-span-4"
        >
          {selectedField && (
            <div className="space-y-4">
              <Field label="Label">
                <Input
                  value={selectedField.field_label || ""}
                  onChange={(e) =>
                    updateField(selectedIndex, { field_label: e.target.value })
                  }
                />
              </Field>
              <Field label="Placeholder">
                <Textarea
                  rows={2}
                  value={selectedField.field_placeholder || ""}
                  onChange={(e) =>
                    updateField(selectedIndex, {
                      field_placeholder: e.target.value,
                    })
                  }
                />
              </Field>
              <Field
                label="Step"
                hint="Fields with the same step are shown together."
              >
                <Input
                  type="number"
                  min={1}
                  value={selectedField.step ?? 1}
                  onChange={(e) =>
                    updateField(selectedIndex, {
                      step: Number(e.target.value) || 1,
                    })
                  }
                />
              </Field>
              <div className="flex items-center justify-between gap-3 text-sm text-app-text">
                Required
                <Switch
                  label="Required"
                  checked={Boolean(selectedField.is_required)}
                  onChange={(is_required) =>
                    updateField(selectedIndex, { is_required })
                  }
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
};

export default LeadFormEditor;

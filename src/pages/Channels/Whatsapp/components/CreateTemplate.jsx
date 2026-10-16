import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../../../../components/ui/Button";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../context/ToastContext";
import { templateSchema } from "../../../../schema/templateSchema";
import {
  createWhatsAppMessageTemplate,
  updateWhatsAppMessageTemplate,
} from "../../../../services/api/whatsApp";
import TemplateButtons from "./TemplateButtons";
import TemplateContent from "./TemplateContent";
import TemplateHeader from "./TemplateHeader";
import TemplatePreview from "./TemplatePreview";
import {
  buttonsProblem,
  extractVariables,
  normalizeTemplate,
  toMetaButtons,
} from "./templateUtils";

const toDefaults = (template) => ({
  name: template?.name || "",
  language: template?.language || "en_US",
  category: template?.category || "UTILITY",
  headerType: template?.headerType || "NONE",
  header: template?.header || "",
  headerImage: template?.headerImage || null,
  body: template?.body || "",
  footer: template?.footer || "",
  headerVariables: template?.headerVariables || [],
  bodyVariables: template?.bodyVariables || [],
  buttons: template?.buttons || [],
});

// Meta's error for a rejected template, in words a user can act on
const metaMessage = (response, fallback) =>
  response?.error?.error?.error_user_msg ||
  response?.metaError?.error?.error_user_msg ||
  response?.error?.error?.message ||
  response?.responseMessage ||
  fallback;

// Create a template (blank, or from the library) or edit one, with a live
// preview. Templates go to Meta for approval when submitted.
const CreateTemplate = ({ initialData = null, mode = "create", onClose, onSaved }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = mode === "edit";

  const template = useMemo(() => normalizeTemplate(initialData), [initialData]);
  const methods = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: toDefaults(template),
  });
  const { handleSubmit, watch, setValue, getValues, reset } = methods;

  // a new template picked from the library refills the form
  useEffect(() => reset(toDefaults(template)), [template, reset]);

  const header = watch("header");
  const body = watch("body");
  const headerType = watch("headerType");

  // one example per variable, keeping the ones already typed
  useEffect(() => {
    const fit = (name, text) => {
      const current = getValues(name) || [];
      setValue(name, extractVariables(text).map((_, i) => current[i] || ""));
    };
    fit("headerVariables", header);
    fit("bodyVariables", body);
  }, [header, body, getValues, setValue]);

  const components = [
    headerType === "TEXT" && { type: "HEADER", format: "TEXT", text: header },
    headerType === "IMAGE" && { type: "HEADER", format: "IMAGE", file: watch("headerImage") },
    { type: "BODY", text: body },
    { type: "FOOTER", text: watch("footer") },
    { type: "BUTTONS", buttons: watch("buttons") || [] },
  ].filter(Boolean);

  const onSubmit = async (data) => {
    const problem =
      buttonsProblem(data.buttons) ||
      (data.headerType === "IMAGE" && !data.headerImage && "Add a header image or choose another header.") ||
      ([...data.headerVariables, ...data.bodyVariables].some((v) => !v?.trim()) &&
        "Add an example for every variable.");
    if (problem) {
      showToast({ message: problem, type: "error" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("language", data.language);
      formData.append("category", data.category || "UTILITY");
      formData.append("headerType", data.headerType);
      formData.append("header", data.header || "");
      formData.append("body", data.body);
      formData.append("footer", data.footer || "");
      formData.append("headerVariables", JSON.stringify(data.headerVariables || []));
      formData.append("bodyVariables", JSON.stringify(data.bodyVariables || []));
      formData.append("buttons", JSON.stringify(toMetaButtons(data.buttons)));
      if (data.headerType === "IMAGE" && data.headerImage instanceof File) {
        formData.append("file", data.headerImage);
      }

      const response = isEdit
        ? await updateWhatsAppMessageTemplate(formData, initialData?.id)
        : await createWhatsAppMessageTemplate(formData);

      if (!response?.success) {
        throw new Error(metaMessage(response, "Meta did not accept this template."));
      }

      showToast({
        message: isEdit
          ? "Changes sent to Meta for review"
          : "Template sent to Meta for approval",
      });
      reset(toDefaults(null));
      onSaved?.();
    } catch (error) {
      showToast({ message: error?.message || "Could not save the template.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {onClose && (isEdit || initialData) && (
            <IconButton icon={ArrowLeft} label="Back" onClick={onClose} />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-app-text">
              {isEdit ? `Edit ${initialData?.name}` : "Create a message template"}
            </h2>
            <p className="text-xs text-app-text-muted">
              Templates start conversations with guests. Meta usually reviews them within
              a few minutes.
            </p>
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-4">
            <TemplateHeader mode={mode} />
            <TemplateContent />
            <TemplateButtons />

            <div className="flex justify-end gap-2">
              {onClose && (isEdit || initialData) && (
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
              )}
              <Button type="submit" icon={Send} loading={loading}>
                {isEdit ? "Submit changes" : "Submit for approval"}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
              Preview
            </p>
            <TemplatePreview
              components={components}
              headerVariables={watch("headerVariables")}
              bodyVariables={watch("bodyVariables")}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateTemplate;

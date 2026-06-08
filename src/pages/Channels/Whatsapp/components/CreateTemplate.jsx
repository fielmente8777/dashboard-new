import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TemplateHeader from "./TemplateHeader";
import { templateSchema } from "../../../../schema/templateSchema";
import TemplateContent from "./TemplateContent";
import TemplateButtons from "./TemplateButtons";
import VariableSamples from "./VariableSample";
import TemplatePreview from "./TemplatePreview";
import { createWhatsAppMessageTemplate } from "../../../../services/api/whatsApp";
import { useToast } from "../../../../context/ToastContext";
import Loader from "../../../../components/Loader";

const extractVariables = (text = "") => {
  const matches = text.match(/{{(\d+)}}/g) || [];

  return matches.map((v) => ({
    key: v,
    sample: "",
  }));
};

const CreateTemplate = ({ initialData = null, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();
  const methods = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || "",
      language: initialData?.language || "en_US",
      category: initialData?.category || "UTILITY",
      header: initialData?.header || "",
      body: initialData?.body || "",
      footer: initialData?.footer || "",
      headerVariables: initialData?.headerVariables || [],
      bodyVariables: initialData?.bodyVariables || [],
      buttons: initialData?.buttons || [],
    },
  });

  const { handleSubmit, watch, setValue } = methods;

  const header = watch("header");
  const body = watch("body");
  const footer = watch("footer");
  const buttons = watch("buttons");

  const components = [
    {
      type: "HEADER",
      text: header,
    },
    {
      type: "BODY",
      text: body,
    },
    {
      type: "FOOTER",
      text: footer,
    },
    {
      type: "BUTTONS",
      buttons: buttons || [],
    },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await createWhatsAppMessageTemplate(data);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message: "Template created successfully",
          type: "success",
        });

        return;
      }

      showToast({
        message:
          response?.error?.error?.error_user_msg || "Failed to create template",
        type: "error",
      });
    } catch (error) {
      console.error(error);
      showToast({
        message: error?.message || "Failed to create template",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const headerVars = extractVariables(header);
    const bodyVars = extractVariables(body);

    const currentHeaderSamples = methods.getValues("headerVariables") || [];
    const currentBodySamples = methods.getValues("bodyVariables") || [];

    const newHeaderSamples = headerVars.map(
      (_, i) => currentHeaderSamples[i] || "",
    );

    const newBodySamples = bodyVars.map((_, i) => currentBodySamples[i] || "");

    setValue("headerVariables", newHeaderSamples);
    setValue("bodyVariables", newBodySamples);
  }, [header, body, setValue]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-6 p-2 bg-app-surface "
      >
        {/* LEFT FORM */}

        <div className="flex-1 space-y-6">
          <TemplateHeader onCancel={onClose} showCancelButton={initialData} />
          <TemplateContent />
          <TemplateButtons />

          <div className="flex justify-end">
            <button
              type="submit"
              className="outline-none border border-slate-500! text-gray-600 dark:text-app-text px-4 py-2 rounded-sm hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
            >
              + Create Template {loading && <Loader color="#378863" />}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="">
          <h2 className="mb-2">Template Preview</h2>
          <TemplatePreview
            components={components}
            headerVariables={watch("headerVariables")}
            bodyVariables={watch("bodyVariables")}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateTemplate;

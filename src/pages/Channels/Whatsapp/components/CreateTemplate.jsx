import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TemplateHeader from "./TemplateHeader";
import { templateSchema } from "../../../../schema/templateSchema";
import TemplateContent from "./TemplateContent";
import TemplateButtons from "./TemplateButtons";
import VariableSamples from "./VariableSample";
import TemplatePreview from "./TemplatePreview";
import {
  createWhatsAppMessageTemplate,
  updateWhatsAppMessageTemplate,
} from "../../../../services/api/whatsApp";
import { useToast } from "../../../../context/ToastContext";
import Loader from "../../../../components/Loader";

const extractVariables = (text = "") => {
  const matches = text.match(/{{(\d+)}}/g) || [];

  return matches.map((v) => ({
    key: v,
    sample: "",
  }));
};

const normalizeTemplate = (template) => {
  if (!template) return null;

  const header = template.components?.find((c) => c.type === "HEADER");
  const body = template.components?.find((c) => c.type === "BODY");
  const footer = template.components?.find((c) => c.type === "FOOTER");
  const buttons = template.components?.find((c) => c.type === "BUTTONS");

  console.log("header", header);

  return {
    id: template.id,
    name: template.name,
    language: template.language,
    category: template.category,

    headerType: header?.format || "NONE",

    // TEXT header only
    header: header?.text || "",

    // Existing media (for preview only)
    headerImage:
      header?.format === "IMAGE"
        ? header?.example?.header_handle?.[0] || null
        : null,

    headerVideo:
      header?.format === "VIDEO"
        ? header?.example?.header_handle?.[0] || null
        : null,

    headerDocument:
      header?.format === "DOCUMENT"
        ? header?.example?.header_handle?.[0] || null
        : null,

    body: body?.text || "",
    footer: footer?.text || "",
    buttons: buttons?.buttons || [],

    headerVariables: header?.example?.header_text || [],
    bodyVariables: body?.example?.body_text[0] || [],
  };
};

const CreateTemplate = ({ initialData = null, onClose, mode = "create" }) => {
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();

  const formData = React.useMemo(
    () => normalizeTemplate(initialData),
    [initialData],
  );

  const methods = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: formData?.name || "",
      language: formData?.language || "en_US",
      category: formData?.category || "UTILITY",

      header: formData?.header || "",
      headerType: formData?.headerType || "NONE",

      headerImage: formData?.headerImage,
      headerVideo: formData?.headerVideo,
      headerDocument: formData?.headerDocument,

      body: formData?.body || "",
      footer: formData?.footer || "",

      headerVariables: formData?.headerVariables || [],
      bodyVariables: formData?.bodyVariables || [],
      buttons: formData?.buttons || [],
    },
  });

  // const methods = useForm({
  //   resolver: zodResolver(templateSchema),
  //   defaultValues: {
  //     name: initialData?.name || "",
  //     language: initialData?.language || "en_US",
  //     category: initialData?.category || "UTILITY",
  //     header: initialData?.header || "",
  //     headerType: "NONE",
  //     headerImage: null,
  //     headerVideo: null,
  //     headerDocument: null,
  //     body: initialData?.body || "",
  //     footer: initialData?.footer || "",
  //     headerVariables: initialData?.headerVariables || [],
  //     bodyVariables: initialData?.bodyVariables || [],
  //     buttons: initialData?.buttons || [],
  //   },
  // });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  console.log("errors", errors);

  const header = watch("header");
  const body = watch("body");
  const footer = watch("footer");
  const buttons = watch("buttons");

  const headerType = watch("headerType");
  const headerImage = watch("headerImage");
  const headerVideo = watch("headerVideo");
  const headerDocument = watch("headerDocument");

  const headerComponent =
    headerType === "TEXT"
      ? {
          type: "HEADER",
          format: "TEXT",
          text: header,
        }
      : headerType === "IMAGE"
        ? {
            type: "HEADER",
            format: "IMAGE",
            file: headerImage,
          }
        : headerType === "VIDEO"
          ? {
              type: "HEADER",
              format: "VIDEO",
              file: headerVideo,
            }
          : headerType === "DOCUMENT"
            ? {
                type: "HEADER",
                format: "DOCUMENT",
                file: headerDocument,
              }
            : null;

  const components = [
    ...(headerComponent ? [headerComponent] : []),
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
    console.log("data", data);

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

      formData.append(
        "headerVariables",
        JSON.stringify(data.headerVariables || []),
      );

      formData.append(
        "bodyVariables",
        JSON.stringify(data.bodyVariables || []),
      );

      formData.append("buttons", JSON.stringify(data.buttons || []));

      if (data.headerType === "IMAGE" && data.headerImage) {
        console.log("data.headerImage  ke andar aag agay");
        formData.append("file", data.headerImage);
      }

      if (data.headerType === "VIDEO" && data.headerVideo) {
        formData.append("file", data.headerVideo);
      }

      if (data.headerType === "DOCUMENT" && data.headerDocument) {
        formData.append("file", data.headerDocument);
      }

      const response =
        mode === "create"
          ? await createWhatsAppMessageTemplate(formData)
          : await updateWhatsAppMessageTemplate(formData, initialData?.id);

      console.log("response", response);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message: response?.responseMessage || "Template created successfully",
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
    } finally {
      setLoading(false);
    }
  };

  // const onSubmit = async (data) => {
  //   setLoading(true);
  //   console.log(data);
  //   try {
  //     const response = await createWhatsAppMessageTemplate(data);

  //     if (response?.success && response?.responseStatusCode === 200) {
  //       showToast({
  //         message: "Template created successfully",
  //         type: "success",
  //       });

  //       return;
  //     }

  //     showToast({
  //       message:
  //         response?.error?.error?.error_user_msg || "Failed to create template",
  //       type: "error",
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     showToast({
  //       message: error?.message || "Failed to create template",
  //       type: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        className="flex md:flex-row flex-col gap-6 p-2 bg-app-surface "
      >
        {/* LEFT FORM */}

        <div className="flex-1 space-y-6">
          <TemplateHeader
            onCancel={onClose}
            showCancelButton={initialData}
            mode={mode}
          />
          <TemplateContent />
          <TemplateButtons />

          <div className="flex justify-end">
            {mode === "edit" ? (
              <button
                type="submit"
                className="outline-none border border-slate-500! text-gray-600 dark:text-app-text px-4 py-2 rounded-sm hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
              >
                Pulish Chnages {loading && <Loader color="#378863" />}
              </button>
            ) : (
              <button
                type="submit"
                className="outline-none border border-slate-500! text-gray-600 dark:text-app-text px-4 py-2 rounded-sm hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
              >
                + Create Template {loading && <Loader color="#378863" />}
              </button>
            )}
            {/* <button
              type="submit"
              className="outline-none border border-slate-500! text-gray-600 dark:text-app-text px-4 py-2 rounded-sm hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
            >
              + Create Template {loading && <Loader color="#378863" />}
            </button> */}
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

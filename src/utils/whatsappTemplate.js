export const normalizeTemplate = (template) => {
  const bodyComponent = template.components?.find((c) => c.type === "BODY");

  const bodyText = bodyComponent?.text || "";
  const variables = bodyText.match(/{{\d+}}/g) || [];

  return {
    id: template.id,
    name: template.name,
    language: template.language || "en",
    body: bodyText,
    variables,
  };
};

export const renderTemplatePreview = (body, values = {}) => {
  return body.replace(/{{(\d+)}}/g, (_, num) => {
    return values[num] || `{{${num}}}`;
  });
};

export const buildTemplateParameters = (values = {}) => {
  return Object.keys(values)
    .sort((a, b) => a - b)
    .map((key) => ({
      type: "text",
      text: values[key],
    }));
};

export const buildTemplatePayload = ({ to, template, values }) => {
  return {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template.name,
      language: {
        code: template.language,
      },
      components: [
        {
          type: "body",
          parameters: buildTemplateParameters(values),
        },
      ],
    },
  };
};

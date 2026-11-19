const findComponent = (template, type) =>
  template?.components?.find((component) => component.type === type);

// The values a template is sent with, starting from its sample values:
// { body: [...], header: [...] }
export const getTemplateDefaults = (template) => ({
  body: [...(findComponent(template, "BODY")?.example?.body_text?.[0] || [])],
  header: [...(findComponent(template, "HEADER")?.example?.header_text || [])],
});

// What the send API expects for a template and its values.
export const buildTemplatePayload = (phone, template, values) => ({
  phone,
  templateName: template.name,
  templateLanguage: template.language || "en",
  templateParams: values.body,
  templateParamsHeader: values.header,
});

// true when every {{n}} of the template has a value
export const isTemplateFilled = (values) =>
  [...values.body, ...values.header].every((value) => String(value).trim());

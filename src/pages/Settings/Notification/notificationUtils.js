// The lead sources a notification can be set for, in display order.
export const SOURCES = [
  { key: "webform", label: "Website forms", description: "Enquiries from your website" },
  { key: "eazbot", label: "Eazbot", description: "Leads captured by the chatbot" },
  { key: "whatsapp", label: "WhatsApp", description: "New WhatsApp conversations" },
  { key: "facebook", label: "Facebook", description: "Meta lead ads" },
  { key: "google", label: "Google", description: "Google Ads leads" },
];

// the call outcomes a follow-up WhatsApp message can be set for
export const CALL_STATUSES = [
  { key: "notAnswered", label: "Not answered" },
  { key: "missedCall", label: "Missed call" },
  { key: "busy", label: "Busy" },
];

const EMPTY_CALL = { type: "template", templateName: "", message: "", templateMeta: null };

// the saved settings with every source and call status filled in
export const normalizeSettings = (docs) => ({
  config: Object.fromEntries(
    SOURCES.map(({ key }) => {
      const saved = docs?.config?.[key] || {};
      return [
        key,
        {
          email: saved.email || [],
          phone: saved.phone || [],
          isEmailAllowed: Boolean(saved.isEmailAllowed),
          isPhoneAllowed: Boolean(saved.isPhoneAllowed),
        },
      ];
    }),
  ),
  callConfig: {
    enabled: Boolean(docs?.callConfig?.enabled),
    configs: Object.fromEntries(
      CALL_STATUSES.map(({ key }) => [
        key,
        { ...EMPTY_CALL, ...docs?.callConfig?.configs?.[key] },
      ]),
    ),
  },
});

export const EMPTY_SETTINGS = normalizeSettings(null);

const component = (template, type) =>
  template?.components?.find((item) => item.type === type);

// what the backend needs to send a template after a call
export const templateMeta = (template) => ({
  name: template.name,
  language: template.language,
  bodyText: component(template, "BODY")?.text || "",
  variables: component(template, "BODY")?.example?.body_text?.[0] || [],
  headerVariables: component(template, "HEADER")?.example?.header_text || [],
  headerType: component(template, "HEADER")?.format || null,
  buttons: component(template, "BUTTONS")?.buttons || [],
});

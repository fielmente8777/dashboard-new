const nodeSchemas = {
  message: {
    label: "Message",
    color: "bg-blue-500",
    fields: [{ name: "text", type: "textarea", label: "Message Text" }],
  },

  cta: {
    label: "CTA Buttons",
    color: "bg-purple-500",
    fields: [
      { name: "message", type: "text", label: "Message" },
      { name: "buttons", type: "array", label: "Buttons" },
    ],
  },

  form: {
    label: "Form",
    color: "bg-green-500",
    fields: [{ name: "fields", type: "array", label: "Form Fields" }],
  },

  media: {
    label: "Media",
    color: "bg-pink-500",
    fields: [{ name: "url", type: "text", label: "Media URL" }],
  },
};

export default nodeSchemas;

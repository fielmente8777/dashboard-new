export const formatScreenId = (title, index) => {
  const clean = title
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .replace(/\s+/g, "_");

  return clean || `SCREEN_${String.fromCharCode(65 + index)}`;
};

export const transformToMetaFlow = (screens) => {
  return screens.map((screen, index) => {
    const currentId = formatScreenId(screen.title, index);
    const isLast = index === screens.length - 1;

    const nextScreenId = !isLast
      ? formatScreenId(screens[index + 1].title, index + 1)
      : null;

    return {
      id: currentId,
      title: screen.title,

      // ✅ required by Meta (even if empty)
      data: {},

      ...(isLast && { terminal: true }),

      layout: {
        type: "SingleColumnLayout",

        children: [
          // ✅ Optional heading
          {
            type: "TextHeading",
            text: screen.title,
          },

          // ✅ Fields
          ...screen.fields.map((field, i) => {
            const fieldName = field.name || `field_${index}_${i}`;

            const base = {
              name: fieldName,
              label: field.label,
              required: field.required || false,
            };

            switch (field.type) {
              case "textarea":
                return {
                  type: "TextArea",
                  ...base,
                };

              case "email":
                return {
                  type: "TextInput",
                  "input-type": "email",
                  ...base,
                };

              case "number":
                return {
                  type: "TextInput",
                  "input-type": "number",
                  ...base,
                };

              case "date":
                return {
                  type: "DatePicker",
                  //   mode: "single",
                  ...base,
                };

              default:
                return {
                  type: "TextInput",
                  ...base,
                };
            }
          }),

          // ✅ Footer (CRITICAL)
          {
            type: "Footer",
            label: isLast ? "Submit" : "Continue",

            "on-click-action": isLast
              ? {
                  // ✅ FINAL SCREEN → COMPLETE
                  name: "complete",
                  payload: screens.reduce((acc, scr, scrIndex) => {
                    const scrId = formatScreenId(scr.title, scrIndex);

                    scr.fields.forEach((f, i) => {
                      const key = f.name || `field_${scrIndex}_${i}`;

                      acc[key] = `\${screen.${scrId}.form.${key}}`;
                    });

                    return acc;
                  }, {}),
                }
              : {
                  // ✅ NAVIGATION
                  name: "navigate",
                  next: {
                    type: "screen",
                    name: nextScreenId,
                  },
                  payload: {},
                },
          },
        ],
      },
    };
  });
};

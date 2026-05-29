const replaceVariables = (text = "", values = []) => {
  return text.replace(/{{(\d+)}}/g, (_, index) => {
    return values[index - 1] || `{{${index}}}`;
  });
};

export default function TemplatePreview({
  components = [],
  headerVariables = [],
  bodyVariables = [],
}) {
  const headerComponent = components.find((c) => c.type === "HEADER");
  const bodyComponent = components.find((c) => c.type === "BODY");
  const footerComponent = components.find((c) => c.type === "FOOTER");
  const buttonComponent = components.find((c) => c.type === "BUTTONS");

  const headerText = replaceVariables(headerComponent?.text, headerVariables);
  const bodyText = replaceVariables(bodyComponent?.text, bodyVariables);
  const footerText = footerComponent?.text;

  return (
    <div className="bg-[#e5ddd5] p-4 rounded-lg max-w-85 w-full">
      <div className="bg-primary rounded-lg p-3 text-sm whitespace-pre-line shadow-sm space-y-2">
        {headerText && (
          <div className="font-semibold text-base">{headerText}</div>
        )}

        {bodyText && <div>{bodyText}</div>}

        {footerText && (
          <div className="text-xs text-gray-500 mt-2">{footerText}</div>
        )}
      </div>

      {buttonComponent?.buttons?.length > 0 && (
        <div className="mt-2 space-y-2">
          {buttonComponent.buttons.map((btn, i) => (
            <button
              key={i}
              className="w-full bg-app-surface border border-gray-300 text-blue-600 text-sm py-2 rounded-md hover:bg-gray-50 transition"
            >
              {btn.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// const replaceVariables = (text = "", values = []) => {
//   return text.replace(/{{(\d+)}}/g, (_, index) => {
//     return values[index - 1] || `{{${index}}}`;
//   });
// };

// export default function TemplatePreview({ components = [], variables = [] }) {
//   const headerComponent = components.find((c) => c.type === "HEADER");
//   const bodyComponent = components.find((c) => c.type === "BODY");
//   const footerComponent = components.find((c) => c.type === "FOOTER");
//   const buttonComponent = components.find((c) => c.type === "BUTTONS");

//   const exampleValues =
//     variables.length > 0
//       ? variables
//       : bodyComponent?.example?.body_text?.[0] || [];

//   const headerText = replaceVariables(headerComponent?.text, exampleValues);
//   const bodyText = replaceVariables(bodyComponent?.text, exampleValues);
//   const footerText = replaceVariables(footerComponent?.text, exampleValues);

//   return (
//     <div className="bg-[#e5ddd5] p-4 rounded-lg w-85">
//       {/* Message Bubble */}
//       <div className="bg-white rounded-lg p-3 text-sm whitespace-pre-line shadow-sm space-y-2">
//         {/* HEADER */}
//         {headerText && (
//           <div className="font-semibold text-base">{headerText}</div>
//         )}

//         {/* BODY */}
//         {bodyText && <div>{bodyText}</div>}

//         {/* FOOTER */}
//         {footerText && (
//           <div className="text-xs text-gray-500 mt-2">{footerText}</div>
//         )}
//       </div>

//       {/* BUTTONS */}
//       {buttonComponent?.buttons?.length > 0 && (
//         <div className="mt-2 space-y-2">
//           {buttonComponent.buttons.map((btn, i) => (
//             <button
//               key={i}
//               className="w-full bg-white border border-gray-300 text-blue-600 text-sm py-2 rounded-md hover:bg-gray-50 transition"
//             >
//               {btn.text}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // const replaceVariables = (text = "", examples = []) => {
// //   return text.replace(/{{(\d+)}}/g, (_, index) => {
// //     return examples[index - 1] || `{{${index}}}`;
// //   });
// // };

// // export default function TemplatePreview({ components = [] }) {
// //   const bodyComponent = components.find((c) => c.type === "BODY");
// //   const buttonComponent = components.find((c) => c.type === "BUTTONS");

// //   const exampleValues = bodyComponent?.example?.body_text?.[0] || [];
// //   const bodyText = replaceVariables(bodyComponent?.text, exampleValues);

// //   return (
// //     <div className="bg-[#e5ddd5] p-4 rounded-lg w-85">
// //       {/* Message Bubble */}
// //       <div className="bg-white rounded-lg p-3 text-sm whitespace-pre-line shadow-sm">
// //         {bodyText}
// //       </div>

// //       {/* Buttons */}
// //       {buttonComponent?.buttons?.length > 0 && (
// //         <div className="mt-2 space-y-2">
// //           {buttonComponent.buttons.map((btn, i) => (
// //             <button
// //               key={i}
// //               className="w-full bg-white border border-gray-300 text-blue-600 text-sm py-2 rounded-md hover:bg-gray-50 transition"
// //             >
// //               {btn.text}
// //             </button>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

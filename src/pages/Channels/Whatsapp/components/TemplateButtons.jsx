import { useFieldArray, useFormContext } from "react-hook-form";
import { IoClose } from "react-icons/io5";

const TemplateButtons = () => {
  const { control, register, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "buttons",
  });

  const buttons = watch("buttons") || [];

  return (
    <div className="bg-app-surface p-6 rounded-lg border-primary/60!">
      <h2 className="text-lg font-semibold mb-4">Buttons</h2>

      <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
        {fields.map((field, index) => {
          const textLength = buttons[index]?.text?.length || 0;
          const urlLength = buttons[index]?.url?.length || 0;

          return (
            <div
              key={field.id}
              className="border rounded-md p-3 bg-app-surface-secondary relative"
            >
              {/* REMOVE ICON */}
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-3 right-3 text-gray-400 dark:text-app-text-faint hover:text-red-500"
              >
                <IoClose />
              </button>

              <div className="flex gap-3 items-start">
                {/* DRAG ICON */}
                {/* <GripVertical
                  size={18}
                  className="text-gray-400 mt-6 cursor-grab"
                /> */}

                <div className="grid grid-cols-4 gap-3 w-full">
                  {/* TYPE */}
                  <div>
                    <label className="text-xs text-gray-500">
                      Type of action
                    </label>

                    <select
                      {...register(`buttons.${index}.type`)}
                      className="w-full border rounded-md px-2 py-1.5 text-sm bg-app-surface"
                    >
                      <option value="visit">Visit website</option>
                      <option value="quick">Quick reply</option>
                    </select>
                  </div>

                  {/* BUTTON TEXT */}
                  <div>
                    <label className="text-xs text-gray-500">Button text</label>

                    <input
                      {...register(`buttons.${index}.text`)}
                      className="w-full border rounded-md px-2 py-1.5 text-sm"
                    />

                    <div className="text-[11px] text-gray-400 text-right">
                      {textLength}/25
                    </div>
                  </div>

                  {/* URL TYPE */}
                  <div>
                    <label className="text-xs text-gray-500">URL type</label>

                    <select
                      {...register(`buttons.${index}.urlType`)}
                      className="w-full border rounded-md px-2 py-1.5 text-sm bg-app-surface"
                    >
                      <option value="static">Static</option>
                      <option value="dynamic">Dynamic</option>
                    </select>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="text-xs text-gray-500">Website URL</label>

                    <input
                      {...register(`buttons.${index}.url`)}
                      className="w-full border rounded-md px-2 py-1.5 text-sm"
                    />

                    <div className="text-[11px] text-gray-400 text-right">
                      {urlLength}/2000
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD BUTTON */}
      <button
        type="button"
        onClick={() =>
          append({
            type: "visit",
            text: "",
            url: "",
            urlType: "static",
          })
        }
        className="mt-4 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-primary/60"
      >
        + Add button
      </button>
    </div>
  );
};

export default TemplateButtons;

// import { useFieldArray, useFormContext } from "react-hook-form";

// const TemplateButtons = () => {
//   const { control, register } = useFormContext();

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "buttons",
//   });

//   return (
//     <div className="bg-white p-6 rounded-lg border">
//       <h2 className="text-lg font-semibold mb-4">Buttons</h2>

//       {fields.map((field, index) => (
//         <div key={field.id} className="grid grid-cols-4 gap-3 mb-3">
//           <select
//             {...register(`buttons.${index}.type`)}
//             className="border rounded-md p-2"
//           >
//             <option value="visit">Visit Website</option>
//             <option value="quick">Quick Reply</option>
//           </select>

//           <input
//             {...register(`buttons.${index}.text`)}
//             placeholder="Button text"
//             className="border rounded-md p-2"
//           />

//           <input
//             {...register(`buttons.${index}.url`)}
//             placeholder="URL"
//             className="border rounded-md p-2"
//           />

//           <button
//             type="button"
//             onClick={() => remove(index)}
//             className="text-red-500"
//           >
//             Remove
//           </button>
//         </div>
//       ))}

//       <button
//         type="button"
//         onClick={() => append({ type: "visit", text: "", url: "" })}
//         className="bg-gray-200 px-4 py-2 rounded"
//       >
//         Add Button
//       </button>
//     </div>
//   );
// };

// export default TemplateButtons;

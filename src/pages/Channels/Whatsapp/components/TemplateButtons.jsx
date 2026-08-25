import { useFieldArray, useFormContext } from "react-hook-form";
import { IoClose } from "react-icons/io5";

const FIELD =
  "w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface px-[var(--sp-2)] py-1.5 text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const FIELD_LABEL =
  "text-[length:var(--fs-xs)] text-gray-500 dark:text-app-text-faint";
const COUNTER =
  "text-[length:var(--fs-2xs)] text-gray-400 dark:text-app-text-faint text-right";

const TemplateButtons = () => {
  const { control, register, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "buttons",
  });

  const buttons = watch("buttons") || [];

  return (
    <div className="bg-app-surface p-[var(--sp-5)] rounded-[var(--r-md)] border border-app-border">
      <h2 className="text-[length:var(--fs-lg)] font-semibold mb-[var(--sp-4)] text-app-text">
        Buttons
      </h2>

      <div className="space-y-[var(--sp-4)] max-h-[16.25rem] overflow-y-auto pr-1">
        {fields.map((field, index) => {
          const textLength = buttons[index]?.text?.length || 0;
          const urlLength = buttons[index]?.url?.length || 0;

          return (
            <div
              key={field.id}
              className="border border-app-border rounded-[var(--r-sm)] p-[var(--sp-3)] pr-10 bg-app-surface-secondary relative"
            >
              {/* REMOVE ICON */}
              <button
                type="button"
                aria-label="Remove button"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 size-8 flex items-center justify-center rounded-[var(--r-sm)] text-gray-400 dark:text-app-text-faint hover:bg-app-surface hover:text-red-500 transition-colors"
              >
                <IoClose />
              </button>

              <div className="flex gap-[var(--sp-3)] items-start">
                {/* DRAG ICON */}
                {/* <GripVertical
                  size={18}
                  className="text-gray-400 mt-6 cursor-grab"
                /> */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[var(--sp-3)] w-full min-w-0">
                  {/* TYPE */}
                  <div className="min-w-0">
                    <label className={FIELD_LABEL}>Type of action</label>

                    <select
                      {...register(`buttons.${index}.type`)}
                      value={"URL"}
                      className={`${FIELD} cursor-pointer`}
                    >
                      <option value="URL">Visit website</option>
                      {/* <option value="quick">Quick reply</option> */}
                    </select>
                  </div>

                  {/* BUTTON TEXT */}
                  <div className="min-w-0">
                    <label className={FIELD_LABEL}>Button text</label>

                    <input
                      {...register(`buttons.${index}.text`)}
                      className={FIELD}
                    />

                    <div className={COUNTER}>{textLength}/25</div>
                  </div>

                  {/* URL TYPE */}
                  <div className="min-w-0">
                    <label className={FIELD_LABEL}>URL type</label>

                    <select
                      {...register(`buttons.${index}.urlType`)}
                      className={`${FIELD} cursor-pointer`}
                    >
                      <option value="static">Static</option>
                      <option value="dynamic">Dynamic</option>
                    </select>
                  </div>

                  {/* URL */}
                  <div className="min-w-0">
                    <label className={FIELD_LABEL}>Website URL</label>

                    <input
                      {...register(`buttons.${index}.url`)}
                      className={FIELD}
                    />

                    <div className={COUNTER}>{urlLength}/2000</div>
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
        className="mt-[var(--sp-4)] w-full sm:w-auto border border-app-border text-app-text px-[var(--sp-4)] py-[var(--sp-2)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] hover:border-primary hover:text-primary transition-colors"
      >
        + Add button
      </button>
    </div>
  );
};

export default TemplateButtons;
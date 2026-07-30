import { useFormContext, Controller } from "react-hook-form";
import CustomDropdown from "../../../../components/ui/Dropdown";

const languages = [
  { value: "en_US", label: "English (US)" },
  { value: "hi", label: "Hindi" },
];

const categories = [
  { value: "UTITLITY", label: "UTILITY" },
  { value: "MARKETING", label: "MARKETING" },
  { value: "AUTHENTICATION", label: "AUTHENTICATION" },
];

const TemplateHeader = ({ onCancel, showCancelButton, mode }) => {
  const {
    register,
    getValues,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-app-surface p-4 rounded-lg border-primary/60!">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold mb-4">
          Template name and language
        </h2>

        {showCancelButton && (
          <div>
            <button
              className="bg-red-500 rounded-sm text-white px-2 py-1"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 w-full bg-app-surface-secondary p-4 rounded-lg">
        {/* TEMPLATE NAME */}
        <div className="flex-1">
          <label className="text-sm text-gray-600 dark:text-app-text-faint mb-2 inline-block">
            Template Name
          </label>

          <input
            disabled={mode === "edit"}
            {...register("name")}
            className="w-full border border-gray-400! bordgr rounded-md px-3 py-2 text-sm 
             focus:outline-none focus:ring-1 focus:ring-primary
             transition disabled:opacity-60"
          />

          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* LANGUAGE DROPDOWN */}
      </div>

      <div className="flex gap-2 mt-2">
        <div>
          <label className="text-sm text-gray-600 inline-block mb-1.5">
            Category
          </label>

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                {...field}
                options={categories}
                label={getValues("category") || ""}
                disabled={mode === "edit"}
              />
            )}
          />

          {errors.language && (
            <p className="text-red-500 text-sm">{errors.language.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600 inline-block mb-1.5">
            Language
          </label>

          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                {...field}
                options={languages}
                label={getValues("language") || ""}
                disabled={mode === "edit"}
              />
            )}
          />

          {errors.language && (
            <p className="text-red-500 text-sm">{errors.language.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateHeader;

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

const LABEL =
  "text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-muted mb-1.5 inline-block";

const TemplateHeader = ({ onCancel, showCancelButton, mode }) => {
  const {
    register,
    getValues,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-app-surface p-[var(--sp-4)] rounded-[var(--r-md)] border border-app-border">
      <div className="flex flex-wrap justify-between items-start gap-[var(--sp-3)]">
        <h2 className="text-[length:var(--fs-lg)] font-semibold mb-[var(--sp-4)] text-app-text">
          Template name and language
        </h2>

        {showCancelButton && (
          <div>
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 rounded-[var(--r-sm)] text-white px-[var(--sp-3)] py-[var(--sp-1)] text-[length:var(--fs-sm)] transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-[var(--sp-3)] w-full bg-app-surface-secondary p-[var(--sp-4)] rounded-[var(--r-md)]">
        {/* TEMPLATE NAME */}
        <div className="flex-1 min-w-0">
          <label className={LABEL}>Template Name</label>

          <input
            disabled={mode === "edit"}
            {...register("name")}
            className="w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface px-[var(--sp-3)] py-[var(--sp-2)] text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint
             outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
             transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {errors.name && (
            <p className="text-red-500 text-[length:var(--fs-sm)] mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* LANGUAGE DROPDOWN */}
      </div>

      <div className="flex flex-col sm:flex-row gap-[var(--sp-3)] mt-[var(--sp-3)]">
        <div className="min-w-0 sm:flex-1">
          <label className={LABEL}>Category</label>

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
            <p className="text-red-500 text-[length:var(--fs-sm)]">
              {errors.language.message}
            </p>
          )}
        </div>

        <div className="min-w-0 sm:flex-1">
          <label className={LABEL}>Language</label>

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
            <p className="text-red-500 text-[length:var(--fs-sm)]">
              {errors.language.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateHeader;
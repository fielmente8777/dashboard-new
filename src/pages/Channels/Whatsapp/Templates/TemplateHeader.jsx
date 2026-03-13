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

const TemplateHeader = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Template name and language</h2>

      <div className="flex items-start gap-2 w-full">
        {/* TEMPLATE NAME */}
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-2 inline-block">
            Template Name
          </label>

          <input
            {...register("name")}
            className="w-full border border-gray-400! bordgr rounded-md px-3 py-2 text-sm 
             focus:outline-none focus:ring-1 focus:ring-primary
             transition"
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
            name="language"
            control={control}
            render={({ field }) => (
              <CustomDropdown {...field} options={categories} className="" />
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
              <CustomDropdown {...field} options={languages} className="" />
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

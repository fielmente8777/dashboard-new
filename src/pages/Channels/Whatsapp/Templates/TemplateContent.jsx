import { useFormContext } from "react-hook-form";
import VariableSamples from "./VariableSample";

const TemplateContent = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const header = watch("header") || "";
  const body = watch("body") || "";
  const footer = watch("footer") || "";

  const getNextVariable = (text) => {
    const matches = text.match(/{{\d+}}/g) || [];
    return matches.length + 1;
  };

  const addHeaderVariable = () => {
    const next = getNextVariable(header);
    setValue("header", header + `{{${next}}}`);
  };

  const addBodyVariable = () => {
    const next = getNextVariable(body);
    setValue("body", body + ` {{${next}}}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-6">
      <h2 className="text-lg font-semibold">Content</h2>

      {/* HEADER */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">
            Header <span className="text-gray-400">(optional)</span>
          </label>

          <button
            type="button"
            onClick={addHeaderVariable}
            className="text-sm text-primary font-medium"
          >
            + Add variable
          </button>
        </div>

        <input
          {...register("header")}
          placeholder="Header text"
          maxLength={60}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:ring-1 focus:ring-primary transition"
        />

        <div className="text-xs text-gray-500 mt-1 text-right">
          {header.length}/60
        </div>
      </div>

      {/* BODY */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-700">Body</label>

          <button
            type="button"
            onClick={addBodyVariable}
            className="text-sm text-primary font-medium"
          >
            + Add variable
          </button>
        </div>

        <textarea
          {...register("body")}
          rows={6}
          maxLength={1024}
          placeholder="Body text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:ring-1 focus:ring-primary transition"
        />

        <div className="flex justify-between text-xs mt-1">
          {errors.body && <p className="text-red-500">{errors.body.message}</p>}

          <span className="text-gray-500 ml-auto">{body.length}/1024</span>
        </div>
      </div>

      {/* FOOTER */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Footer <span className="text-gray-400">(optional)</span>
        </label>

        <input
          {...register("footer")}
          placeholder="Footer"
          maxLength={60}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
          focus:outline-none focus:ring-1 focus:ring-primary transition"
        />

        <div className="text-xs text-gray-500 mt-1 text-right">
          {footer.length}/60
        </div>
      </div>

      <VariableSamples />
    </div>
  );
};

export default TemplateContent;

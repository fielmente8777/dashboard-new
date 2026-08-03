import { useFormContext } from "react-hook-form";

const extractVariables = (text) => {
  const matches = text?.match(/{{\d+}}/g);
  return matches ? [...new Set(matches)] : [];
};

const VariableSamples = () => {
  const { register, watch } = useFormContext();

  const header = watch("header");
  const body = watch("body");

  const headerVars = extractVariables(header);
  const bodyVars = extractVariables(body);

  if (!headerVars.length && !bodyVars.length) return null;

  return (
    <div className="bg-app-surface p-6 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Variable Samples</h2>

      <p className="text-sm text-gray-500 mb-6">
        Include samples of all variables to help Meta review your template.
      </p>

      {/* HEADER VARIABLES */}
      {headerVars.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Header</h3>

          <div className="space-y-2">
            {headerVars.map((v, index) => (
              <div key={v} className="flex gap-3">
                <input
                  value={v}
                  disabled
                  className="border rounded-md px-3 py-2 w-20 bg-gray-100"
                />

                <input
                  {...register(`headerVariables.${index}`)}
                  placeholder={`Enter content for ${v}`}
                  className="border rounded-md px-3 py-2 flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BODY VARIABLES */}
      {bodyVars.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Body</h3>

          <div className="space-y-2">
            {bodyVars.map((v, index) => (
              <div key={v} className="flex gap-3">
                <input
                  value={v}
                  disabled
                  className="border rounded-md px-3 py-2 w-20 bg-gray-100"
                />

                <input
                  {...register(`bodyVariables.${index}`)}
                  placeholder={`Enter content for ${v}`}
                  className="border rounded-md px-3 py-2 flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariableSamples;

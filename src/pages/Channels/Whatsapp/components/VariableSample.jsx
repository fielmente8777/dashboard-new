import { useFormContext } from "react-hook-form";

const extractVariables = (text) => {
  const matches = text?.match(/{{\d+}}/g);
  return matches ? [...new Set(matches)] : [];
};

const FIELD =
  "min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface px-[var(--sp-3)] py-[var(--sp-2)] text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

const VariableSamples = () => {
  const { register, watch } = useFormContext();

  const header = watch("header");
  const body = watch("body");

  const headerVars = extractVariables(header);
  const bodyVars = extractVariables(body);

  if (!headerVars.length && !bodyVars.length) return null;

  return (
    <div className="bg-app-surface p-[var(--sp-5)] rounded-[var(--r-md)] border border-app-border">
      <h2 className="text-[length:var(--fs-lg)] font-semibold mb-[var(--sp-4)] text-app-text">
        Variable Samples
      </h2>

      <p className="text-[length:var(--fs-sm)] text-gray-500 dark:text-app-text-faint mb-[var(--sp-5)]">
        Include samples of all variables to help Meta review your template.
      </p>

      {/* HEADER VARIABLES */}
      {headerVars.length > 0 && (
        <div className="mb-[var(--sp-5)]">
          <h3 className="text-[length:var(--fs-sm)] font-semibold text-gray-700 dark:text-app-text-muted mb-2">
            Header
          </h3>

          <div className="space-y-2">
            {headerVars.map((v, index) => (
              <div key={v} className="flex gap-[var(--sp-3)]">
                <input
                  value={v}
                  disabled
                  className={`${FIELD} w-16 sm:w-20 shrink-0 bg-app-surface-secondary text-center opacity-80 cursor-not-allowed`}
                />

                <input
                  {...register(`headerVariables.${index}`)}
                  placeholder={`Enter content for ${v}`}
                  className={`${FIELD} flex-1`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BODY VARIABLES */}
      {bodyVars.length > 0 && (
        <div>
          <h3 className="text-[length:var(--fs-sm)] font-semibold text-gray-700 dark:text-app-text-muted mb-2">
            Body
          </h3>

          <div className="space-y-2">
            {bodyVars.map((v, index) => (
              <div key={v} className="flex gap-[var(--sp-3)]">
                <input
                  value={v}
                  disabled
                  className={`${FIELD} w-16 sm:w-20 shrink-0 bg-app-surface-secondary text-center opacity-80 cursor-not-allowed`}
                />

                <input
                  {...register(`bodyVariables.${index}`)}
                  placeholder={`Enter content for ${v}`}
                  className={`${FIELD} flex-1`}
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
import { useFormContext } from "react-hook-form";
import { Input } from "../../../../components/ui/Field";
import { extractVariables } from "./templateUtils";

const SampleRows = ({ title, variables, name, register }) => (
  <div className="space-y-2">
    <p className="text-xs font-medium text-app-text-muted">{title}</p>
    {variables.map((variable, index) => (
      <div key={variable} className="flex items-center gap-2">
        <span className="w-12 shrink-0 rounded-md bg-blue-500/10 py-2 text-center font-mono text-xs text-blue-600 dark:text-blue-400">
          {variable}
        </span>
        <Input
          {...register(`${name}.${index}`)}
          placeholder={`Example for ${variable}, e.g. ${index === 0 ? "Rahul" : "Hotel Lotus"}`}
        />
      </div>
    ))}
  </div>
);

// Example values for each variable. Meta needs them to review the template;
// they also fill the preview.
const VariableSamples = () => {
  const { register, watch } = useFormContext();
  const headerVars = extractVariables(watch("header"));
  const bodyVars = extractVariables(watch("body"));

  if (!headerVars.length && !bodyVars.length) return null;

  return (
    <div className="space-y-4 rounded-lg border border-app-border! bg-app-surface-secondary/50 p-4">
      <div>
        <p className="text-sm font-medium text-app-text">Variable examples</p>
        <p className="text-xs text-app-text-muted">
          Meta uses these to review your template. Guests see the real values.
        </p>
      </div>
      {headerVars.length > 0 && (
        <SampleRows title="Header" variables={headerVars} name="headerVariables" register={register} />
      )}
      {bodyVars.length > 0 && (
        <SampleRows title="Body" variables={bodyVars} name="bodyVariables" register={register} />
      )}
    </div>
  );
};

export default VariableSamples;

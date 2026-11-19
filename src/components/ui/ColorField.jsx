import { Field, inputClassName } from "./Field";

const HEX = /^#[0-9a-f]{6}$/i;

// A colour: the native picker plus an editable hex code. `swatches` adds a
// row of one-click presets. onChange receives "#rrggbb".
const ColorField = ({ label, value, onChange, swatches, hint }) => {
  const color = HEX.test(value || "") ? value : "#000000";

  return (
    <Field as="div" label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-app-border! bg-app-surface p-1"
        />
        <input
          aria-label={`${label} hex code`}
          value={value || ""}
          placeholder="#000000"
          maxLength={7}
          onChange={(e) => {
            const next = e.target.value.trim();
            onChange(next.startsWith("#") ? next : `#${next}`);
          }}
          className={`${inputClassName} font-mono uppercase`}
        />
      </div>
      {swatches?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {swatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              title={swatch}
              aria-label={`Use ${swatch}`}
              onClick={() => onChange(swatch)}
              className={`size-6 rounded-full border-2 transition hover:scale-110 ${
                swatch.toLowerCase() === (value || "").toLowerCase()
                  ? "border-app-text!"
                  : "border-transparent!"
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      )}
    </Field>
  );
};

export default ColorField;

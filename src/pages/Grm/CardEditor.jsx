import { Check, RotateCcw } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import Switch from "../../components/ui/Switch";
import { CARD_TEXT_FIELDS } from "./cardDesign";
import { CARD_DESIGNS, CARD_PALETTES } from "./printCard";

// Everything on the print card that can be changed: the design (with a small
// picture of each), the colours, every line of text and the Eazotel footer.
//   content  - the card's texts as shown; defaults - what they start as
//   thumbs   - { classic: dataUrl, ... } small pictures of each design
//   onText(key, value)  onDesign(key)  onPalette(key)  onResetText()
const CardEditor = ({
  content,
  defaults,
  design,
  palette,
  thumbs,
  onText,
  onDesign,
  onPalette,
  onResetText,
  className = "",
}) => {
  const edited = CARD_TEXT_FIELDS.some((f) => content[f.key] !== defaults[f.key]) ||
    content.poweredBy !== defaults.poweredBy;

  return (
    <Card
      title="Customize the card"
      description="Pick a design and colours, and change any text. The preview and the download update as you type."
      className={className}
      actions={
        edited && (
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onResetText}>
            Reset text
          </Button>
        )
      }
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-app-text">Design</p>
          <div role="radiogroup" aria-label="Card design" className="grid grid-cols-3 gap-2 sm:gap-3">
            {CARD_DESIGNS.map((d) => {
              const selected = d.key === design;
              return (
                <button
                  key={d.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onDesign(d.key)}
                  className={`group relative rounded-xl border p-2 text-left transition ${
                    selected
                      ? "border-primary! ring-2 ring-primary dark:border-blue-500! dark:ring-blue-500"
                      : "border-app-border! hover:bg-app-surface-secondary"
                  }`}
                >
                  <span className="block aspect-[12/17] overflow-hidden rounded-lg bg-app-bg">
                    {thumbs[d.key] ? (
                      <img src={thumbs[d.key]} alt="" className="size-full object-contain" />
                    ) : (
                      <span className="block size-full animate-pulse bg-app-surface-secondary" />
                    )}
                  </span>
                  <span className="mt-1.5 block text-xs font-semibold text-app-text sm:text-sm">{d.label}</span>
                  <span className="hidden text-[11px] leading-snug text-app-text-muted sm:block">{d.description}</span>
                  {selected && (
                    <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-white dark:bg-blue-600">
                      <Icon icon={Check} size="xs" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-app-text">Colours</p>
          <div role="radiogroup" aria-label="Card colours" className="flex flex-wrap gap-2">
            {CARD_PALETTES.map((p) => {
              const selected = p.key === palette;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={p.label}
                  onClick={() => onPalette(p.key)}
                  className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition ${
                    selected
                      ? "border-primary! bg-primary/5 text-app-text ring-1 ring-primary dark:border-blue-500! dark:ring-blue-500"
                      : "border-app-border! text-app-text-muted hover:bg-app-surface-secondary"
                  }`}
                >
                  <span className="flex">
                    <span className="size-5 rounded-full ring-2 ring-white" style={{ background: p.primary }} />
                    <span className="-ml-1.5 size-5 rounded-full ring-2 ring-white" style={{ background: p.accent }} />
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CARD_TEXT_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} className={f.key === "caption" || f.key === "footnote" ? "sm:col-span-2" : ""}>
              <Input
                value={content[f.key] ?? ""}
                maxLength={f.max}
                placeholder={f.placeholder}
                onChange={(e) => onText(f.key, e.target.value)}
              />
            </Field>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={content.poweredBy}
            onChange={(value) => onText("poweredBy", value)}
            label="Show Powered by Eazotel at the bottom"
          />
          <span className="text-sm text-app-text">Show “Powered by Eazotel” at the bottom</span>
        </div>
      </div>
    </Card>
  );
};

export default CardEditor;

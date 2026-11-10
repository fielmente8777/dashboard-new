import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import SettingsCard from "../../../components/ui/SettingsCard";

const FIELDS = [
  "lowThreshold",
  "criticalThreshold",
  "chatReserveCredits",
  "reserveMultiplier",
  "reservationTtlMinutes",
  "fallbackCreditsPer1kTokens",
  "fallbackCreditsPerRequest",
];

const toForm = (settings) => Object.fromEntries(FIELDS.map((key) => [key, String(settings[key] ?? "")]));

// Low-balance warnings and how many credits are held before AI requests run.
// onSave(changedFields); `saving` while it saves.
const CreditSettings = ({ settings, saving = false, onSave }) => {
  const [form, setForm] = useState(() => toForm(settings));

  useEffect(() => setForm(toForm(settings)), [settings]);

  const n = (key) => Number(form[key]);
  const error =
    !Number.isInteger(n("lowThreshold")) || n("lowThreshold") < 1 ? "The low threshold must be a whole number above 0"
      : !Number.isInteger(n("criticalThreshold")) || n("criticalThreshold") < 0 ? "The critical threshold must be a whole number"
        : n("criticalThreshold") >= n("lowThreshold") ? "The critical threshold must be below the low threshold"
          : !Number.isInteger(n("chatReserveCredits")) || n("chatReserveCredits") < 1 ? "The AI request hold must be a whole number above 0"
            : !(n("reserveMultiplier") >= 1 && n("reserveMultiplier") <= 10) ? "The headroom must be between 1 and 10"
              : !Number.isInteger(n("reservationTtlMinutes")) || n("reservationTtlMinutes") < 5 || n("reservationTtlMinutes") > 1440
                ? "Holds must expire after 5 to 1440 minutes"
                : !(n("fallbackCreditsPer1kTokens") >= 0) || !(n("fallbackCreditsPerRequest") >= 0)
                  ? "Fallback rates can't be negative"
                  : null;

  const changed = FIELDS.filter((key) => n(key) !== Number(settings[key]));
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <SettingsCard
      icon={SlidersHorizontal}
      title="Credit settings"
      description="Low-balance warnings and credit holds for every tenant"
      footer={
        <>
          <span>{error ? <span className="text-red-500">{error}</span> : "Applies to every tenant"}</span>
          <Button variant="secondary" size="sm" disabled={!changed.length || saving} onClick={() => setForm(toForm(settings))}>
            Reset
          </Button>
          <Button
            size="sm"
            disabled={!changed.length || Boolean(error) || saving}
            onClick={() => onSave(Object.fromEntries(changed.map((key) => [key, n(key)])))}
          >
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Low-credit threshold" hint="Amber warning below this balance">
          <Input type="number" min="1" value={form.lowThreshold} onChange={set("lowThreshold")} />
        </Field>
        <Field label="Critical-credit threshold" hint="Red warning below this balance">
          <Input type="number" min="0" value={form.criticalThreshold} onChange={set("criticalThreshold")} />
        </Field>
        <Field label="AI request hold (credits)" hint="Held before each AI request; with less available, the request holds what is left. Unused credits return right after">
          <Input type="number" min="1" value={form.chatReserveCredits} onChange={set("chatReserveCredits")} />
        </Field>
        <Field label="Knowledge base headroom" hint="Estimated embedding cost × this, held while documents are added">
          <Input type="number" min="1" max="10" step="0.05" value={form.reserveMultiplier} onChange={set("reserveMultiplier")} />
        </Field>
        <Field label="Release stuck holds after (minutes)" hint="Holds of requests that never finished return to the tenant">
          <Input type="number" min="5" max="1440" value={form.reservationTtlMinutes} onChange={set("reservationTtlMinutes")} />
        </Field>
        <Field label="Unpriced models: credits per 1K tokens" hint="AI on a model without a pricing row still runs and is charged this until you add its pricing">
          <Input type="number" min="0" step="any" value={form.fallbackCreditsPer1kTokens} onChange={set("fallbackCreditsPer1kTokens")} />
        </Field>
        <Field label="Unpriced models: credits per request" hint="For unpriced calls that report no tokens (e.g. speech-to-text)">
          <Input type="number" min="0" step="any" value={form.fallbackCreditsPerRequest} onChange={set("fallbackCreditsPerRequest")} />
        </Field>
      </div>
    </SettingsCard>
  );
};

export default CreditSettings;

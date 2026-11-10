import { useEffect, useState } from "react";
import { formatCredits } from "../../../components/AiCredits/aiCredits";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";

const EMPTY = {
  provider: "",
  model: "",
  inputPrice: "0",
  outputPrice: "0",
  embeddingPrice: "0",
  requestPrice: "0",
  currency: "USD",
  creditConversionRate: "",
  status: "active",
};

const PROVIDER = /^[a-z0-9][a-z0-9_-]{0,39}$/;
const MODEL = /^[\w.:/-]{1,100}$/;

// Creates (`row` null) or edits the pricing of one provider model.
// Provider and model must match what the backend calls (e.g. sarvam /
// sarvam-105b, openai / text-embedding-3-small).
const PricingDialog = ({ open, row, busy = false, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      row
        ? {
            ...row,
            inputPrice: String(row.inputPrice),
            outputPrice: String(row.outputPrice),
            embeddingPrice: String(row.embeddingPrice),
            requestPrice: String(row.requestPrice ?? 0),
            creditConversionRate: String(row.creditConversionRate),
          }
        : EMPTY,
    );
  }, [open, row]);

  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));
  const num = (field) => Number(form[field]);
  const provider = form.provider.trim().toLowerCase();
  const model = form.model.trim();
  const currency = form.currency.trim().toUpperCase();

  const errors = {
    provider: form.provider && !PROVIDER.test(provider) ? "Lowercase letters, digits, - or _" : null,
    model: form.model && !MODEL.test(model) ? "Letters, digits and . : / - _ only" : null,
    currency: form.currency && !/^[A-Z]{3}$/.test(currency) ? "A 3-letter code such as USD or INR" : null,
    rate: form.creditConversionRate !== "" && !(num("creditConversionRate") > 0) ? "Must be above 0" : null,
  };
  const pricesValid = ["inputPrice", "outputPrice", "embeddingPrice", "requestPrice"].every(
    (f) => form[f] !== "" && num(f) >= 0,
  );
  const valid =
    provider && model && currency && pricesValid && num("creditConversionRate") > 0 && !Object.values(errors).some(Boolean);

  // a worked example so the admin sees what a typical request costs
  const exampleCost = (1000 / 1e6) * num("inputPrice") + (500 / 1e6) * num("outputPrice") + num("requestPrice");
  const exampleCredits = Math.ceil(Number((exampleCost * num("creditConversionRate")).toFixed(6)));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={row ? "Edit pricing" : "New model pricing"}
      description="Prices per 1 million tokens, in the provider's billing currency"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            disabled={!valid || busy}
            onClick={() =>
              onSubmit({
                ...(row ? { id: row.id } : {}),
                provider,
                model,
                inputPrice: num("inputPrice"),
                outputPrice: num("outputPrice"),
                embeddingPrice: num("embeddingPrice"),
                requestPrice: num("requestPrice"),
                currency,
                creditConversionRate: num("creditConversionRate"),
                status: form.status,
              })
            }
          >
            {busy ? "Saving…" : "Save pricing"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provider" error={errors.provider} hint="e.g. sarvam, openai">
            <Input value={form.provider} onChange={(e) => set("provider")(e.target.value)} autoFocus={!row} />
          </Field>
          <Field label="Model" error={errors.model} hint="Exact model name used by the backend">
            <Input value={form.model} onChange={(e) => set("model")(e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Input price / 1M">
            <Input type="number" min="0" step="any" value={form.inputPrice} onChange={(e) => set("inputPrice")(e.target.value)} />
          </Field>
          <Field label="Output price / 1M">
            <Input type="number" min="0" step="any" value={form.outputPrice} onChange={(e) => set("outputPrice")(e.target.value)} />
          </Field>
          <Field label="Embedding price / 1M">
            <Input type="number" min="0" step="any" value={form.embeddingPrice} onChange={(e) => set("embeddingPrice")(e.target.value)} />
          </Field>
        </div>
        <Field label="Price per request" hint="For APIs not billed by tokens, e.g. Sarvam speech-to-text (saaras:v4). Leave 0 otherwise.">
          <Input type="number" min="0" step="any" value={form.requestPrice} onChange={(e) => set("requestPrice")(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency" error={errors.currency}>
            <Input value={form.currency} maxLength={3} onChange={(e) => set("currency")(e.target.value)} />
          </Field>
          <Field
            label={`Credits per 1 ${currency || "unit"} of cost`}
            error={errors.rate}
            hint="Includes your margin"
          >
            <Input
              type="number"
              min="0"
              step="any"
              value={form.creditConversionRate}
              onChange={(e) => set("creditConversionRate")(e.target.value)}
            />
          </Field>
        </div>
        {valid && exampleCost > 0 && (
          <p className="rounded-lg bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">
            Example: a chat request with 1,000 input and 500 output tokens costs{" "}
            {exampleCost.toFixed(6)} {currency} and is charged{" "}
            <span className="font-semibold text-app-text">{formatCredits(exampleCredits)} credits</span>.
          </p>
        )}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-app-border! px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-app-text">Active</p>
            <p className="text-xs text-app-text-muted">Inactive: this model is charged at the fallback rates in Credit settings</p>
          </div>
          <Switch label="Active" checked={form.status === "active"} onChange={(on) => set("status")(on ? "active" : "inactive")} />
        </div>
      </div>
    </Dialog>
  );
};

export default PricingDialog;

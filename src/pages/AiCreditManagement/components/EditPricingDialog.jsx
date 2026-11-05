import { useEffect, useState } from "react";
import { PRICING_TYPES } from "../../../components/AiCredits/aiCredits";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Select } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";

// Edits one AI service's price; onSubmit(updatedService).
const EditPricingDialog = ({ service, onClose, onSubmit }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (service) setForm({ ...service, creditsPerUsage: String(service.creditsPerUsage) });
  }, [service]);

  if (!service || !form) return null;

  const credits = Number(form.creditsPerUsage);
  const error = form.creditsPerUsage !== "" && !(credits > 0) ? "Enter a number above 0" : null;
  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog
      open
      onClose={onClose}
      title="Edit pricing"
      description={service.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!(credits > 0)}
            onClick={() => onSubmit({ ...form, creditsPerUsage: credits })}
          >
            Save pricing
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Credits per usage" error={error}>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={form.creditsPerUsage}
            onChange={(e) => set("creditsPerUsage")(e.target.value)}
          />
        </Field>
        <Field label="Pricing type" as="div">
          <Select
            aria-label="Pricing type"
            options={PRICING_TYPES}
            value={form.pricingType}
            onChange={(e) => set("pricingType")(e.target.value)}
          />
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-app-border! px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-app-text">Service active</p>
            <p className="text-xs text-app-text-muted">Inactive services can't be used by tenants</p>
          </div>
          <Switch
            label="Service active"
            checked={form.status === "active"}
            onChange={(on) => set("status")(on ? "active" : "inactive")}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default EditPricingDialog;

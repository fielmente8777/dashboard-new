import { useEffect, useState } from "react";
import { formatMoney } from "../../../components/AiCredits/aiCredits";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";

const EMPTY = { name: "", credits: "", price: "", status: "active", popular: false, currency: "INR" };

// Creates a package (`pack` null) or edits one; onSubmit(pack).
const PackageDialog = ({ open, pack, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(pack ? { ...pack, credits: String(pack.credits), price: String(pack.price) } : EMPTY);
    }
  }, [open, pack]);

  const credits = Math.floor(Number(form.credits));
  const price = Number(form.price);
  const valid = form.name.trim() && credits > 0 && price > 0;
  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={pack ? "Edit package" : "New package"}
      description="Tenants see this on their AI Wallet"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => onSubmit({ ...form, name: form.name.trim(), credits, price })}
          >
            {pack ? "Save package" : "Create package"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Package name">
          <Input value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Festive Pack" autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Credits">
            <Input type="number" min="1" value={form.credits} onChange={(e) => set("credits")(e.target.value)} />
          </Field>
          <Field label="Price (₹)">
            <Input type="number" min="1" value={form.price} onChange={(e) => set("price")(e.target.value)} />
          </Field>
        </div>
        {credits > 0 && price > 0 && (
          <p className="text-xs text-app-text-muted">
            {formatMoney((price / credits) * 100)} per 100 credits
          </p>
        )}
        <div className="divide-y divide-app-border rounded-lg border border-app-border!">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <p className="text-sm font-medium text-app-text">Active</p>
            <Switch label="Active" checked={form.status === "active"} onChange={(on) => set("status")(on ? "active" : "inactive")} />
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <p className="text-sm font-medium text-app-text">Mark as most popular</p>
            <Switch label="Most popular" checked={Boolean(form.popular)} onChange={set("popular")} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PackageDialog;

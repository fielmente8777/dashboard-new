import { useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import { formatCurrency } from "../googleAdsUtils";

// Changes a campaign's daily budget. Google uses the new amount at once;
// a day's spend can go up to twice the daily budget, averaging out over the month.
//   campaign: { id, name, budget }   onSave(amount) -> Promise<boolean>
const BudgetDialog = ({ campaign, saving, onSave, onClose }) => {
  const [value, setValue] = useState(() => (campaign?.budget ? String(campaign.budget) : ""));
  const amount = Number(value);
  const valid = amount > 0 && amount <= 1_000_000;
  const big = campaign?.budget && amount > campaign.budget * 3;

  return (
    <Dialog
      open={Boolean(campaign)}
      onClose={onClose}
      title="Change daily budget"
      description={campaign?.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!valid || amount === campaign?.budget} onClick={() => onSave(amount)}>
            Save budget
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field
          label="Daily budget"
          hint={campaign?.budget ? `Now ${formatCurrency(campaign.budget)} a day` : "The average the campaign may spend each day"}
          error={value && !valid ? "Enter an amount above 0" : ""}
        >
          <Input type="number" min="1" step="1" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </Field>
        {valid && (
          <p className="text-xs text-app-text-muted">
            About {formatCurrency(amount * 30.4)} a month. Google may spend up to twice this on a busy day, but not more than this
            × 30.4 in a month.
          </p>
        )}
        {big && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            That is more than three times the current budget. Check the amount before saving.
          </p>
        )}
      </div>
    </Dialog>
  );
};

export default BudgetDialog;

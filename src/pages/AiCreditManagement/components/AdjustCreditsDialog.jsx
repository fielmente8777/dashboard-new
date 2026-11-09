import { useEffect, useState } from "react";
import { formatCredits } from "../../../components/AiCredits/aiCredits";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../../components/ui/Field";

// Adds credits to, or takes them from, one tenant's wallet.
// mode: "add" | "deduct"; onSubmit({ amount, reason }); `busy` while it saves.
const AdjustCreditsDialog = ({ open, mode, tenant, busy = false, onClose, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setReason("");
    }
  }, [open]);

  if (!tenant) return null;

  const isAdd = mode === "add";
  const value = Math.floor(Number(amount));
  const tooMuch = !isAdd && value > tenant.availableCredits;
  const error =
    amount === "" ? null
      : !(value > 0) ? "Enter a whole number above 0"
        : tooMuch ? `This tenant only has ${formatCredits(tenant.availableCredits)} credits`
          : null;
  const valid = amount !== "" && !error && reason.trim();
  const after = tenant.availableCredits + (isAdd ? 1 : -1) * (value > 0 ? value : 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isAdd ? "Add credits" : "Deduct credits"}
      description={`${tenant.name} · ${tenant.tenantId}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={isAdd ? "primary" : "danger"}
            disabled={!valid || busy}
            onClick={() => onSubmit({ amount: value, reason: reason.trim() })}
          >
            {busy ? "Saving…" : isAdd ? "Add credits" : "Deduct credits"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Credits" error={error}>
          <Input
            type="number"
            min="1"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            autoFocus
          />
        </Field>
        <Field label="Reason" hint="Shown in the tenant's transaction history and kept in the admin audit log">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isAdd ? "e.g. Goodwill credits for downtime" : "e.g. Correction for duplicate recharge"}
          />
        </Field>
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-app-surface-secondary px-3 py-2.5 text-sm">
          <div>
            <dt className="text-xs text-app-text-muted">Current balance</dt>
            <dd className="font-semibold tabular-nums">{formatCredits(tenant.availableCredits)}</dd>
          </div>
          <div>
            <dt className="text-xs text-app-text-muted">After this change</dt>
            <dd className="font-semibold tabular-nums">{formatCredits(Math.max(0, after))}</dd>
          </div>
        </dl>
      </div>
    </Dialog>
  );
};

export default AdjustCreditsDialog;

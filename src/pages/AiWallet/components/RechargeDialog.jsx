import { useEffect, useState } from "react";
import { formatCredits, formatMoney } from "../../../components/AiCredits/aiCredits";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";

// Picks a package and confirms the recharge. IN PROGRESS: there is no payment
// yet; onConfirm(pack) only tells the user so.
const RechargeDialog = ({ open, packages, initialPackage, balance, onClose, onConfirm }) => {
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (open) setSelectedId(initialPackage?.id ?? packages.find((p) => p.popular)?.id ?? packages[0]?.id);
  }, [open, initialPackage, packages]);

  const selected = packages.find((pack) => pack.id === selectedId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Recharge AI wallet"
      description="Choose how many credits to add"
      sheetOnPhone
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!selected} onClick={() => onConfirm(selected)}>
            Pay {selected ? formatMoney(selected.price, selected.currency) : ""}
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="Package" className="space-y-2">
        {packages.map((pack) => {
          const active = pack.id === selectedId;
          return (
            <button
              key={pack.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelectedId(pack.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                active
                  ? "border-blue-500! bg-blue-500/5 ring-1 ring-blue-500"
                  : "border-app-border! hover:bg-app-surface-secondary"
              }`}
            >
              <span>
                <span className="block text-sm font-medium text-app-text">{pack.name}</span>
                <span className="block text-xs text-app-text-muted">
                  {formatCredits(pack.credits)} credits
                </span>
              </span>
              <span className="text-sm font-semibold tabular-nums text-app-text">
                {formatMoney(pack.price, pack.currency)}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="mt-4 rounded-lg bg-app-surface-secondary px-3 py-2 text-sm text-app-text-muted">
          New balance after recharge:{" "}
          <span className="font-semibold tabular-nums text-app-text">
            {formatCredits(balance + selected.credits)} credits
          </span>
        </p>
      )}
    </Dialog>
  );
};

export default RechargeDialog;

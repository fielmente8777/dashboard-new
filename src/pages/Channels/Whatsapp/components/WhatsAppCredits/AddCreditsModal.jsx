import { useEffect, useState } from "react";
import Button from "../../../../../components/ui/Button";
import Dialog from "../../../../../components/ui/Dialog";
import { Field, Input } from "../../../../../components/ui/Field";
import { formatCount, formatMoney } from "./utils";

const PRESETS = [500, 1000, 2000, 5000];
const DEFAULT_AMOUNT = 1000;
const MIN_AMOUNT = 1;

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-app-text-muted">{label}</dt>
    <dd className="font-medium tabular-nums text-app-text">{children}</dd>
  </div>
);

// Tops up the WhatsApp credit balance. `rates` is the price of one message
// per kind ({ marketing, service }); onSubmit(amount) starts the payment.
const AddCreditsModal = ({
  open,
  onClose,
  onSubmit,
  currentBalance = 0,
  rates = {},
  currency = "INR",
}) => {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (open) setAmount(DEFAULT_AMOUNT);
  }, [open]);

  const value = Number(amount) || 0;
  const isValid = value >= MIN_AMOUNT;
  const messagesFor = (rate) => (rate ? Math.floor(value / rate) : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setPaying(true);
    try {
      await onSubmit?.(value);
      onClose();
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add credits"
      description="Credits pay for the WhatsApp messages you send."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={value === preset ? "primary" : "secondary"}
              onClick={() => setAmount(preset)}
            >
              ₹{formatCount(preset)}
            </Button>
          ))}
        </div>

        <Field
          label="Or enter an amount (₹)"
          error={isValid ? "" : `The minimum recharge is ₹${MIN_AMOUNT}`}
        >
          <Input
            type="number"
            min={MIN_AMOUNT}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>

        <dl className="space-y-2 rounded-lg bg-app-surface-secondary p-4 text-sm">
          <Row label="Balance after recharge">
            {formatMoney(currentBalance + value, currency)}
          </Row>
          <Row label="≈ Marketing messages">
            {formatCount(messagesFor(rates.marketing))}
          </Row>
          <Row label="≈ Paid service messages">
            {formatCount(messagesFor(rates.service))}
          </Row>
        </dl>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!isValid}
          loading={paying}
        >
          Pay {formatMoney(value, currency)}
        </Button>
      </form>
    </Dialog>
  );
};

export default AddCreditsModal;

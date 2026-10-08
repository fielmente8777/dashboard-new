import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { formatCount, formatMoney } from "./utils";

const PRESETS = [500, 1000, 2000, 5000];
const MIN_AMOUNT = 1;

const AddCreditsModal = ({
  open,
  onClose,
  onSubmit,
  currentBalance = 0,
  rates = {},
  currency = "INR",
}) => {
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const value = Number(amount) || 0;
  const isValid = value >= MIN_AMOUNT;
  const approxMarketing = rates.marketing
    ? Math.floor(value / rates.marketing)
    : 0;
  const approxService = rates.service ? Math.floor(value / rates.service) : 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onSubmit?.(value);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999] px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-app-surface w-full max-w-md rounded-lg border border-gray-100 dark:border-gray-800 p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-700 dark:text-app-text-muted">
            Add Credits
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`py-2 rounded-lg text-sm font-medium border transition ${
                value === p
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-app-text-muted hover:bg-primary/10"
              }`}
            >
              ₹{formatCount(p)}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-app-text-faint mb-2">
            Or enter amount
          </label>
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-3">
            <span className="text-gray-500">₹</span>
            <input
              type="number"
              min={MIN_AMOUNT}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent px-2 py-2.5 text-sm outline-none text-gray-700 dark:text-app-text"
            />
          </div>
          {!isValid && (
            <p className="mt-1 text-xs text-red-500">
              Minimum recharge is ₹{MIN_AMOUNT}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-app-text-faint">
              Balance after recharge
            </span>
            <span className="font-medium text-gray-800 dark:text-app-text">
              {formatMoney(currentBalance + value, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-app-text-faint">
              ≈ Marketing messages
            </span>
            <span className="text-gray-700 dark:text-app-text-muted">
              {formatCount(approxMarketing)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-app-text-faint">
              ≈ Paid service messages
            </span>
            <span className="text-gray-700 dark:text-app-text-muted">
              {formatCount(approxService)}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!isValid || loading}
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition"
        >
          {loading ? "Processing..." : `Pay ${formatMoney(value, currency)}`}
        </button>
      </div>
    </div>
  );
};

export default AddCreditsModal;

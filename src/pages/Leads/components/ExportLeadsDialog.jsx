import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import DateRange from "../../../components/ui/DateRange";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Select } from "../../../components/ui/Field";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useSendExportOtpMutation,
  useVerifyExportOtpMutation,
} from "../../../redux/api/leadsApi";

const RANGE_OPTIONS = [
  { value: "", label: "Select range" },
  { value: "all", label: "All" },
  { value: "7", label: "Last 7 days" },
  { value: "15", label: "Last 15 days" },
  { value: "30", label: "Last 30 days" },
  { value: "custom", label: "Custom dates" },
];

const EMPTY_DATES = { from: "", to: "" };

// Asks which leads to export, then for the one-time password sent to the
// account's WhatsApp. onExport gets { from, to } as Dates (both null = all)
// once the password is confirmed.
const ExportLeadsDialog = ({ open, onClose, onExport }) => {
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const [sendOtp, { isLoading: isSending }] = useSendExportOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyExportOtpMutation();

  const [step, setStep] = useState("range"); // "range" | "otp"
  const [range, setRange] = useState("");
  const [dates, setDates] = useState(EMPTY_DATES);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("range");
    setRange("");
    setDates(EMPTY_DATES);
    setOtp("");
    setOtpError("");
  }, [open]);

  const canContinue =
    range === "custom" ? Boolean(dates.from && dates.to) : Boolean(range);

  const getPeriod = () => {
    if (range === "all") return { from: null, to: null };
    if (range === "custom") {
      return {
        from: new Date(`${dates.from}T00:00:00`),
        to: new Date(`${dates.to}T00:00:00`),
      };
    }
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - Number(range));
    return { from, to };
  };

  const handleSendOtp = async () => {
    const sent = await run(sendOtp(hid), {
      success: "Code sent to your WhatsApp",
      error: "Could not send the code. Please try again.",
    });
    if (sent) setStep("otp");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setOtpError("");

    try {
      const { verified, message } = await verifyOtp({ ndid, otp }).unwrap();
      if (!verified) {
        setOtpError(message || "That code is not right. Please try again.");
        return;
      }
      onExport(getPeriod());
      onClose();
    } catch {
      setOtpError("Could not check the code. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export leads"
      description={
        step === "otp"
          ? "Enter the code sent to your WhatsApp to confirm this export."
          : "Choose which leads to export."
      }
    >
      {step === "range" && (
        <div className="space-y-4">
          <Field label="Period">
            <Select
              options={RANGE_OPTIONS}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            />
          </Field>
          {range === "custom" && (
            <DateRange from={dates.from} to={dates.to} onChange={setDates} />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!canContinue}
              loading={isSending}
              onClick={handleSendOtp}
            >
              Send code
            </Button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <Field label="One-time code" error={otpError}>
            <Input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter code"
            />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSending}
              onClick={handleSendOtp}
            >
              Resend code
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("range")}>
                Back
              </Button>
              <Button type="submit" disabled={!otp} loading={isVerifying}>
                Verify and export
              </Button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
};

export default ExportLeadsDialog;

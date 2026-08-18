import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import CustomDropdown from "../ui/Dropdown";
import { sendOtpService, verifyOtpService } from "../../services/api/otp.api";

const ExportLeadsModal = ({ isOpen, onClose, onExport, isLoading }) => {
  const [range, setRange] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // otp flow state
  const [step, setStep] = useState("select"); // "select" | "otp"
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingRange, setPendingRange] = useState({ start: null, end: null });

  const canSendOtp =
    range === "all" || (range && range !== "") || (startDate && endDate);

  const rangeOptions = [
    { label: "All", value: "all" },
    { label: "Last 7 Days", value: "7" },
    { label: "Last 15 Days", value: "15" },
    { label: "Last 30 Days", value: "30" },
  ];

  const sendOtp = async () => {
    if (!canSendOtp) return;

    try {
      setOtpLoading(true);

      await sendOtpService(localStorage.getItem("ndid"));

      setStep("otp");
    } catch (error) {
      console.log(error);
      setOtpError("Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // const sendOtp = async () => {
  //   try {
  //     const response = await sendOtpService(localStorage.getItem("ndid"));
  //     console.log(response);
  //     setStep("otp");
  //   } catch (error) {
  //     console.log(error);
  //     setOtpError("Failed to send OTP. Try again.");
  //   }
  // };

  const handleRangeChange = (value) => {
    setRange(value);
    setStartDate(null);
    setEndDate(null);

    if (value === "all") {
      setPendingRange({
        start: null,
        end: null,
      });
    } else {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - Number(value));

      setPendingRange({
        start: pastDate,
        end: today,
      });
    }
  };

  // const handleRangeChange = async (value) => {
  //   setRange(value);
  //   setStartDate(null);
  //   setEndDate(null);

  //   if (value === "all") {
  //     setPendingRange({ start: null, end: null });
  //   } else {
  //     const today = new Date();
  //     const pastDate = new Date();
  //     pastDate.setDate(today.getDate() - Number(value));
  //     setPendingRange({ start: pastDate, end: today });
  //   }

  //   await sendOtp(); // send OTP, then show OTP input — no export yet
  // };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setRange("");

    if (start && end) {
      setPendingRange({
        start,
        end,
      });
    }

    // if (start && end) {
    //   setPendingRange({ start, end });
    //   sendOtp();
    // }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("Enter the OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const data = await verifyOtpService(localStorage.getItem("ndid"), otp);

      console.log(data);

      const isVerified = data?.result?.success && data?.result?.docs?.response;

      if (isVerified) {
        // ✅ OTP verified — now actually run export
        onExport(pendingRange.start, pendingRange.end);
        resetAndClose();
      } else {
        setOtpError(
          data?.result?.responseMessage ||
            data?.responseMessage ||
            "Invalid OTP. Try again.",
        );
      }
    } catch (error) {
      console.log(error);
      setOtpError("Verification failed. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep("select");
    setOtp("");
    setOtpError("");
    setRange("");
    setStartDate(null);
    setEndDate(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setOtp("");
      setOtpError("");
      setRange("");
      setStartDate(null);
      setEndDate(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-9999">
      <div className="bg-app-surface p-5 rounded-xl max-w-80 w-full space-y-4 shadow-lg">
        <h3 className="font-semibold text-lg">Export Leads</h3>

        {step === "select" && (
          <>
            <CustomDropdown
              options={rangeOptions}
              value={range}
              onChange={handleRangeChange}
              placeholder="Select Range"
              className="w-full!"
            />

            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              className="border p-2 rounded w-full!"
              wrapperClassName="w-full"
              placeholderText="Select custom date range"
            />

            <div className="flex gap-2">
              <button
                onClick={resetAndClose}
                className="w-full bg-app-text-muted py-2 rounded"
              >
                Close
              </button>

              <button
                onClick={sendOtp}
                disabled={!canSendOtp || otpLoading}
                className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
              >
                {otpLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>

            {/* <div className="flex gap-2">
              <button
                onClick={resetAndClose}
                className="w-full bg-app-text-muted py-2 rounded"
              >
                Close
              </button>
            </div> */}
          </>
        )}

        {step === "otp" && (
          <>
            <p className="text-sm text-app-text-muted">
              Enter the OTP sent to your WhatsApp to confirm this export.
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter OTP"
              className="border p-2 rounded w-full"
            />

            {otpError && <p className="text-sm text-red-500">{otpError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setStep("select")}
                className="w-full bg-app-text-muted py-2 rounded"
                disabled={otpLoading || isLoading}
              >
                Back
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || isLoading}
                className="w-full bg-primary text-white py-2 rounded disabled:opacity-70"
              >
                {otpLoading || isLoading ? "Verifying..." : "Verify & Export"}
              </button>
            </div>

            <button
              onClick={sendOtp}
              className="text-xs text-primary underline"
              disabled={otpLoading}
            >
              Resend OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExportLeadsModal;

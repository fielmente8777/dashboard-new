import { Download, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import DateRange from "../../../components/ui/DateRange";
import Dialog from "../../../components/ui/Dialog";
import CustomDropdown from "../../../components/ui/Dropdown";
import { Field, Input } from "../../../components/ui/Field";
import Tabs from "../../../components/ui/Tabs";
import { Sources, Stages } from "../../../data/constant";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useGetLeadsQuery,
  useSendExportOtpMutation,
  useVerifyExportOtpMutation,
} from "../../../redux/api/leadsApi";
import { formatRange } from "../../../utils/datePresets";
import { NOTES_FILTERS } from "../leadSources";
import { toApiDate } from "../leadUtils";

// the list filters -> what this dialog edits (stage becomes a list)
const toDraft = (filters) => ({
  search: filters.search || "",
  from: filters.from || "",
  to: filters.to || "",
  stage: filters.stage ? [filters.stage] : [],
  source: filters.source || [],
  notes: filters.notes || "",
});

// Export with filters. Opens with the filters in use on the page; any of them
// can be changed here without touching the list. Shows how many leads match
// before exporting. When `requireOtp`, a code sent to the account's WhatsApp
// confirms the export first.
//   pageFilters - the list's filters ({ search, from, to, stage, source, notes })
//   source      - the page's LEAD_SOURCES entry
//   onExport    - (filters) => Promise<boolean>; the dialog closes on true
const ExportLeadsDialog = ({
  open,
  onClose,
  pageFilters,
  source,
  requireOtp,
  onExport,
}) => {
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const [sendOtp, { isLoading: isSending }] = useSendExportOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyExportOtpMutation();

  const [step, setStep] = useState("filters"); // "filters" | "otp"
  const [draft, setDraft] = useState(() => toDraft(pageFilters));
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("filters");
    setDraft(toDraft(pageFilters));
    setOtp("");
    setOtpError("");
    // only opening the dialog starts over, not a change on the page behind it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const change = (changes) => setDraft((current) => ({ ...current, ...changes }));

  // how many leads the export will hold (one row is enough for the total)
  const countQuery = useMemo(
    () => ({
      hid,
      page: 1,
      limit: 1,
      search: draft.search,
      stage: draft.stage,
      source: draft.source,
      notes: draft.notes,
      createdFrom: source.createdFrom,
      from: toApiDate(draft.from),
      to: toApiDate(draft.to),
    }),
    [hid, draft, source.createdFrom],
  );
  const count = useGetLeadsQuery(countQuery, { skip: !open || !hid });
  const total = count.currentData?.total ?? null;
  const counting = count.isFetching || total === null;

  // OTP before export. To test locally without it, change to: const needsOtp = false;
  const needsOtp = requireOtp;
  const pageDraft = toDraft(pageFilters);
  const isPageFilters = JSON.stringify(pageDraft) === JSON.stringify(draft);

  const doExport = async () => {
    setIsExporting(true);
    const done = await onExport({ ...draft, createdFrom: source.createdFrom });
    setIsExporting(false);
    if (done) onClose();
  };

  const handleContinue = async () => {
    if (!needsOtp) {
      doExport();
      return;
    }
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
    } catch {
      setOtpError("Could not check the code. Please try again.");
      return;
    }
    doExport();
  };

  const summary = [
    draft.from && draft.to
      ? formatRange({ start: draft.from, end: draft.to })
      : "Any date",
    draft.stage.length ? draft.stage.join(", ") : "All stages",
    source.sourceFilter &&
      (draft.source.length
        ? draft.source
            .map((value) => Sources.find((s) => s.value === value)?.label || value)
            .join(", ")
        : "All sources"),
    draft.notes && NOTES_FILTERS.find((n) => n.value === draft.notes)?.label,
    draft.search && `“${draft.search}”`,
  ].filter(Boolean);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Export leads"
      description={
        step === "otp"
          ? "Enter the code sent to your WhatsApp to confirm this export."
          : "Starts with the filters on the page. Change any of them for this export only."
      }
    >
      {step === "filters" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <DateRange
                from={draft.from}
                to={draft.to}
                onChange={change}
                placeholder="Any date"
              />
            </Field>
            <Field label="Stage">
              <CustomDropdown
                multiple
                label={draft.stage}
                options={Stages}
                placeholder="All stages"
                onChange={(stage) => change({ stage })}
              />
            </Field>
            {source.sourceFilter && (
              <Field label="Source">
                <CustomDropdown
                  multiple
                  label={draft.source}
                  options={Sources}
                  placeholder="All sources"
                  onChange={(value) => change({ source: value })}
                />
              </Field>
            )}
            <Field label="Notes">
              <Tabs
                tabs={NOTES_FILTERS}
                value={draft.notes}
                onChange={(notes) => change({ notes })}
              />
            </Field>
          </div>

          {draft.search && (
            <div className="flex items-center gap-2 text-sm">
              <Search size={14} className="text-app-text-faint" />
              <span className="text-app-text-muted">Search</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-medium">
                {draft.search}
                <button
                  type="button"
                  aria-label="Remove search"
                  onClick={() => change({ search: "" })}
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

          <div className="rounded-lg border border-app-border! bg-app-surface-secondary px-4 py-3">
            <p className="text-sm">
              {counting ? (
                <span className="text-app-text-muted">Counting leads...</span>
              ) : (
                <>
                  <span className="font-semibold tabular-nums">
                    {total.toLocaleString()}
                  </span>{" "}
                  {total === 1 ? "lead" : "leads"} will be exported
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-app-text-muted">
              {source.title} · {summary.join(" · ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              disabled={isPageFilters}
              onClick={() => setDraft(pageDraft)}
            >
              Use page filters
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                icon={needsOtp ? undefined : Download}
                disabled={counting || total === 0}
                loading={isSending || isExporting}
                onClick={handleContinue}
              >
                {needsOtp ? "Send code" : "Export CSV"}
              </Button>
            </div>
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
              onClick={handleContinue}
            >
              Resend code
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("filters")}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={!otp}
                loading={isVerifying || isExporting}
              >
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

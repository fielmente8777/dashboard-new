import { FileDown } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import DatePopover from "../../../components/ui/DatePopover";
import DateRangePanel from "../../../components/ui/DateRangePanel";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { downloadMetaReportPdf, useCreateMetaReportMutation } from "../../../redux/api/metaReportApi";
import { addDays, DATE_PRESETS, toISODate } from "../../../utils/datePresets";

// a report can cover at most a year (gian checks the same)
const MAX_DAYS_BACK = 365;

const fromCommon = (key) => DATE_PRESETS.find((p) => p.key === key);
const PRESETS = [
  fromCommon("lastMonth"),
  fromCommon("thisMonth"),
  fromCommon("last7"),
  fromCommon("last30"),
  fromCommon("last90"),
  {
    key: "last12Months",
    label: "Last 12 months",
    get: () => ({ start: toISODate(addDays(new Date(), -364)), end: toISODate(new Date()) }),
  },
].filter(Boolean);
const DEFAULT_PRESET = PRESETS[0];

// "Create report": opens the same date panel as the Meta leads Refresh button (presets,
// start / end boxes and the calendar). The report is built from Meta for those dates, its PDF
// downloads, and it is kept in the Reports list.
const CreateReportButton = ({ hid, onCreated, size = "md", align = "right", label = "Create report" }) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [createReport, { isLoading }] = useCreateMetaReportMutation();

  const close = useCallback(() => setOpen(false), []);

  const submit = async ({ start, end }) => {
    let report;
    try {
      report = await createReport({ hid, since: start, until: end }).unwrap();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not create the report."), type: "error" });
      return;
    }
    close();
    onCreated?.(report);
    try {
      await downloadMetaReportPdf(report._id);
      showToast({ message: "Report created. The PDF is in your downloads.", type: "success" });
    } catch (error) {
      showToast({ message: `Report created, but the PDF could not be made: ${error.message}`, type: "error" });
    }
  };

  return (
    <>
      <div ref={triggerRef} className="inline-flex">
        <Button icon={FileDown} size={size} loading={isLoading} onClick={() => setOpen(!open)}>
          {label}
        </Button>
      </div>

      {open && (
        <DatePopover
          triggerRef={triggerRef}
          title="Create a Meta report"
          align={align}
          width={576}
          height={560}
          showTitle
          onClose={isLoading ? () => {} : close}
        >
          {(sheet) => (
            <DateRangePanel
              sheet={sheet}
              presets={PRESETS}
              initial={{ ...DEFAULT_PRESET.get(), preset: DEFAULT_PRESET.key, label: DEFAULT_PRESET.label }}
              min={toISODate(addDays(new Date(), -MAX_DAYS_BACK))}
              max={toISODate(new Date())}
              submitLabel={isLoading ? "Reading Meta…" : "Create & download"}
              submitIcon={FileDown}
              loading={isLoading}
              hint="Up to one year. Reading the ads, page and Instagram from Meta can take up to a minute."
              onCancel={close}
              onSubmit={submit}
            />
          )}
        </DatePopover>
      )}
    </>
  );
};

export default CreateReportButton;

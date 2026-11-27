import { FileDown } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { downloadDashboardReportPdf, partLabel, useCreateDashboardReportMutation } from "../../redux/api/reportsApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { addDays, DATE_PRESETS, toISODate } from "../../utils/datePresets";
import Button from "../ui/Button";
import DatePopover from "../ui/DatePopover";
import DateRangePanel from "../ui/DateRangePanel";

const fromCommon = (key) => DATE_PRESETS.find((p) => p.key === key);
const PRESETS = [
  fromCommon("lastMonth"),
  fromCommon("thisMonth"),
  fromCommon("last7"),
  fromCommon("last30"),
  fromCommon("last90"),
  { key: "last12Months", label: "Last 12 months", get: () => ({ start: toISODate(addDays(new Date(), -364)), end: toISODate(new Date()) }) },
].filter(Boolean);
const DEFAULT_PRESET = PRESETS[0];

// "Download report" on a service page (Leads, Calls, Google Ads, Google Analytics, Website
// SEO): that service's own PDF for the dates picked, in the same look as the full report.
// It is kept under Reports › Saved reports; service reports are never sent monthly.
//   part - "leads" | "calls" | "emailMarketing" | "whatsappMarketing" | "googleAds" | "analytics" | "searchConsole"
const ServiceReportButton = ({ part, label = "Download report", size = "md", align = "right", variant = "secondary" }) => {
  const hid = useSelector(selectHid);
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [create, { isLoading }] = useCreateDashboardReportMutation();
  const close = useCallback(() => setOpen(false), []);

  const submit = async ({ start, end }) => {
    let report;
    try {
      report = await create({ hid, sections: [part], since: start, until: end }).unwrap();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not make the report."), type: "error" });
      return;
    }
    close();
    try {
      await downloadDashboardReportPdf(report._id);
      showToast({ message: `${partLabel(part)} report downloaded. It is also under Reports.`, type: "success" });
    } catch (error) {
      showToast({ message: `The report was made, but the PDF could not be downloaded: ${error.message}`, type: "error" });
    }
  };

  return (
    <>
      <div ref={triggerRef} className="inline-flex">
        <Button icon={FileDown} size={size} variant={variant} loading={isLoading} onClick={() => setOpen(!open)} disabled={!hid}>
          {label}
        </Button>
      </div>
      {open && (
        <DatePopover
          triggerRef={triggerRef}
          title={`${partLabel(part)} report`}
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
              min={toISODate(addDays(new Date(), -365))}
              max={toISODate(new Date())}
              submitLabel={isLoading ? "Making the report…" : "Download PDF"}
              submitIcon={FileDown}
              loading={isLoading}
              hint="Up to one year. The PDF uses the same look as the monthly report."
              onCancel={close}
              onSubmit={submit}
            />
          )}
        </DatePopover>
      )}
    </>
  );
};

export default ServiceReportButton;

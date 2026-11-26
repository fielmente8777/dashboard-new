import { CheckCircle2, CircleDashed, Download, FileBarChart, Files, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  downloadDashboardReportPdf,
  REPORT_PARTS,
  useCreateDashboardReportMutation,
  useGetReportPartsQuery,
} from "../../../redux/api/reportsApi";
import { DATE_PRESETS } from "../../../utils/datePresets";

const lastMonth = DATE_PRESETS.find((p) => p.key === "lastMonth");
const DEFAULT_RANGE = { ...lastMonth.get(), preset: "lastMonth", label: lastMonth.label };

// One part of the report, ticked or not, with whether it is connected for this property.
const PartCard = ({ part, info, checked, onToggle }) => {
  const connected = info?.connected !== false;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition hover:bg-app-surface-secondary ${
        checked ? "border-blue-500! bg-blue-500/5 ring-1 ring-blue-500" : "border-app-border! bg-app-surface"
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
          checked ? "border-blue-600 bg-blue-600 text-white" : "border-app-border! bg-app-surface"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-app-text">{part.label}</span>
        <span className="mt-0.5 block text-xs text-app-text-muted">{part.hint}</span>
        <span className={`mt-1.5 inline-flex items-center gap-1 text-xs ${connected ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          <Icon icon={connected ? CheckCircle2 : CircleDashed} size="xs" />
          {connected ? "Connected" : info?.note || "Not connected"}
        </span>
      </span>
    </button>
  );
};

// Create report: pick the dates and the parts, then one PDF downloads. The same report can
// then be downloaded part by part, or emailed.
const CreateReportPanel = ({ hid, onCreated, onParts, onEmail }) => {
  const { showToast } = useToast();
  const partsQuery = useGetReportPartsQuery(hid, { skip: !hid });
  const [create, { isLoading }] = useCreateDashboardReportMutation();
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [picked, setPicked] = useState(null);
  const [made, setMade] = useState(null);

  const info = useMemo(() => new Map((partsQuery.data || []).map((p) => [p.key, p])), [partsQuery.data]);

  // connected parts are ticked to start with
  useEffect(() => {
    if (partsQuery.data && picked === null) setPicked(partsQuery.data.filter((p) => p.connected).map((p) => p.key));
  }, [partsQuery.data, picked]);

  const chosen = picked || [];
  const toggle = (key) => setPicked(chosen.includes(key) ? chosen.filter((k) => k !== key) : [...chosen, key]);
  const allOn = chosen.length === REPORT_PARTS.length;

  const submit = async () => {
    let report;
    try {
      report = await create({ hid, sections: chosen, since: range.start, until: range.end }).unwrap();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not create the report."), type: "error" });
      return;
    }
    setMade(report);
    onCreated?.(report);
    try {
      await downloadDashboardReportPdf(report._id);
      showToast({ message: "Report created. The PDF is in your downloads.", type: "success" });
    } catch (error) {
      showToast({ message: `Report created, but the PDF could not be made: ${error.message}`, type: "error" });
    }
  };

  return (
    <div className="space-y-4">
      <Card title="1 · Dates" description="Any dates up to one year. Last month is the usual monthly report.">
        <DateRangePicker value={range} onChange={(next) => next && setRange(next)} align="left" className="w-full sm:w-80" />
      </Card>

      <Card
        title="2 · What goes in the report"
        description="Tick the parts you want. One part on its own makes that service's report."
        actions={
          <Button size="sm" variant="ghost" onClick={() => setPicked(allOn ? [] : REPORT_PARTS.map((p) => p.key))}>
            {allOn ? "Clear all" : "Select all"}
          </Button>
        }
      >
        {partsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {REPORT_PARTS.map((p) => (
              <Skeleton key={p.key} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {REPORT_PARTS.map((part) => (
              <PartCard key={part.key} part={part} info={info.get(part.key)} checked={chosen.includes(part.key)} onToggle={() => toggle(part.key)} />
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3 rounded-xl border border-app-border! bg-app-surface p-4 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-sm text-app-text-muted">
          {isLoading
            ? "Reading leads, ads, Google and Meta for these dates. This can take up to a minute."
            : `${chosen.length} part${chosen.length === 1 ? "" : "s"} · ${range.label || `${range.start} – ${range.end}`}`}
        </p>
        <Button icon={FileBarChart} loading={isLoading} disabled={!chosen.length || !hid} onClick={submit} className="w-full sm:w-auto">
          {isLoading ? "Making the report…" : "Create & download PDF"}
        </Button>
      </div>

      {made && (
        <Card title="Your report is ready" description={`${made.period?.label} · ${made.sections?.length} part${made.sections?.length === 1 ? "" : "s"}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button icon={Download} variant="secondary" onClick={() => downloadDashboardReportPdf(made._id).catch((e) => showToast({ message: e.message, type: "error" }))}>
              Download again
            </Button>
            {made.sections?.length > 1 && (
              <Button icon={Files} variant="secondary" onClick={() => onParts(made)}>
                Individual reports
              </Button>
            )}
            <Button icon={Mail} variant="secondary" onClick={() => onEmail(made)}>
              Email it
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreateReportPanel;

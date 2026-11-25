import { Download, FileBarChart, Files, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import IconButton from "../../../components/ui/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  downloadDashboardReportPdf,
  partLabel,
  useDeleteDashboardReportMutation,
  useGetDashboardReportsQuery,
} from "../../../redux/api/reportsApi";

const when = (date) => new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const DELIVERY_TONE = { sent: "green", partly: "amber", failed: "red", skipped: "gray" };
const DELIVERY_TEXT = { sent: "Emailed", partly: "Partly emailed", failed: "Email failed", skipped: "Not emailed" };

const ReportRow = ({ report, onParts, onEmail }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [downloading, setDownloading] = useState(false);
  const [remove, { isLoading: removing }] = useDeleteDashboardReportMutation();
  const ready = report.status === "ready";
  const email = report.delivery?.email;

  const download = async () => {
    setDownloading(true);
    try {
      await downloadDashboardReportPdf(report._id);
    } catch (error) {
      showToast({ message: error.message || "Could not download the report.", type: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const del = async () => {
    const ok = await confirm(`The report for ${report.period?.label} will be deleted. This can't be undone.`, {
      title: "Delete report",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await remove(report._id).unwrap();
      showToast({ message: "Report deleted", type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not delete the report."), type: "error" });
    }
  };

  return (
    <li className="flex flex-col gap-3 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-app-text">
          {report.period?.label}
          <Badge tone={report.kind === "monthly" ? "blue" : "gray"}>{report.kind === "monthly" ? "Monthly" : "Made by you"}</Badge>
          {report.status === "building" && <Badge tone="amber">Being made</Badge>}
          {report.status === "failed" && (
            <span title={report.error}>
              <Badge tone="red">Failed</Badge>
            </span>
          )}
          {email && (
            <span title={email.failed?.map((f) => `${f.to}: ${f.error}`).join("\n") || email.to?.join(", ")}>
              <Badge tone={DELIVERY_TONE[email.status]}>{DELIVERY_TEXT[email.status] || email.status}</Badge>
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-app-text-muted">
          {(report.sections || []).map(partLabel).join(" · ")}
        </p>
        <p className="mt-0.5 text-xs text-app-text-faint">
          {when(report.createdAt)}
          {report.createdBy && report.createdBy !== "schedule" ? ` · ${report.createdBy}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" icon={Download} onClick={download} loading={downloading} disabled={!ready}>
          PDF
        </Button>
        {report.sections?.length > 1 && (
          <Button size="sm" variant="secondary" icon={Files} onClick={() => onParts(report)} disabled={!ready}>
            Parts
          </Button>
        )}
        <Button size="sm" variant="secondary" icon={Mail} onClick={() => onEmail(report)} disabled={!ready}>
          Email
        </Button>
        {report.kind === "manual" && <IconButton icon={Trash2} label="Delete report" onClick={del} disabled={removing} />}
      </div>
    </li>
  );
};

// Every report of this property: monthly ones and those made by hand, newest first.
const ReportsHistory = ({ hid, onParts, onEmail, onCreate }) => {
  const reports = useGetDashboardReportsQuery(hid, { skip: !hid, refetchOnMountOrArgChange: true });

  if (reports.isLoading) return <Skeleton className="h-64" />;
  if (reports.isError) {
    return <ErrorState message={getApiErrorMessage(reports.error, "Could not load the reports.")} onRetry={reports.refetch} />;
  }
  const list = reports.data || [];
  return (
    <Card title="Saved reports" description="Download any of them again, part by part, or email them.">
      {list.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No report yet"
          description="Create one for any dates, or wait for the monthly email on the 1st."
          action={<Button onClick={onCreate}>Create report</Button>}
        />
      ) : (
        <ul className="-mx-4 divide-y divide-app-border! sm:-mx-5">
          {list.map((report) => (
            <ReportRow key={report._id} report={report} onParts={onParts} onEmail={onEmail} />
          ))}
        </ul>
      )}
    </Card>
  );
};

export default ReportsHistory;

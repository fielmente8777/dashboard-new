import { Download, FileBarChart, Send, Trash2 } from "lucide-react";
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
  downloadMetaReportPdf,
  useDeleteMetaReportMutation,
  useGetMetaReportsQuery,
  useSendMetaReportMutation,
} from "../../../redux/api/metaReportApi";
import CreateReportButton from "./CreateReportButton";
import MonthlyReportSettings from "./MonthlyReportSettings";

const inr = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return `${currency} ${Math.round(value || 0)}`;
  }
};
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const when = (date) =>
  new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const DELIVERY_TONE = { sent: "green", partly: "amber", failed: "red", skipped: "gray" };
const DELIVERY_TEXT = { sent: "sent", partly: "partly sent", failed: "failed", skipped: "not sent" };

const Delivery = ({ label, value }) => {
  if (!value) return null;
  const problem = value.note || value.failed?.map((f) => `${f.to}: ${f.error}`).join("\n");
  return (
    <span title={problem || value.to?.join(", ")}>
      <Badge tone={DELIVERY_TONE[value.status]}>
        {label} {DELIVERY_TEXT[value.status] || value.status}
      </Badge>
    </span>
  );
};

const ReportRow = ({ report }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [downloading, setDownloading] = useState(false);
  const [send, { isLoading: sending }] = useSendMetaReportMutation();
  const [remove, { isLoading: removing }] = useDeleteMetaReportMutation();
  const s = report.summary;
  const ready = report.status === "ready";

  const download = async () => {
    setDownloading(true);
    try {
      await downloadMetaReportPdf(report._id);
    } catch (error) {
      showToast({ message: error.message || "Could not download the report.", type: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const sendNow = async () => {
    try {
      const result = await send({ id: report._id }).unwrap();
      const parts = [result?.email && `email ${result.email.status}`, result?.whatsapp && `WhatsApp ${result.whatsapp.status}`];
      showToast({ message: `Report ${parts.filter(Boolean).join(", ") || "sent"}`, type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not send the report."), type: "error" });
    }
  };

  const del = async () => {
    const confirmed = await confirm(`The report for ${report.period.label} will be deleted. This can't be undone.`, {
      title: "Delete report",
      confirmText: "Delete",
    });
    if (!confirmed) return;
    try {
      await remove(report._id).unwrap();
      showToast({ message: "Report deleted", type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not delete the report."), type: "error" });
    }
  };

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-app-text">
          {report.period.label}
          <Badge tone={report.kind === "monthly" ? "blue" : "gray"}>{report.kind === "monthly" ? "Monthly" : "Made by you"}</Badge>
          {report.status === "building" && <Badge tone="amber">Being made</Badge>}
          {report.status === "failed" && (
            <span title={report.error}>
              <Badge tone="red">Failed</Badge>
            </span>
          )}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
          <span>{when(report.createdAt)}</span>
          {s && (
            <span>
              {s.hasAds ? `${inr(s.spend, s.currency)} spent · ` : "No ads · "}
              {compact.format(s.reach || 0)} reached · {s.enquiries || 0} enquiries
            </span>
          )}
          <Delivery label="Email" value={report.delivery?.email} />
          <Delivery label="WhatsApp" value={report.delivery?.whatsapp} />
        </p>
      </div>
      {ready && (
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="secondary" icon={Download} onClick={download} loading={downloading}>
            PDF
          </Button>
          <Button size="sm" variant="secondary" icon={Send} onClick={sendNow} loading={sending}>
            Send now
          </Button>
          {report.kind === "manual" && (
            <IconButton icon={Trash2} label="Delete report" onClick={del} disabled={removing} />
          )}
        </div>
      )}
    </li>
  );
};

// The Reports tab of Meta insights: monthly report settings, then every report made.
const MetaReportsPanel = ({ hid }) => {
  const reports = useGetMetaReportsQuery(hid, { skip: !hid, pollingInterval: 0 });

  return (
    <div className="space-y-4">
      <MonthlyReportSettings hid={hid} />

      <Card
        title="Reports"
        description="Every report made for this property. Download the PDF, or send it again to the people above."
        actions={<CreateReportButton hid={hid} size="sm" />}
      >
        {reports.isLoading ? (
          <Skeleton className="h-32" />
        ) : reports.isError ? (
          <ErrorState message={getApiErrorMessage(reports.error, "Could not load the reports.")} onRetry={reports.refetch} />
        ) : reports.data?.length ? (
          <ul className="-mx-4 divide-y divide-app-border! sm:-mx-5">
            {reports.data.map((report) => (
              <ReportRow key={report._id} report={report} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={FileBarChart}
            title="No reports yet"
            description="Create one now, or wait for the monthly report on the 1st."
            action={<CreateReportButton hid={hid} align="left" />}
          />
        )}
      </Card>
    </div>
  );
};

export default MetaReportsPanel;

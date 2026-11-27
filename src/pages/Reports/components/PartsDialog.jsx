import { Download, FileText } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import Icon from "../../../components/ui/Icon";
import { useToast } from "../../../context/ToastContext";
import { downloadDashboardReportPdf, partLabel } from "../../../redux/api/reportsApi";

// Download a saved report as one PDF, or each part as its own report (Leads report, Google
// Ads report …). Drawing a PDF needs no new data: it is made from the saved report.
const PartsDialog = ({ report, onClose }) => {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(null); // "all" | part key

  const download = async (parts, key) => {
    setBusy(key);
    try {
      await downloadDashboardReportPdf(report._id, parts);
    } catch (error) {
      showToast({ message: error.message || "Could not download the report.", type: "error" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog
      open={Boolean(report)}
      onClose={onClose}
      title="Download"
      description={report ? `${report.period?.label} · one PDF, or each part as its own report` : ""}
      sheetOnPhone
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {report && (
        <div className="space-y-2">
          <Button icon={Download} className="w-full" loading={busy === "all"} disabled={Boolean(busy)} onClick={() => download(null, "all")}>
            The whole report (one PDF)
          </Button>
          {report.sections?.length > 1 && (
            <ul className="divide-y divide-app-border! rounded-xl border border-app-border!">
              {report.sections.map((key) => (
                <li key={key} className="flex items-center gap-3 px-3 py-2.5">
                  <Icon icon={FileText} tone="muted" />
                  <span className="min-w-0 flex-1 truncate text-sm text-app-text">{partLabel(key)}</span>
                  <Button size="sm" variant="secondary" icon={Download} loading={busy === key} disabled={Boolean(busy)} onClick={() => download([key], key)}>
                    PDF
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default PartsDialog;

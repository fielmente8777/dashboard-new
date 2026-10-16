import { FileSpreadsheet, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import FileDropZone from "../../../components/ui/FileDropZone";
import Icon from "../../../components/ui/Icon";
import { useToast } from "../../../context/ToastContext";
import { useTenant } from "../../../hooks/useTenant";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { leadsApi, useImportLeadsMutation } from "../../../redux/api/leadsApi";
import { readCsvFile } from "../../../utils/csv";
import { csvRowToLead } from "../leadUtils";

// leads are sent to the server this many at a time
const BATCH_SIZE = 100;

// Imports leads from a CSV file.
const ImportLeadsDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { hid } = useTenant();
  const [importLeads] = useImportLeadsMutation();

  const [fileName, setFileName] = useState("");
  const [leads, setLeads] = useState([]);
  // how many leads have been sent so far; null while not importing
  const [sent, setSent] = useState(null);
  const isImporting = sent !== null;

  useEffect(() => {
    if (!open) return;
    setFileName("");
    setLeads([]);
    setSent(null);
  }, [open]);

  const handleFiles = async ([file]) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showToast({ message: "Please choose a CSV file.", type: "error" });
      return;
    }

    try {
      const rows = await readCsvFile(file);
      setFileName(file.name);
      setLeads(rows.map(csvRowToLead));
    } catch {
      showToast({ message: "Could not read that file.", type: "error" });
    }
  };

  const handleImport = async () => {
    let done = 0;
    setSent(0);

    try {
      for (let start = 0; start < leads.length; start += BATCH_SIZE) {
        const batch = leads.slice(start, start + BATCH_SIZE);
        await importLeads({ hid, leads: batch }).unwrap();
        done += batch.length;
        setSent(done);
      }
      showToast({ message: `${done} leads imported` });
      onClose();
    } catch (error) {
      showToast({
        message: `${getApiErrorMessage(error, "The import stopped")} (${done} of ${leads.length} leads imported).`,
        type: "error",
      });
      setSent(null);
    } finally {
      // whatever did get in should show up in the list
      if (done > 0) dispatch(leadsApi.util.invalidateTags(["Lead"]));
    }
  };

  return (
    <Dialog
      open={open}
      // closing mid-way would hide an import that is still running
      onClose={isImporting ? () => {} : onClose}
      title="Import leads"
      description="Upload a CSV file with a header row. Columns such as Name, Email, Phone, Status, Source, Notes and Date are picked up automatically."
    >
      <FileDropZone accept=".csv" disabled={isImporting} onFiles={handleFiles}>
        <Icon icon={Upload} size="2xl" tone="faint" />
        <p className="text-sm text-app-text">
          <span className="font-medium text-blue-500">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-app-text-faint">CSV files only</p>
      </FileDropZone>

      {fileName && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-app-surface-secondary px-3 py-2 text-sm text-app-text">
          <Icon icon={FileSpreadsheet} tone="muted" />
          <span className="min-w-0 flex-1 truncate">{fileName}</span>
          <span className="shrink-0 text-app-text-muted">
            {leads.length} leads
          </span>
        </p>
      )}

      {isImporting && (
        <div className="mt-4">
          <p className="mb-1.5 flex justify-between text-xs text-app-text-muted">
            <span>Importing...</span>
            <span className="tabular-nums">
              {sent} / {leads.length}
            </span>
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${(sent / leads.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" disabled={isImporting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={leads.length === 0}
          loading={isImporting}
          onClick={handleImport}
        >
          Import
        </Button>
      </div>
    </Dialog>
  );
};

export default ImportLeadsDialog;

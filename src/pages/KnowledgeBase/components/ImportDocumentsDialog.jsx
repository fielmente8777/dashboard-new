import { AlertTriangle, CheckCircle2, FileText, FileUp, X } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import FileDropZone from "../../../components/ui/FileDropZone";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useImportKnowledgeDocumentsMutation } from "../../../redux/api/knowledgeBaseApi";
import { formatLabel } from "../utils/kbHelpers";
import { mergeDocumentAdditions } from "../utils/kbMerge";

const ACCEPT = ".pdf,.docx,.txt,.md";
const MAX_FILES = 10;
const MAX_SIZE = 15 * 1024 * 1024;

const sizeLabel = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const pathLabel = (path) =>
  path.map((part) => (typeof part === "number" ? `#${part + 1}` : formatLabel(part))).join(" › ");

const valueText = (value) =>
  typeof value === "string" ? value : JSON.stringify(value);

// Upload the hotel's documents (house rules, local guides, emergency
// contacts...): the AI adds what's new to the open knowledge base, in its own
// sections. Nothing is saved until the hotel reviews and presses Save.
const ImportDocumentsDialog = ({ open, onClose, kb, setKb, onSectionsChanged }) => {
  const { showToast } = useToast();
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [importDocuments, { isLoading }] = useImportKnowledgeDocumentsMutation();

  const close = () => {
    if (isLoading) return;
    setFiles([]);
    setResult(null);
    setError("");
    onClose();
  };

  const addFiles = (picked) => {
    setError("");
    const allowed = picked.filter((file) => /\.(pdf|docx|txt|md)$/i.test(file.name));
    const tooBig = allowed.filter((file) => file.size > MAX_SIZE);
    const rejected = picked.length - allowed.length;
    if (rejected) setError("Only PDF, DOCX and TXT files can be imported. Save old .doc files as .docx first.");
    if (tooBig.length) setError(`${tooBig.map((f) => f.name).join(", ")} is over 15 MB.`);
    setFiles((current) => {
      const names = new Set(current.map((f) => f.name));
      const next = [...current, ...allowed.filter((f) => f.size <= MAX_SIZE && !names.has(f.name))];
      if (next.length > MAX_FILES) setError(`Up to ${MAX_FILES} documents at a time.`);
      return next.slice(0, MAX_FILES);
    });
  };

  const runImport = async () => {
    setError("");
    try {
      const data = await importDocuments({ files, knowledgeBase: kb?.knowledge_base }).unwrap();
      if (!data?.success) throw new Error(data?.error);

      const merged = mergeDocumentAdditions(kb, data.additions);
      setKb(merged.kb);
      onSectionsChanged?.(merged.changedSections);
      setResult({ ...merged, summary: data.summary || [], skipped: data.skipped || [] });
      if (merged.changedSections.length) {
        showToast({ message: "Added to the knowledge base. Review it, then save your changes." });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, err?.message || "Could not import these documents."));
    }
  };

  const footer = result ? (
    <Button onClick={close}>Review changes</Button>
  ) : (
    <>
      <Button variant="secondary" onClick={close} disabled={isLoading}>
        Cancel
      </Button>
      <Button icon={FileUp} loading={isLoading} disabled={!files.length} onClick={runImport}>
        {isLoading ? "Reading documents…" : `Import ${files.length || ""} ${files.length === 1 ? "document" : "documents"}`}
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title="Import documents"
      description="Upload house rules, local guides, emergency contacts or instructions. The AI adds what's new to the right sections of your knowledge base. Nothing already there is changed, and nothing is saved until you save."
      footer={footer}
    >
      {!result && (
        <div className="space-y-3">
          <FileDropZone accept={ACCEPT} multiple disabled={isLoading} onFiles={addFiles}>
            <Icon icon={FileUp} size="xl" tone="muted" />
            <p className="text-sm text-app-text">Drop files here, or click to choose</p>
            <p className="text-xs text-app-text-faint">PDF, DOCX or TXT · up to {MAX_FILES} files · 15 MB each</p>
          </FileDropZone>

          {files.length > 0 && (
            <ul className="divide-y divide-app-border! rounded-lg border border-app-border!">
              {files.map((file) => (
                <li key={file.name} className="flex items-center gap-2 px-3 py-2">
                  <Icon icon={FileText} size="sm" tone="muted" />
                  <span className="min-w-0 flex-1 truncate text-sm text-app-text">{file.name}</span>
                  <span className="shrink-0 text-xs text-app-text-faint">{sizeLabel(file.size)}</span>
                  <IconButton
                    icon={X}
                    size="sm"
                    label={`Remove ${file.name}`}
                    disabled={isLoading}
                    onClick={() => setFiles((current) => current.filter((f) => f !== file))}
                  />
                </li>
              ))}
            </ul>
          )}

          {isLoading && (
            <p className="text-xs text-app-text-muted">
              Reading {files.length} {files.length === 1 ? "document" : "documents"}. This can take a minute or two.
            </p>
          )}
          <p className="text-xs text-app-text-faint">Uses AI credits.</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {result.changedSections.length > 0 ? (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <Icon icon={CheckCircle2} size="sm" className="mt-0.5" />
              <span>
                Added to {result.changedSections.map(formatLabel).join(", ")}. Check these sections, then press Save.
              </span>
            </div>
          ) : (
            <p className="text-sm text-app-text-muted">
              Nothing new was found: your knowledge base already has what these documents say.
            </p>
          )}

          {result.summary.length > 0 && (
            <ul className="space-y-2">
              {result.summary.map((item, index) => {
                const accounted = (item.pointsAdded ?? 0) + (item.pointsAlreadyInKb ?? 0);
                // the AI's own count doesn't add up, or it found far fewer
                // points than the file has lines: worth a look
                const short =
                  (item.pointsFound != null && accounted < item.pointsFound) ||
                  (item.lines != null && item.pointsFound != null && item.pointsFound < item.lines * 0.5);
                return (
                  <li key={`${item.document}-${index}`} className="text-sm">
                    <span className="font-medium text-app-text">{item.document}</span>
                    {item.note && <span className="text-app-text-muted"> · {item.note}</span>}
                    {item.pointsFound != null && (
                      <p className={`mt-0.5 text-xs ${short ? "text-amber-700 dark:text-amber-400" : "text-app-text-faint"}`}>
                        {item.pointsFound} points found · {item.pointsAdded ?? 0} added ·{" "}
                        {item.pointsAlreadyInKb ?? 0} already in your knowledge base
                        {item.lines != null && ` · the file has ${item.lines} lines`}
                        {short && ". Some points may be missing: check this document's sections."}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {result.conflicts.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                <Icon icon={AlertTriangle} size="sm" />
                {result.conflicts.length} {result.conflicts.length === 1 ? "value differs" : "values differ"}. Your current value was kept:
              </p>
              <ul className="max-h-56 space-y-2 overflow-y-auto">
                {result.conflicts.map((conflict, index) => (
                  <li key={index} className="rounded-lg border border-app-border! p-2.5 text-xs">
                    <p className="font-medium text-app-text">{pathLabel(conflict.path)}</p>
                    <p className="mt-1 text-app-text-muted">
                      Kept: <span className="text-app-text">{valueText(conflict.existing)}</span>
                    </p>
                    <p className="mt-0.5 text-app-text-muted">
                      Document says: <span className="text-app-text">{valueText(conflict.incoming)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.skipped.length > 0 && (
            <ul className="space-y-1 text-xs text-red-600 dark:text-red-400">
              {result.skipped.map((item) => (
                <li key={item.document}>
                  {item.document}: {item.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </Dialog>
  );
};

export default ImportDocumentsDialog;

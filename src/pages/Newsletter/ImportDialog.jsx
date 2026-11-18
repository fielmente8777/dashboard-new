import { FileSpreadsheet, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import FileDropZone from "../../components/ui/FileDropZone";
import { useToast } from "../../context/ToastContext";
import { newsletterError, useGetNewsletterGroupsQuery, useImportSubscribersMutation } from "../../redux/api/newsletterApi";
import { formatNumber, readSubscriberFile } from "./newsletterUtils";

// the server takes up to 10,000 rows a call; bigger files go in parts
const CHUNK = 10_000;
const ACCEPT = ".csv,.xlsx,.xls";

// Upload a CSV / Excel list: pick the file, see what was found, put it in a group (e.g.
// "Past guests"), confirm consent, import. Every other column of the
// file (country, language, ...) is kept on each person.
//   group - start with this group filled in (from the Groups tab)
export default function ImportDialog({ open, onClose, group: initialGroup = "" }) {
  const { showToast } = useToast();
  const [importRows] = useImportSubscribersMutation();
  const [file, setFile] = useState(null); // { name, rows, valid, invalid, hasNames }
  const [reading, setReading] = useState(false);
  const [group, setGroup] = useState(initialGroup);
  const groups = useGetNewsletterGroupsQuery(undefined, { skip: !open });
  // opened from a group's card: that group is filled in
  useEffect(() => {
    if (open) setGroup(initialGroup);
  }, [open, initialGroup]);
  const [consent, setConsent] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const close = () => {
    setFile(null);
    setGroup("");
    setConsent(false);
    setResult(null);
    onClose();
  };

  const pick = async ([picked]) => {
    if (!picked) return;
    if (!/\.(csv|xlsx|xls)$/i.test(picked.name)) {
      showToast({ message: "Use a .csv, .xlsx or .xls file.", type: "error" });
      return;
    }
    setReading(true);
    try {
      const read = await readSubscriberFile(picked);
      if (!read.valid) {
        showToast({ message: "No email addresses were found in that file.", type: "error" });
        return;
      }
      setFile({ name: picked.name, ...read });
    } catch {
      showToast({ message: "Could not read that file.", type: "error" });
    } finally {
      setReading(false);
    }
  };

  const run = async () => {
    setImporting(true);
    const total = { added: 0, updated: 0, skippedUnsubscribed: 0, invalid: 0, duplicatesInFile: 0 };
    try {
      for (let i = 0; i < file.rows.length; i += CHUNK) {
        const part = await importRows({ rows: file.rows.slice(i, i + CHUNK), tags: group.trim() ? [group.trim()] : [] }).unwrap();
        for (const key of Object.keys(total)) total[key] += part[key] || 0;
      }
      setResult(total);
    } catch (error) {
      showToast({ message: newsletterError(error, "The import stopped. Please try again."), type: "error" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="Import subscribers"
      description="A CSV or Excel file with an email column. Every other column (name, country, language…) is kept."
      onClose={close}
      sheetOnPhone
      footer={
        result ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button icon={Upload} loading={importing} disabled={!file || !consent} onClick={run}>
              Import {file ? formatNumber(file.valid) : ""}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-app-text">
            Import finished{group.trim() ? ` · group "${group.trim()}"` : ""}
          </p>
          <ul className="space-y-1 text-app-text-muted">
            <li><strong className="text-app-text">{formatNumber(result.added)}</strong> added</li>
            <li><strong className="text-app-text">{formatNumber(result.updated)}</strong> already on your list (name and tags updated)</li>
            {result.skippedUnsubscribed > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.skippedUnsubscribed)}</strong> skipped: they had
                unsubscribed, so they stay unsubscribed
              </li>
            )}
            {result.invalid + result.duplicatesInFile > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.invalid + result.duplicatesInFile)}</strong> skipped:
                not a valid email, or listed twice
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="space-y-4">
          <FileDropZone accept={ACCEPT} disabled={reading} onFiles={pick}>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-app-border! px-4 py-8 text-center hover:border-blue-500!">
              <FileSpreadsheet className="size-7 text-app-text-muted" aria-hidden />
              {file ? (
                <>
                  <p className="text-sm font-medium text-app-text">{file.name}</p>
                  <p className="text-xs text-app-text-muted">
                    {formatNumber(file.valid)} email{file.valid === 1 ? "" : "s"}
                    {file.hasNames ? " with names" : ""}
                    {file.invalid ? ` · ${formatNumber(file.invalid)} not valid (skipped)` : ""} · click to pick another
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-app-text">{reading ? "Reading the file…" : "Drop a file here, or click to choose"}</p>
                  <p className="text-xs text-app-text-muted">.csv, .xlsx or .xls</p>
                </>
              )}
            </div>
          </FileDropZone>

          {file?.columns?.length > 0 && (
            <p className="text-xs text-app-text-muted">
              Also kept on each person: <span className="text-app-text">{file.columns.join(", ")}</span>
            </p>
          )}

          <Field
            label="Add everyone to a group"
            hint="Pick a group or type a new one, e.g. Past guests or Corporate. Send a newsletter to just that group later."
          >
            <Input
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              list="newsletter-import-groups"
              maxLength={40}
              placeholder="e.g. Past guests"
            />
            <datalist id="newsletter-import-groups">
              {(groups.data || []).map((g) => (
                <option key={g.name} value={g.name} />
              ))}
            </datalist>
          </Field>

          <label className="flex items-start gap-2 text-sm text-app-text">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 accent-blue-600"
            />
            Everyone in this file agreed to get emails from us. People who unsubscribed before stay unsubscribed.
          </label>
        </div>
      )}
    </Dialog>
  );
}

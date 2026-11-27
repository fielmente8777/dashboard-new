import { FileSpreadsheet, Link2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import FileDropZone from "../../components/ui/FileDropZone";
import Segmented from "../../components/ui/Segmented";
import { useToast } from "../../context/ToastContext";
import {
  newsletterError,
  useFetchSheetLinkMutation,
  useGetNewsletterGroupsQuery,
  useImportSubscribersMutation,
} from "../../redux/api/newsletterApi";
import { formatNumber, readSubscriberFile } from "./newsletterUtils";

// 200 rows a call, one after the other (like the console's imports): each call checks its
// addresses quickly, the server never gets one huge request, and the bar shows the progress
const CHUNK = 200;
const RETRIES = 3;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ACCEPT = ".csv,.xlsx,.xls";
const FROM = [
  { value: "file", label: "File" },
  { value: "link", label: "Link (Google Sheet, CSV…)" },
];

// base64 from the server -> a File, so a link is read exactly like an upload
const toFile = ({ base64, fileName }) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new File([bytes], fileName);
};

// Upload a CSV / Excel list, or give a link (Google Sheet, a CSV / Excel link, Drive, Dropbox,
// OneDrive): see what was found, put it in a group (e.g. "Past guests"), confirm consent, import.
// Opened from a group (Groups tab / email marketing "Add people") it adds to that group. Every other column of the
// file (country, language, ...) is kept on each person.
//   group - start with this group filled in (from the Groups tab)
export default function ImportDialog({ open, onClose, group: initialGroup = "" }) {
  const { showToast } = useToast();
  const [importRows] = useImportSubscribersMutation();
  const [file, setFile] = useState(null); // { name, rows, valid, invalid, hasNames }
  const [from, setFrom] = useState("file");
  const [link, setLink] = useState("");
  const [fetchLink] = useFetchSheetLinkMutation();
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
  // rows sent so far, while importing (and where to go on after a part failed)
  const [progress, setProgress] = useState(null);

  const close = () => {
    setFile(null);
    setLink("");
    setFrom("file");
    setGroup("");
    setConsent(false);
    setResult(null);
    setProgress(null);
    onClose();
  };

  const readLink = async () => {
    if (!/^https?:\/\//i.test(link.trim())) {
      showToast({ message: "Paste the full link, starting with https://", type: "error" });
      return;
    }
    setReading(true);
    try {
      const got = await fetchLink({ url: link.trim() }).unwrap();
      const read = await readSubscriberFile(toFile(got));
      if (!read.valid) {
        showToast({ message: "No email addresses were found in that sheet.", type: "error" });
        return;
      }
      setFile({ name: got.fileName, ...read });
      setProgress(null);
    } catch (error) {
      showToast({ message: newsletterError(error, "Could not read the sheet from that link."), type: "error" });
    } finally {
      setReading(false);
    }
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
      setProgress(null);
    } catch {
      showToast({ message: "Could not read that file.", type: "error" });
    } finally {
      setReading(false);
    }
  };

  const run = async () => {
    setImporting(true);
    // continuing after a failed part: the counts so far are kept
    const total = progress?.total || { added: 0, updated: 0, skippedUnsubscribed: 0, invalid: 0, duplicatesInFile: 0, contactsAdded: 0, undeliverable: 0, corrected: 0 };
    // addresses the server left out because they can't receive email (first 50 shown)
    const undeliverableList = progress?.undeliverableList || [];
    const tags = group.trim() ? [group.trim()] : [];
    let i = progress?.done || 0;
    try {
      for (; i < file.rows.length; i += CHUNK) {
        setProgress({ done: i, of: file.rows.length, total, undeliverableList });
        let part = null;
        for (let attempt = 0; !part; attempt += 1) {
          try {
            part = await importRows({ rows: file.rows.slice(i, i + CHUNK), tags }).unwrap();
          } catch (error) {
            // busy or a dropped connection: wait and try the same part again
            if (attempt + 1 >= RETRIES) throw error;
            await wait(1500 * (attempt + 1));
          }
        }
        for (const key of Object.keys(total)) total[key] += part[key] || 0;
        if (undeliverableList.length < 50) undeliverableList.push(...(part.undeliverableList || []).slice(0, 50 - undeliverableList.length));
      }
      setProgress(null);
      setResult({ ...total, undeliverableList });
    } catch (error) {
      // keep what went in: Import again goes on from this part
      setProgress({ done: i, of: file.rows.length, total, undeliverableList, stopped: true });
      showToast({
        message: `${newsletterError(error, "The import stopped.")} ${formatNumber(i)} of ${formatNumber(file.rows.length)} rows are in. Press Import to go on from there.`,
        type: "error",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="Import subscribers"
      description="A CSV or Excel file with an email column. Every other column (name, country, language…) is kept, and everyone in it is added to Contacts too."
      onClose={close}
      sheetOnPhone
      footer={
        result ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button icon={Upload} loading={importing} disabled={!file || !consent} onClick={run}>
              {progress?.stopped ? "Go on importing" : `Import ${file ? formatNumber(file.valid) : ""}`}
            </Button>
          </>
        )
      }
    >
      {progress && !result && (
        <div className="mb-4 space-y-1.5" role="status">
          <div className="flex justify-between text-xs text-app-text-muted">
            <span>{progress.stopped ? "Stopped" : "Importing and checking each address…"}</span>
            <span className="tabular-nums">
              {formatNumber(progress.done)} of {formatNumber(progress.of)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-app-surface-secondary">
            <div
              className={`h-full rounded-full transition-all ${progress.stopped ? "bg-amber-500" : "bg-blue-600"}`}
              style={{ width: `${Math.round((progress.done / Math.max(progress.of, 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}
      {result ? (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-app-text">
            Import finished{group.trim() ? ` · group "${group.trim()}"` : ""}
          </p>
          <ul className="space-y-1 text-app-text-muted">
            <li><strong className="text-app-text">{formatNumber(result.added)}</strong> added</li>
            <li><strong className="text-app-text">{formatNumber(result.updated)}</strong> already on your list (name and tags updated)</li>
            {result.contactsAdded > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.contactsAdded)}</strong> new in Contacts too (the
                others were already there)
              </li>
            )}
            {result.skippedUnsubscribed > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.skippedUnsubscribed)}</strong> skipped: they had
                unsubscribed, so they stay unsubscribed
              </li>
            )}
            {result.corrected > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.corrected)}</strong> saved without accents, spaces or symbols
                (as written they weren&apos;t valid; cleaned they are)
              </li>
            )}
            {result.undeliverable > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.undeliverable)}</strong> left out: they can&apos;t receive
                email (bounced before, the domain doesn&apos;t exist, or mistyped), so they would only bounce. They are on Email
                marketing → Wrong emails
                <UndeliverableList items={result.undeliverableList} />
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
          <Segmented
            label="Import from"
            options={FROM}
            value={from}
            onChange={(next) => {
              setFrom(next);
              setFile(null);
            }}
          />

          {from === "link" ? (
            <div className="space-y-2">
              <Field
                label="Link to the sheet"
                hint="Google Sheets: Share → General access → “Anyone with the link” (Viewer). Every tab is read. Also works with a CSV / Excel link, Google Drive, Dropbox or OneDrive."
              >
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/…"
                    onKeyDown={(e) => e.key === "Enter" && link.trim() && readLink()}
                  />
                  <Button variant="secondary" icon={Link2} loading={reading} disabled={!link.trim()} onClick={readLink}>
                    Get the sheet
                  </Button>
                </div>
              </Field>
              {file && (
                <p className="rounded-lg bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">
                  <span className="font-medium text-app-text">{file.name}</span>: {formatNumber(file.valid)} email
                  {file.valid === 1 ? "" : "s"}
                  {file.hasNames ? " with names" : ""}
                  {file.invalid ? ` · ${formatNumber(file.invalid)} not valid (skipped)` : ""}
                </p>
              )}
            </div>
          ) : (
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
          )}

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
            Everyone in this {from === "link" ? "sheet" : "file"} agreed to get emails from us. People who unsubscribed before stay
            unsubscribed.
          </label>
        </div>
      )}
    </Dialog>
  );
}

/** the addresses left out, with the likely right spelling */
const UndeliverableList = ({ items }) =>
  items?.length ? (
    <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto rounded-lg bg-app-surface-secondary p-2 text-xs">
      {items.map((p) => (
        <li key={p.email} className="break-all">
          {p.email}
          <span className="text-app-text-faint">
            {" "}
            ·{" "}
            {p.verdict === "typo"
              ? `did you mean ${p.suggestion}?`
              : p.verdict === "no_domain"
                ? "domain has no email"
                : p.verdict === "bounced"
                  ? p.reason || "bounced before"
                  : "not an email address"}
          </span>
        </li>
      ))}
    </ul>
  ) : null;

import { FileSpreadsheet, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input, Select } from "../../components/ui/Field";
import FileDropZone from "../../components/ui/FileDropZone";
import Notice from "../../components/ui/Notice";
import Segmented from "../../components/ui/Segmented";
import { useToast } from "../../context/ToastContext";
import {
  tradeDirectoryApi,
  tradeError,
  useCancelTradeImportMutation,
  useLazyGetTradeImportQuery,
  useSendTradeImportRowsMutation,
  useStartTradeImportMutation,
} from "../../redux/api/tradeDirectoryApi";
import { useDispatch } from "react-redux";
import { formatNumber, readContactFile, uploadInBatches } from "./tradeUtils";

const COUNTS = [
  ["inserted", "New"],
  ["merged", "Merged"],
  ["duplicates", "Already saved"],
  ["review", "To check"],
  ["empty", "Skipped"],
  ["inDirectory", "Also in Eazotel's list"],
  ["unsorted", "Not sorted yet"],
];

/**
 * Imports the hotel's own contacts: an Excel / CSV file (read here, sent 200 rows at a time) or a
 * Google Sheet link (read by the server). Duplicates are merged on the way in; live counts.
 */
const ImportContactsDialog = ({ onClose }) => {
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [book, setBook] = useState(null);
  const [sheetName, setSheetName] = useState("");
  const [url, setUrl] = useState("");
  const [job, setJob] = useState(null);
  const [sent, setSent] = useState(0);
  const [busy, setBusy] = useState(false);
  const abort = useRef(null);
  const [start] = useStartTradeImportMutation();
  const [sendRows] = useSendTradeImportRowsMutation();
  const [cancel] = useCancelTradeImportMutation();
  const [poll] = useLazyGetTradeImportQuery();

  const sheet = book?.sheets.find((s) => s.name === sheetName);
  const running = job?.status === "running";

  const refreshLists = () => dispatch(tradeDirectoryApi.util.invalidateTags(["TradePartners", "TradeFacets", "TradeImports"]));

  // a link import runs on the server: poll it
  useEffect(() => {
    if (!job || job.kind !== "link" || job.status !== "running") return undefined;
    const t = setInterval(async () => {
      const next = await poll(job.id).unwrap().catch(() => null);
      if (next) {
        setJob(next);
        if (next.status !== "running") refreshLists();
      }
    }, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  const pick = async ([f]) => {
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) {
      showToast({ message: "The file is bigger than 25 MB. Split it and import the parts.", type: "error" });
      return;
    }
    setBusy(true);
    try {
      const read = await readContactFile(f);
      setFile(f);
      setBook(read);
      setSheetName(read.sheets[0]?.name || "");
    } catch {
      showToast({ message: "Couldn't read this file. Use .xlsx, .xls or .csv.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const importFile = async () => {
    setBusy(true);
    abort.current = new AbortController();
    try {
      const started = await start({ kind: "file", fileName: `${file.name} › ${sheet.name}`, expectedRows: sheet.rows.length }).unwrap();
      setJob(started);
      await uploadInBatches(
        sheet.rows,
        (rows, last) => sendRows({ importId: started.id, headers: sheet.headers, rows, last }).unwrap(),
        (n, result) => {
          setSent(n);
          setJob(result);
        },
        abort.current.signal,
      );
      if (abort.current.signal.aborted) {
        await cancel(started.id).unwrap().catch(() => null);
        showToast({ message: "Import stopped. What was sent so far is saved.", type: "info" });
      }
      refreshLists();
    } catch (error) {
      showToast({ message: tradeError(error, "The import stopped. Please try again."), type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const importLink = async () => {
    setBusy(true);
    try {
      setJob(await start({ kind: "link", url: url.trim() }).unwrap());
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const total = job?.kind === "file" ? sheet?.rows.length || 0 : null;

  return (
    <Dialog
      open
      size="lg"
      title="Import your contacts"
      description="Only you can see contacts you import. Duplicates are merged: same email, same phone, or the same agency and person in the same city."
      onClose={() => (running && job?.kind === "file" ? null : onClose())}
      footer={
        job ? (
          running && job.kind === "file" ? (
            <Button variant="secondary" onClick={() => abort.current?.abort()}>
              Stop
            </Button>
          ) : running ? (
            <Button variant="secondary" onClick={onClose}>
              Close (keeps running)
            </Button>
          ) : (
            <Button onClick={onClose}>Done</Button>
          )
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={busy} disabled={mode === "file" ? !sheet?.rows.length : !url.trim()} onClick={mode === "file" ? importFile : importLink}>
              Import{mode === "file" && sheet ? ` ${formatNumber(sheet.rows.length)} rows` : ""}
            </Button>
          </>
        )
      }
    >
      {!job ? (
        <div className="space-y-4">
          <Segmented
            label="Import from"
            value={mode}
            onChange={setMode}
            options={[
              { value: "file", label: <span className="flex items-center gap-1.5"><FileSpreadsheet className="size-4" aria-hidden />Excel or CSV</span> },
              { value: "link", label: <span className="flex items-center gap-1.5"><Link2 className="size-4" aria-hidden />Google Sheet link</span> },
            ]}
          />
          <p className="rounded-lg bg-app-surface-secondary p-3 text-xs text-app-text-muted">
            The category (travel agent, wedding planner, MICE…) is found for each row from a Category column, the sheet or file name, or the company name. Rows it
            can't place are saved as <b>Not sorted yet</b>; you can set them later.
          </p>
          {mode === "file" ? (
            <>
              <FileDropZone accept=".xlsx,.xls,.csv" disabled={busy} onFiles={pick}>
                <p className="text-sm font-medium text-app-text">{file ? file.name : "Drop an .xlsx, .xls or .csv file, or click to choose"}</p>
                <p className="text-xs text-app-text-muted">Columns like Company, Contact Person, Mobile, Email, City, State are read automatically.</p>
              </FileDropZone>
              {book && (
                <div className="space-y-2 rounded-lg border border-app-border p-3 text-sm">
                  {book.sheets.length > 1 && (
                    <Field label="Sheet">
                      <Select
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        options={book.sheets.map((s) => ({ value: s.name, label: `${s.name} (${formatNumber(s.rows.length)} rows)` }))}
                      />
                    </Field>
                  )}
                  {sheet && (
                    <p className="text-app-text">
                      <b>{formatNumber(sheet.rows.length)}</b> rows · columns:{" "}
                      <span className="text-app-text-muted">{sheet.headers.filter(Boolean).join(" · ")}</span>
                    </p>
                  )}
                  {sheet && sheet.recognised < 2 && (
                    <Notice tone="warning">Few known columns found. Name the header row like: Company, Contact Person, Mobile, Email, City, State.</Notice>
                  )}
                </div>
              )}
            </>
          ) : (
            <Field label="Google Sheet link" hint='Share the sheet as "Anyone with the link can view". The tab in the link is the one read.'>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…" />
            </Field>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-app-text">
            {running ? "Importing…" : job.status === "done" ? "Finished" : "Stopped"}
            {total !== null && (
              <span className="font-normal text-app-text-muted">
                {" "}
                · {formatNumber(sent)} of {formatNumber(total)} rows sent
              </span>
            )}
          </p>
          {total > 0 && (
            <div className="h-2 overflow-hidden rounded-full bg-app-surface-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.round((sent / total) * 100)}%` }} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {COUNTS.map(([key, label]) => (
              <div key={key} className="rounded-lg border border-app-border p-2">
                <p className="text-[11px] text-app-text-muted">{label}</p>
                <p className="text-lg font-semibold tabular-nums text-app-text">{formatNumber(job.counts?.[key])}</p>
              </div>
            ))}
          </div>
          {job.error && <Notice tone="warning">{job.error}</Notice>}
        </div>
      )}
    </Dialog>
  );
};

export default ImportContactsDialog;

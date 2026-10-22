
import { useRef, useState } from "react";
import { Download, FileUp, FileJson, Loader2 } from "lucide-react";
import {
  exportRulesToCSV,
  exportRulesToJSON,
  parseRulesFile,
} from "./utils/ruleFileUtils";

export default function RuleFileManager({
  rules = [],
  channel = "whatsapp",
  onImport,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    setBusy(true);
    setMessage("");
    setError("");

    let imported = 0;

    try {
      const rows = await parseRulesFile(file);

      for (const row of rows) {
        // Uses the parent's channel-specific API handler.
        await onImport(row);
        imported += 1;
      }

      setMessage(`Successfully imported ${imported} rules.`);
    } catch (err) {
      setError(
        imported > 0
          ? `Imported ${imported} rules before failure. ${
              err?.message || "Import failed."
            }`
          : err?.message || "Could not import the file."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#252c3a] bg-[#0d1017] p-4">
      <div className="mb-3">
        <h3 className="font-medium text-gray-100">
          Import / Export Rules
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Back up or import {channel === "voice" ? "Voice AI" : "WhatsApp"} rules.
          Export includes rule text, category, and enabled status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => exportRulesToCSV(rules, channel)}
          className="flex items-center gap-2 rounded-lg border border-[#30394a] px-3 py-2 text-sm text-gray-200 hover:bg-white/5 disabled:opacity-50"
        >
          <Download size={16} />
          Export CSV
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => exportRulesToJSON(rules, channel)}
          className="flex items-center gap-2 rounded-lg border border-[#30394a] px-3 py-2 text-sm text-gray-200 hover:bg-white/5 disabled:opacity-50"
        >
          <FileJson size={16} />
          Export JSON
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileUp size={16} />
          )}
          {busy ? "Importing..." : "Import CSV / JSON"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="hidden"
          onChange={handleImport}
          disabled={busy}
        />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        CSV columns: ruleText, category, enabled. Maximum 500 rules per file.
      </p>

      {message && (
        <p role="status" className="mt-3 text-sm text-emerald-400">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}

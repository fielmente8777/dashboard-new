import { Loader2, PenLine, RotateCcw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import AiPausedNotice from "../AiCredits/AiPausedNotice";
import { useAiAccess } from "../AiCredits/useAiAccess";
import { aiWriteEmail } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

// the quick actions, Gmail "Help me write" style
const ACTIONS = [
  { value: "improve", label: "Improve" },
  { value: "shorter", label: "Shorter" },
  { value: "longer", label: "Longer" },
  { value: "formal", label: "More formal" },
  { value: "friendly", label: "Friendlier" },
  { value: "fix", label: "Fix spelling" },
  { value: "subjects", label: "Subject lines" },
];

const textOf = (html) => {
  const box = document.createElement("div");
  box.innerHTML = html || "";
  return (box.textContent || "").replace(/\s+/g, " ").trim();
};

// "Help me write" inside the compose window (gian /email-marketing/ai/write,
// billed to AI credits). Writes the email from a few words, reworks what is
// written, or suggests subject lines. Nothing changes until "Replace" /
// "Insert" / a subject is clicked.
//
//   getBody()            the editor's HTML now
//   subject
//   designMode           an HTML design is in use: only subject lines (its text is read)
//   designText           that design's text
//   onReplace(html) / onInsert(html) / onSubject(text) / onClose()
export default function HelpMeWritePanel({ getBody, subject, designMode, designText, onReplace, onInsert, onSubject, onClose }) {
  const aiAccess = useAiAccess();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(""); // the action running
  const [result, setResult] = useState(null); // { action, html, subjects }
  const [error, setError] = useState("");

  const run = async (action) => {
    if (busy || aiAccess.paused) return;
    setBusy(action);
    setError("");
    try {
      // a design is long HTML: its words are enough for subject lines
      const bodyHtml = designMode ? `<p>${designText.slice(0, 15000)}</p>` : getBody();
      const doc = (await aiWriteEmail({ action, prompt: prompt.trim(), bodyHtml, subject }))?.doc;
      setResult({ action, html: doc?.html || "", subjects: doc?.subjects || [] });
    } catch (e) {
      setError(e?.message || "The AI couldn't do that. Try again.");
    } finally {
      setBusy("");
    }
  };

  const hasBody = designMode ? Boolean(designText) : Boolean(textOf(getBody()));

  return (
    <div className="shrink-0 border-t border-app-border! bg-gradient-to-b from-blue-500/5 to-transparent px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold text-app-text">Help me write</span>
        <span className="text-[11px] text-app-text-faint">uses AI credits</span>
        <IconButton icon={X} label="Close Help me write" size="sm" className="ml-auto" onClick={onClose} disabled={Boolean(busy)} />
      </div>

      <AiPausedNotice access={aiAccess} feature="Help me write" compact className="mb-2" />

      {!designMode && (
        <div className="flex items-end gap-2">
          <textarea
            value={prompt}
            autoFocus
            rows={2}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                run("write");
              }
            }}
            placeholder={
              hasBody
                ? "What should change? e.g. “Add that breakfast is included”"
                : "Describe the email, e.g. “Black Friday: 20% off all villas, book by 30 Nov, stays until March”"
            }
            disabled={Boolean(busy)}
            className="min-w-0 flex-1 resize-none rounded-md border border-app-border! bg-app-surface px-2.5 py-1.5 text-sm text-app-text outline-none placeholder:text-app-text-faint focus:border-blue-500!"
          />
          <Button
            size="sm"
            icon={PenLine}
            loading={busy === "write"}
            onClick={() => run("write")}
            disabled={Boolean(busy) || aiAccess.paused || (prompt.trim().length < 5 && !hasBody)}
          >
            {hasBody ? "Rewrite" : "Write"}
          </Button>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {ACTIONS.filter((a) => !designMode || a.value === "subjects").map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => run(a.value)}
            disabled={Boolean(busy) || aiAccess.paused || (!hasBody && !(a.value === "subjects" && prompt.trim().length >= 5))}
            className="inline-flex items-center gap-1 rounded-full border border-app-border! bg-app-surface px-2.5 py-1 text-xs text-app-text transition enabled:hover:border-blue-500! enabled:hover:text-blue-600 disabled:opacity-40"
          >
            {busy === a.value && <Loader2 className="size-3 animate-spin" />}
            {a.label}
          </button>
        ))}
      </div>
      {designMode && (
        <p className="mt-1.5 text-[11px] text-app-text-faint">
          An HTML design is in use, so the AI suggests subject lines from its text. To have the AI rewrite the words, choose
          “Edit as text” on the design first.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {result && result.action === "subjects" && (
        <div className="mt-2.5 space-y-1">
          <p className="text-[11px] text-app-text-muted">Click one to use it:</p>
          {result.subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSubject(s)}
              className="block w-full truncate rounded-md border border-app-border! bg-app-surface px-2.5 py-1.5 text-left text-sm text-app-text hover:border-blue-500!"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {result && result.action !== "subjects" && result.html && (
        <div className="mt-2.5">
          <div
            className="max-h-48 overflow-y-auto rounded-md border border-app-border! bg-app-surface px-3 py-2 text-sm text-app-text [&_a]:text-blue-600 [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2"
            // gian cleaned it: only simple text tags, no scripts or styles
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onReplace(result.html)}>
              {hasBody ? "Replace my text" : "Use this"}
            </Button>
            {hasBody && (
              <Button size="sm" variant="secondary" onClick={() => onInsert(result.html)}>
                Insert at cursor
              </Button>
            )}
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => run(result.action === "write" ? "write" : result.action)} disabled={Boolean(busy)}>
              Try again
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setResult(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

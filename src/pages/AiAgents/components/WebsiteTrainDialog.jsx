import { Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import Notice from "../../../components/ui/Notice";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useTrainAiAgentFromWebsiteMutation } from "../../../redux/api/aiAgentsApi";

// "Train from website": read the hotel's site, review what the AI found,
// keep what is right. Applying only changes the draft on screen; the hotel
// saves (and later publishes) it like any other edit.
const WebsiteTrainDialog = ({ open, onClose, channel, hid, draft, set }) => {
  const [train, { isLoading }] = useTrainAiAgentFromWebsiteMutation();
  const [url, setUrl] = useState(draft.knowledge.website?.url || "");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState("");
  const [keep, setKeep] = useState([]); // indexes of facts to keep
  const [useGreeting, setUseGreeting] = useState(false);

  const read = async (event) => {
    event?.preventDefault();
    if (!url.trim() || isLoading) return;
    setError("");
    try {
      const found = await train({ channel, hid, url: url.trim() }).unwrap();
      setResult(found);
      setSummary(found.summary);
      setKeep(found.facts.map((_, i) => i));
      setUseGreeting(Boolean(found.welcomeMessage) && !draft.behaviour.welcomeMessage);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not read that website. Check the address and try again."));
    }
  };

  const apply = () => {
    set("knowledge.website", {
      url: result.url,
      summary: summary.trim(),
      facts: result.facts.filter((_, i) => keep.includes(i)),
      syncedAt: new Date().toISOString(),
    });
    if (useGreeting && result.welcomeMessage) set("behaviour.welcomeMessage", result.welcomeMessage);
    close();
  };

  const close = () => {
    setResult(null);
    setError("");
    onClose();
  };

  const toggle = (index) => setKeep((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]));

  return (
    <Dialog
      open={open}
      size="lg"
      sheetOnPhone
      title="Train from your website"
      description="We read your home page and up to four useful pages (rooms, amenities, dining, contact). You choose what the agent keeps."
      onClose={close}
      footer={result ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setResult(null)}>Read another page</Button>
          <Button onClick={apply} disabled={!keep.length && !summary.trim()}>Add {keep.length} fact{keep.length === 1 ? "" : "s"} to draft</Button>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button icon={Globe} loading={isLoading} disabled={!url.trim()} onClick={read}>Read website</Button>
        </div>
      )}
    >
      {!result ? (
        <form onSubmit={read} className="space-y-3">
          <Field label="Website address" error={error}>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourhotel.com" inputMode="url" disabled={isLoading} autoFocus />
          </Field>
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-app-text-muted" role="status"><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Reading your website. This takes 10–30 seconds…</p>
          ) : (
            <p className="text-xs text-app-text-muted">Uses a few AI credits. Only public page text is read. Your knowledge base stays the main source: if the two disagree, the knowledge base wins.</p>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-app-text-muted">Read {result.pages.length} page{result.pages.length === 1 ? "" : "s"}: {result.pages.map((p) => p.replace(/^https?:\/\//, "")).join(", ")}</p>
          <Field label="About your property">
            <Textarea rows={2} maxLength={500} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-app-text-muted">Facts the agent can use ({keep.length} of {result.facts.length} selected). Untick anything that is wrong or out of date.</legend>
            <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-app-border! p-2">
              {result.facts.map((fact, index) => (
                <li key={index}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm text-app-text hover:bg-app-surface-secondary">
                    <input type="checkbox" className="mt-0.5 size-4 accent-blue-600" checked={keep.includes(index)} onChange={() => toggle(index)} />
                    <span>{fact}</span>
                  </label>
                </li>
              ))}
              {result.facts.length === 0 && <li className="px-2 py-1.5 text-sm text-app-text-muted">No clear facts were found on these pages.</li>}
            </ul>
          </fieldset>
          {result.welcomeMessage && (
            <label className="flex items-start gap-2 rounded-lg border border-app-border! p-3 text-sm text-app-text">
              <input type="checkbox" className="mt-0.5 size-4 accent-blue-600" checked={useGreeting} onChange={(e) => setUseGreeting(e.target.checked)} />
              <span><span className="font-medium">Use as the greeting</span><span className="block text-app-text-muted">“{result.welcomeMessage}”</span></span>
            </label>
          )}
          <Notice>Nothing is live yet. After adding, save the draft and publish when you're happy.</Notice>
        </div>
      )}
    </Dialog>
  );
};

export default WebsiteTrainDialog;

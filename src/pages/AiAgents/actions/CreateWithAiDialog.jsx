import { Sparkles } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Textarea } from "../../../components/ui/Field";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGenerateAiAgentActionMutation, useGetAiAgentActionEstimateQuery } from "../../../redux/api/aiAgentsApi";

const EXAMPLES = [
  "When a guest wants a spa treatment, collect the date, time and number of people and book it through our spa system's API.",
  "When a guest asks for an airport pickup, collect their flight number and landing time and alert the front desk.",
  "When a guest asks about their booking status, look it up in our PMS by booking ID and tell them the status.",
];

// "Create with AI": describe it, optionally paste API details, get a draft.
// The draft opens in the editor; nothing is saved, enabled or published here.
const CreateWithAiDialog = ({ open, onClose, channel, hid, onDraft }) => {
  const [description, setDescription] = useState("");
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [generate, { isLoading }] = useGenerateAiAgentActionMutation();
  const { data: estimate } = useGetAiAgentActionEstimateQuery({ channel, hid }, { skip: !open });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await generate({ channel, hid, description, paste }).unwrap();
      setDescription("");
      setPaste("");
      onDraft(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create the draft. Try again."));
    }
  };

  const cost = !estimate ? "" : estimate.chargingEnabled ? `Uses up to ~${estimate.estimatedCredits} AI credits (usually less).` : "AI credits are not charged right now.";

  return (
    <Dialog open={open} onClose={() => !isLoading && onClose()} title="Create an action with AI" description="Describe what the action should do. You'll review the draft before anything is saved." size="lg">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Describe what this action should do">
          <Textarea rows={4} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} placeholder="When a guest… collect… then…" />
        </Field>
        <div>
          <p className="mb-1.5 text-xs font-medium text-app-text-muted">Examples</p>
          <div className="flex flex-col gap-1.5">
            {EXAMPLES.map((example) => (
              <button key={example} type="button" onClick={() => setDescription(example)} className="rounded-lg border border-app-border! px-3 py-2 text-left text-xs text-app-text hover:bg-app-surface-secondary focus-visible:outline-2 focus-visible:outline-app-focus">
                {example}
              </button>
            ))}
          </div>
        </div>
        <Field label="API details (optional)" hint="A URL, cURL command, OpenAPI snippet or sample JSON. Keys and tokens are removed before anything is sent to the AI; you enter them in the editor.">
          <Textarea rows={5} maxLength={6000} className="font-mono text-xs" spellCheck={false} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"curl -X POST https://api.example.com/spa/bookings -d '{\"date\":\"2026-12-01\"}'"} />
        </Field>
        {error && <p role="alert" className="rounded-lg bg-app-danger-soft p-3 text-sm text-app-danger">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-app-text-muted">{cost}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" icon={Sparkles} loading={isLoading} disabled={description.trim().length < 10}>{isLoading ? "Creating draft…" : "Create draft"}</Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateWithAiDialog;

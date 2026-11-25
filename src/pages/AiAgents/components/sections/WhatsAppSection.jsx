import { MessageSquareReply, Plus, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input } from "../../../../components/ui/Field";
import IconButton from "../../../../components/ui/IconButton";
import Notice from "../../../../components/ui/Notice";
import Switch from "../../../../components/ui/Switch";
import { addTestNumber, MAX_TEST_NUMBERS } from "../../agentRules";
import { SectionTitle } from "./PersonaSection";

const display = (digits) => `+${digits}`;

// WhatsApp-only settings: test numbers and reply buttons.
const WhatsAppSection = ({ draft, set }) => {
  const { testNumbers, replyButtons } = draft.channelOptions;
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");

  const add = () => {
    const { numbers, error: problem } = addTestNumber(testNumbers, number);
    if (problem) return setError(problem);
    set("channelOptions.testNumbers", numbers);
    setNumber("");
    setError("");
  };

  return (
    <div className="space-y-4">
      <Card
        title={<SectionTitle icon={Smartphone}>Test numbers</SectionTitle>}
        description="Messages from these numbers get this agent's latest saved draft, even before it goes live. Everyone else keeps getting your current WhatsApp replies until you publish."
      >
        <ul className="mb-3 space-y-2" aria-label="Test numbers">
          {testNumbers.map((digits) => (
            <li key={digits} className="flex items-center gap-2 rounded-lg border border-app-border! px-3 py-2">
              <FaWhatsapp className="size-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="flex-1 font-mono text-sm text-app-text">{display(digits)}</span>
              <IconButton icon={X} label={`Remove ${display(digits)}`} size="sm" onClick={() => set("channelOptions.testNumbers", testNumbers.filter((n) => n !== digits))} />
            </li>
          ))}
          {testNumbers.length === 0 && <li className="rounded-lg border border-dashed border-app-border! px-3 py-3 text-sm text-app-text-muted">No test numbers yet. Add your own phone to try the agent on WhatsApp.</li>}
        </ul>
        {testNumbers.length < MAX_TEST_NUMBERS ? (
          <form className="flex flex-wrap items-start gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <Field label="WhatsApp number" className="min-w-[14rem] flex-1" error={error}>
              <Input value={number} inputMode="tel" placeholder="+91 98765 43210" onChange={(e) => { setNumber(e.target.value); setError(""); }} />
            </Field>
            <Button type="submit" variant="secondary" icon={Plus} className="sm:mt-6">Add</Button>
          </form>
        ) : <p className="text-xs text-app-text-muted">You can add up to {MAX_TEST_NUMBERS} test numbers.</p>}
        <p className="mt-2 text-xs text-app-text-muted">Save the draft after changing numbers. Test chats use AI credits like real ones and appear in Activity marked "test number".</p>
      </Card>

      <Card
        title={<SectionTitle icon={MessageSquareReply}>Reply buttons</SectionTitle>}
        description="Let the agent add up to 3 tap-to-reply buttons under a message, like “Check availability” or “Talk to the team”. Guests tap instead of typing."
        actions={<Switch label="Use reply buttons" checked={replyButtons} onChange={(value) => set("channelOptions.replyButtons", value)} />}
      >
        <div className="flex flex-wrap gap-2" aria-hidden="true">
          <div className="w-full max-w-xs rounded-xl border border-app-border! bg-app-surface-secondary p-3 text-sm text-app-text">
            Hello! I can help you plan your stay. What would you like to do?
            {replyButtons && (
              <div className="mt-2 grid gap-1 border-t border-app-border! pt-2 text-center text-xs font-medium text-sky-600 dark:text-sky-400">
                <span>Check availability</span><span>See room types</span><span>Talk to the team</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Notice title="Your existing WhatsApp AI">
        While this agent is live it answers your WhatsApp chats instead of the AI auto-reply in WhatsApp settings. Chat flows that are running and chats your team has taken over are left alone. Pause the agent to go back to the previous replies.
      </Notice>
    </div>
  );
};

export default WhatsAppSection;

import { ShieldCheck } from "lucide-react";
import Card from "../../../../components/ui/Card";
import { Field, Input, Textarea } from "../../../../components/ui/Field";
import Switch from "../../../../components/ui/Switch";
import TagInput from "../../../../components/ui/TagInput";
import { SectionTitle } from "./PersonaSection";

const number = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// When the AI steps back for your team, and topics it must not handle.
const HandoffSection = ({ draft, set }) => {
  const { handoff, guardrails } = draft;
  return (
    <Card
      title={<SectionTitle icon={ShieldCheck}>Handover & safety</SectionTitle>}
      description="When the AI stops and lets your team take over, and what it must never discuss."
    >
      <Field
        label="Hand over when the guest says"
        as="div"
        hint="Any of these words hands the chat to your team straight away."
      >
        <TagInput
          value={handoff.keywords}
          onChange={(value) => set("handoff.keywords", value)}
          placeholder="Add a word, e.g. manager"
        />
      </Field>

      <Field label="Message on handover" className="mt-4">
        <Textarea
          rows={2}
          maxLength={1000}
          value={handoff.message}
          onChange={(e) => set("handoff.message", e.target.value)}
        />
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field
          label="AI stays quiet for (hours)"
          hint="After a handover or a reply from your team."
        >
          <Input
            type="number"
            min={1}
            max={168}
            value={handoff.pauseHours}
            onChange={(e) => set("handoff.pauseHours", number(e.target.value, 12))}
          />
        </Field>
        <Field label="Max AI replies per chat" hint="0 = no limit. Stops endless loops.">
          <Input
            type="number"
            min={0}
            max={200}
            value={handoff.maxRepliesPerConversation}
            onChange={(e) => set("handoff.maxRepliesPerConversation", number(e.target.value, 25))}
          />
        </Field>
        <Field label="Reply after (seconds)" hint="Waits, so several quick messages get one answer.">
          <Input
            type="number"
            min={0}
            max={30}
            value={draft.replyDelaySeconds}
            onChange={(e) => set("replyDelaySeconds", number(e.target.value, 4))}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Switch
          label="Notify my team on handover"
          checked={handoff.notifyTeam}
          onChange={(value) => set("handoff.notifyTeam", value)}
        />
        <span className="ml-2 text-sm text-app-text">Notify my team on handover</span>
      </div>

      <Field
        label="Topics the AI must not handle"
        as="div"
        className="mt-4"
        hint="It politely declines and offers your team instead, e.g. discounts, refunds, legal matters."
      >
        <TagInput
          value={guardrails.restrictedTopics}
          onChange={(value) => set("guardrails.restrictedTopics", value)}
          placeholder="Add a topic"
        />
      </Field>
    </Card>
  );
};

export default HandoffSection;

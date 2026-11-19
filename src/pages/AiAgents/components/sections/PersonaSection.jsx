import { UserRound } from "lucide-react";
import Card from "../../../../components/ui/Card";
import { Field, Input, Select } from "../../../../components/ui/Field";
import Segmented from "../../../../components/ui/Segmented";
import Switch from "../../../../components/ui/Switch";
import ChoiceCard from "../ChoiceCard";
import { LANGUAGE_OPTIONS, LENGTH_HINTS, LENGTH_OPTIONS, TONE_OPTIONS } from "../../agentOptions";

const SectionTitle = ({ icon: IconComponent, children }) => (
  <span className="flex items-center gap-2">
    <IconComponent className="size-4 text-app-text-muted" />
    {children}
  </span>
);

// Who the agent is and how it sounds.
const PersonaSection = ({ draft, set }) => {
  const { persona } = draft;
  return (
    <Card
      title={<SectionTitle icon={UserRound}>Personality</SectionTitle>}
      description="How the agent introduces itself and how it sounds to guests."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Agent name" hint="Guests see this if they ask who they're talking to.">
          <Input
            value={persona.name}
            maxLength={40}
            onChange={(e) => set("persona.name", e.target.value)}
            placeholder="Aria"
          />
        </Field>
        <Field label="Role" hint="One line about what it does for your hotel.">
          <Input
            value={persona.role}
            maxLength={300}
            onChange={(e) => set("persona.role", e.target.value)}
            placeholder="Guest assistant who helps guests plan their stay"
          />
        </Field>
      </div>

      <Field label="Tone" as="div" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {TONE_OPTIONS.map((tone) => (
            <ChoiceCard
              key={tone.value}
              type="radio"
              checked={persona.tone === tone.value}
              onChange={() => set("persona.tone", tone.value)}
              label={tone.label}
              hint={tone.hint}
            />
          ))}
        </div>
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Reply length" as="div" hint={LENGTH_HINTS[persona.replyLength]}>
          <Segmented
            options={LENGTH_OPTIONS}
            value={persona.replyLength}
            onChange={(value) => set("persona.replyLength", value)}
          />
        </Field>
        <Field label="Emojis" as="div" hint="At most one or two per message.">
          <Switch
            label="Use emojis"
            checked={persona.useEmojis}
            onChange={(value) => set("persona.useEmojis", value)}
          />
        </Field>
      </div>

      <Field label="Language" as="div" className="mt-4">
        <Segmented
          options={[
            { value: "auto", label: "Same as the guest" },
            { value: "fixed", label: "Always one language" },
          ]}
          value={persona.languageMode}
          onChange={(value) => set("persona.languageMode", value)}
        />
        {persona.languageMode === "fixed" ? (
          <div className="mt-2 max-w-xs">
            <Select
              options={LANGUAGE_OPTIONS}
              value={persona.language}
              onChange={(e) => set("persona.language", e.target.value)}
              aria-label="Reply language"
            />
          </div>
        ) : (
          <p className="mt-1 text-xs text-app-text-faint">
            English gets English, Hindi gets Hindi, Hinglish gets Hinglish.
          </p>
        )}
      </Field>
    </Card>
  );
};

export { SectionTitle };
export default PersonaSection;

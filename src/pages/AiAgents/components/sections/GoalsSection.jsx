import { Target } from "lucide-react";
import Card from "../../../../components/ui/Card";
import { Field, Textarea } from "../../../../components/ui/Field";
import ChoiceCard from "../ChoiceCard";
import { GOAL_OPTIONS } from "../../agentOptions";
import { SectionTitle } from "./PersonaSection";

// What the agent should try to achieve, plus the hotel's own instructions.
const GoalsSection = ({ draft, set }) => {
  const { behaviour } = draft;
  const toggleGoal = (goal, on) =>
    set(
      "behaviour.goals",
      on ? [...behaviour.goals, goal] : behaviour.goals.filter((item) => item !== goal),
    );

  return (
    <Card
      title={<SectionTitle icon={Target}>Goals & instructions</SectionTitle>}
      description="What the agent works towards in every conversation."
    >
      <div className="grid gap-2 md:grid-cols-3">
        {GOAL_OPTIONS.map((goal) => (
          <ChoiceCard
            key={goal.value}
            checked={behaviour.goals.includes(goal.value)}
            onChange={(on) => toggleGoal(goal.value, on)}
            label={goal.label}
            hint={goal.hint}
          />
        ))}
      </div>

      <Field
        label="Instructions for Instagram"
        className="mt-4"
        hint="Anything specific to this channel. Rules for every channel belong in AI training."
      >
        <Textarea
          rows={4}
          maxLength={3000}
          value={behaviour.instructions}
          onChange={(e) => set("behaviour.instructions", e.target.value)}
          placeholder={"e.g. Mention our weekend brunch when guests ask about food.\nShare the menu link from quick replies when asked for the menu."}
        />
      </Field>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Welcome message (optional)"
          hint="Sent once, before the first AI reply in a new chat. Leave empty to skip."
        >
          <Textarea
            rows={3}
            maxLength={1000}
            value={behaviour.welcomeMessage}
            onChange={(e) => set("behaviour.welcomeMessage", e.target.value)}
            placeholder="Hi! 👋 Thanks for reaching out to us."
          />
        </Field>
        <Field
          label="When it doesn't know"
          hint="What it says instead of guessing. It adapts this to the guest's language."
        >
          <Textarea
            rows={3}
            maxLength={1000}
            value={behaviour.fallbackMessage}
            onChange={(e) => set("behaviour.fallbackMessage", e.target.value)}
          />
        </Field>
      </div>
    </Card>
  );
};

export default GoalsSection;

import { Zap } from "lucide-react";
import Card from "../../../../components/ui/Card";
import ChoiceCard from "../ChoiceCard";
import { ACTION_OPTIONS } from "../../agentOptions";
import { SectionTitle } from "./PersonaSection";

// Things the agent can do, not just say.
const ActionsSection = ({ draft, set }) => (
  <Card
    title={<SectionTitle icon={Zap}>Actions</SectionTitle>}
    description="What the agent is allowed to do during a conversation. Try each one in the Test tab first."
  >
    <div className="grid gap-2 md:grid-cols-2">
      {ACTION_OPTIONS.map((action) => (
        <ChoiceCard
          key={action.key}
          checked={Boolean(draft.actions[action.key])}
          onChange={(on) => set(`actions.${action.key}`, on)}
          label={action.label}
          hint={action.hint}
          warning={action.warning}
        />
      ))}
    </div>
  </Card>
);

export default ActionsSection;

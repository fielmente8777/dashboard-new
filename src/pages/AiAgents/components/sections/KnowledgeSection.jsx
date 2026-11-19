import { BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import Switch from "../../../../components/ui/Switch";
import { PAGES, dashboardPath } from "../../../../routes/paths";
import { SectionTitle } from "./PersonaSection";

const Row = ({ title, hint, link, linkLabel, action }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-app-border! p-3">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-app-text">{title}</p>
      <p className="text-xs text-app-text-muted">{hint}</p>
    </div>
    {link && (
      <Link
        to={link}
        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        {linkLabel} <Icon icon={ExternalLink} size="xs" />
      </Link>
    )}
    {action}
  </div>
);

// What the agent knows. The knowledge base is shared by every AI (WhatsApp,
// Instagram, website, voice), so it is only linked here, never copied.
const KnowledgeSection = ({ draft, set }) => (
  <Card
    title={<SectionTitle icon={BookOpen}>Knowledge</SectionTitle>}
    description="The agent only answers from what you have taught your AI. Update it once and every channel learns it."
  >
    <div className="space-y-2">
      <Row
        title="Knowledge base"
        hint="Rooms, amenities, policies, location, FAQs. Always used. Shared by all your AI agents."
        link={dashboardPath(PAGES.KNOWLEDGE_BASE)}
        linkLabel="Edit knowledge base"
      />
      <Row
        title="Quick replies"
        hint="Charges, add-ons and links you saved as quick replies."
        action={
          <Switch
            label="Use quick replies"
            checked={draft.knowledge.useQuickReplies}
            onChange={(value) => set("knowledge.useQuickReplies", value)}
          />
        }
      />
      <Row
        title="AI training rules"
        hint="Your 'Train your AI' rules (shared with WhatsApp and the website chat)."
        link={dashboardPath(PAGES.AI_TRAINING)}
        linkLabel="Edit rules"
        action={
          <Switch
            label="Use AI training rules"
            checked={draft.knowledge.useCustomRules}
            onChange={(value) => set("knowledge.useCustomRules", value)}
          />
        }
      />
    </div>
  </Card>
);

export default KnowledgeSection;

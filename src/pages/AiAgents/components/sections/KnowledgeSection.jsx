import { BookOpen, ExternalLink, Globe, RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import IconButton from "../../../../components/ui/IconButton";
import Icon from "../../../../components/ui/Icon";
import Switch from "../../../../components/ui/Switch";
import { PAGES, dashboardPath } from "../../../../routes/paths";
import WebsiteTrainDialog from "../WebsiteTrainDialog";
import { SectionTitle } from "./PersonaSection";

const syncedFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const EMPTY_SITE = { url: "", summary: "", facts: [], syncedAt: "" };

// "Train from website": what was read, with a way to drop single facts.
const WebsiteKnowledge = ({ draft, set, channel, hid }) => {
  const [open, setOpen] = useState(false);
  const site = draft.knowledge.website || EMPTY_SITE;
  const trained = Boolean(site.facts.length || site.summary);

  return (
    <div className="rounded-lg border border-app-border! p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-app-accent-soft text-app-accent-text" aria-hidden="true"><Globe className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">Your website</p>
          <p className="text-xs text-app-text-muted">
            {trained
              ? <>{site.facts.length} facts from {site.url.replace(/^https?:\/\//, "")}{site.syncedAt && <> · read {syncedFormat.format(new Date(site.syncedAt))}</>}. The website doesn't update this by itself: read it again after big changes.</>
              : "Paste your website and the AI picks out facts guests ask about. You review them first."}
          </p>
        </div>
        <Button size="sm" variant={trained ? "secondary" : "primary"} icon={trained ? RefreshCw : Globe} onClick={() => setOpen(true)}>{trained ? "Read again" : "Train from website"}</Button>
        {trained && <IconButton icon={Trash2} tone="danger" label="Remove website knowledge" onClick={() => set("knowledge.website", { ...EMPTY_SITE })} />}
      </div>
      {trained && (
        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto" aria-label="Facts from your website">
          {site.summary && <li className="rounded-md bg-app-surface-secondary px-2 py-1.5 text-xs text-app-text"><span className="font-medium">About: </span>{site.summary}</li>}
          {site.facts.map((fact, index) => (
            <li key={`${index}:${fact}`} className="group flex items-start gap-2 rounded-md px-2 py-1 text-xs text-app-text hover:bg-app-surface-secondary">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-app-text-muted" aria-hidden="true" />
              <span className="flex-1">{fact}</span>
              <IconButton icon={X} size="xs" label={`Remove: ${fact}`} onClick={() => set("knowledge.website", { ...site, facts: site.facts.filter((_, i) => i !== index) })} />
            </li>
          ))}
        </ul>
      )}
      {open && <WebsiteTrainDialog open={open} onClose={() => setOpen(false)} channel={channel} hid={hid} draft={draft} set={set} />}
    </div>
  );
};

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
const KnowledgeSection = ({ draft, set, channel, hid }) => (
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
      <WebsiteKnowledge draft={draft} set={set} channel={channel} hid={hid} />
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

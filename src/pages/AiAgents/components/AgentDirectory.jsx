import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Field";
import PageShell from "../../../components/ui/PageShell";
import Segmented from "../../../components/ui/Segmented";
import { Skeleton } from "../../../components/ui/States";
import { useGetAiAgentQuery, useGetAiAgentTemplatesQuery } from "../../../redux/api/aiAgentsApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { TONE_OPTIONS } from "../agentOptions";
import { AGENT_CHANNELS, channelMeta } from "../channelMeta";
import TemplatePicker from "./TemplatePicker";

const linkButton = "inline-flex w-fit items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-3 py-2 text-sm font-medium text-app-text hover:bg-app-surface-secondary focus-visible:outline-2 focus-visible:outline-app-focus";
const primaryLink = "inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-app-focus";
const STATES = { uncreated: { label: "No agent", tone: "gray" }, draft: { label: "Draft", tone: "purple" }, live: { label: "Live", tone: "green" }, paused: { label: "Paused", tone: "amber" } };

// One channel's card: its agent's state and the way in.
const ChannelCard = ({ channel, hid }) => {
  const meta = channelMeta(channel);
  const { currentData: snapshot, isLoading } = useGetAiAgentQuery({ channel, hid }, { refetchOnMountOrArgChange: true });
  const state = snapshot?.status.state;
  const ChannelIcon = meta.icon;
  const to = dashboardPath(PAGES.AI_AGENTS, { hid, query: { channel } });

  return (
    <Card
      className={meta.cardClass}
      title={<span className="inline-flex items-center gap-2"><ChannelIcon className={`size-4 ${meta.iconClass}`} aria-hidden="true" /> {meta.name}</span>}
      actions={state && <Badge tone={STATES[state].tone}>{STATES[state].label}</Badge>}
    >
      <p className="mb-3 text-sm text-app-text-muted">{meta.blurb}</p>
      {isLoading ? <Skeleton className="h-9 w-32" /> : (
        <>
          <p className="mb-3 text-xs text-app-text-muted">
            {meta.name} <span className="font-medium text-app-text">{snapshot?.connected ? "connected" : "not connected"}</span>
            {snapshot?.config && <> · Agent <span className="font-medium text-app-text">{snapshot.config.persona.name}</span> · {snapshot.status.label}</>}
          </p>
          <Link className={state === "uncreated" ? primaryLink : linkButton} to={to}>
            {state === "uncreated" ? "Set up agent" : "Open agent"} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </>
      )}
    </Card>
  );
};

// Creating an agent for `agent.channel`: pick a template, name it, choose a tone.
const CreateAgent = ({ agent, hid }) => {
  const meta = channelMeta(agent.channel);
  const { defaults, connected } = agent.snapshot;
  const { currentData: templates = [], isLoading } = useGetAiAgentTemplatesQuery();
  const [template, setTemplate] = useState("room_sales");
  const [name, setName] = useState(defaults.persona.name);
  const [tone, setTone] = useState(null); // null = the template's tone
  const nameInput = useRef(null);
  const chosen = templates.find((t) => t.id === template);
  const effectiveTone = tone ?? chosen?.tone ?? defaults.persona.tone;

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim() || agent.saving) return;
    agent.write("create", { persona: { name, tone: effectiveTone } }, template || undefined);
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Card title="1. Choose a starting point" description="Each template comes with a personality, skills, a fallback reply and safe actions for a common hotel job. You can change everything later.">
        <TemplatePicker templates={templates} loading={isLoading} value={template} onChange={(id) => { setTemplate(id); setTone(null); }} disabled={agent.saving} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title={`2. Name your ${meta.name} agent`} description="Start with a draft. Guests get replies only after you publish.">
          <div className="space-y-4">
            <Field label="Agent name">
              <Input ref={nameInput} value={name} onChange={(event) => setName(event.target.value)} required maxLength={40} disabled={agent.saving} />
            </Field>
            <Field label="Tone" as="div" hint={chosen && tone === null ? `Suggested by the ${chosen.name} template.` : undefined}>
              <Segmented label="Tone" className="flex-wrap" options={TONE_OPTIONS} value={effectiveTone} onChange={setTone} disabled={agent.saving} />
            </Field>
            <Button type="submit" loading={agent.saving} disabled={!name.trim()}>Create draft <ArrowRight className="size-4" /></Button>
          </div>
        </Card>
        <Card title={`${meta.name} connection`} description="You can create and test a draft now. A connection is needed to publish.">
          <div className="flex flex-col items-start gap-3">
            <Badge tone={connected ? "green" : "amber"}>{connected ? "Connected" : "Not connected"}</Badge>
            <Link className={linkButton} to={dashboardPath(connected ? meta.inboxPage : meta.connectPage, { hid, query: connected ? undefined : meta.connectQuery })}>
              {connected ? `Open ${meta.name} inbox` : `Connect ${meta.name}`} <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {agent.channel === "whatsapp" && (
              <p className="text-xs text-app-text-muted">Until this agent is live, your existing WhatsApp auto-replies keep working as they do today. Add a test number to try the agent on your own phone first.</p>
            )}
          </div>
        </Card>
      </div>
    </form>
  );
};

// The AI Agents home: one card per channel; with `createAgent`, the create flow for that channel.
const AgentDirectory = ({ hid, createAgent }) => (
  <PageShell
    title={createAgent ? `Set up your ${channelMeta(createAgent.channel).name} agent` : "AI Agents"}
    description={createAgent ? "Your 24/7 sales and support assistant, ready in a few minutes." : "Your 24/7 sales and support team on every channel, for this location."}
  >
    <div className="grid gap-3 md:grid-cols-3">
      {AGENT_CHANNELS.map((channel) => <ChannelCard key={channel} channel={channel} hid={hid} />)}
      <Card title={<span className="inline-flex items-center gap-2"><Phone className="size-4 text-app-text-muted" aria-hidden="true" /> Voice AI</span>}>
        <p className="mb-3 text-sm text-app-text-muted">Manage voice agent instructions for guest calls.</p>
        <Link className={linkButton} to={dashboardPath(PAGES.AI_TRAINING, { hid })}>Open Voice AI settings <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </Card>
    </div>
    {createAgent && <CreateAgent agent={createAgent} hid={hid} />}
  </PageShell>
);

export default AgentDirectory;

import { Bot } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useTenant } from "../../hooks/useTenant";
import { channelMeta, isAgentChannel } from "./channelMeta";
import AgentDirectory from "./components/AgentDirectory";
import AgentWorkspace from "./components/AgentWorkspace";
import { useAgentDraft } from "./hooks/useAgentDraft";

// One channel's agent: the create flow until it exists, then the builder.
const ChannelAgent = ({ channel, hid }) => {
  const agent = useAgentDraft({ channel, hid });

  if (agent.snapshot?.status.state === "uncreated") return <AgentDirectory hid={hid} createAgent={agent} />;
  if (agent.snapshot) return <AgentWorkspace agent={agent} hid={hid} />;

  return (
    <PageShell title="AI Agents">
      {agent.query.isError ? <ErrorState message={`Could not load the ${channelMeta(channel).name} agent.`} onRetry={agent.query.refetch} /> : <Skeleton className="h-64" />}
    </PageShell>
  );
};

// ?channel=whatsapp|instagram opens that agent; ?view=channels (or nothing)
// shows every channel. Older links with only ?tab= open the Instagram agent.
const AiAgentsPage = () => {
  const { ndid, hid } = useTenant();
  const [params] = useSearchParams();

  if (!hid) {
    return (
      <PageShell title="AI Agents">
        <EmptyState icon={Bot} title="Select a location" description="Choose a hotel location to manage its AI agents." />
      </PageShell>
    );
  }

  const requested = params.get("channel");
  const channel = isAgentChannel(requested) ? requested : params.get("tab") ? "instagram" : null;
  if (params.get("view") === "channels" || !channel) return <AgentDirectory key={`${ndid}:${hid}`} hid={hid} />;
  return <ChannelAgent key={`${ndid}:${hid}:${channel}`} channel={channel} hid={hid} />;
};

export default AiAgentsPage;

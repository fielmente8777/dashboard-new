import { FaInstagram } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useTenant } from "../../hooks/useTenant";
import AgentDirectory from "./components/AgentDirectory";
import AgentWorkspace from "./components/AgentWorkspace";
import { useAgentDraft } from "./hooks/useAgentDraft";

const InstagramAgents = ({ hid }) => {
  const agent = useAgentDraft({ channel: "instagram", hid });
  const [params] = useSearchParams();

  if (agent.snapshot && (agent.snapshot.status.state === "uncreated" || params.get("view") === "channels")) return <AgentDirectory agent={agent} hid={hid} />;
  if (agent.snapshot) return <AgentWorkspace agent={agent} hid={hid} />;

  return (
    <PageShell title="AI Agents">
      {agent.query.isError ? <ErrorState message="Could not load the Instagram agent." onRetry={agent.query.refetch} /> : <Skeleton className="h-64" />}
    </PageShell>
  );
};

const AiAgentsPage = () => {
  const { ndid, hid } = useTenant();
  if (hid) return <InstagramAgents key={`${ndid}:${hid}`} hid={hid} />;

  return (
    <PageShell title="AI Agents">
      <EmptyState icon={FaInstagram} title="Select a location" description="Choose a hotel location to manage its Instagram agent." />
    </PageShell>
  );
};

export default AiAgentsPage;

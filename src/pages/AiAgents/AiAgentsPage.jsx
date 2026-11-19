import { ArrowUpRight, Bot, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { Link } from "react-router-dom";
import AiPausedNotice from "../../components/AiCredits/AiPausedNotice";
import { useAiAccess } from "../../components/AiCredits/useAiAccess";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import SaveBar from "../../components/ui/SaveBar";
import { ErrorState, Skeleton } from "../../components/ui/States";
import Switch from "../../components/ui/Switch";
import Tabs from "../../components/ui/Tabs";
import { useTenant } from "../../hooks/useTenant";
import { PAGES, dashboardPath } from "../../routes/paths";
import { CHANNELS } from "./agentOptions";
import ActivityLog from "./components/ActivityLog";
import TestPlayground from "./components/TestPlayground";
import ActionsSection from "./components/sections/ActionsSection";
import GoalsSection from "./components/sections/GoalsSection";
import HandoffSection from "./components/sections/HandoffSection";
import KnowledgeSection from "./components/sections/KnowledgeSection";
import PersonaSection from "./components/sections/PersonaSection";
import ScheduleSection from "./components/sections/ScheduleSection";
import { useAgentDraft } from "./hooks/useAgentDraft";

const CHANNEL_ICONS = { instagram: FaInstagram, whatsapp: MessageCircle, voice: Phone };

// where a channel's AI is configured until it moves to this page
const LEGACY_LINKS = {
  whatsapp: () => dashboardPath(PAGES.SETTINGS, { query: { tab: "whatsapp" } }),
  voice: () => dashboardPath(PAGES.AI_TRAINING),
};

const ChannelPicker = ({ value, onChange }) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {CHANNELS.map((channel) => {
      const selected = channel.key === value;
      const content = (
        <>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              channel.key === "instagram"
                ? "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white"
                : "bg-app-surface-secondary text-app-text-muted"
            }`}
          >
            <Icon icon={CHANNEL_ICONS[channel.key]} size="lg" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-app-text">
              {channel.label} agent
              {!channel.configurable && (
                <Icon icon={ArrowUpRight} size="xs" className="text-app-text-faint" />
              )}
            </span>
            <span className="block text-xs text-app-text-muted">{channel.description}</span>
          </span>
        </>
      );
      const className = `flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
        selected
          ? "border-pink-500! bg-pink-500/5"
          : "border-app-border! bg-app-surface hover:border-app-text-faint!"
      }`;

      return channel.configurable ? (
        <button key={channel.key} type="button" className={className} onClick={() => onChange(channel.key)}>
          {content}
        </button>
      ) : (
        <Link key={channel.key} to={LEGACY_LINKS[channel.key]()} className={className}>
          {content}
        </Link>
      );
    })}
  </div>
);

// The agent's on/off switch and whether it is answering right now.
const AgentStatusCard = ({ agent }) => {
  const { draft, status, set, dirty } = agent;
  const tone = !draft.enabled ? "gray" : status?.active ? "green" : "amber";
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-app-border! bg-app-surface p-4">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white">
        <Icon icon={Bot} size="xl" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-app-text">
          {draft.persona.name} · Instagram agent
          <Badge tone={tone}>{dirty ? (draft.enabled ? "On (unsaved)" : "Off (unsaved)") : status?.label}</Badge>
        </p>
        <p className="text-sm text-app-text-muted">
          {draft.enabled
            ? "Answers Instagram DMs from your knowledge base, and hands over to your team when needed."
            : "Off: your team answers every Instagram DM."}{" "}
          <Link
            to={dashboardPath(PAGES.CHAT_INSTAGRAM)}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Open Instagram chats
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-app-text">{draft.enabled ? "On" : "Off"}</span>
        <Switch label="Instagram AI agent" checked={draft.enabled} onChange={(value) => set("enabled", value)} />
      </div>
    </div>
  );
};

// AI Agents: one AI agent per channel, all sharing the same knowledge base and
// AI training rules. Instagram is configured here; WhatsApp and voice link to
// their current settings until they move here.
const AiAgentsPage = () => {
  const { hid } = useTenant();
  const aiAccess = useAiAccess();
  const [channel, setChannel] = useState("instagram");
  const [tab, setTab] = useState("settings");
  const agent = useAgentDraft({ channel, hid });

  return (
    <PageShell
      title="AI Agents"
      description="Set up how your AI answers guests on each channel. Every agent learns from the same knowledge base and AI training rules."
    >
      <AiPausedNotice access={aiAccess} feature="AI replies" />
      <ChannelPicker value={channel} onChange={setChannel} />

      {!hid || agent.query.isLoading || !agent.draft ? (
        agent.query.isError ? (
          <ErrorState message="Could not load the AI agent." onRetry={agent.query.refetch} />
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-64" />
          </div>
        )
      ) : (
        <>
          <AgentStatusCard agent={agent} />

          <Tabs
            value={tab}
            onChange={setTab}
            className="border-b border-app-border! pb-2"
            tabs={[
              { value: "settings", label: "Settings" },
              { value: "test", label: "Test" },
              { value: "activity", label: "Activity" },
            ]}
          />

          {tab === "settings" && (
            <div className="space-y-5">
              <PersonaSection draft={agent.draft} set={agent.set} />
              <GoalsSection draft={agent.draft} set={agent.set} />
              <KnowledgeSection draft={agent.draft} set={agent.set} />
              <ActionsSection draft={agent.draft} set={agent.set} />
              <ScheduleSection draft={agent.draft} set={agent.set} />
              <HandoffSection draft={agent.draft} set={agent.set} />
            </div>
          )}
          {tab === "test" && <TestPlayground channel={channel} hid={hid} draft={agent.draft} />}
          {tab === "activity" && <ActivityLog channel={channel} hid={hid} />}

          <SaveBar
            show={agent.dirty}
            onSave={() => agent.save()}
            onDiscard={agent.discard}
            saving={agent.saving}
          />
        </>
      )}
    </PageShell>
  );
};

export default AiAgentsPage;

import { Activity, ArrowRight, ArrowUpRight, Bot, ChevronRight, FlaskConical, Pause, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AiPausedNotice from "../../../components/AiCredits/AiPausedNotice";
import { useAiAccess } from "../../../components/AiCredits/useAiAccess";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Drawer from "../../../components/ui/Drawer";
import { useConfirm } from "../../../context/ConfirmContext";
import { useGetInstagramAccountsQuery } from "../../../redux/api/instagramApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { validateSchedule } from "../actions/scheduleCore";
import { channelMeta } from "../channelMeta";
import ActivityLog from "./ActivityLog";
import AgentSetup from "./AgentSetup";
import SetupChecklist from "./SetupChecklist";
import TestPlayground from "./TestPlayground";

const LIFE_STATES = {
  draft: { label: "Draft", tone: "purple" },
  paused: { label: "Paused", tone: "amber" },
  live: { label: "Live", tone: "green" },
};

// "Draft (unsaved)" while editing, "Saved" otherwise (and whether it is live yet)
const SaveChip = ({ dirty, unpublished }) => (
  <span
    role="status"
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${dirty ? "bg-app-warning-soft text-app-warning" : "bg-app-success-soft text-app-success"}`}
  >
    <span className={`size-1.5 rounded-full ${dirty ? "bg-app-warning" : "bg-app-success"}`} aria-hidden="true" />
    {dirty ? "Draft (unsaved)" : unpublished ? "Saved · not published" : "Saved"}
  </span>
);

const AgentWorkspace = ({ agent, hid }) => {
  const aiAccess = useAiAccess();
  const { confirm } = useConfirm();
  const [drawer, setDrawer] = useState(null); // "test" | "activity"
  const channel = agent.channel;
  const meta = channelMeta(channel);
  const { currentData: accounts = [] } = useGetInstagramAccountsQuery(hid, { refetchOnMountOrArgChange: true, skip: channel !== "instagram" });
  const { config, status, connected, hasDraftChanges } = agent.snapshot;
  const life = LIFE_STATES[status.state];
  const live = status.state === "live";
  const paused = status.state === "paused";
  const busy = agent.saving;
  const hoursValid = validateSchedule(config.workingHours).length === 0;
  const canPublish = connected && !busy && !agent.dirty && hoursValid;
  const unpublished = status.state === "draft" || hasDraftChanges;
  const publishLabel = status.state === "draft" ? "Publish Agent" : "Publish changes";
  const connectionLabel = channel !== "instagram" ? "Connected" : accounts.length > 1 ? `${accounts.length} accounts connected` : accounts[0]?.igUsername ? `@${accounts[0].igUsername} connected` : accounts.length ? "1 account connected" : "Connected";

  const confirmAction = async (action, label, message, variant = "primary") => {
    if (await confirm(message, { title: label, confirmText: label, variant })) agent.write(action);
  };
  const publish = () => confirmAction("publish", publishLabel, `Apply the saved settings and actions to ${meta.surface} for this location?${channel === "whatsapp" ? " The agent replaces your existing WhatsApp AI auto-replies while it is live." : ""}`);
  const inboxLink = connected ? dashboardPath(meta.inboxPage, { hid }) : dashboardPath(meta.connectPage, { hid, query: meta.connectQuery });
  const ChannelIcon = meta.icon;

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="anim-stagger mx-auto space-y-5">
        {/* top bar */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent-text" aria-hidden="true"><Bot className="size-4" /></span>
            <span className="inline-flex items-center gap-1 rounded-full border border-app-accent! px-2.5 py-0.5 text-xs font-semibold text-app-accent-text">
              <Sparkles className="size-3" aria-hidden="true" /> AI Agent Builder
            </span>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 text-sm text-app-text-muted">
                <li><Link className="rounded hover:text-app-text focus-visible:outline-2 focus-visible:outline-app-focus" to={dashboardPath(PAGES.AI_AGENTS, { hid, query: { view: "channels" } })}>Agents</Link></li>
                <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
                <li>{meta.name}</li>
                <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
                <li aria-current="page" className="font-medium text-app-text">{config.persona.name}</li>
              </ol>
            </nav>
            <SaveChip dirty={agent.dirty} unpublished={unpublished} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" icon={Activity} onClick={() => setDrawer("activity")}>Activity</Button>
            <Link className="inline-flex h-9 items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-3 text-sm font-medium text-app-text hover:bg-app-surface-secondary focus-visible:outline-2 focus-visible:outline-app-focus" to={inboxLink}>
              {connected ? "Open inbox" : `Connect ${meta.name}`} <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            {live && <Button variant="secondary" icon={Pause} onClick={() => agent.write("pause")} disabled={busy}>Pause</Button>}
            {paused && <Button variant="secondary" icon={Play} disabled={busy || !connected} onClick={() => confirmAction("resume", "Resume replies", `Resume ${meta.name} replies using the last published settings?`)}>Resume</Button>}
            <Button variant="secondary" icon={FlaskConical} onClick={() => setDrawer("test")}>Test Agent</Button>
            <Button icon={ArrowRight} disabled={!canPublish || !unpublished} onClick={publish} title={!connected ? `Connect ${meta.name} to publish` : agent.dirty ? "Save your changes first" : !hoursValid ? "Fix the working hours first" : !unpublished ? "Nothing new to publish" : undefined}>
              {publishLabel}
            </Button>
          </div>
        </header>

        {/* agent header */}
        <section aria-label="Agent" className="flex flex-wrap items-center gap-4 rounded-xl border border-app-border! bg-app-surface p-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-app-accent-soft text-lg font-semibold text-app-accent-text" aria-hidden="true">
            {config.persona.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold text-app-text">{config.persona.name} <Badge tone={life.tone}>{life.label}</Badge></h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-sm text-app-text-muted">
              <ChannelIcon className={`size-3.5 ${meta.iconClass}`} aria-hidden="true" />
              {meta.surface} · {connected ? connectionLabel : "Not connected"}
              {connected && (live || status.label.includes("esting")) ? ` · ${aiAccess.paused ? "Replies paused" : status.label}` : ""}
            </p>
          </div>
        </section>

        <AiPausedNotice access={aiAccess} feature="AI replies" />
        {(agent.dirty || hasDraftChanges) && (
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-warning! bg-app-surface p-3 shadow-sm" role="region" aria-label="Draft changes">
            <p className="min-w-[14rem] flex-1 text-sm text-app-text">
              {agent.outdated
                ? "Settings changed in another session. Copy any edits you want to keep, then discard them to reload."
                : agent.dirty
                  ? "You have unsaved edits."
                  : `You have unpublished changes${agent.snapshot.pendingActions ? ` (including ${agent.snapshot.pendingActions} action${agent.snapshot.pendingActions > 1 ? "s" : ""})` : ""}. ${meta.name} uses the last published settings until you publish.`}
            </p>
            {agent.dirty ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" disabled={busy} onClick={agent.discard}>Discard edits</Button>
                <Button size="sm" loading={busy} disabled={agent.outdated} onClick={agent.save}>Save draft</Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" disabled={busy} onClick={() => confirmAction("discard-draft", "Discard draft changes", "Restore the last published agent settings? Saved action drafts stay until you publish or change them.", "danger")}>Discard draft changes</Button>
                <Button size="sm" disabled={!canPublish} onClick={publish}>{publishLabel}</Button>
              </div>
            )}
          </div>
        )}

        {status.state === "draft" && <SetupChecklist agent={agent} onTest={() => setDrawer("test")} onPublish={publish} canPublish={canPublish} />}

        <AgentSetup agent={agent} hid={hid} channel={channel} />
      </div>

      <Drawer open={drawer === "test"} title="Test Agent" description={`Try the agent with the settings on screen. Nothing is sent to ${meta.name}.`} onClose={() => setDrawer(null)}>
        <TestPlayground channel={channel} hid={hid} draft={agent.draft} />
      </Drawer>
      <Drawer open={drawer === "activity"} title="Activity" description="What the agent did with recent guest messages." onClose={() => setDrawer(null)}>
        {drawer === "activity" && <ActivityLog channel={channel} hid={hid} />}
      </Drawer>
    </div>
  );
};

export default AgentWorkspace;

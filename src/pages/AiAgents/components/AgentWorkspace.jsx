import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AiPausedNotice from "../../../components/AiCredits/AiPausedNotice";
import { useAiAccess } from "../../../components/AiCredits/useAiAccess";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageShell from "../../../components/ui/PageShell";
import Tabs from "../../../components/ui/Tabs";
import { useConfirm } from "../../../context/ConfirmContext";
import { useGetInstagramAccountsQuery } from "../../../redux/api/instagramApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import ActivityLog from "./ActivityLog";
import AgentSetup from "./AgentSetup";
import TestPlayground from "./TestPlayground";

const channel = "instagram";
const TABS = [{ value: "setup", label: "Setup" }, { value: "test", label: "Test" }, { value: "activity", label: "Activity" }];
const LIFE_STATES = {
  draft: { label: "Draft", tone: "purple" },
  paused: { label: "Paused", tone: "amber" },
  live: { label: "Live", tone: "green" },
};

const AgentWorkspace = ({ agent, hid }) => {
  const aiAccess = useAiAccess();
  const { confirm } = useConfirm();
  const [tab, setTab] = useState("setup");
  const { currentData: accounts = [] } = useGetInstagramAccountsQuery(hid, { refetchOnMountOrArgChange: true });
  const { config, status, connected, hasDraftChanges } = agent.snapshot;
  const life = LIFE_STATES[status.state];
  const live = status.state === "live";
  const paused = status.state === "paused";
  const busy = agent.saving;
  const canPublish = connected && !busy && !agent.dirty && (config.schedule.mode === "always" || config.schedule.days.some((day) => day.enabled));
  const publishLabel = status.state === "draft" ? "Publish agent" : "Publish changes";
  const connectionLabel = accounts.length > 1 ? `${accounts.length} accounts connected` : accounts[0]?.igUsername ? `@${accounts[0].igUsername} connected` : "Connected";

  const confirmAction = async (action, label, message, variant = "primary") => {
    if (await confirm(message, { title: label, confirmText: label, variant })) agent.write(action);
  };
  const publish = () => confirmAction("publish", publishLabel, "Apply these saved settings to Instagram DMs for this location?");

  return (
    <PageShell
      title={<span className="flex flex-wrap items-center gap-2">{config.persona.name} <Badge tone={life.tone}>{life.label}</Badge></span>}
      description={`Instagram DMs · ${connected ? connectionLabel : "Not connected"}${live && connected ? ` · ${aiAccess.paused ? "Replies paused" : status.label}` : ""}`}
      actions={(
        <>
          <Link className="px-1 text-sm text-app-text-muted hover:text-app-text" to={dashboardPath(PAGES.AI_AGENTS, { hid, query: { view: "channels" } })}>All channels</Link>
          <Link className="inline-flex h-9 items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-3 text-sm font-medium text-app-text hover:bg-app-surface-secondary" to={dashboardPath(PAGES.CHAT_INSTAGRAM, { hid })}>
            {connected ? "Open inbox" : "Connect Instagram"} <ArrowUpRight className="size-4" />
          </Link>
          {live && <Button variant="secondary" icon={Pause} onClick={() => agent.write("pause")} disabled={busy}>Pause</Button>}
          {paused && <Button icon={Play} disabled={busy || !connected} onClick={() => confirmAction("resume", "Resume replies", "Resume Instagram replies using the last published settings?")}>Resume replies</Button>}
          {status.state === "draft" && <Button icon={ArrowRight} disabled={!canPublish} onClick={publish}>{publishLabel}</Button>}
        </>
      )}
    >
      <AiPausedNotice access={aiAccess} feature="AI replies" />
      {(agent.dirty || hasDraftChanges) && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30! bg-app-surface p-3 shadow-sm" role="region" aria-label="Draft changes">
          <p className="min-w-0 flex-1 text-sm text-app-text">
            {agent.outdated ? "Settings changed in another session. Copy any edits you want to keep, then discard them to reload." : agent.dirty ? "You have unsaved edits." : "You have unpublished changes. Instagram will use the last published settings until you publish again."}
          </p>
          {agent.dirty ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" disabled={busy} onClick={agent.discard}>Discard edits</Button>
              <Button size="sm" loading={busy} disabled={agent.outdated} onClick={agent.save}>Save draft</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => confirmAction("discard-draft", "Discard draft changes", "Restore the last published settings? The saved draft changes will be removed.", "danger")}>Discard draft changes</Button>
              <Button size="sm" disabled={!canPublish} onClick={publish}>{publishLabel}</Button>
            </div>
          )}
        </div>
      )}
      {config.schedule.mode === "custom" && !config.schedule.days.some((day) => day.enabled) && (
        <p className="text-sm text-app-text-muted">Select a working day in Setup before publishing.</p>
      )}

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="border-b border-app-border! pb-2" />
      <div hidden={tab !== "setup"}><AgentSetup agent={agent} /></div>
      <div hidden={tab !== "test"}><TestPlayground channel={channel} hid={hid} draft={agent.draft} /></div>
      {tab === "activity" && <ActivityLog channel={channel} hid={hid} />}
    </PageShell>
  );
};

export default AgentWorkspace;

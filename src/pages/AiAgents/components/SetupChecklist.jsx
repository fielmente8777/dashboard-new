import { CheckCircle2, Circle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { channelMeta } from "../channelMeta";

// "Go live in a few steps": shown while the agent is a draft. Each step is
// worked out from the saved settings, so it ticks itself off.
const SetupChecklist = ({ agent, onTest, onPublish, canPublish }) => {
  const [, setParams] = useSearchParams();
  const { config, connected } = agent.snapshot;
  const meta = channelMeta(agent.channel);
  const openTab = (tab) => setParams((p) => { p.set("tab", tab); return p; });

  const steps = [
    {
      key: "skills",
      title: "Give it a job",
      hint: config.template ? "Started from a template. Fine-tune its skills any time." : "Pick goals and write what the agent should do.",
      done: Boolean(config.template || config.behaviour.instructions),
      action: <Button variant="ghost" size="sm" onClick={() => openTab("skills")}>Skills</Button>,
    },
    {
      key: "knowledge",
      title: "Teach it your hotel",
      hint: config.knowledge.website?.facts?.length ? `${config.knowledge.website.facts.length} facts from your website.` : "Read your website in one click, on top of your knowledge base.",
      done: Boolean(config.knowledge.website?.facts?.length),
      action: <Button variant="ghost" size="sm" onClick={() => openTab("knowledge")}>Train from website</Button>,
    },
    agent.channel === "whatsapp" && {
      key: "test-numbers",
      title: "Add your test number",
      hint: config.channelOptions?.testNumbers?.length ? "Message your hotel's WhatsApp from that phone to chat with this draft." : "Chat with the draft on your own phone before guests see it.",
      done: Boolean(config.channelOptions?.testNumbers?.length),
      action: <Button variant="ghost" size="sm" onClick={() => openTab("whatsapp")}>Test numbers</Button>,
    },
    {
      key: "test",
      title: "Test like a guest",
      hint: "Try real questions, typos and Hinglish in the simulator. Guests never see it.",
      done: false,
      optional: true,
      action: <Button variant="ghost" size="sm" onClick={onTest}>Test Agent</Button>,
    },
    {
      key: "connect",
      title: `Connect ${meta.name}`,
      hint: connected ? "Connected." : "Needed to publish.",
      done: connected,
      action: !connected && <Link className="text-sm font-medium text-app-accent-text hover:underline" to={dashboardPath(meta.connectPage, { query: meta.connectQuery })}>Connect</Link>,
    },
  ].filter(Boolean);
  const required = steps.filter((s) => !s.optional);
  const doneCount = required.filter((s) => s.done).length;

  return (
    <section aria-labelledby="setup-checklist-title" className="rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="setup-checklist-title" className="text-sm font-semibold text-app-text">Go live in a few steps</h2>
          <p className="text-xs text-app-text-muted">{doneCount} of {required.length} done</p>
        </div>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-app-surface-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={required.length} aria-valuenow={doneCount} aria-label="Setup progress">
          <div className="h-full rounded-full bg-app-success transition-all" style={{ width: `${(doneCount / required.length) * 100}%` }} />
        </div>
      </div>
      <ol className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => (
          <li key={step.key} className="flex items-start gap-2 rounded-lg border border-app-border! p-2.5">
            {step.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-app-success" aria-label="Done" /> : <Circle className="mt-0.5 size-4 shrink-0 text-app-text-muted" aria-label="To do" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-app-text">{step.title}{step.optional && <span className="font-normal text-app-text-muted"> (recommended)</span>}</p>
              <p className="text-xs text-app-text-muted">{step.hint}</p>
            </div>
            {!step.done && step.action}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex justify-end">
        <Button size="sm" disabled={!canPublish} onClick={onPublish} title={!connected ? `Connect ${meta.name} to publish` : undefined}>Go live</Button>
      </div>
    </section>
  );
};

export default SetupChecklist;

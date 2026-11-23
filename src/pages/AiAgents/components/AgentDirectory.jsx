import { ArrowRight, ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Field";
import PageShell from "../../../components/ui/PageShell";
import Segmented from "../../../components/ui/Segmented";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { TONE_OPTIONS } from "../agentOptions";

const settingsLink = "inline-flex w-fit items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-3 py-2 text-sm font-medium text-app-text hover:bg-app-surface-secondary";
const statuses = { uncreated: "No agent", draft: "Draft", live: "Live", paused: "Paused" };

const AgentDirectory = ({ agent, hid }) => {
  const { defaults, connected, status } = agent.snapshot;
  const canCreate = status.state === "uncreated";
  const [name, setName] = useState(defaults.persona.name);
  const [tone, setTone] = useState(defaults.persona.tone);
  const nameInput = useRef(null);
  const inbox = dashboardPath(PAGES.CHAT_INSTAGRAM, { hid });

  return (
    <PageShell title="AI Agents" description="Manage how AI replies to guests at this location.">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-pink-500/35!" title={<span className="inline-flex items-center gap-2"><FaInstagram className="size-4 text-pink-600 dark:text-pink-400" /> Instagram DMs</span>} actions={<Badge tone={status.state === "live" ? "green" : "gray"}>{statuses[status.state]}</Badge>}>
          <p className="mb-3 text-sm text-app-text-muted">Answer guest DMs using your hotel knowledge, AI training and quick replies.</p>
          <p className="mb-3 text-xs text-app-text-muted">Instagram <span className="font-medium text-app-text">{connected ? "connected" : "not connected"}</span></p>
          {canCreate ? <Button size="sm" onClick={() => nameInput.current?.focus()}>Set up</Button> : <Link className={settingsLink} to={dashboardPath(PAGES.AI_AGENTS, { hid })}>Open agent <ArrowRight className="size-4" /></Link>}
        </Card>
        <Card title={<span className="inline-flex items-center gap-2"><MessageCircle className="size-4 text-app-text-muted" /> WhatsApp</span>}>
          <p className="mb-3 text-sm text-app-text-muted">Manage WhatsApp replies and working hours.</p>
          <Link className={settingsLink} to={dashboardPath(PAGES.SETTINGS, { hid, query: { tab: "whatsapp" } })}>Open WhatsApp settings <ArrowUpRight className="size-4" /></Link>
        </Card>
        <Card title={<span className="inline-flex items-center gap-2"><Phone className="size-4 text-app-text-muted" /> Voice AI</span>}>
          <p className="mb-3 text-sm text-app-text-muted">Manage voice agent instructions for guest calls.</p>
          <Link className={settingsLink} to={dashboardPath(PAGES.AI_TRAINING, { hid })}>Open Voice AI settings <ArrowUpRight className="size-4" /></Link>
        </Card>
      </div>

      {canCreate && <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="Create your Instagram agent" description="Start with a draft. Guest replies begin after you publish.">
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (name.trim() && !agent.saving) agent.write("create", { persona: { name, tone } });
          }}>
            <Field label="Agent name">
              <Input ref={nameInput} value={name} onChange={(event) => setName(event.target.value)} required maxLength={40} disabled={agent.saving} />
            </Field>
            <Field label="Tone" as="div">
              <Segmented label="Tone" className="flex-wrap" options={TONE_OPTIONS} value={tone} onChange={setTone} disabled={agent.saving} />
            </Field>
            <Button type="submit" loading={agent.saving} disabled={!name.trim()}>Create draft <ArrowRight className="size-4" /></Button>
          </form>
        </Card>
        <Card title="Instagram connection" description="You can create a draft now. A connection is required to publish.">
          <div className="flex flex-col items-start gap-3">
            <Badge tone={connected ? "green" : "amber"}>{connected ? "Connected" : "Not connected"}</Badge>
            <Link className={settingsLink} to={inbox}>{connected ? "Open Instagram inbox" : "Connect Instagram"} <ArrowUpRight className="size-4" /></Link>
          </div>
        </Card>
      </div>}
    </PageShell>
  );
};

export default AgentDirectory;

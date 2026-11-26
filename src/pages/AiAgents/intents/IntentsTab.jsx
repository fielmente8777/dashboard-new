import { ChevronDown, Gauge, Route, Search, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";
import { useGetAiAgentIntentsQuery } from "../../../redux/api/aiAgentsApi";
import { CLASSIFIER_OPTIONS, DEFAULT_INTENT_SETTINGS, GROUP_LABELS, intentLabel, percent, SOURCE_LABELS, WORKFLOW_TONES } from "./intentModel";

const SectionTitle = ({ icon: IconComponent, children }) => (
  <span className="flex items-center gap-2">
    <IconComponent className="size-4 text-app-text-muted" aria-hidden="true" />
    {children}
  </span>
);

const formatCount = new Intl.NumberFormat().format;

// One intent: on/off, where it goes, 7-day numbers, and the business's own
// description (what the classifier reads).
const IntentRow = ({ intent, stat, enabled, description, onToggle, onDescription, open, onOpen }) => (
  <li className="py-3">
    <div className="flex flex-wrap items-center gap-3">
      <Switch
        checked={enabled}
        disabled={!intent.canDisable}
        label={`${enabled ? "Turn off" : "Turn on"} ${intentLabel(intent.key)}`}
        onChange={onToggle}
      />
      <div className="min-w-[12rem] flex-1">
        <p className={`text-sm font-medium ${enabled ? "text-app-text" : "text-app-text-muted line-through"}`}>{intentLabel(intent.key)}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-app-text-muted" title={description || intent.description}>{description || intent.description}</p>
      </div>
      <Badge tone={WORKFLOW_TONES[intent.workflow] || "gray"}>{intent.workflowLabel}</Badge>
      <span className="w-24 text-right text-xs tabular-nums text-app-text-muted" title="Detected in the last 7 days · average AI confidence">
        {stat ? `${formatCount(stat.count)} · ${percent(stat.avgConfidence)}` : "—"}
      </span>
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        aria-label={`Edit the description of ${intentLabel(intent.key)}`}
        className="rounded-md p-1 text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text focus-visible:outline-2 focus-visible:outline-app-focus"
      >
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
    </div>
    {open && (
      <Field
        label="What this means for your business"
        className="mt-3 pl-12"
        hint="The AI reads this to recognise the intent. Leave empty to use the default shown as placeholder."
      >
        <Textarea rows={2} maxLength={300} value={description} placeholder={intent.description} onChange={(e) => onDescription(e.target.value)} />
      </Field>
    )}
  </li>
);

// The Intents tab: how the agent recognises what a guest wants and which
// workflow (skills + actions) handles it. Part of the agent draft: Save draft,
// then Publish, like Personality.
const IntentsTab = ({ agent, channel, hid }) => {
  const [, setParams] = useSearchParams();
  const query = useGetAiAgentIntentsQuery({ channel, hid }, { refetchOnMountOrArgChange: true });
  const settings = { ...DEFAULT_INTENT_SETTINGS, ...(agent.draft.intents || {}) };
  const set = (key, value) => agent.set("intents", { ...settings, [key]: value });
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState(null);

  const catalogue = query.currentData;
  const stats = catalogue?.stats;
  const statByIntent = useMemo(() => Object.fromEntries((stats?.byIntent ?? []).map((s) => [s.intent, s])), [stats]);
  const disabled = new Set(settings.disabled);
  const needle = search.trim().toLowerCase();
  const groups = (catalogue?.groups ?? []).map((group) => ({
    group,
    intents: (catalogue?.intents ?? []).filter((i) => i.group === group && (!needle || `${i.key} ${i.description} ${i.workflowLabel}`.toLowerCase().includes(needle))),
  })).filter((g) => g.intents.length);

  const toggle = (key) => set("disabled", disabled.has(key) ? settings.disabled.filter((k) => k !== key) : [...settings.disabled, key]);
  const describe = (key, value) => {
    const descriptions = { ...settings.descriptions };
    if (value.trim()) descriptions[key] = value;
    else delete descriptions[key];
    set("descriptions", descriptions);
  };
  const openTab = (tab) => setParams((p) => { p.set("tab", tab); return p; });
  const lowConfidence = (stats?.byIntent ?? []).reduce((sum, s) => sum + (s.lowConfidence || 0), 0);

  return (
    <div className="space-y-4">
      <Card
        title={<SectionTitle icon={Route}>Intent detection</SectionTitle>}
        description="Before replying, the agent works out what the guest wants (English, Hindi or Hinglish), picks the matching workflow and remembers it across messages."
        actions={<Switch checked={settings.enabled} label="Detect intents" onChange={(value) => set("enabled", value)} />}
      >
        {!settings.enabled ? (
          <p className="text-sm text-app-text-muted">Intent detection is off: the agent replies the way it did before, using its skills and actions directly.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="How intents are detected" hint="Quick rules answer plain greetings and thanks for free. The AI classifier handles everything else (a small, fast model).">
                <Select options={CLASSIFIER_OPTIONS} value={settings.classifier} onChange={(e) => set("classifier", e.target.value)} />
              </Field>
              <Field label="Ask to clarify below (% confidence)" hint="When the AI is less sure than this, the agent asks one short question instead of guessing.">
                <Input
                  type="number"
                  min={0}
                  max={95}
                  step={5}
                  value={Math.round(settings.confidenceThreshold * 100)}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) set("confidenceThreshold", Math.min(0.95, Math.max(0, n / 100)));
                  }}
                />
              </Field>
            </div>
            <Field label="Clarifying question (optional)" hint='e.g. "Are you asking about rooms, the restaurant or something else?" Empty = the AI words it.'>
              <Input maxLength={300} value={settings.clarificationMessage} onChange={(e) => set("clarificationMessage", e.target.value)} />
            </Field>
            <Field label="Reply for intents you switched off (optional)" hint="Used when a guest asks for something you don't handle in this chat. Empty = the AI words it and offers your team.">
              <Input maxLength={300} value={settings.unsupportedMessage} onChange={(e) => set("unsupportedMessage", e.target.value)} />
            </Field>
            <div className="flex items-start gap-3 rounded-lg border border-app-border! p-3">
              <Switch checked={settings.narrowTools} label="Offer only the matching actions" onChange={(value) => set("narrowTools", value)} />
              <div>
                <p className="text-sm font-medium text-app-text">Offer only the matching actions</p>
                <p className="text-xs text-app-text-muted">
                  For bookings, pricing and leads the AI only sees that workflow's actions (hand-over and lead details always stay). Off = every action is available every time.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {settings.enabled && (
        <Card
          title={<SectionTitle icon={Gauge}>Last 7 days</SectionTitle>}
          description={catalogue?.model ? `Classifier model: ${catalogue.model}` : undefined}
        >
          {query.isLoading ? <Skeleton className="h-16" /> : !stats?.total ? (
            <p className="text-sm text-app-text-muted">No detected intents yet. They appear here once guests message the published agent.</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Messages classified", value: formatCount(stats.total) },
                  { label: "By AI classifier", value: formatCount(stats.bySource?.llm ?? 0) },
                  { label: "By quick rules", value: formatCount(stats.bySource?.rules ?? 0) },
                  { label: "Asked to clarify", value: formatCount(lowConfidence) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-app-border! bg-app-surface p-3">
                    <p className="text-xs text-app-text-muted">{label}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-app-text">{value}</p>
                  </div>
                ))}
              </div>
              {stats.bySource?.fallback > 0 && (
                <p className="text-xs text-app-warning">{formatCount(stats.bySource.fallback)} message(s) used the fallback ({SOURCE_LABELS.fallback.toLowerCase()}): the classifier was unavailable and the agent answered normally.</p>
              )}
              <ul className="flex flex-wrap gap-2" aria-label="Top intents">
                {stats.byIntent.slice(0, 8).map((s) => (
                  <li key={s.intent}><Badge tone="blue">{intentLabel(s.intent)} · {formatCount(s.count)}{s.avgConfidence != null ? ` · ${percent(s.avgConfidence)}` : ""}</Badge></li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {settings.enabled && (
        <Card
          title={<SectionTitle icon={Zap}>Intents and workflows</SectionTitle>}
          description="Switch off what you don't handle in this chat. Each intent goes to a workflow that uses your skills and actions."
          actions={(
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-app-text-muted" aria-hidden="true" />
              <Input className="w-56 pl-8" aria-label="Search intents" placeholder="Search intents" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
        >
          {query.isError && !catalogue ? <ErrorState message="Could not load the intents." onRetry={query.refetch} /> : query.isLoading ? (
            <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <div className="space-y-5">
              {groups.map(({ group, intents }) => (
                <section key={group} aria-labelledby={`intent-group-${group}`}>
                  <h3 id={`intent-group-${group}`} className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">{GROUP_LABELS[group]?.label || group}</h3>
                  <p className="text-xs text-app-text-muted">{GROUP_LABELS[group]?.hint}</p>
                  <ul className="mt-1 divide-y divide-app-border">
                    {intents.map((intent) => (
                      <IntentRow
                        key={intent.key}
                        intent={intent}
                        stat={statByIntent[intent.key]}
                        enabled={!disabled.has(intent.key)}
                        description={settings.descriptions[intent.key] || ""}
                        onToggle={() => toggle(intent.key)}
                        onDescription={(value) => describe(intent.key, value)}
                        open={openKey === intent.key}
                        onOpen={() => setOpenKey(openKey === intent.key ? null : intent.key)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
              {!groups.length && <p className="text-sm text-app-text-muted">No intent matches “{search}”.</p>}
            </div>
          )}
        </Card>
      )}

      {settings.enabled && catalogue?.workflows && (
        <Card title="What each workflow uses" description="Workflows guide the agent; the facts still come only from your knowledge and action results.">
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalogue.workflows.filter((w) => w.actions.length || w.requiredEntities.length).map((w) => (
              <li key={w.key} className="rounded-lg border border-app-border! p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-app-text"><Badge tone={WORKFLOW_TONES[w.key] || "gray"}>{w.label}</Badge></p>
                {w.actions.length > 0 && <p className="mt-2 text-xs text-app-text-muted">Actions: {w.actions.map(intentLabel).join(", ")}</p>}
                {w.requiredEntities.length > 0 && <p className="mt-1 text-xs text-app-text-muted">Asks for: {w.requiredEntities.map(intentLabel).join(", ")}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-app-text-muted">
            An action that is off or missing is simply not used. Turn actions on in{" "}
            <button type="button" className="text-blue-600 hover:underline dark:text-blue-400" onClick={() => openTab("actions")}>Actions</button>
            {" "}and write how to handle a conversation in{" "}
            <button type="button" className="text-blue-600 hover:underline dark:text-blue-400" onClick={() => openTab("skills")}>Skills</button>.
          </p>
        </Card>
      )}
    </div>
  );
};

export default IntentsTab;

import { ArrowDown, ArrowUp, Eye, ExternalLink, GripVertical, ListOrdered, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Switch from "../../../components/ui/Switch";
import { useConfirm } from "../../../context/ConfirmContext";
import { useGetAiAgentSkillsQuery, usePreviewAiAgentPromptMutation } from "../../../redux/api/aiAgentsApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { BLOCK_INFO, MAX_RULE_TEXT, MAX_RULE_TITLE, MAX_RULES, blankRule, dropBlock, isFixed, moveBlock, resetOrder, ruleErrors, withFixedEnds } from "./promptLayoutModel";
import MediaRepliesCard from "./MediaRepliesCard";
import PromptPreviewDrawer from "./PromptPreviewDrawer";

const CHANNEL_NAMES = { instagram: "Instagram", whatsapp: "WhatsApp" };

// The Prompt & Rules tab: every part of the system prompt as a block, in the
// order the assistant reads it. The hotel moves blocks, switches them off and
// adds its own rules for this agent. Saved with the agent draft (Save draft).
const PromptRulesTab = ({ agent, channel, hid }) => {
  const [, setParams] = useSearchParams();
  const { confirm } = useConfirm();
  const layout = agent.draft.promptLayout || [];
  const [selectedId, setSelectedId] = useState(() => layout.find((b) => b.type === "custom")?.id || "channel_instructions");
  const [dragId, setDragId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { data: skillsData } = useGetAiAgentSkillsQuery({ channel, hid });
  const [preview, previewState] = usePreviewAiAgentPromptMutation();

  const setLayout = (next) => agent.set("promptLayout", next);
  const rules = layout.filter((b) => b.type === "custom");
  const middle = layout.filter((b) => !isFixed(b));
  const selected = layout.find((b) => b.id === selectedId) || null;
  const skillsOn = (skillsData?.skills || []).filter((s) => s.draft.enabled);
  const channelName = CHANNEL_NAMES[channel] || "this channel";

  const update = (id, patch) => setLayout(layout.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const addRule = () => {
    if (rules.length >= MAX_RULES) return;
    const rule = blankRule();
    // new rules start near the top (more weight); they can be moved
    setLayout(withFixedEnds([rule, ...middle]));
    setSelectedId(rule.id);
  };

  const removeRule = async (rule) => {
    if (!(await confirm(`Delete the rule "${rule.title || "Untitled"}"?`, { title: "Delete rule", confirmText: "Delete", variant: "danger" }))) return;
    setLayout(layout.filter((b) => b.id !== rule.id));
    setSelectedId("channel_instructions");
  };

  const openPreview = () => {
    setPreviewOpen(true);
    preview({ channel, hid, config: agent.draft });
  };

  const openTab = (tab) => setParams((p) => { p.set("tab", tab); return p; });

  const blockLabel = (block) => {
    if (block.type === "custom") return block.title || "Untitled rule";
    if (block.id === "skills") return `Skills${skillsData ? ` (${skillsOn.length} on)` : ""}`;
    if (block.id === "channel_instructions") return `${channelName} instructions`;
    return BLOCK_INFO[block.id]?.title || block.id;
  };

  // a block whose content is switched off elsewhere still shows, with a note
  const offElsewhere = (block) => {
    if (block.id === "quick_replies" && !agent.draft.knowledge.useQuickReplies) return "Off in Knowledge";
    if (block.id === "ai_training" && !agent.draft.knowledge.useCustomRules) return "Off in Knowledge";
    if (block.id === "channel_instructions" && !agent.draft.behaviour.instructions) return "Empty";
    if (block.id === "website" && !agent.draft.knowledge.website?.facts?.length && !agent.draft.knowledge.website?.summary) return "Empty";
    return null;
  };

  const errorsFor = (block) => (block?.type === "custom" ? ruleErrors(block) : {});
  const anyRuleErrors = rules.some((r) => Object.keys(ruleErrors(r)).length);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-labelledby="prompt-order-title" className="min-w-0 rounded-xl border border-app-border! bg-app-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="prompt-order-title" className="flex items-center gap-2 text-base font-semibold text-app-text">
              <ListOrdered className="size-4 text-app-text-muted" aria-hidden="true" /> Prompt order
            </h2>
            <p className="text-xs text-app-text-muted">Your assistant reads these blocks from top to bottom before every reply. Drag to change the order. Blocks higher up weigh more.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" icon={Plus} disabled={rules.length >= MAX_RULES} onClick={addRule} title={rules.length >= MAX_RULES ? `At most ${MAX_RULES} rules` : undefined}>Add rule</Button>
            <Button size="sm" variant="secondary" icon={Eye} onClick={openPreview}>Preview prompt</Button>
          </div>
        </div>

        <ol className="mt-4 space-y-1.5" aria-label="Prompt blocks, in order">
          {layout.map((block, index) => {
            const fixedBlock = isFixed(block);
            const custom = block.type === "custom";
            const position = middle.findIndex((b) => b.id === block.id);
            const note = offElsewhere(block);
            const hasErrors = custom && Object.keys(ruleErrors(block)).length > 0;
            return (
              <li
                key={block.id}
                draggable={!fixedBlock}
                onDragStart={(e) => { setDragId(block.id); e.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(e) => { if (dragId && !fixedBlock) e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); if (dragId) setLayout(dropBlock(layout, dragId, block.id)); setDragId(null); }}
                onDragEnd={() => setDragId(null)}
                className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                  block.id === selectedId ? "border-app-accent! bg-app-accent-soft" : custom ? "border-purple-500/40! bg-app-surface" : "border-app-border! bg-app-surface"
                } ${fixedBlock ? "border-dashed!" : ""} ${dragId === block.id ? "opacity-50" : ""} ${!fixedBlock && !block.enabled ? "opacity-60" : ""}`}
              >
                {fixedBlock ? (
                  <Lock className="size-4 shrink-0 text-app-text-faint" aria-hidden="true" />
                ) : (
                  <GripVertical className="size-4 shrink-0 cursor-grab text-app-text-faint" aria-hidden="true" />
                )}
                <span className="w-5 shrink-0 text-right text-xs text-app-text-faint">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => setSelectedId(block.id)}
                  onKeyDown={(e) => {
                    if (fixedBlock || !e.altKey) return;
                    if (e.key === "ArrowUp") { e.preventDefault(); setLayout(moveBlock(layout, block.id, -1)); }
                    if (e.key === "ArrowDown") { e.preventDefault(); setLayout(moveBlock(layout, block.id, 1)); }
                  }}
                  aria-current={block.id === selectedId ? "true" : undefined}
                  aria-keyshortcuts={fixedBlock ? undefined : "Alt+ArrowUp Alt+ArrowDown"}
                  className="min-w-0 flex-1 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-app-focus"
                >
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-app-text">{blockLabel(block)}</span>
                    {custom && <Badge tone="purple">My rule</Badge>}
                    {custom && block.whenSkill && <Badge tone="sky">With skill</Badge>}
                    {hasErrors && <Badge tone="red">Needs attention</Badge>}
                    {note && <Badge tone="amber">{note}</Badge>}
                  </span>
                  <span className="block truncate text-xs text-app-text-muted">
                    {custom ? block.text || "Write the rule" : BLOCK_INFO[block.id]?.source}
                  </span>
                </button>
                {!fixedBlock && (
                  <span className="flex shrink-0 items-center">
                    <IconButton icon={ArrowUp} size="sm" label={`Move ${blockLabel(block)} up`} disabled={position === 0} onClick={() => setLayout(moveBlock(layout, block.id, -1))} />
                    <IconButton icon={ArrowDown} size="sm" label={`Move ${blockLabel(block)} down`} disabled={position === middle.length - 1} onClick={() => setLayout(moveBlock(layout, block.id, 1))} />
                    <Switch label={`${block.enabled ? "Turn off" : "Turn on"} ${blockLabel(block)}`} checked={block.enabled} onChange={(enabled) => update(block.id, { enabled })} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => setLayout(resetOrder(layout))}>Reset to default order</Button>
          <span className="text-xs text-app-text-faint">Keyboard: select a block, then Alt+↑ / Alt+↓. Changes are saved with Save draft.</span>
        </div>
        {anyRuleErrors && <p className="mt-2 text-xs text-app-danger" role="alert">Some rules need a title and a rule before you can save the draft.</p>}
      </section>

      <aside className="min-w-0 space-y-4">
        <MediaRepliesCard agent={agent} hid={hid} />
        {selected?.type === "custom" ? (
          <section className="rounded-xl border border-app-border! bg-app-surface p-4" aria-label="Rule editor">
            <h3 className="text-sm font-semibold text-app-text">Rule</h3>
            <p className="text-xs text-app-text-muted">Only for this {channelName} assistant. Rules for every channel belong in AI training.</p>
            <Field label="Title" className="mt-3" error={errorsFor(selected).title}>
              <Input value={selected.title} maxLength={MAX_RULE_TITLE} onChange={(e) => update(selected.id, { title: e.target.value })} placeholder="Always ask budget first" />
            </Field>
            <Field label="Rule" className="mt-3" error={errorsFor(selected).text} hint={`${(selected.text || "").length} / ${MAX_RULE_TEXT}`}>
              <Textarea rows={5} maxLength={MAX_RULE_TEXT} value={selected.text} onChange={(e) => update(selected.id, { text: e.target.value })} placeholder="Before suggesting any room, ask the guest's budget per night. If they don't say, suggest the cheapest room first." />
            </Field>
            <Field as="div" label="Use it" className="mt-3" hint="A rule tied to a skill is only in the prompt while that skill is on.">
              <Select
                aria-label="When to use this rule"
                value={selected.whenSkill || ""}
                onChange={(e) => update(selected.id, { whenSkill: e.target.value })}
                options={[{ value: "", label: "Always" }, ...(skillsData?.skills || []).map((s) => ({ value: s.key, label: `Only with skill: ${s.draft.name}` }))]}
              />
            </Field>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs text-app-text-muted">
                <Switch label={selected.enabled ? "Turn this rule off" : "Turn this rule on"} checked={selected.enabled} onChange={(enabled) => update(selected.id, { enabled })} />
                {selected.enabled ? "On" : "Off"}
              </span>
              <Button size="sm" variant="ghost" icon={Trash2} className="text-app-danger!" onClick={() => removeRule(selected)}>Delete rule</Button>
            </div>
          </section>
        ) : selected ? (
          <section className="rounded-xl border border-app-border! bg-app-surface p-4" aria-label="Block details">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-app-text">
              {isFixed(selected) && <Lock className="size-3.5 text-app-text-faint" aria-hidden="true" />}
              {blockLabel(selected)}
            </h3>
            <p className="mt-1 text-xs text-app-text-muted">{BLOCK_INFO[selected.id]?.about}</p>
            {selected.id === "channel_instructions" && (
              <Field label={`Instructions for ${channelName}`} className="mt-3" hint="Anything specific to this channel. Rules for every channel belong in AI training.">
                <Textarea
                  rows={5}
                  maxLength={3000}
                  value={agent.draft.behaviour.instructions}
                  onChange={(e) => agent.set("behaviour.instructions", e.target.value)}
                  placeholder={"e.g. Mention our weekend brunch when guests ask about food.\nShare the menu link from quick replies when asked for the menu."}
                />
              </Field>
            )}
            {BLOCK_INFO[selected.id]?.tab && (
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => openTab(BLOCK_INFO[selected.id].tab)}>
                Edit in {BLOCK_INFO[selected.id].tab === "personality" ? "Personality" : BLOCK_INFO[selected.id].tab[0].toUpperCase() + BLOCK_INFO[selected.id].tab.slice(1)}
              </Button>
            )}
            {BLOCK_INFO[selected.id]?.training && (
              <Link to={dashboardPath(PAGES.AI_TRAINING, { hid })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-app-accent-text hover:underline">
                Edit in AI training <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </section>
        ) : null}

        <section className="rounded-xl border border-app-border! bg-app-surface p-4">
          <h3 className="text-sm font-semibold text-app-text">How the order works</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-app-text-muted">
            <li>The safety rules are always first and a short reminder is always last. No rule can switch them off.</li>
            <li>When two blocks disagree, the one higher up wins.</li>
            <li>A switched-off block is left out of the prompt completely.</li>
            <li>Shorter prompts are faster and use fewer AI credits. Use Preview prompt to see the size.</li>
          </ul>
        </section>
      </aside>

      <PromptPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        preview={previewState.data}
        loading={previewState.isLoading}
        error={previewState.isError}
        onRetry={openPreview}
      />
    </div>
  );
};

export default PromptRulesTab;

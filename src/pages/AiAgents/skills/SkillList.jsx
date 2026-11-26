import { GripVertical, Plus, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "on", label: "On" },
  { value: "mine", label: "Mine" },
];

const chipClass = (active) =>
  `inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition ${
    active ? "border-app-accent! bg-app-accent-soft text-app-accent-text" : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
  }`;

// The left column: search, filters and the skills in their order. Drag a row
// (or focus it and press Alt+Up / Alt+Down) to change the order; the order is
// the order of the skills in the prompt.
const SkillList = ({ data, selectedId, onSelect, onCreate, onCreateWithAi, onToggle, onReorder }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [dragId, setDragId] = useState(null);
  const skills = data.skills;

  const counts = { all: skills.length, on: skills.filter((s) => s.draft.enabled).length, mine: skills.filter((s) => !s.isBuiltIn).length };
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (filter === "on" && !s.draft.enabled) return false;
      if (filter === "mine" && s.isBuiltIn) return false;
      return !q || `${s.draft.name} ${s.draft.summary} ${s.draft.goal}`.toLowerCase().includes(q);
    });
  }, [skills, query, filter]);
  // reordering only makes sense on the full list
  const canReorder = filter === "all" && !query.trim();

  const move = (id, delta) => {
    const ids = skills.map((s) => s.id);
    const from = ids.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= ids.length) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    onReorder(ids);
  };

  const dropOn = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const ids = skills.map((s) => s.id);
    // takes the target's place: after it when moving down, before it when moving up
    const to = ids.indexOf(targetId);
    ids.splice(ids.indexOf(dragId), 1);
    ids.splice(to, 0, dragId);
    onReorder(ids);
  };

  return (
    <section aria-labelledby="skills-title" className="min-w-0 rounded-xl border border-app-border! bg-app-surface p-4">
      <h2 id="skills-title" className="text-base font-semibold text-app-text">Skills</h2>
      <p className="text-xs text-app-text-muted">How your assistant talks, thinks and helps guests.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" icon={Plus} onClick={onCreate}>New skill</Button>
        <Button size="sm" variant="secondary" icon={Sparkles} onClick={onCreateWithAi}>Create with AI</Button>
      </div>

      <label className="relative mt-3 block">
        <span className="sr-only">Search skills</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-app-text-faint" aria-hidden="true" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills" className="pl-9" />
      </label>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Show">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)} className={chipClass(filter === f.value)}>
            {f.label} ({counts[f.value]})
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1" aria-label="Skills, in prompt order">
        {visible.map((skill) => {
          const selected = skill.id === selectedId;
          return (
            <li
              key={skill.id}
              draggable={canReorder}
              onDragStart={(e) => { setDragId(skill.id); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { if (dragId) e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); dropOn(skill.id); setDragId(null); }}
              onDragEnd={() => setDragId(null)}
              className={`group flex items-center gap-1.5 rounded-lg border p-2 transition ${
                selected ? "border-app-accent! bg-app-accent-soft" : "border-transparent! hover:bg-app-surface-secondary"
              } ${dragId === skill.id ? "opacity-50" : ""}`}
            >
              {canReorder && <GripVertical className="size-4 shrink-0 cursor-grab text-app-text-faint" aria-hidden="true" />}
              <button
                type="button"
                onClick={() => onSelect(skill.id)}
                onKeyDown={(e) => {
                  if (!canReorder || !e.altKey) return;
                  if (e.key === "ArrowUp") { e.preventDefault(); move(skill.id, -1); }
                  if (e.key === "ArrowDown") { e.preventDefault(); move(skill.id, 1); }
                }}
                aria-current={selected ? "true" : undefined}
                aria-keyshortcuts={canReorder ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
                className="min-w-0 flex-1 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-app-focus"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`truncate text-sm font-medium ${selected ? "text-app-accent-text" : "text-app-text"}`}>{skill.draft.name}</span>
                  {skill.status === "draft" && <Badge tone="purple">Not published</Badge>}
                </span>
                <span className="block truncate text-xs text-app-text-muted">
                  {skill.isBuiltIn ? "" : "Mine · "}{skill.draft.summary || skill.draft.goal}
                </span>
              </button>
              <Switch
                label={`${skill.draft.enabled ? "Turn off" : "Turn on"} ${skill.draft.name}`}
                checked={Boolean(skill.draft.enabled)}
                onChange={(enabled) => onToggle(skill, enabled)}
              />
            </li>
          );
        })}
        {!visible.length && <li className="px-2 py-6 text-center text-sm text-app-text-muted">No skills match.</li>}
      </ul>
      {canReorder && skills.length > 1 && (
        <p className="mt-3 text-xs text-app-text-faint">Drag to change the order, or select one and press Alt+↑ / Alt+↓. Skills higher up come first in the prompt.</p>
      )}
    </section>
  );
};

export default SkillList;

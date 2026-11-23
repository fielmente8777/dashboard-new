import { Copy, Download, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";
import { CATEGORIES, EXECUTOR_TYPES, categoryLabel, typeLabel } from "./actionModel";
import { iconFor } from "./actionIcons";
import RowMenu from "./RowMenu";

const FILTERS = [
  { value: "all", label: "All", count: (c) => c.all },
  { value: "enabled", label: "Enabled", count: (c) => c.enabled },
  { value: "custom", label: "Custom", count: (c) => c.custom },
];

// Left column: search, filters and the list of actions.
const ActionList = ({ data, selectedId, onSelect, onCreate, onCreateWithAi, onToggle, onDuplicate, onDelete, onExport, onImport }) => {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("all");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const list = useRef(null);
  const importInput = useRef(null);

  const actions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data?.actions || []).filter((a) => {
      if (chip === "enabled" && !a.draft.enabled) return false;
      if (chip === "custom" && a.isBuiltIn) return false;
      if (category && a.draft.category !== category) return false;
      if (type && a.draft.executor?.type !== type) return false;
      if (state && String(a.draft.enabled) !== state) return false;
      return !term || `${a.draft.name} ${a.key} ${a.draft.description}`.toLowerCase().includes(term);
    });
  }, [data, query, chip, category, type, state]);

  // Up / Down move between rows
  const onListKeyDown = (e) => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
    const rows = [...(list.current?.querySelectorAll("[data-row]") || [])];
    const index = rows.indexOf(document.activeElement);
    if (index === -1) return;
    e.preventDefault();
    rows[e.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : Math.max(0, index - 1)]?.focus();
  };

  const counts = data?.counts || { all: 0, enabled: 0, custom: 0 };

  return (
    <section aria-labelledby="actions-title" className="flex min-w-0 flex-col gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
      <div>
        <h2 id="actions-title" className="text-sm font-semibold text-app-text">Actions</h2>
        <p className="mt-0.5 text-xs text-app-text-muted">What your agent can do during a conversation, not just say.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" icon={Plus} onClick={onCreate}>Create Action</Button>
        <Button size="sm" variant="secondary" icon={Sparkles} onClick={onCreateWithAi}>Create with AI</Button>
        <input ref={importInput} type="file" accept="application/json,.json" className="hidden" aria-hidden="true" tabIndex={-1} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onImport(file); }} />
        <Button size="sm" variant="ghost" icon={Upload} onClick={() => importInput.current?.click()}>Import</Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-muted" aria-hidden="true" />
        <Input className="pl-9" type="search" aria-label="Search actions" placeholder="Search actions" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Select aria-label="Category" options={[{ value: "", label: "Category" }, ...CATEGORIES]} value={category} onChange={(e) => setCategory(e.target.value)} />
        <Select aria-label="Type" options={[{ value: "", label: "Type" }, ...EXECUTOR_TYPES.map(({ value, label }) => ({ value, label }))]} value={type} onChange={(e) => setType(e.target.value)} />
        <Select aria-label="On or off" options={[{ value: "", label: "Status" }, { value: "true", label: "On" }, { value: "false", label: "Off" }]} value={state} onChange={(e) => setState(e.target.value)} />
      </div>
      <div role="radiogroup" aria-label="Show" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={chip === f.value}
            onClick={() => setChip(f.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus ${chip === f.value ? "border-app-accent! bg-app-accent-soft text-app-accent-text" : "border-app-border! text-app-text-muted hover:text-app-text"}`}
          >
            {f.label} ({f.count(counts)})
          </button>
        ))}
      </div>

      <ul ref={list} onKeyDown={onListKeyDown} aria-label="Actions" className="-mx-1 flex max-h-[34rem] flex-col gap-1 overflow-y-auto px-1 py-0.5 lg:max-h-[calc(100vh-20rem)]">
        {actions.map((action) => {
          const ActionIcon = iconFor(action);
          const selected = action.id === selectedId;
          return (
            <li key={action.id} className={`group flex items-center gap-2 rounded-lg border px-2 py-2 transition ${selected ? "border-app-accent! bg-app-accent-soft" : "border-transparent! hover:bg-app-surface-secondary"}`}>
              <button
                type="button"
                data-row
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(action.id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-app-focus"
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-app-surface text-app-accent-text" : "bg-app-surface-secondary text-app-text-muted"}`}>
                  <ActionIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className={`truncate text-sm font-medium ${selected ? "text-app-accent-text" : "text-app-text"}`}>{action.draft.name}</span>
                    {action.status === "draft" && <span className="size-1.5 shrink-0 rounded-full bg-app-warning" title="Not published yet" aria-label="Not published yet" />}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-app-text-muted">
                    <span className="truncate">{action.isBuiltIn ? categoryLabel(action.draft.category) : `${typeLabel(action.draft.executor?.type)} · ${categoryLabel(action.draft.category)}`}</span>
                    {action.isBuiltIn && <Badge tone="gray" className="!px-1.5 !py-0 text-[10px]">Built-in</Badge>}
                  </span>
                </span>
              </button>
              <Switch label={`${action.draft.name} ${action.draft.enabled ? "on" : "off"}`} checked={action.draft.enabled} onChange={(enabled) => onToggle(action, enabled)} />
              <RowMenu
                label={`More for ${action.draft.name}`}
                items={[
                  { label: "Duplicate", icon: Copy, onSelect: () => onDuplicate(action) },
                  { label: "Export JSON", icon: Download, onSelect: () => onExport(action) },
                  { label: "Delete", icon: Trash2, danger: true, hidden: action.isBuiltIn, onSelect: () => onDelete(action) },
                ]}
              />
            </li>
          );
        })}
        {!actions.length && <li className="px-2 py-6 text-center text-xs text-app-text-muted">{data?.actions?.length ? "No action matches." : "No actions yet."}</li>}
      </ul>
    </section>
  );
};

export default ActionList;

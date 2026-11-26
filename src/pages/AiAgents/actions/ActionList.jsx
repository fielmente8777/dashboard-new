import { Copy, Download, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Chip from "../../../components/ui/Chip";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import Switch from "../../../components/ui/Switch";
import { iconFor } from "./actionIcons";
import RowMenu from "./RowMenu";
import { fill } from "./simpleCopy";
import { plainSubtitle } from "./simpleModel";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus";

// Left column: search, All / On / Mine, and the list of actions.
const ActionList = ({ data, copy, currentUser, selectedId, onSelect, onCreate, onCreateWithAi, onToggle, onDuplicate, onDelete, onExport, onImport }) => {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("all");
  const list = useRef(null);
  const importInput = useRef(null);
  const all = useMemo(() => data?.actions || [], [data]);
  const mine = (a) => Boolean(currentUser) && !a.isBuiltIn && a.createdBy === currentUser;

  const counts = { all: all.length, on: all.filter((a) => a.draft.enabled).length, mine: all.filter(mine).length };
  const actions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return all.filter((a) => {
      if (chip === "on" && !a.draft.enabled) return false;
      if (chip === "mine" && !mine(a)) return false;
      return !term || `${a.draft.name} ${a.draft.description}`.toLowerCase().includes(term);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, query, chip, currentUser]);

  // Up / Down move between rows
  const onListKeyDown = (e) => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
    const rows = [...(list.current?.querySelectorAll("[data-row]") || [])];
    const index = rows.indexOf(document.activeElement);
    if (index === -1) return;
    e.preventDefault();
    rows[e.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : Math.max(0, index - 1)]?.focus();
  };

  return (
    <Card
      id="actions-list"
      aria-labelledby="actions-title"
      className="flex min-w-0 flex-col gap-3"
      title={<span id="actions-title">{copy.list.title}</span>}
      description={copy.list.subtitle}
    >
      <div className="flex flex-wrap gap-2">
        <Button icon={Plus} onClick={onCreate}>{copy.list.create}</Button>
        <Button variant="secondary" icon={Sparkles} onClick={onCreateWithAi}>{copy.list.createAi}</Button>
        <input ref={importInput} type="file" accept="application/json,.json" className="hidden" aria-hidden="true" tabIndex={-1} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onImport(file); }} />
        <Button variant="ghost" icon={Upload} onClick={() => importInput.current?.click()}>{copy.list.import}</Button>
      </div>

      <div className="relative">
        <Icon icon={Search} tone="muted" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
        <Input className="pl-9" type="search" aria-label={copy.list.search} placeholder={copy.list.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div role="group" aria-label={copy.list.show} className="flex flex-wrap gap-2">
        {["all", "on", "mine"].map((value) => (
          <Chip key={value} selected={chip === value} onClick={() => setChip(value)}>
            {copy.list.chips[value]} ({counts[value]})
          </Chip>
        ))}
      </div>

      <ul ref={list} onKeyDown={onListKeyDown} aria-label={copy.list.title} className="-mx-1 flex max-h-[34rem] flex-col gap-1 overflow-y-auto px-1 py-0.5 lg:max-h-[calc(100vh-20rem)]">
        {actions.map((action) => {
          const ActionIcon = iconFor(action);
          const selected = action.id === selectedId;
          const name = action.draft.name;
          const subtitle = plainSubtitle(action, copy);
          return (
            <li key={action.id} className={`flex min-h-14 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${selected ? "bg-app-accent-soft" : "hover:bg-app-surface-secondary"}`}>
              <button type="button" data-row aria-current={selected ? "true" : undefined} onClick={() => onSelect(action.id)} title={name} className={`flex min-w-0 flex-1 items-center gap-3 self-stretch rounded-md text-left ${focusRing}`}>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-app-surface text-app-accent-text" : "bg-app-surface-secondary text-app-text-muted"}`}>
                  <Icon icon={ActionIcon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className={`truncate text-sm font-medium ${selected ? "text-app-accent-text" : "text-app-text"}`}>{name}</span>
                    {action.status === "draft" && <span className="size-1.5 shrink-0 rounded-full bg-app-warning" title={copy.list.notLive} aria-label={copy.list.notLive} />}
                    {action.isBuiltIn && <Badge className="ml-auto">{copy.list.builtIn}</Badge>}
                  </span>
                  <span className="block truncate text-xs text-app-text-muted" title={subtitle}>{subtitle}</span>
                </span>
              </button>
              <Switch label={fill(copy.list.state, { name, state: action.draft.enabled ? copy.header.on : copy.header.off })} checked={action.draft.enabled} onChange={(enabled) => onToggle(action, enabled)} />
              <RowMenu
                label={fill(copy.list.menu, { name })}
                items={[
                  { label: copy.list.duplicate, icon: Copy, onSelect: () => onDuplicate(action) },
                  { label: copy.list.export, icon: Download, onSelect: () => onExport(action) },
                  { label: copy.list.delete, icon: Trash2, danger: true, hidden: action.isBuiltIn, onSelect: () => onDelete(action) },
                ]}
              />
            </li>
          );
        })}
        {!actions.length && <li className="px-2 py-6 text-center text-sm text-app-text-muted">{all.length ? copy.list.noMatch : copy.list.none}</li>}
      </ul>
    </Card>
  );
};

export default ActionList;

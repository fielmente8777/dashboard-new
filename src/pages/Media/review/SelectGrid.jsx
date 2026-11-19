import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Chip from "../../../components/ui/Chip";
import { Input } from "../../../components/ui/Field";
import ImageTile from "./ImageTile";

const folderOf = (a) => a.folder || "Top folder";

// Scenario 1 grid: every staged file, with select-all, folder filter and search.
const SelectGrid = ({ session, activeId, onOpen }) => {
  const { assets, selected, edits, toggle, setMany } = session;
  const [folder, setFolder] = useState("");
  const [search, setSearch] = useState("");

  const folders = useMemo(() => {
    const counts = {};
    assets.forEach((a) => (counts[folderOf(a)] = (counts[folderOf(a)] || 0) + 1));
    return Object.entries(counts);
  }, [assets]);

  const visible = assets.filter(
    (a) => (!folder || folderOf(a) === folder) && (!search || a.sourceName.toLowerCase().includes(search.toLowerCase())),
  );
  const allOn = visible.length > 0 && visible.every((a) => selected.has(a.id));

  return (
    <div className="min-w-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-9 items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-3 text-sm font-medium">
          <input type="checkbox" checked={allOn} onChange={() => setMany(visible.map((a) => a.id), !allOn)} /> Select all
        </label>
        <Chip selected={!folder} onClick={() => setFolder("")}>All {assets.length}</Chip>
        {folders.map(([name, n]) => (
          <Chip key={name} selected={folder === name} onClick={() => setFolder(name)}>
            {name} · {n}
          </Chip>
        ))}
        <div className="relative ml-auto w-52">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search file names" className="pl-9" aria-label="Search file names" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {visible.map((a) => (
          <ImageTile
            key={a.id}
            asset={a}
            edit={edits[a.id]}
            checked={selected.has(a.id)}
            active={a.id === activeId}
            badge={a.suggestion ? `${Math.round(a.suggestion.confidence * 100)}%` : null}
            badgeTone={a.scan?.verdict === "unsure" ? "amber" : "gray"}
            subtitle={edits[a.id]?.category || a.suggestion?.category || folderOf(a)}
            onToggle={() => toggle(a.id)}
            onOpen={() => onOpen(a.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectGrid;

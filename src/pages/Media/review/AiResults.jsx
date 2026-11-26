import { useMemo } from "react";
import ImageTile from "./ImageTile";
import { VERDICT_ORDER } from "./reviewConstants";

const GROUP_STYLE = {
  include: "border-app-border! bg-app-surface",
  unsure: "border-amber-300! bg-amber-500/5",
  exclude: "border-app-border! bg-app-surface",
};

/** Item totals from the scan, as the inventory form will show them. */
const inventoryPreview = (assets, selected) => {
  const totals = {};
  assets
    .filter((a) => selected.has(a.id) && a.suggestion?.detectedItems?.length)
    .forEach((a) => {
      const where = a.suggestion.room?.identifier || a.suggestion.room?.type || "Unspecified";
      a.suggestion.detectedItems.forEach((i) => {
        const key = `${i.name}|${where}`;
        totals[key] = { name: i.name, where, qty: Math.max(totals[key]?.qty || 0, i.count) };
      });
    });
  return Object.values(totals);
};

// Scenario 2, step 2: what the AI found, grouped; the client verifies.
const AiResults = ({ session, onOpen }) => {
  const { assets, selected, edits, toggle, setMany } = session;

  const groups = useMemo(() => {
    const map = {};
    assets.forEach((a) => {
      const key = `${a.scan?.verdict || "unsure"}|${a.scan?.group || "Not sure"}`;
      (map[key] ||= { verdict: a.scan?.verdict || "unsure", name: a.scan?.group || "Not sure", items: [] }).items.push(a);
    });
    return Object.values(map).sort((x, y) => VERDICT_ORDER[x.verdict] - VERDICT_ORDER[y.verdict] || y.items.length - x.items.length);
  }, [assets]);
  const inventory = inventoryPreview(assets, selected);

  return (
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {groups.map((g) => {
          const ids = g.items.map((a) => a.id);
          const allOn = ids.every((id) => selected.has(id));
          return (
            <section key={`${g.verdict}${g.name}`} className={`space-y-3 rounded-xl border p-4 ${GROUP_STYLE[g.verdict]}`}>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-app-text">{g.verdict === "unsure" ? "Not sure — you decide" : g.verdict === "exclude" ? "Left out" : g.name}</h3>
                <span className="text-xs text-app-text-muted">{g.items.length} file{g.items.length === 1 ? "" : "s"}</span>
                <button type="button" className="ml-auto text-xs font-medium text-blue-600" onClick={() => setMany(ids, !allOn)}>
                  {allOn ? "Untick all" : "Include all"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {g.items.map((a) => (
                  <ImageTile
                    key={a.id}
                    asset={a}
                    edit={edits[a.id]}
                    checked={selected.has(a.id)}
                    badge={a.suggestion ? `${Math.round(a.suggestion.confidence * 100)}%` : null}
                    badgeTone={g.verdict === "unsure" ? "amber" : "gray"}
                    subtitle={a.scan?.reason || a.sourceName}
                    onToggle={() => toggle(a.id)}
                    onOpen={() => onOpen(a.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <aside aria-label="Inventory preview" className="hidden w-72 shrink-0 space-y-3 overflow-y-auto border-l border-app-border! bg-app-surface p-5 lg:block">
        <h3 className="text-sm font-semibold text-app-text">Inventory form preview</h3>
        {inventory.length ? (
          <table className="w-full text-xs">
            <thead className="text-left text-app-text-muted">
              <tr><th className="py-1 font-medium">Item</th><th className="py-1 font-medium">Qty</th><th className="py-1 font-medium">Where</th></tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {inventory.map((i) => (
                <tr key={`${i.name}${i.where}`}><td className="py-1.5 text-app-text">{i.name}</td><td className="py-1.5">{i.qty}</td><td className="py-1.5 text-app-text-muted">{i.where}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-app-text-muted">No items counted in the selected files.</p>
        )}
        <p className="text-xs text-app-text-muted">Counts can be corrected after import.</p>
      </aside>
    </div>
  );
};

export default AiResults;

import { Package, Search } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Field";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import useDebounce from "../../../hooks/useDebounce";
import { useGetMediaInventoryQuery } from "../../../redux/api/mediaApi";

const CONDITION_TONE = { new: "green", good: "green", worn: "amber", damaged: "red", unknown: "gray" };

// Items Claude counted in Inventory photos, per location. The quantity is the
// most seen in a single photo of that location (photos of one room overlap).
const InventoryPanel = () => {
  const [search, setSearch] = useState("");
  const q = useDebounce(search.trim(), 300);
  const { data, isLoading, error, refetch } = useGetMediaInventoryQuery(q ? { q } : {});
  const items = data?.items || [];

  return (
    <Card title="Inventory" description="Built from images in the Inventory collection. Correct an image to update its counts.">
      <div className="relative mb-3 max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items, e.g. chair" className="pl-9" aria-label="Search inventory" />
      </div>

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <ErrorState message="Inventory could not be loaded." onRetry={refetch} />
      ) : !items.length ? (
        <EmptyState icon={Package} title="No inventory yet" description="Import photos of furniture, appliances or supplies; Claude counts what it sees." />
      ) : (
        <div className="space-y-4">
          {data.totals.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {data.totals.map((t) => (
                <span key={t.name} className="rounded-lg bg-app-surface-secondary px-2.5 py-1 text-xs text-app-text">
                  {t.name}: <strong>{t.quantity}</strong>
                  {t.locations > 1 && <span className="text-app-text-muted"> in {t.locations} places</span>}
                </span>
              ))}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-app-text-muted">
                <tr>
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium">Location</th>
                  <th className="py-2 pr-3 text-right font-medium">Quantity</th>
                  <th className="py-2 pr-3 font-medium">Condition</th>
                  <th className="py-2 font-medium">Brand / model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 pr-3 text-app-text">{i.name}</td>
                    <td className="py-2 pr-3 text-app-text-muted">{i.location}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-app-text">{i.quantity}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={CONDITION_TONE[i.condition] || "gray"}>{i.condition}</Badge>
                    </td>
                    <td className="py-2 text-app-text-muted">{i.brandOrModel || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default InventoryPanel;

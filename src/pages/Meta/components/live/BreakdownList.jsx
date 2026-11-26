import { useState } from "react";
import Card from "../../../../components/ui/Card";
import Segmented from "../../../../components/ui/Segmented";
import { compact, cost, count, money } from "./metaFormat";

const MEASURES = [
  { value: "spend", label: "Spend" },
  { value: "enquiries", label: "Enquiries" },
  { value: "reach", label: "Reach" },
];

// One split of the ads (platform, placement, age and gender, region, device) as bars,
// with spend, enquiries and cost per enquiry on each line.
const BreakdownList = ({ title, description, rows = [], currency, limit = 8 }) => {
  const [measure, setMeasure] = useState("spend");
  const list = [...rows].sort((a, b) => (b[measure] || 0) - (a[measure] || 0)).slice(0, limit);
  const top = Math.max(1, ...list.map((r) => r[measure] || 0));

  return (
    <Card
      title={title}
      description={description}
      actions={rows.length > 0 && <Segmented label="Measure" options={MEASURES} value={measure} onChange={setMeasure} />}
    >
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-app-text-muted">Meta has no split for these dates.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-app-text" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-app-text-muted">
                  <span className="font-medium text-app-text">
                    {measure === "spend" ? money(row.spend, currency) : measure === "reach" ? compact(row.reach) : count(row.enquiries)}
                  </span>
                  {row.enquiries > 0 && measure !== "enquiries" && (
                    <span className="hidden sm:inline"> · {cost(row.spend / row.enquiries, currency)} / enquiry</span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-app-surface-secondary">
                <div
                  className="h-full rounded-full bg-blue-500 transition-[width] duration-500"
                  style={{ width: `${Math.max(2, ((row[measure] || 0) / top) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default BreakdownList;

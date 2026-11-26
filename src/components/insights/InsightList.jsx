import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import Card from "../ui/Card";
import Icon from "../ui/Icon";
import { Skeleton } from "../ui/States";

const TONES = {
  good: { icon: CheckCircle2, ring: "border-emerald-500/30 bg-emerald-500/[0.06]", text: "text-emerald-600 dark:text-emerald-400" },
  attention: { icon: AlertTriangle, ring: "border-amber-500/40 bg-amber-500/[0.07]", text: "text-amber-600 dark:text-amber-400" },
  info: { icon: Info, ring: "border-blue-500/30 bg-blue-500/[0.05]", text: "text-blue-600 dark:text-blue-400" },
};
const ORDER = { attention: 0, good: 1, info: 2 };

// "Highlights & needs attention": findings worked out from a report, each
// { tone: "good" | "attention" | "info", title, detail }. What needs action
// comes first. Used by the Google Analytics and Search Console pages.
const InsightList = ({ items, loading, title = "Highlights & needs attention", description, className = "" }) => {
  const sorted = [...(items || [])].sort((a, b) => ORDER[a.tone] - ORDER[b.tone]);
  const attention = sorted.filter((i) => i.tone === "attention").length;

  return (
    <Card
      title={title}
      description={description || (attention ? `${attention} ${attention === 1 ? "thing needs" : "things need"} your attention` : "Worked out from your numbers for this period")}
      className={className}
    >
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !sorted.length ? (
        <p className="text-sm text-app-text-muted">Nothing stands out for this period.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sorted.map((item) => {
            const tone = TONES[item.tone] || TONES.info;
            return (
              <li key={item.title} className={`flex gap-3 rounded-xl border p-3 ${tone.ring}`}>
                <Icon icon={tone.icon} className={`mt-0.5 shrink-0 ${tone.text}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-app-text">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-app-text-muted">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default InsightList;

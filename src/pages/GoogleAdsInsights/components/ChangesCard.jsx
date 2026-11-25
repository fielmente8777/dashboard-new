import { CheckCircle2, History, XCircle } from "lucide-react";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import { useGetAdsChangesQuery } from "../../../redux/api/googleAdsApi";
import { formatCurrency, timeAgo } from "../googleAdsUtils";

const NOUN = { campaign: "campaign", adgroup: "ad group", ad: "ad" };

const describe = (c) => {
  const n = c.ids?.length || 0;
  const what = `${n || ""} ${NOUN[c.level] || "item"}${n === 1 ? "" : "s"}`.trim();
  if (c.action === "pause") return `Paused ${what}`;
  if (c.action === "resume") return `Switched on ${what}`;
  if (c.action === "budget") return `Daily budget ${c.before != null ? `${formatCurrency(c.before)} → ` : ""}${formatCurrency(c.after)}`;
  if (c.action === "create_campaign") return `Created campaign “${c.after?.name || ""}” (paused)`;
  return c.action;
};

// The latest changes made to Google Ads from the dashboard: who, what, when,
// and Google's answer when it refused.
const ChangesCard = ({ accountId }) => {
  const changes = useGetAdsChangesQuery(accountId, { skip: !accountId });
  const list = changes.data || [];

  return (
    <Card title="Changes made here" description="Pauses, budgets and new campaigns from this dashboard">
      {changes.isLoading ? (
        <Skeleton className="h-24" />
      ) : !list.length ? (
        <p className="flex items-center gap-2 text-sm text-app-text-muted">
          <Icon icon={History} size="sm" />
          No changes yet.
        </p>
      ) : (
        <ul className="divide-y divide-app-border">
          {list.map((c, i) => (
            <li key={`${c.at}-${i}`} className="flex items-start gap-3 py-2.5">
              <Icon icon={c.ok ? CheckCircle2 : XCircle} size="sm" className={`mt-0.5 ${c.ok ? "text-emerald-500" : "text-red-500"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-app-text">{describe(c)}</p>
                {!c.ok && c.error && <p className="text-xs text-red-500">{c.error}</p>}
                <p className="text-xs text-app-text-faint">
                  {c.by || "Someone"} · {timeAgo(c.at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default ChangesCard;

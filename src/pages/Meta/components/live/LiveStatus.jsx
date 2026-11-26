import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { useToast } from "../../../../context/ToastContext";
import { getApiErrorMessage } from "../../../../redux/api/baseApi";
import { ago } from "./metaFormat";

// "Numbers from Meta, updated 12 min ago · Refresh", and a note when Meta failed and an
// older copy is shown.
const LiveStatus = ({ live }) => {
  const { showToast } = useToast();
  const data = live.data;
  if (!data) return null;

  const refresh = async () => {
    try {
      const result = await live.refresh().unwrap();
      if (result?.stale) showToast({ message: `Meta did not answer: ${result.error}`, type: "warning" });
      else if (result?.cached) showToast({ message: "These numbers were read from Meta under 2 minutes ago.", type: "info" });
      else showToast({ message: "Updated from Meta", type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not read Meta. Try again in a minute."), type: "error" });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-app-text-muted">
        <span>
          {data.snapshot?.period?.label} · numbers from Meta, updated {ago(data.builtAt)}
        </span>
        <Button size="sm" variant="ghost" icon={RefreshCw} loading={live.isRefreshing} onClick={refresh}>
          Refresh
        </Button>
      </div>
      {data.stale && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          <Icon icon={AlertTriangle} size="sm" className="mt-0.5" />
          <span>
            Meta did not answer ({data.error}). These are the numbers from {ago(data.builtAt)}.
          </span>
        </p>
      )}
    </div>
  );
};

export default LiveStatus;

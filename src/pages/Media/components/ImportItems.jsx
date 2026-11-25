import { RotateCcw } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Chip from "../../../components/ui/Chip";
import { Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../context/ToastContext";
import { MediaThumbnail } from "./MediaPreview";
import { mediaDetails } from "./mediaFormat";
import { useGetImportItemsQuery, useRetryImportItemMutation } from "../../../redux/api/mediaApi";

const STATE = {
  pending: { label: "Pending", tone: "gray" },
  stored: { label: "Imported", tone: "blue" },
  processing: { label: "Processing", tone: "blue" },
  review: { label: "Ready for review", tone: "amber" },
  done: { label: "Completed", tone: "green" },
  failed: { label: "Failed", tone: "red" },
  duplicate: { label: "Duplicate", tone: "sky" },
  skipped: { label: "Skipped", tone: "amber" },
  unsaved: { label: "Not saved yet", tone: "amber" },
  removed: { label: "Removed", tone: "gray" },
};

const when = (d) => (d ? new Date(d).toLocaleString() : "—");

// Per-image status of one import: filter by state, retry one image.
const ImportItems = ({ job, live }) => {
  const { showToast } = useToast();
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetImportItemsQuery({ id: job.id, state, page }, { pollingInterval: live ? 2500 : 0 });
  const [retry, { isLoading: retrying, originalArgs }] = useRetryImportItemMutation();

  const retryOne = async (key) => {
    try {
      await retry({ id: job.id, key }).unwrap();
      showToast({ message: "Retrying this file…", type: "success" });
    } catch (e) {
      showToast({ message: e?.data?.error || "Unable to retry this file.", type: "error" });
    }
  };

  if (isLoading) return <Skeleton className="h-24" />;
  const counts = data?.counts || {};

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Chip selected={!state} onClick={() => (setState(""), setPage(1))}>All {job.totalFound}</Chip>
        {Object.entries(counts).map(([s, n]) => (
          <Chip key={s} selected={state === s} onClick={() => (setState(s), setPage(1))}>
            {STATE[s]?.label || s} {n}
          </Chip>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-app-border!">
        <table className="w-full text-xs">
          <thead className="bg-app-surface-secondary text-left text-app-text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">File</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Details</th>
              <th className="px-3 py-2 font-medium">Updated</th>
              <th className="px-3 py-2" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {(data?.items || []).map((i) => (
              <tr key={i.key}>
                <td className="max-w-72 px-3 py-2 text-app-text" title={`${i.folderPath ? `${i.folderPath}/` : ""}${i.name}`}>
                  <span className="flex items-center gap-2">
                    <MediaThumbnail asset={i} className="size-10 shrink-0 rounded" />
                    <span className="truncate">
                      {i.folderPath && <span className="text-app-text-muted">{i.folderPath}/</span>}
                      {i.name}
                      <span className="block text-app-text-muted">{mediaDetails(i)}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2"><Badge tone={STATE[i.displayState || i.state]?.tone}>{STATE[i.displayState || i.state]?.label || i.state}</Badge></td>
                <td className="max-w-72 truncate px-3 py-2 text-app-text-muted" title={i.error || ""}>{i.error || (i.attempts > 1 ? `${i.attempts} attempts` : "—")}</td>
                <td className="whitespace-nowrap px-3 py-2 text-app-text-muted">{when(i.updatedAt)}</td>
                <td className="px-3 py-2 text-right">
                  {i.state === "failed" && !live && (
                    <Button size="sm" variant="secondary" icon={RotateCcw} loading={retrying && originalArgs?.key === i.key} onClick={() => retryOne(i.key)}>
                      Retry
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-app-text-muted">Page {page} of {data.pages}</span>
          <Button size="sm" variant="secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default ImportItems;

import { useMemo, useState } from "react";
import Tabs from "../../../components/ui/Tabs";
import { useGetMediaCollectionsQuery } from "../../../redux/api/mediaApi";
import ConnectionsPanel from "../../Media/components/ConnectionsPanel";
import ImportJobsList from "../../Media/components/ImportJobsList";
import ImportPanel from "../../Media/components/ImportPanel";
import InventoryPanel from "../../Media/components/InventoryPanel";
import MediaGallery from "../../Media/components/MediaGallery";
import ReviewDialog from "../../Media/review/ReviewDialog";

// Media inside the Knowledge Base: paste links -> review (pick + edit, or AI
// picks and the client verifies) -> images are analyzed by Claude, sorted
// into collections and stored as Knowledge Base entries.
export default function MediaTab({ draftId, unsavedCount = 0 }) {
  const [tab, setTab] = useState("library");
  const [review, setReview] = useState(null); // { jobIds, mode }
  const { data: tree } = useGetMediaCollectionsQuery(draftId);
  const jobIds = useMemo(() => review?.jobIds || [], [review]);

  return (
    <div className="space-y-5 py-5">
      {unsavedCount > 0 && (
        <div role="status" className="rounded-lg border border-amber-400/40! bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {unsavedCount} new image{unsavedCount === 1 ? " is" : "s are"} ready. Click <strong>Save changes</strong> to add {unsavedCount === 1 ? "it" : "them"} to the Knowledge Base; leaving without saving removes {unsavedCount === 1 ? "it" : "them"}.
        </div>
      )}
      <ImportPanel onStarted={(jobs, mode) => setReview({ jobIds: jobs.map((j) => j.id), mode })} />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "library", label: "Library", count: tree?.total || 0 },
          { value: "imports", label: "Imports" },
          { value: "inventory", label: "Inventory" },
          { value: "connections", label: "Connections" },
        ]}
      />
      {tab === "library" && <MediaGallery draftId={draftId} />}
      {tab === "imports" && <ImportJobsList onReview={(job) => setReview({ jobIds: [job.id], mode: job.brief ? "ai" : "manual" })} />}
      {tab === "inventory" && <InventoryPanel />}
      {tab === "connections" && <ConnectionsPanel />}

      {review && (
        <ReviewDialog
          jobIds={jobIds}
          mode={review.mode}
          draftId={draftId}
          onClose={(phase) => {
            setReview(null);
            // finished: show the new images; otherwise the import to continue later
            setTab(phase === "finished" ? "library" : "imports");
          }}
        />
      )}
    </div>
  );
}

import { Loader2 } from "lucide-react";
import { SOURCE_LABELS } from "../components/mediaUi";

const LABEL = {
  queued: "Waiting to start…",
  resolving: "Looking inside the link…",
  downloading: "Downloading previews…",
  scanning: "AI is checking the files…",
  committing: "Importing your selection…",
};

const detail = (job) => {
  if (["scanning", "committing"].includes(job.status) && job.step?.total) return `${job.step.done} of ${job.step.total} files`;
  if (job.totalFound) return `${job.totalFound} files found`;
  return SOURCE_LABELS[job.sourceType] || "";
};

// Shown while the imports are being prepared, scanned or imported.
const ReviewProgress = ({ jobs }) => (
  <div className="mx-auto flex max-w-lg flex-col gap-3 py-16">
    {jobs.map((job) => (
      <div key={job.id} className="flex items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
        {LABEL[job.status] ? <Loader2 size={20} className="shrink-0 animate-spin text-blue-600" /> : <span className="size-5 shrink-0 rounded-full bg-emerald-500" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">{LABEL[job.status] || "Ready"}</p>
          <p className="truncate text-xs text-app-text-muted" title={job.sourceUrl}>
            {detail(job)} · {job.sourceUrl}
          </p>
          {job.error && <p className="mt-1 text-xs text-red-500">{job.error}</p>}
        </div>
      </div>
    ))}
  </div>
);

export default ReviewProgress;

import { ChevronDown, ChevronRight, Cloud, Database, FolderOpen, Globe, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../context/ToastContext";
import { baseApi } from "../../../redux/api/baseApi";
import { ACTIVE_IMPORT_STATUSES, useGetMediaImportsQuery, useRetryMediaImportMutation } from "../../../redux/api/mediaApi";
import { useTenant } from "../../../hooks/useTenant";
import { MediaThumbnail } from "./MediaPreview";
import ImportItems from "./ImportItems";
import { JOB_STATUS, SOURCE_LABELS } from "./mediaUi";

const SOURCE_ICONS = { google_drive: FolderOpen, s3: Database, dropbox: Cloud, onedrive: Cloud, direct: ImageIcon, web: Globe };

const isActive = (job) => ACTIVE_IMPORT_STATUSES.includes(job.status) && !job.stalled;

const JobRow = ({ job, onReview }) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [retry, { isLoading }] = useRetryMediaImportMutation();
  const Icon = SOURCE_ICONS[job.sourceType] || Globe;
  const status = job.stalled ? { label: "Interrupted", tone: "red" } : JOB_STATUS[job.status] || { label: job.status, tone: "gray" };
  const done = job.processedCount + job.duplicateCount + job.skippedCount + job.failedCount;

  const handleRetry = async () => {
    try {
      await retry(job.id).unwrap();
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to retry this import.", type: "error" });
    }
  };

  return (
    <li className="rounded-lg border border-app-border! p-3">
      <div className="flex flex-wrap items-center gap-3">
        <Icon size={18} className="shrink-0 text-app-text-muted" aria-label={SOURCE_LABELS[job.sourceType]} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-app-text" title={job.sourceUrl}>
            {job.sourceUrl}
          </p>
          <p className="text-xs text-app-text-muted">
            {SOURCE_LABELS[job.sourceType] || job.sourceType}
            {job.totalFound > 0 && ` · ${done} of ${job.totalFound} files`}
            {job.duplicateCount > 0 && ` · ${job.duplicateCount} already in library`}
            {job.skippedCount > 0 && ` · ${job.skippedCount} skipped`}
            {job.failedCount > 0 && ` · ${job.failedCount} failed`}
            {job.truncated && " · limited to the per-import maximum"}
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
        {["awaiting_review", "scanned"].includes(job.status) && onReview && (
          <Button size="sm" onClick={() => onReview(job)}>
            Review
          </Button>
        )}
        {job.canRetry && !["awaiting_review", "scanned"].includes(job.status) && (job.failedCount > 0 || job.status === "failed" || job.stalled) && (
          <Button variant="secondary" size="sm" icon={RotateCcw} loading={isLoading} onClick={handleRetry}>
            Retry
          </Button>
        )}
      </div>

      {job.totalFound > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
        </div>
      )}

      {job.error && <p className="mt-2 text-xs text-red-500">{job.error}</p>}

      {job.title && <p className="mt-1 text-xs text-app-text-muted">Title: <span className="text-app-text">{job.title}</span></p>}

      {job.previews?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Imported files">
          {job.previews.map((p) => (
            <MediaThumbnail key={p.assetId || p.thumbUrl} asset={p} className="size-12 rounded-md border border-app-border!" />
          ))}
          {job.totalFound > job.previews.length && (
            <span className="flex size-12 items-center justify-center rounded-md bg-app-surface-secondary text-xs text-app-text-muted">+{job.totalFound - job.previews.length}</span>
          )}
        </div>
      )}

      {job.totalFound > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 text-xs text-app-text-muted hover:text-app-text">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            View status of each image ({job.totalFound})
          </button>
          {open && <ImportItems job={job} live={isActive(job)} />}
        </div>
      )}
    </li>
  );
};

// Recent imports with live progress (polls while any import runs).
const ImportJobsList = ({ onReview }) => {
  const dispatch = useDispatch();
  const { hid } = useTenant();
  const [polling, setPolling] = useState(false);
  const { data: jobs = [], isLoading, error, refetch } = useGetMediaImportsQuery({ limit: 20, hid }, { pollingInterval: polling ? 2000 : 0 });

  const activeCount = jobs.filter(isActive).length;
  const processed = jobs.reduce((sum, j) => sum + j.processedCount, 0);
  const lastProcessed = useRef(processed);

  useEffect(() => setPolling(activeCount > 0), [activeCount]);

  // new images analyzed (or an import finished): refresh the gallery and collections
  useEffect(() => {
    if (processed !== lastProcessed.current) {
      lastProcessed.current = processed;
      dispatch(baseApi.util.invalidateTags(["MediaAssets", "MediaCollections", "MediaInventory"]));
    }
  }, [processed, dispatch]);

  return (
    <Card title="Imports" description={activeCount ? `${activeCount} running…` : "Recent imports and their results."}>
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : error ? (
        <ErrorState message="Imports could not be loaded." onRetry={refetch} />
      ) : !jobs.length ? (
        <EmptyState icon={FolderOpen} title="No imports yet" description="Paste a link above to import its files." />
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} onReview={onReview} />
          ))}
        </ul>
      )}
    </Card>
  );
};

export default ImportJobsList;

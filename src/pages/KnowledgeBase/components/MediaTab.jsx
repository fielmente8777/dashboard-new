
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Link2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { API_URLS } from "../../../config/env";
import { getToken } from "../../../utils/session";

import {
  useAnalyzeKnowledgeBaseMediaMutation,
  useGetKnowledgeBaseMediaJobQuery,
  useRetryKnowledgeBaseMediaJobMutation,
} from "../../../redux/api/knowledgeBaseApi";

const DRIVE_FILES_URL = `${API_URLS.node}/api/v1/knowledgebase/media/google/files`;
const DRIVE_PREVIEW_PATH = /\/api\/v1\/knowledgebase\/media\/google\/files\/([A-Za-z0-9_-]+)\/content$/;

const JOB_ACTIVE = ["pending", "extracting", "downloading", "classifying"];
const JOB_LABELS = {
  pending: "Queued…",
  extracting: "Finding images…",
  downloading: "Downloading images…",
  classifying: "Classifying with Claude Vision…",
  completed: "Analysis complete",
  partially_completed: "Analysis finished with some failed images",
  failed: "Analysis failed",
};

/**
 * Google Drive images are served by the backend preview endpoint, which
 * needs the session token, so they are fetched as a blob instead of being
 * put straight into <img src>.
 */
function MediaImage({ asset }) {
  const driveFileId =
    asset.drive_file_id || asset.image_url?.match(DRIVE_PREVIEW_PATH)?.[1] || null;
  const [src, setSrc] = useState(driveFileId ? null : asset.image_url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!driveFileId) {
      setSrc(asset.image_url);
      return undefined;
    }

    let objectUrl = null;
    let cancelled = false;
    setFailed(false);

    fetch(`${DRIVE_FILES_URL}/${encodeURIComponent(driveFileId)}/content`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [driveFileId, asset.image_url]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-app-text-muted">
        Preview unavailable.
      </div>
    );
  }

  if (!src) {
    return <div className="h-full w-full animate-pulse bg-app-surface-secondary" />;
  }

  return (
    <img
      src={src}
      alt={asset.alt_text || asset.title || "Knowledge Base media"}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

// Same suggestions the classifier uses; it may also return its own category.
const CATEGORIES = [
  "Rooms & Accommodation",
  "Interior",
  "Exterior & Architecture",
  "Amenities & Facilities",
  "Food & Beverage",
  "Product",
  "People & Staff",
  "Events",
  "Nature & Landscape",
  "Vehicles",
  "Logo & Branding",
  "Promotion & Marketing",
  "Document & Text",
  "Other",
];

const categoryOptions = (current) =>
  current && !CATEGORIES.includes(current) ? [current, ...CATEGORIES] : CATEGORIES;

export default function MediaTab({
  mediaAssets = [],
  onChange,
}) {
  const [sources, setSources] = useState([""]);

  const [analyze, { isLoading: starting }] =
    useAnalyzeKnowledgeBaseMediaMutation();
  const [retryJob, { isLoading: retrying }] =
    useRetryKnowledgeBaseMediaJobMutation();

  const { showToast } = useToast();

  /* ---------------- background analysis job ---------------- */

  const [jobId, setJobId] = useState(null);
  const [polling, setPolling] = useState(false);

  const { data: job } = useGetKnowledgeBaseMediaJobQuery(jobId, {
    skip: !jobId,
    pollingInterval: polling ? 1500 : 0,
  });

  const jobActive = Boolean(job && JOB_ACTIVE.includes(job.status));
  const isLoading = starting || retrying || (polling && (!job || jobActive));

  // When a run finishes, add its new images to the Knowledge Base once.
  const mergedRun = useRef(null);
  useEffect(() => {
    if (!job || !polling || JOB_ACTIVE.includes(job.status)) return;
    const runKey = `${job.id}:${job.runs}`;
    if (mergedRun.current === runKey) return;
    mergedRun.current = runKey;
    setPolling(false);

    const existing = new Set(mediaAssets.map((asset) => asset.image_url));
    const added = (job.media_assets || []).filter(
      (asset) => asset.image_url && !existing.has(asset.image_url)
    );
    if (added.length) onChange([...mediaAssets, ...added]);

    const failed = job.progress?.failed || 0;
    if (job.status === "failed") {
      showToast({ message: job.error || "Media analysis failed.", type: "error" });
    } else {
      showToast({
        message: `${added.length} new images classified${failed ? `, ${failed} failed` : ""}.`,
        type: failed ? "warning" : "success",
      });
    }
  }, [job, polling, mediaAssets, onChange, showToast]);

  const handleRetry = async () => {
    if (!jobId) return;
    try {
      await retryJob(jobId).unwrap();
      setPolling(true);
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to retry the failed images.", type: "error" });
    }
  };

  const validSources = useMemo(
    () => sources.map((value) => value.trim()).filter(Boolean),
    [sources]
  );

  // Update an individual media asset
  const updateAsset = (index, patch) => {
    onChange(
      mediaAssets.map((asset, i) =>
        i === index
          ? { ...asset, ...patch }
          : asset
      )
    );
  };

  // Delete an image
  const removeAsset = (index) => {
    onChange(
      mediaAssets.filter((_, i) => i !== index)
    );
  };

  // Update source URL
  const updateSource = (index, value) => {
    setSources((current) =>
      current.map((item, i) =>
        i === index ? value : item
      )
    );
  };

  // Add another source URL
  const addSource = () => {
    setSources((current) =>
      current.length < 5
        ? [...current, ""]
        : current
    );
  };

  // Remove source URL
  const removeSource = (index) => {
    setSources((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // Analyze images using backend AI API
  const handleAnalyze = async () => {
    if (!validSources.length) {
      showToast({
        message: "Paste at least one image source URL.",
        type: "warning",
      });
      return;
    }

    const invalid = validSources.find((value) => {
      try {
        const url = new URL(value);

        return !["http:", "https:"].includes(
          url.protocol
        );
      } catch {
        return true;
      }
    });

    if (invalid) {
      showToast({
        message: "Please enter valid HTTP or HTTPS URLs.",
        type: "error",
      });
      return;
    }

    try {
      // The backend answers right away; results arrive by polling the job.
      const { job: started } = await analyze({
        sources: validSources,
      }).unwrap();

      if (!started?.id) throw new Error("The analysis could not be started.");
      mergedRun.current = null;
      setJobId(started.id);
      setPolling(true);
    } catch (error) {
      showToast({
        message:
          error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "Image classification failed.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 py-5">

      {/* SOURCE URL SECTION */}

      <section className="rounded-xl border border-app-border bg-app-surface p-5">

        <div className="flex items-center gap-2">

          <ImagePlus
            size={20}
            className="text-primary"
          />

          <div>
            <h3 className="font-semibold text-app-text">
              AI Media Intelligence
            </h3>

            <p className="text-sm text-app-text-muted">
              Extract and classify images using Claude Vision.
            </p>
          </div>

        </div>

        <div className="mt-5 space-y-3">

          {sources.map((source, index) => (
            <div
              key={index}
              className="flex gap-2"
            >

              <div className="relative flex-1">

                <Link2
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
                />

                <input
                  type="url"
                  value={source}
                  placeholder="Paste Google Drive, Amazon or website URL"
                  onChange={(event) =>
                    updateSource(index, event.target.value)
                  }
                  className="h-11 w-full rounded-lg border border-app-border bg-app-bg pl-10 pr-3 text-sm text-app-text"
                />

              </div>

              {sources.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSource(index)}
                  className="rounded-lg p-2 text-app-text-muted hover:text-red-500"
                  aria-label="Remove source URL"
                >
                  <Trash2 size={17} />
                </button>
              )}

            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <button
              type="button"
              disabled={sources.length >= 5}
              onClick={addSource}
              className="inline-flex items-center gap-1 text-sm text-primary disabled:opacity-50"
            >
              <Plus size={16} />
              Add another link
            </button>

            <Button
              icon={Sparkles}
              loading={isLoading}
              disabled={!validSources.length || isLoading}
              onClick={handleAnalyze}
            >
              Extract Images
            </Button>

          </div>

          <p className="text-xs text-app-text-muted">
            Maximum 5 links and 20 images per analysis.
            Google Drive folders must be shared as &quot;Anyone with the link&quot;.
          </p>

        </div>

        {/* ANALYSIS PROGRESS */}

        {job && (
          <div className="mt-5 rounded-lg border border-app-border bg-app-bg px-4 py-3">

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-app-text">
                {JOB_LABELS[job.status] || job.status}
              </p>
              {job.progress?.total > 0 && (
                <p className="text-xs text-app-text-muted">
                  {job.progress.classified} of{" "}
                  {job.progress.total - job.progress.duplicates - job.progress.skipped} classified
                  {job.progress.duplicates ? ` · ${job.progress.duplicates} duplicates` : ""}
                  {job.progress.skipped ? ` · ${job.progress.skipped} icons skipped` : ""}
                  {job.progress.failed ? ` · ${job.progress.failed} failed` : ""}
                </p>
              )}
            </div>

            {job.progress?.total > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.round(
                      ((job.progress.classified + job.progress.failed + job.progress.duplicates + job.progress.skipped) /
                        job.progress.total) *
                        100
                    )}%`,
                  }}
                />
              </div>
            )}

            {job.status === "failed" && job.error && (
              <p className="mt-2 text-xs text-red-500">{job.error}</p>
            )}

            {!jobActive && job.failed_items?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {job.failed_items.slice(0, 5).map((item) => (
                  <li key={item.key} className="truncate text-xs text-app-text-muted">
                    <span className="text-app-text">{item.alt_text || item.image_url}</span>
                    {": "}
                    {item.error}
                  </li>
                ))}
              </ul>
            )}

            {!jobActive && job.can_retry && (
              <div className="mt-3">
                <Button variant="secondary" size="sm" loading={retrying} onClick={handleRetry}>
                  Retry failed images
                </Button>
              </div>
            )}

          </div>
        )}

      </section>

      {/* CLASSIFIED IMAGES SECTION */}

      <section>

        <div className="mb-4">
          <h3 className="font-semibold text-app-text">
            Classified Media
          </h3>

          <p className="text-sm text-app-text-muted">
            {mediaAssets.length} images classified.
            Edit their details before saving your Knowledge Base.
          </p>
        </div>

        {!mediaAssets.length ? (

          <div className="rounded-xl border border-dashed border-app-border px-5 py-12 text-center">

            <ImagePlus
              className="mx-auto mb-3 text-app-text-muted"
              size={28}
            />

            <p className="font-medium text-app-text">
              No media analyzed yet
            </p>

            <p className="text-sm text-app-text-muted">
              Add a source URL to get started.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {mediaAssets.map((asset, index) => (

              <article
                key={`${asset.image_url || "image"}-${index}`}
                className="overflow-hidden rounded-xl border border-app-border bg-app-surface"
              >

                {/* IMAGE PREVIEW */}

                <div className="aspect-[4/3] bg-app-surface-secondary">

                  <MediaImage asset={asset} />

                </div>

                {/* IMAGE DETAILS */}

                <div className="space-y-3 p-3">

                  {/* CARD HEADER */}

                  <div className="flex items-center justify-between gap-2">

                    <p className="text-sm font-semibold text-app-text">
                      Image Details
                    </p>

                    <button
                      type="button"
                      onClick={() => removeAsset(index)}
                      className="text-app-text-muted hover:text-red-500"
                      aria-label="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                  {/* EDITABLE CATEGORY */}

                  <label className="block text-xs text-app-text-muted">

                    Category

                    <select
                      value={asset.category || "Other"}
                      onChange={(event) =>
                        updateAsset(index, {
                          category: event.target.value,
                        })
                      }
                      className="mt-1 h-9 w-full rounded-md border border-app-border bg-app-bg px-2 text-sm text-app-text"
                    >

                      {categoryOptions(asset.category).map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}

                    </select>

                  </label>

                  {/* EDITABLE IMAGE TITLE */}

                  <label className="block text-xs text-app-text-muted">

                    Image Title

                    <input
                      type="text"
                      value={asset.title || ""}
                      onChange={(event) =>
                        updateAsset(index, {
                          title: event.target.value,
                        })
                      }
                      placeholder="Enter image title"
                      className="mt-1 h-9 w-full rounded-md border border-app-border bg-app-bg px-2 text-sm text-app-text"
                    />

                  </label>

                  {/* EDITABLE IMAGE DESCRIPTION */}

                  <label className="block text-xs text-app-text-muted">

                    Image Description

                    <textarea
                      value={asset.description || ""}
                      onChange={(event) =>
                        updateAsset(index, {
                          description: event.target.value,
                        })
                      }
                      placeholder="Describe this image..."
                      rows={3}
                      className="mt-1 w-full resize-y rounded-md border border-app-border bg-app-bg p-2 text-sm text-app-text"
                    />

                  </label>

                  {/* AI CLASSIFICATION STATUS */}

                  <div className="flex justify-between text-xs text-app-text-muted">

                    <span>
                      {asset.status === "review_required"
                        ? "Needs review"
                        : "AI classified"}
                    </span>

                    <span>
                      {Math.round(
                        (asset.confidence || 0) * 100
                      )}
                      % confidence
                    </span>

                  </div>

                  {/* TAGS */}

                  {!!asset.tags?.length && (
                    <div className="flex flex-wrap gap-1">

                      {asset.tags.slice(0, 5).map((tag, tagIndex) => (
                        <span
                          key={`${tag}-${tagIndex}`}
                          className="rounded-full bg-app-surface-secondary px-2 py-1 text-xs text-app-text-muted"
                        >
                          {tag}
                        </span>
                      ))}

                    </div>
                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

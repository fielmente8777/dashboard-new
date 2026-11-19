// Labels and colours shared by the Media page components.

export const SOURCE_LABELS = {
  google_drive: "Google Drive",
  s3: "Amazon S3",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
  direct: "Image link",
  web: "Web page",
};

export const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  ...Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label })),
];

export const JOB_STATUS = {
  queued: { label: "Queued", tone: "gray" },
  resolving: { label: "Resolving", tone: "blue" },
  downloading: { label: "Downloading", tone: "blue" },
  analyzing: { label: "Analyzing", tone: "purple" },
  awaiting_review: { label: "Waiting for your review", tone: "amber" },
  scanning: { label: "AI checking", tone: "purple" },
  scanned: { label: "AI results ready", tone: "amber" },
  committing: { label: "Importing", tone: "blue" },
  done: { label: "Done", tone: "green" },
  partial: { label: "Partial", tone: "amber" },
  failed: { label: "Failed", tone: "red" },
};

export const ASSET_STATUS = {
  ready: { label: "Ready", tone: "green" },
  needs_review: { label: "Needs review", tone: "amber" },
  failed: { label: "Failed", tone: "red" },
};

/** Options for "move to collection": every collection and nested collection. */
export const collectionChoices = (collections = []) =>
  collections.flatMap((c) => [
    { value: c.id, label: c.name },
    ...(c.children || []).map((s) => ({ value: s.id, label: `${c.name} › ${s.name}` })),
  ]);

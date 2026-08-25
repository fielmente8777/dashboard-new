import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  MessageSquare,
  Upload,
  Edit,
  Trash2,
  X,
  Paperclip,
} from "lucide-react";
import { NEW_BASE_URL } from "../../../../data/constant";
import { useToast } from "../../../../context/ToastContext";
import Loader from "../../../../components/Loader";
import { useConfirm } from "../../../../context/ConfirmContext";

/* ── shared presentation tokens ─────────────────────────────── */
const FIELD =
  "w-full min-w-0 rounded-[var(--r-md)] border border-app-border bg-app-surface p-[var(--sp-3)] text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const LABEL = "font-medium text-[length:var(--fs-sm)] text-app-text";
const PILL =
  "flex items-center gap-1 text-[length:var(--fs-xs)] px-[var(--sp-2)] py-1 rounded-full whitespace-nowrap";

const LIMITS = {
  image: {
    max: 5 * 1024 * 1024,
    accept: "image/jpeg,image/png,image/PNG, image/jpg",
    label: "5MB per image",
  },
  video: { max: 10 * 1024 * 1024, accept: "video/*", label: "10MB per video" },
  document: {
    max: 10 * 1024 * 1024,
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
    label: "10MB per document",
  },
};

const emptyForm = () => ({
  id: null,
  title: "",
  text: "",
  images: [],
  videos: [],
  documents: [],
});

const fileId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const seedReplies = [
  {
    id: 1,
    title: "Welcome",
    text: "Hello 👋 Welcome to Eazotel! Here's a quick look at our property.",
    images: [
      { id: "seed-1", name: "lobby.jpg", size: 812000, url: null },
      { id: "seed-2", name: "room-101.jpg", size: 640000, url: null },
    ],
    videos: [],
    documents: [{ id: "seed-3", name: "brochure.pdf", size: 2_400_000 }],
  },
  {
    id: 2,
    title: "Booking Confirmation",
    text: "Your booking is confirmed. See attached voucher and directions video.",
    images: [],
    videos: [{ id: "seed-4", name: "directions.mp4", size: 9_400_000 }],
    documents: [{ id: "seed-5", name: "voucher.pdf", size: 340000 }],
  },
];

const AttachmentThumb = ({ file, kind, onRemove }) => (
  <div className="relative group flex items-center gap-2 border border-app-border rounded-[var(--r-md)] p-2 pr-3 bg-app-surface">
    <div className="w-9 h-9 rounded-[var(--r-sm)] bg-app-surface-secondary flex items-center justify-center shrink-0 overflow-hidden">
      {kind === "image" && file.url ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : kind === "image" ? (
        <ImageIcon size={16} className="text-gray-400 dark:text-app-text-faint" />
      ) : kind === "video" ? (
        <VideoIcon size={16} className="text-gray-400 dark:text-app-text-faint" />
      ) : (
        <FileText size={16} className="text-gray-400 dark:text-app-text-faint" />
      )}
    </div>
    <div className="min-w-0">
      <p className="text-[length:var(--fs-sm)] font-medium truncate max-w-[8.75rem] text-app-text">
        {file.name}
      </p>
      <p className="text-[length:var(--fs-xs)] text-gray-400 dark:text-app-text-faint">
        {formatBytes(file.size)}
      </p>
    </div>
    {onRemove && (
      <button
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute -top-2 -right-2 bg-app-surface border border-app-border rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 transition-opacity"
        title="Remove"
      >
        <X size={14} className="text-red-500" />
      </button>
    )}
  </div>
);

const UploadZone = ({ kind, onFiles }) => {
  const inputRef = useRef(null);
  const { accept, label } = LIMITS[kind];
  const icon =
    kind === "image" ? (
      <ImageIcon size={18} />
    ) : kind === "video" ? (
      <VideoIcon size={18} />
    ) : (
      <FileText size={18} />
    );

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    onFiles(files);
    e.target.value = "";
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-app-border rounded-[var(--r-md)] p-[var(--sp-4)] flex flex-wrap items-center justify-center gap-2 text-gray-500 dark:text-app-text-faint hover:border-primary hover:text-primary transition-colors"
      >
        {icon}
        <span className="text-[length:var(--fs-sm)] font-medium">
          Add {kind}
        </span>
        <span className="text-[length:var(--fs-xs)] text-gray-400 dark:text-app-text-faint">
          ({label})
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={accept}
        onChange={handleChange}
      />
    </div>
  );
};

const QuickReplies = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [replies, setReplies] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [fileError, setFileError] = useState("");

  const [creating, setCreating] = useState(false);

  const totalAttachments = (r) =>
    r?.images?.length + r?.videos?.length + r?.documents?.length;

  const startCreate = () => {
    setForm(emptyForm());
    setFileError("");
    setActiveTab("create");
  };

  const startEdit = (reply) => {
    console.log("reply", reply);

    const editForm = {
      id: reply._id,
      title: reply.title,
      text: "",
      shortcut: reply.shortcut || "",
      images: [],
      videos: [],
      documents: [],
    };

    reply.items.forEach((item) => {
      if (item.type === "text") {
        editForm.text = item.text;
      }

      if (item.type === "image") {
        editForm.images = item.media.map((m, index) => ({
          id: `img-${index}`,
          name: m.fileName,
          size: m.size || 0,
          url: m.url,
          mimeType: m.mimeType,
          existing: true,
        }));
      }

      if (item.type === "video") {
        editForm.videos = item.media.map((m, index) => ({
          id: `vid-${index}`,
          name: m.fileName,
          size: m.size || 0,
          url: m.url,
          mimeType: m.mimeType,
          existing: true,
        }));
      }

      if (item.type === "document") {
        editForm.documents = item.media.map((m, index) => ({
          id: `doc-${index}`,
          name: m.fileName,
          size: m.size || 0,
          url: m.url,
          mimeType: m.mimeType,
          existing: true,
        }));
      }
    });

    setForm(editForm);
    setFileError("");
    setActiveTab("create");
  };

  const removeReply = async (id) => {
    const isConfirmed = await confirm(
      `Are you sure you want to delete this quick reply`,
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/quick-reply/${id}?hid=${localStorage.getItem("hid")}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data?.success) {
        showToast({
          message: data?.responseMessage || "Quick reply deleted successfully",
          type: "success",
        });

        // setReplies((prev) => prev.filter((r) => r._id !== id));
        return;
      }

      showToast({
        message: data?.responseMessage || "Failed to delete quick reply",
        type: "error",
      });
    } catch (error) {
      showToast({
        message: error?.message || "Failed to delete quick reply",
        type: "error",
      });
    }
  };

  const addFiles = (kind, incoming) => {
    const { max } = LIMITS[kind];
    const key =
      kind === "image" ? "images" : kind === "video" ? "videos" : "documents";
    const tooBig = incoming.filter((f) => f.size > max);
    const ok = incoming.filter((f) => f.size <= max);

    if (tooBig.length) {
      setFileError(
        `${tooBig.map((f) => f.name).join(", ")} exceed${tooBig.length === 1 ? "s" : ""} the ${LIMITS[kind].label} limit and was skipped.`,
      );
    } else {
      setFileError("");
    }

    const mapped = ok.map((f) => ({
      id: fileId(),
      name: f.name,
      size: f.size,
      file: f,
      url: kind === "image" ? URL.createObjectURL(f) : undefined,
    }));

    setForm((prev) => ({ ...prev, [key]: [...prev[key], ...mapped] }));
  };

  const removeFile = (kind, id) => {
    const key =
      kind === "image" ? "images" : kind === "video" ? "videos" : "documents";
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((f) => f.id !== id),
    }));
  };

  const charLimit =
    form?.images?.length + form?.videos?.length + form?.documents?.length > 0
      ? 1024
      : 4096;

  const canSave =
    form?.title?.trim().length > 0 &&
    (form?.text?.trim().length > 0 || totalAttachments(form) > 0);

  const handleSave = async () => {
    if (!canSave) return;

    setCreating(true);

    try {
      const isEdit = !!form.id;

      const payload = new FormData();

      payload.append("title", form.title);
      payload.append("text", form.text);
      payload.append("shortcut", form.shortcut || "");

      // Existing media
      const existingMedia = [];

      // New files + existing files
      [...form.images, ...form.videos, ...form.documents].forEach((item) => {
        if (item.existing) {
          existingMedia.push({
            url: item.url,
            fileName: item.name,
            mimeType: item.mimeType,
            size: item.size,
          });
        } else {
          payload.append("file", item.file);
        }
      });

      payload.append("media", JSON.stringify(existingMedia));

      const response = await fetch(
        isEdit
          ? `${NEW_BASE_URL}/api/v1/quick-reply/${form.id}?hid=${localStorage.getItem("hid")}`
          : `${NEW_BASE_URL}/api/v1/quick-reply?hid=${localStorage.getItem("hid")}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: payload,
        },
      );

      const data = await response.json();

      if (data?.success) {
        showToast({
          message:
            data?.responseMessage ||
            (isEdit
              ? "Quick reply updated successfully"
              : "Quick reply created successfully"),
          type: "success",
        });

        fetchReplies();

        setForm(emptyForm());

        setActiveTab("list");

        return;
      }

      showToast({
        message:
          data?.responseMessage ||
          (isEdit
            ? "Failed to update quick reply"
            : "Failed to create quick reply"),
        type: "error",
      });
    } catch (error) {
      console.log(error);

      showToast({
        message: error?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const fetchReplies = async () => {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/quick-reply?hid=${localStorage.getItem("hid")}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();

    if (data?.success) {
      setReplies(data?.result?.docs);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  // const filteredReplies = replies.filter((r) =>
  //   r.title.toLowerCase().includes(search.toLowerCase()),
  // );

  return (
    <div className="py-[var(--sp-4)]">
      <div className="bg-app-surface">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-[var(--sp-3)] border-b border-app-border p-[var(--sp-5)]">
          <div className="min-w-0">
            <h2 className="text-[length:var(--fs-xl)] font-bold text-app-text">
              Quick Replies
            </h2>
            <p className="text-gray-500 dark:text-app-text-faint text-[length:var(--fs-sm)]">
              Build reusable templates with text, images, videos and documents
            </p>
          </div>

          <button
            onClick={startCreate}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-[var(--sp-5)] py-[var(--sp-2)] rounded-[var(--r-md)] text-[length:var(--fs-sm)] font-medium transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            <Plus size={18} />
            New Reply
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-app-border overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-[var(--sp-5)] py-[var(--sp-3)] text-[length:var(--fs-sm)] whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === "list"
                ? "border-primary font-semibold text-primary dark:text-app-text"
                : "border-transparent text-gray-500 dark:text-app-text-faint hover:text-app-text"
            }`}
          >
            Existing Replies
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-[var(--sp-5)] py-[var(--sp-3)] text-[length:var(--fs-sm)] whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === "create"
                ? "border-primary font-semibold text-primary dark:text-app-text"
                : "border-transparent text-gray-500 dark:text-app-text-faint hover:text-app-text"
            }`}
          >
            {form.id ? "Edit Reply" : "Create Reply"}
          </button>
        </div>

        {/* Existing Replies */}
        {activeTab === "list" && (
          <div className="p-[var(--sp-5)]">
            <div className="relative mb-[var(--sp-5)]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-app-text-faint pointer-events-none"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search replies..."
                className={`${FIELD} pl-10`}
              />
            </div>

            {replies.length === 0 ? (
              <div className="text-center py-[var(--sp-6)] text-[length:var(--fs-sm)] text-gray-400 dark:text-app-text-faint">
                No quick replies yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-[var(--sp-4)]">
                {replies &&
                  replies.length > 0 &&
                  replies?.map((item) => {
                    const textItem = item.items?.find((i) => i.type === "text");

                    const mediaItem = item.items.find((i) =>
                      ["image", "video", "document"].includes(i.type),
                    );

                    const mediaCount = mediaItem?.media?.length || 0;

                    return (
                      <div
                        key={item._id}
                        className="border border-app-border rounded-[var(--r-md)] p-[var(--sp-4)] bg-app-surface hover:border-primary/40 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-[var(--sp-4)]">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-[length:var(--fs-base)] text-app-text break-words">
                              {item.title}
                            </h3>

                            {textItem?.text && (
                              <p className="text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-faint mt-1 line-clamp-2 break-words">
                                {textItem.text}
                              </p>
                            )}

                            {mediaItem && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {mediaItem.type === "image" && (
                                  <span
                                    className={`${PILL} bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300`}
                                  >
                                    <ImageIcon size={12} />
                                    {mediaCount} Image
                                    {mediaCount > 1 ? "s" : ""}
                                  </span>
                                )}

                                {mediaItem.type === "video" && (
                                  <span
                                    className={`${PILL} bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300`}
                                  >
                                    <VideoIcon size={12} />
                                    {mediaCount} Video
                                    {mediaCount > 1 ? "s" : ""}
                                  </span>
                                )}

                                {mediaItem.type === "document" && (
                                  <span
                                    className={`${PILL} bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300`}
                                  >
                                    <FileText size={12} />
                                    {mediaCount} Document
                                    {mediaCount > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEdit(item)}
                              aria-label="Edit quick reply"
                              className="p-2 rounded-[var(--r-md)] bg-app-surface-secondary text-app-text hover:bg-app-surface border border-app-border transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() => removeReply(item._id)}
                              aria-label="Delete quick reply"
                              className="p-2 rounded-[var(--r-md)] bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Create / Edit */}
        {activeTab === "create" && (
          <div className="p-[var(--sp-5)] space-y-[var(--sp-5)]">
            <div>
              <label className={`${LABEL} block mb-2`}>Reply Name</label>
              <input
                className={FIELD}
                placeholder="Welcome Message"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2 mb-2">
                <label className={LABEL}>Message text</label>
                <span
                  className={`text-[length:var(--fs-xs)] shrink-0 ${
                    form?.text?.length > charLimit
                      ? "text-red-500"
                      : "text-gray-400 dark:text-app-text-faint"
                  }`}
                >
                  {form?.text?.length}/{charLimit}
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={charLimit}
                className={`${FIELD} resize-y`}
                placeholder="Type your quick reply... (sent as a caption if attachments are included)"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Paperclip
                  size={16}
                  className="shrink-0 text-gray-400 dark:text-app-text-faint"
                />
                <label className={LABEL}>Attachments</label>
                <span className="text-[length:var(--fs-xs)] text-gray-400 dark:text-app-text-faint">
                  Mix and match — this reply will send as{" "}
                  {Math.max(1, totalAttachments(form))} message
                  {totalAttachments(form) > 1 ? "s" : ""} on WhatsApp
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--sp-3)] mb-[var(--sp-4)]">
                <UploadZone
                  kind="image"
                  onFiles={(f) => addFiles("image", f)}
                />
                <UploadZone
                  kind="video"
                  onFiles={(f) => addFiles("video", f)}
                />
                <UploadZone
                  kind="document"
                  onFiles={(f) => addFiles("document", f)}
                />
              </div>

              {fileError && (
                <p className="text-[length:var(--fs-sm)] text-red-500 mb-3">
                  {fileError}
                </p>
              )}

              {totalAttachments(form) > 0 && (
                <div className="space-y-[var(--sp-3)]">
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-[var(--sp-3)]">
                      {form.images.map((f) => (
                        <AttachmentThumb
                          key={f.id}
                          file={f}
                          kind="image"
                          onRemove={() => removeFile("image", f.id)}
                        />
                      ))}
                    </div>
                  )}
                  {form.videos.length > 0 && (
                    <div className="flex flex-wrap gap-[var(--sp-3)]">
                      {form.videos.map((f) => (
                        <AttachmentThumb
                          key={f.id}
                          file={f}
                          kind="video"
                          onRemove={() => removeFile("video", f.id)}
                        />
                      ))}
                    </div>
                  )}
                  {form.documents.length > 0 && (
                    <div className="flex flex-wrap gap-[var(--sp-3)]">
                      {form.documents.map((f) => (
                        <AttachmentThumb
                          key={f.id}
                          file={f}
                          kind="document"
                          onRemove={() => removeFile("document", f.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-[var(--sp-3)] pt-[var(--sp-4)] border-t border-app-border">
              <button
                onClick={() => setActiveTab("list")}
                className="px-[var(--sp-5)] py-[var(--sp-3)] border border-app-border text-app-text rounded-[var(--r-md)] text-[length:var(--fs-sm)] hover:bg-app-surface-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || creating}
                className="bg-primary/80 hover:bg-primary text-white px-[var(--sp-5)] py-[var(--sp-3)] rounded-[var(--r-md)] text-[length:var(--fs-sm)] font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
              >
                Save Reply {creating && <Loader size={22} color="#fefefe" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickReplies;
import {
  FileText,
  Image as ImageIcon,
  MessageSquareText,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Dialog from "../../../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../../../../components/ui/States";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import {
  useDeleteQuickReplyMutation,
  useGetQuickRepliesQuery,
  useSaveQuickReplyMutation,
} from "../../../../redux/api/whatsappApi";
import { getApiErrorMessage } from "../../../../redux/api/baseApi";

const KINDS = {
  image: { key: "images", icon: ImageIcon, max: 5 * 1024 * 1024, accept: "image/jpeg,image/png", limit: "5 MB", tone: "purple" },
  video: { key: "videos", icon: VideoIcon, max: 10 * 1024 * 1024, accept: "video/*", limit: "10 MB", tone: "amber" },
  document: { key: "documents", icon: FileText, max: 10 * 1024 * 1024, accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx", limit: "10 MB", tone: "green" },
};

const emptyForm = () => ({ id: null, title: "", text: "", shortcut: "", images: [], videos: [], documents: [] });
const fileId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const attachmentCount = (form) => form.images.length + form.videos.length + form.documents.length;

const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// a thrown Error keeps its message; an API error shows what the server said
const errorText = (error, fallback) => getApiErrorMessage(error, error?.message || fallback);

// a saved reply as the form edits it
const toForm = (reply) => {
  const form = { ...emptyForm(), id: reply._id, title: reply.title, shortcut: reply.shortcut || "" };
  reply.items?.forEach((item) => {
    if (item.type === "text") form.text = item.text;
    const kind = KINDS[item.type];
    if (kind) {
      form[kind.key] = item.media.map((m, index) => ({
        id: `${item.type}-${index}`,
        name: m.fileName,
        size: m.size || 0,
        url: m.url,
        mimeType: m.mimeType,
        existing: true,
      }));
    }
  });
  return form;
};

const AttachmentChip = ({ file, kind, onRemove }) => (
  <div className="flex items-center gap-2 rounded-lg border border-app-border! p-1.5 pr-2">
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-app-surface-secondary text-app-text-faint">
      {kind === "image" && file.url ? (
        <img src={file.url} alt="" className="size-full object-cover" />
      ) : (
        <Icon icon={KINDS[kind].icon} size="sm" />
      )}
    </span>
    <div className="min-w-0">
      <p className="max-w-36 truncate text-xs font-medium text-app-text">{file.name}</p>
      <p className="text-[11px] text-app-text-faint">{formatBytes(file.size)}</p>
    </div>
    <IconButton icon={X} label={`Remove ${file.name}`} size="sm" onClick={onRemove} className="size-6" />
  </div>
);

// Create or edit one quick reply.
const ReplyDialog = ({ form, setForm, open, onClose, onSave, saving }) => {
  const { showToast } = useToast();
  const inputs = { image: useRef(null), video: useRef(null), document: useRef(null) };

  const addFiles = (kind, files) => {
    const { key, max, limit } = KINDS[kind];
    const tooBig = files.filter((f) => f.size > max);
    if (tooBig.length) {
      showToast({ message: `${tooBig.map((f) => f.name).join(", ")} is over ${limit} and was skipped.`, type: "error" });
    }
    const added = files
      .filter((f) => f.size <= max)
      .map((f) => ({
        id: fileId(),
        name: f.name,
        size: f.size,
        file: f,
        url: kind === "image" ? URL.createObjectURL(f) : undefined,
      }));
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ...added] }));
  };

  const removeFile = (kind, id) =>
    setForm((prev) => ({ ...prev, [KINDS[kind].key]: prev[KINDS[kind].key].filter((f) => f.id !== id) }));

  const count = attachmentCount(form);
  const canSave = form.title.trim() && (form.text.trim() || count > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={form.id ? "Edit quick reply" : "New quick reply"}
      description="Your team can send this in a chat with one click."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={saving} disabled={!canSave}>
            Save reply
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" hint="Only your team sees this.">
          <Input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Directions to the hotel"
          />
        </Field>

        <Field label="Message" hint={count ? "Sent as the caption of the attachments." : undefined}>
          <Textarea
            rows={4}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Type the message your team will send…"
          />
        </Field>

        <Field as="div" label="Attachments (optional)">
          <div className="flex flex-wrap gap-2">
            {Object.entries(KINDS).map(([kind, { icon, accept, limit }]) => (
              <span key={kind}>
                <Button
                  variant="dashed"
                  size="sm"
                  icon={icon}
                  onClick={() => inputs[kind].current?.click()}
                >
                  Add {kind} <span className="text-app-text-faint">(≤ {limit})</span>
                </Button>
                <input
                  ref={inputs[kind]}
                  type="file"
                  multiple
                  hidden
                  accept={accept}
                  onChange={(e) => {
                    addFiles(kind, Array.from(e.target.files || []));
                    e.target.value = "";
                  }}
                />
              </span>
            ))}
          </div>
          {count > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.keys(KINDS).flatMap((kind) =>
                form[KINDS[kind].key].map((file) => (
                  <AttachmentChip key={file.id} file={file} kind={kind} onRemove={() => removeFile(kind, file.id)} />
                )),
              )}
            </div>
          )}
          {count > 1 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-app-text-muted">
              <Icon icon={Paperclip} size="xs" /> Sends as {count} WhatsApp messages.
            </p>
          )}
        </Field>
      </div>
    </Dialog>
  );
};

// Saved replies (text and attachments) the team sends from the chat.
const QuickReplies = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const hid = localStorage.getItem("hid");
  const list = useGetQuickRepliesQuery(hid, { refetchOnMountOrArgChange: true });
  const [saveQuickReply, { isLoading: saving }] = useSaveQuickReplyMutation();
  const [deleteQuickReply] = useDeleteQuickReplyMutation();
  const replies = list.data || [];
  const loading = list.isLoading;
  const failed = list.isError;
  const load = list.refetch;

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);

  const openForm = (reply) => {
    setForm(reply ? toForm(reply) : emptyForm());
    setEditing(true);
  };

  const save = async () => {
    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("text", form.text);
      payload.append("shortcut", form.shortcut || "");
      const existing = [];
      [...form.images, ...form.videos, ...form.documents].forEach((item) => {
        if (item.existing) {
          existing.push({ url: item.url, fileName: item.name, mimeType: item.mimeType, size: item.size });
        } else {
          payload.append("file", item.file);
        }
      });
      payload.append("media", JSON.stringify(existing));

      const data = await saveQuickReply({ hid, id: form.id, body: payload }).unwrap();
      if (!data?.success) throw new Error(data?.responseMessage);

      showToast({ message: form.id ? "Quick reply updated" : "Quick reply created" });
      setEditing(false);
    } catch (error) {
      showToast({ message: errorText(error, "Could not save the quick reply."), type: "error" });
    }
  };

  const remove = async (reply) => {
    const confirmed = await confirm(`Delete “${reply.title}”?`, { title: "Delete quick reply" });
    if (!confirmed) return;
    try {
      const data = await deleteQuickReply({ hid, id: reply._id }).unwrap();
      if (!data?.success) throw new Error(data?.responseMessage);
      showToast({ message: "Quick reply deleted" });
    } catch (error) {
      showToast({ message: errorText(error, "Could not delete the quick reply."), type: "error" });
    }
  };

  const term = search.trim().toLowerCase();
  const shown = term
    ? replies.filter((r) =>
        [r.title, r.items?.find((i) => i.type === "text")?.text].some((v) =>
          v?.toLowerCase().includes(term),
        ),
      )
    : replies;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-app-text">Quick replies</h2>
          <p className="text-xs text-app-text-muted">
            Saved answers with text, photos, videos or documents, ready to send from any chat.
          </p>
        </div>
        <Button icon={Plus} onClick={() => openForm(null)}>
          New reply
        </Button>
      </div>

      {replies.length > 0 && (
        <div className="relative sm:w-80">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search replies"
            className="pl-9"
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : failed ? (
        <ErrorState message="Could not load your quick replies." onRetry={load} />
      ) : replies.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No quick replies yet"
          description="Save answers you send often, like directions, check-in times or your brochure."
          action={<Button size="sm" icon={Plus} onClick={() => openForm(null)}>Create a reply</Button>}
        />
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-app-text-muted">No replies match “{search}”.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((reply) => {
            const text = reply.items?.find((i) => i.type === "text")?.text;
            const media = reply.items?.filter((i) => KINDS[i.type]) || [];
            return (
              <div key={reply._id} className="flex gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-app-text">{reply.title}</h3>
                  {text && <p className="mt-1 line-clamp-2 text-sm text-app-text-muted">{text}</p>}
                  {media.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {media.map((item) => (
                        <Badge key={item.type} tone={KINDS[item.type].tone}>
                          {item.media.length} {item.type}
                          {item.media.length > 1 ? "s" : ""}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton icon={Pencil} label="Edit" onClick={() => openForm(reply)} />
                  <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(reply)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReplyDialog
        open={editing}
        form={form}
        setForm={setForm}
        onClose={() => setEditing(false)}
        onSave={save}
        saving={saving}
      />
    </div>
  );
};

export default QuickReplies;

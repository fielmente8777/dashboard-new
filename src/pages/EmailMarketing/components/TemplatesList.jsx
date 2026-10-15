import { LayoutTemplate, Pencil, Search, Send, Sparkles, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import useDebounce from "../../../hooks/useDebounce";
import { deleteEmailTemplate, getEmailTemplates } from "../../../services/api/emailTemplate";
import { formatDate } from "../emailUtils";
import AITemplateModal from "./AITemplateModal";
import { EmailThumbnail } from "./EmailPreviewFrame";

const PAGE_SIZE = 12;

// Saved email designs, made with AI; any of them can start a new email.
export default function TemplatesList({ onUseTemplate }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [modal, setModal] = useState({ open: false, template: null });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await getEmailTemplates({ page, limit: PAGE_SIZE, search: debouncedSearch });
      setTemplates(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => setModal({ open: true, template: null });

  const remove = async (template) => {
    const confirmed = await confirm(`“${template.name}” will be deleted.`, { title: "Delete template" });
    if (!confirmed) return;
    setDeletingId(template._id);
    try {
      await deleteEmailTemplate(template._id);
      showToast({ message: "Template deleted" });
      if (templates.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch {
      showToast({ message: "Could not delete the template.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1 sm:max-w-sm">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates"
            className="pl-9"
          />
        </div>
        <Button icon={Sparkles} onClick={openCreate} className="ml-auto">
          Create with AI
        </Button>
      </div>

      {failed ? (
        <ErrorState message="Could not load your templates." onRetry={load} />
      ) : loading && !templates.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : !templates.length ? (
        <EmptyState
          icon={LayoutTemplate}
          title={debouncedSearch ? "No templates match" : "No templates yet"}
          description={
            debouncedSearch
              ? "Try another name or subject."
              : "Describe the email you want and AI designs it. Save it to reuse in any email."
          }
          action={
            !debouncedSearch && (
              <Button size="sm" icon={Sparkles} onClick={openCreate}>
                Create your first template
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className="flex flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface transition hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setModal({ open: true, template })}
                className="block border-b border-app-border! text-left"
                aria-label={`Open ${template.name}`}
              >
                <EmailThumbnail html={template.html} />
              </button>
              <div className="flex flex-1 flex-col p-3">
                <p className="truncate text-sm font-semibold text-app-text">{template.name}</p>
                <p className="mt-0.5 truncate text-xs text-app-text-muted">{template.subject || "No subject"}</p>
                <p className="mt-1 text-[11px] text-app-text-faint">Updated {formatDate(template.updatedAt)}</p>
                <div className="mt-3 flex items-center gap-1">
                  {onUseTemplate && (
                    <Button size="sm" icon={Send} onClick={() => onUseTemplate(template)} className="flex-1">
                      Use in email
                    </Button>
                  )}
                  <IconButton icon={Pencil} label="Edit" onClick={() => setModal({ open: true, template })} />
                  <IconButton
                    icon={Trash2}
                    label="Delete"
                    tone="danger"
                    onClick={() => remove(template)}
                    disabled={deletingId === template._id}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs text-app-text-muted">
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </Button>
          {page} / {totalPages}
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}

      <AITemplateModal
        isOpen={modal.open}
        mode="manage"
        initialTemplate={modal.template}
        onClose={() => setModal({ open: false, template: null })}
        onSaved={() => (page !== 1 ? setPage(1) : load())}
      />
    </div>
  );
}

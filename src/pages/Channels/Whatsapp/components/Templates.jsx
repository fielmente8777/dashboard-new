import { Eye, FileText, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import { Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState, ErrorState } from "../../../../components/ui/States";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import {
  deleteWhatsAppMessageTemplate,
  getWhatsAppMessageTemplates,
} from "../../../../redux/api/whatsappBusinessApi";
import TemplatePreviewModal from "./TemplatePreviewModal";
import { CATEGORY_TONE, STATUS_TONE } from "./templateUtils";

const label = (value = "") => value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

// The account's message templates and their Meta approval status.
export default function WhatsAppMessageTemplate({ onCreate, onEdit }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [previewing, setPreviewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await getWhatsAppMessageTemplates();
      if (!response?.success) throw new Error();
      setTemplates(response?.result?.docs?.data || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (template) => {
    const confirmed = await confirm(
      `“${template.name}” will be deleted from WhatsApp. Campaigns and auto replies using it will stop sending it.`,
      { title: "Delete template", confirmText: "Delete" },
    );
    if (!confirmed) return;

    try {
      const response = await deleteWhatsAppMessageTemplate({
        templateName: template.name,
        language: template.language,
      });
      if (response?.success === false) throw new Error(response?.responseMessage);
      setTemplates((prev) => prev.filter((t) => t.name !== template.name));
      showToast({ message: "Template deleted" });
    } catch (error) {
      showToast({ message: error?.message || "Could not delete the template.", type: "error" });
    }
  };

  const term = search.trim().toLowerCase();
  const shown = term ? templates.filter((t) => t.name?.toLowerCase().includes(term)) : templates;

  const columns = [
    {
      key: "name",
      header: "Template",
      render: (t) => <span className="font-medium">{t.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (t) => <Badge tone={CATEGORY_TONE[t.category]}>{label(t.category)}</Badge>,
    },
    { key: "language", header: "Language", render: (t) => t.language },
    {
      key: "status",
      header: "Status",
      render: (t) => <Badge tone={STATUS_TONE[t.status] || "gray"}>{label(t.status)}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton icon={Eye} label="Preview" onClick={() => setPreviewing(t)} />
          {onEdit && <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(t)} />}
          <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(t)} />
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Message templates"
      description="Approved templates can be used in campaigns, auto replies and chats."
      actions={
        <div className="flex gap-2">
          <IconButton icon={RefreshCw} label="Refresh" onClick={load} disabled={loading} />
          {onCreate && (
            <Button size="sm" icon={Plus} onClick={onCreate}>
              New template
            </Button>
          )}
        </div>
      }
    >
      {failed ? (
        <ErrorState message="Could not load your templates." onRetry={load} />
      ) : !loading && templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Create your first template, or start from one of our ready-made hotel templates."
          action={
            onCreate && (
              <Button size="sm" icon={Plus} onClick={onCreate}>
                Create template
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.length > 5 && (
            <div className="relative sm:w-72">
              <Icon
                icon={Search}
                size="sm"
                tone="faint"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates"
                className="pl-9"
              />
            </div>
          )}
          <DataTable
            columns={columns}
            rows={shown}
            rowKey={(t) => `${t.name}-${t.language}`}
            loading={loading}
            onRowClick={setPreviewing}
            emptyMessage="No templates match your search."
          />
        </div>
      )}

      {previewing && (
        <TemplatePreviewModal
          components={previewing.components || []}
          onClose={() => setPreviewing(null)}
        />
      )}
    </Card>
  );
}

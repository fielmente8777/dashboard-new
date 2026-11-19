import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import IconButton from "../../../components/ui/IconButton";
import PageShell from "../../../components/ui/PageShell";
import { ErrorState } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useDeleteLeadFormMutation,
  useGetLeadFormsQuery,
} from "../../../redux/api/leadFormsApi";
import { formatDate } from "../../../utils/formateDate";
import CreateLeadFormDialog from "./CreateLeadFormDialog";
import LeadFormEditor from "./LeadFormEditor";

// The lead capture forms of the location: list, create, delete, and the
// editor for one form.
const LeadForms = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const run = useApiAction();
  const { hid } = useTenant();

  const forms = useGetLeadFormsQuery(hid, { skip: !hid });
  const [deleteForm] = useDeleteLeadFormMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingForm, setEditingForm] = useState(null);

  const columns = useMemo(() => {
    const handleCopy = async (url) => {
      try {
        await navigator.clipboard.writeText(url);
        showToast({ message: "Link copied" });
      } catch {
        showToast({ message: "Could not copy the link.", type: "error" });
      }
    };

    const handleDelete = async (form) => {
      const confirmed = await confirm(
        `Delete "${form.title}"? Its link will stop working.`,
        { title: "Delete form" },
      );
      if (!confirmed) return;

      run(deleteForm(form.form_id), {
        success: "Form deleted",
        error: "Could not delete the form.",
      });
    };

    return [
      {
        key: "title",
        header: "Form",
        className: "font-medium",
        render: (form) => (
          <span className="block max-w-64 truncate" title={form.title}>
            {form.title}
          </span>
        ),
      },
      {
        key: "form_url",
        header: "Link",
        render: (form) =>
          form.form_url ? (
            <span className="flex items-center gap-1">
              <a
                href={form.form_url}
                target="_blank"
                rel="noreferrer"
                className="block max-w-80 truncate text-blue-500 hover:underline"
              >
                {form.form_url}
              </a>
              <IconButton
                icon={Copy}
                label="Copy link"
                onClick={() => handleCopy(form.form_url)}
              />
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (form) => (
          <Badge
            tone={
              String(form.status).toLowerCase() === "active" ? "green" : "gray"
            }
          >
            {form.status || "—"}
          </Badge>
        ),
      },
      {
        key: "created_at",
        header: "Created",
        className: "whitespace-nowrap",
        render: (form) => (form.created_at ? formatDate(form.created_at) : "—"),
      },
      {
        key: "actions",
        header: "",
        render: (form) => (
          <div className="flex justify-end gap-1">
            <IconButton
              icon={Pencil}
              label="Edit form"
              onClick={() => setEditingForm(form)}
            />
            <IconButton
              icon={Trash2}
              label="Delete form"
              tone="danger"
              onClick={() => handleDelete(form)}
            />
          </div>
        ),
      },
    ];
  }, [confirm, deleteForm, run, showToast]);

  if (editingForm) {
    return (
      <LeadFormEditor form={editingForm} onClose={() => setEditingForm(null)} />
    );
  }

  return (
    <PageShell
      title="Lead Forms"
      description="Forms you can share to collect enquiries. Every submission becomes a lead."
      actions={
        <Button icon={Plus} onClick={() => setIsCreating(true)}>
          New form
        </Button>
      }
    >
      {forms.isError ? (
        <ErrorState
          message="Could not load the forms."
          onRetry={forms.refetch}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={forms.data || []}
          rowKey={(form) => form.form_id}
          loading={forms.isLoading || forms.isUninitialized}
          emptyMessage="No forms yet. Create your first one."
        />
      )}

      <CreateLeadFormDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </PageShell>
  );
};

export default LeadForms;

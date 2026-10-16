import { Plus, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Pagination from "../../components/Pagination";
import SendCampaignPopup from "../../components/Popup/SendCampaignPopup";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Field";
import IconButton from "../../components/ui/IconButton";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import { useConfirm } from "../../context/ConfirmContext";
import { useApiAction } from "../../hooks/useApiAction";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useDeleteContactMutation,
  useGetContactsQuery,
} from "../../redux/api/contactsApi";
import { formatDateTime } from "../../utils/formateDate";
import ContactFormDialog from "./components/ContactFormDialog";
import { PAGE_SIZE, getSourceLabel } from "./constants";

// checkbox cells must not open the row
const stopRowClick = (e) => e.stopPropagation();

const Contacts = () => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const contacts = useGetContactsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteContact] = useDeleteContactMutation();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  // { contact } while the add / edit dialog is open (contact: null = new)
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = contacts.data || [];
    if (!term) return all;

    return all.filter((contact) =>
      [contact.name, contact.phone, contact.email].some((value) =>
        String(value || "").toLowerCase().includes(term),
      ),
    );
  }, [contacts.data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // stays in range when a search or a delete shortens the list
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(firstIndex, firstIndex + PAGE_SIZE);
  const pageIds = pageRows.map((contact) => contact._id);
  const isPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const togglePage = (checked) =>
    setSelectedIds((prev) => {
      const others = prev.filter((id) => !pageIds.includes(id));
      return checked ? [...others, ...pageIds] : others;
    });

  const handleDelete = async (contact) => {
    const confirmed = await confirm(
      `Delete ${contact.name || "this contact"}? This cannot be undone.`,
      { title: "Delete contact" },
    );
    if (!confirmed) return;

    const deleted = await run(deleteContact(contact._id), {
      success: "Contact deleted",
      error: "Could not delete the contact.",
    });
    if (deleted) {
      setSelectedIds((prev) => prev.filter((id) => id !== contact._id));
    }
  };

  const columns = [
    {
      key: "select",
      className: "w-10",
      header: (
        <input
          type="checkbox"
          aria-label="Select all on this page"
          checked={isPageSelected}
          onChange={(e) => togglePage(e.target.checked)}
        />
      ),
      render: (contact) => (
        <input
          type="checkbox"
          aria-label={`Select ${contact.name}`}
          checked={selectedIds.includes(contact._id)}
          onClick={stopRowClick}
          onChange={() => toggleOne(contact._id)}
        />
      ),
    },
    { key: "index", header: "#", render: (_, index) => firstIndex + index + 1 },
    {
      key: "name",
      header: "Name",
      className: "font-medium",
      render: (contact) => (
        <span className="block max-w-56 truncate" title={contact.name}>
          {contact.name || "—"}
        </span>
      ),
    },
    { key: "phone", header: "Contact" },
    { key: "email", header: "Email" },
    {
      key: "added_from",
      header: "Source",
      className: "capitalize",
      render: (contact) => getSourceLabel(contact.added_from),
    },
    {
      key: "created_at",
      header: "Created",
      className: "whitespace-nowrap",
      render: (contact) =>
        contact.created_at ? formatDateTime(contact.created_at) : "—",
    },
    {
      key: "action",
      header: "",
      className: "w-12",
      render: (contact) => (
        <IconButton
          icon={Trash2}
          label="Delete contact"
          tone="danger"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(contact);
          }}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Contacts"
      description={
        selectedIds.length > 0
          ? `${selectedIds.length} selected for the campaign`
          : `${filtered.length} contacts`
      }
      actions={
        <>
          <div className="w-56">
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone or email"
              aria-label="Search contacts"
            />
          </div>
          <Button
            variant="secondary"
            icon={Send}
            onClick={() => setCampaignOpen(true)}
          >
            Send campaign
          </Button>
          <Button icon={Plus} onClick={() => setEditing({ contact: null })}>
            Add contact
          </Button>
        </>
      }
    >
      {contacts.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            contacts.error,
            "Could not load the contacts.",
          )}
          onRetry={contacts.refetch}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(contact) => contact._id}
          onRowClick={(contact) => setEditing({ contact })}
          loading={contacts.isLoading}
          skeletonRows={PAGE_SIZE}
          emptyMessage={
            search ? "No contact matches your search." : "No contacts yet."
          }
        />
      )}

      <div className="flex justify-end">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onPrev={() => setPage(currentPage - 1)}
          onNext={() => setPage(currentPage + 1)}
        />
      </div>

      <ContactFormDialog
        open={Boolean(editing)}
        contact={editing?.contact || null}
        onClose={() => setEditing(null)}
      />

      <SendCampaignPopup
        open={campaignOpen}
        setOpen={setCampaignOpen}
        contacts={selectedIds}
        setContacts={setSelectedIds}
      />
    </PageShell>
  );
};

export default Contacts;

import {
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import SendCampaignPopup from "../../components/Popup/SendCampaignPopup";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import IconButton from "../../components/ui/IconButton";
import PageShell from "../../components/ui/PageShell";
import StatCard from "../../components/ui/StatCard";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import TablePagination from "../../components/ui/TablePagination";
import { useConfirm } from "../../context/ConfirmContext";
import { useApiAction } from "../../hooks/useApiAction";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useDeleteContactMutation,
  useGetContactsQuery,
} from "../../redux/api/contactsApi";
import { formatDate } from "../../utils/formateDate";
import ContactFormDialog from "./components/ContactFormDialog";
import { PAGE_SIZE, getSourceLabel, getSourceTone } from "./constants";

const DAY = 86_400_000;

const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "?";

// a steady colour per person, so the list is easy to scan
const AVATAR_TONES = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
];
const avatarTone = (seed) =>
  AVATAR_TONES[[...String(seed || "")].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_TONES.length];

const Avatar = ({ contact }) => (
  <span
    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone(contact._id || contact.name)}`}
  >
    {initials(contact.name)}
  </span>
);

const Checkbox = ({ label, ...props }) => (
  <input
    type="checkbox"
    aria-label={label}
    onClick={(e) => e.stopPropagation()}
    className="size-4 shrink-0 cursor-pointer accent-blue-600"
    {...props}
  />
);

const SourceBadge = ({ value }) =>
  value ? <Badge tone={getSourceTone(value)}>{getSourceLabel(value)}</Badge> : <span className="text-app-text-faint">—</span>;

const Contacts = () => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const contacts = useGetContactsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteContact] = useDeleteContactMutation();

  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  // { contact } while the add / edit dialog is open (contact: null = new)
  const [editing, setEditing] = useState(null);

  const all = useMemo(() => contacts.data || [], [contacts.data]);

  // headline numbers for the whole list, whatever is filtered
  const stats = useMemo(() => {
    const since = Date.now() - 30 * DAY;
    return {
      total: all.length,
      withPhone: all.filter((c) => String(c.phone || "").trim()).length,
      withEmail: all.filter((c) => String(c.email || "").trim()).length,
      recent: all.filter((c) => c.created_at && new Date(c.created_at).getTime() >= since).length,
    };
  }, [all]);

  // the sources present, most contacts first
  const sources = useMemo(() => {
    const counts = new Map();
    all.forEach((c) => c.added_from && counts.set(c.added_from, (counts.get(c.added_from) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [all]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter(
      (contact) =>
        (!source || contact.added_from === source) &&
        (!term ||
          [contact.name, contact.phone, contact.email].some((value) =>
            String(value || "").toLowerCase().includes(term),
          )),
    );
  }, [all, search, source]);

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

  const openContact = (contact) => setEditing({ contact });
  const filtering = Boolean(search.trim() || source);
  const loading = contacts.isLoading;

  const rowActions = (contact) => (
    <div className="flex items-center justify-end gap-0.5">
      <IconButton
        icon={Pencil}
        label="Edit contact"
        onClick={(e) => {
          e.stopPropagation();
          openContact(contact);
        }}
      />
      <IconButton
        icon={Trash2}
        label="Delete contact"
        tone="danger"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(contact);
        }}
      />
    </div>
  );

  const list = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      );
    }

    if (pageRows.length === 0) {
      return (
        <div className="p-4">
          {filtering ? (
            <EmptyState
              icon={Search}
              title="No contact matches"
              description="Try another name, number or source."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSource("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No contacts yet"
              description="Guests from your leads, website, Eazbot and calls are saved here. You can also add one yourself."
              action={
                <Button size="sm" icon={Plus} onClick={() => setEditing({ contact: null })}>
                  Add contact
                </Button>
              }
            />
          )}
        </div>
      );
    }

    return (
      <>
        {/* phones: one card per contact */}
        <ul className="divide-y divide-app-border! md:hidden">
          {pageRows.map((contact) => (
            <li key={contact._id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => openContact(contact)}
                onKeyDown={(e) => e.key === "Enter" && openContact(contact)}
                className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-app-surface-secondary"
              >
                <Checkbox
                  label={`Select ${contact.name || "contact"}`}
                  checked={selectedIds.includes(contact._id)}
                  onChange={() => toggleOne(contact._id)}
                />
                <Avatar contact={contact} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium text-app-text">
                      {contact.name || "Unnamed"}
                    </p>
                    {contact.added_from && <SourceBadge value={contact.added_from} />}
                  </div>
                  <p className="truncate text-xs text-app-text-muted">
                    {[contact.phone, contact.email].filter(Boolean).join(" · ") || "No phone or email"}
                  </p>
                </div>
                <Icon icon={ChevronRight} size="sm" tone="faint" />
              </div>
            </li>
          ))}
        </ul>

        {/* larger screens: a table */}
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="border-b border-app-border! text-xs text-app-text-muted">
            <tr>
              <th className="w-10 py-2.5 pl-4 font-medium">
                <Checkbox
                  label="Select all on this page"
                  checked={isPageSelected}
                  onChange={(e) => togglePage(e.target.checked)}
                />
              </th>
              <th className="px-3 py-2.5 font-medium">Contact</th>
              <th className="px-3 py-2.5 font-medium">Phone</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">Added</th>
              <th className="w-24 py-2.5 pr-4" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border!">
            {pageRows.map((contact) => {
              const selected = selectedIds.includes(contact._id);
              return (
                <tr
                  key={contact._id}
                  onClick={() => openContact(contact)}
                  className={`group cursor-pointer transition-colors hover:bg-app-surface-secondary ${selected ? "bg-blue-500/5" : ""}`}
                >
                  <td className="py-3 pl-4">
                    <Checkbox
                      label={`Select ${contact.name || "contact"}`}
                      checked={selected}
                      onChange={() => toggleOne(contact._id)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar contact={contact} />
                      <div className="min-w-0">
                        <p className="max-w-64 truncate font-medium text-app-text" title={contact.name}>
                          {contact.name || "Unnamed"}
                        </p>
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block max-w-64 truncate text-xs text-app-text-muted hover:text-blue-500"
                          >
                            {contact.email}
                          </a>
                        ) : (
                          <p className="text-xs text-app-text-faint">No email</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-xs text-app-text hover:text-blue-500"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-app-text-faint">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <SourceBadge value={contact.added_from} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-app-text-muted">
                    {contact.created_at ? formatDate(contact.created_at) : "—"}
                  </td>
                  <td className="py-3 pr-4 opacity-60 transition-opacity group-hover:opacity-100">
                    {rowActions(contact)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <PageShell
      title="Contacts"
      description="Everyone who reached you, from leads, website, Eazbot and calls, in one address book."
      actions={
        <Button icon={Plus} onClick={() => setEditing({ contact: null })}>
          Add contact
        </Button>
      }
    >
      {contacts.isError ? (
        <ErrorState
          message={getApiErrorMessage(contacts.error, "Could not load the contacts.")}
          onRetry={contacts.refetch}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Contacts" icon={Users} value={loading ? "…" : stats.total.toLocaleString("en-IN")} />
            <StatCard label="With phone" icon={Phone} value={loading ? "…" : stats.withPhone.toLocaleString("en-IN")} />
            <StatCard label="With email" icon={Mail} value={loading ? "…" : stats.withEmail.toLocaleString("en-IN")} />
            <StatCard label="New in 30 days" icon={Sparkles} value={loading ? "…" : stats.recent.toLocaleString("en-IN")} />
          </div>

          <section className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
            <div className="space-y-3 border-b border-app-border! p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Icon
                    icon={Search}
                    size="sm"
                    tone="faint"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <Input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, phone or email"
                    aria-label="Search contacts"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-app-text-muted">
                  {filtering
                    ? `${filtered.length.toLocaleString("en-IN")} of ${all.length.toLocaleString("en-IN")} contacts`
                    : `${all.length.toLocaleString("en-IN")} contacts`}
                </p>
              </div>

              {sources.length > 1 && (
                <div className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
                  <Chip
                    selected={!source}
                    onClick={() => {
                      setSource("");
                      setPage(1);
                    }}
                    className="shrink-0"
                  >
                    All <span className="tabular-nums opacity-70">{all.length}</span>
                  </Chip>
                  {sources.map(([value, count]) => (
                    <Chip
                      key={value}
                      selected={source === value}
                      onClick={() => {
                        setSource(source === value ? "" : value);
                        setPage(1);
                      }}
                      className="shrink-0 whitespace-nowrap"
                    >
                      {getSourceLabel(value)} <span className="tabular-nums opacity-70">{count}</span>
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            {/* what to do with the picked contacts */}
            {selectedIds.length > 0 && (
              <div className="anim-fade flex flex-wrap items-center gap-2 border-b border-app-border! bg-blue-500/5 px-4 py-2.5">
                <Icon icon={UserRound} size="sm" className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-app-text">
                  {selectedIds.length} selected
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" icon={Send} onClick={() => setCampaignOpen(true)}>
                    WhatsApp campaign
                  </Button>
                  <Button size="sm" variant="ghost" icon={X} onClick={() => setSelectedIds([])}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {list()}
          </section>

          {filtered.length > PAGE_SIZE && (
            <TablePagination
              page={currentPage}
              limit={PAGE_SIZE}
              total={filtered.length}
              itemLabel="contacts"
              onPageChange={setPage}
            />
          )}
        </>
      )}

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

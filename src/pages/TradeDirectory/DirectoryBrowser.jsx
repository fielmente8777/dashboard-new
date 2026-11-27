import { ArrowLeft, BookUser, Eye, EyeOff, Lock, Mail, MessageCircle, Phone, Plus, Search, Send, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import { Input, Select } from "../../components/ui/Field";
import Notice from "../../components/ui/Notice";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import StatCard from "../../components/ui/StatCard";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import {
  tradeError,
  useDeleteTradeContactsMutation,
  useGetTradeFacetsQuery,
  useGetTradePartnersQuery,
  useHideTradeContactsMutation,
  useUnhideTradeContactsMutation,
} from "../../redux/api/tradeDirectoryApi";
import ContactDialog from "./ContactDialog";
import DirectoryEditDialog from "./DirectoryEditDialog";
import ImportContactsDialog from "./ImportContactsDialog";
import OutreachDialog from "./OutreachDialog";
import PartnerDrawer from "./PartnerDrawer";
import { PAGE_SIZE, formatNumber } from "./tradeUtils";
import { useTradeCategories } from "./useTradeCategories";

const useDebounced = (value, ms) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

// the server takes at most 1,000 ids a call
const inChunks = async (ids, send) => {
  let total = 0;
  for (let i = 0; i < ids.length; i += 1000) total += Object.values(await send(ids.slice(i, i + 1000)))[0] || 0;
  return total;
};

// one option per name: the counts come per city + state, so "Ahmedabad" (Gujarat) and "Ahmedabad"
// (no state) are one city here; the filter matches without case, so the first spelling is kept
const mergeByName = (items) => {
  const merged = new Map();
  for (const [name, count] of items) {
    const hit = merged.get(name.toLowerCase());
    if (hit) hit[1] += count;
    else merged.set(name.toLowerCase(), [name, count]);
  }
  return [...merged.values()].sort((a, b) => b[1] - a[1]);
};

// the list columns on wide screens (xl); below that every row is a card
const COLUMNS = "xl:grid-cols-[32px_minmax(0,2fr)_140px_minmax(0,1fr)_minmax(150px,auto)_minmax(0,1.3fr)_148px]";

/**
 * One list (pool "directory" = Eazotel's, masked; pool "mine" = the hotel's own), with counts,
 * category chips, filters, cursor pages ("Load more"), selection and outreach.
 *
 * Hide / delete only take contacts out of THIS hotel's view: on Eazotel's directory "Hide" (and
 * "Hidden by me" to show them again); on the hotel's own contacts "Delete". Eazotel keeps the
 * rows and its team sees who did it. Directory contacts can be corrected ("Edit"): the change
 * is saved for everyone and Eazotel's team checks it.
 */
const DirectoryBrowser = ({ pool, onSent }) => {
  const mine = pool === "mine";
  const { categories } = useTradeCategories();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [segment, setSegment] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [reach, setReach] = useState("");
  const [search, setSearch] = useState("");
  // directory only: the contacts this hotel hid, to show them again
  const [hiddenView, setHiddenView] = useState(false);
  const query = useDebounced(search.trim(), 300);
  const filter = useMemo(
    () => ({ segment: segment || undefined, state: state || undefined, city: city || undefined, reach: reach || undefined, search: query || undefined }),
    [segment, state, city, reach, query],
  );
  const filterKey = JSON.stringify(filter);

  // cursor pages: [undefined, cursor2, cursor3…]; each page component loads itself
  const [cursors, setCursors] = useState([undefined]);
  const [pages, setPages] = useState({});
  const [selected, setSelected] = useState(() => new Set());
  const [allMatching, setAllMatching] = useState(false);
  const [open, setOpen] = useState(null);
  const [outreach, setOutreach] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [removeContacts, { isLoading: removing }] = useDeleteTradeContactsMutation();
  const [hideContacts, { isLoading: hiding }] = useHideTradeContactsMutation();
  const [unhideContacts, { isLoading: unhiding }] = useUnhideTradeContactsMutation();

  useEffect(() => {
    setCursors([undefined]);
    setPages({});
    setSelected(new Set());
    setAllMatching(false);
  }, [filterKey, pool, hiddenView]);

  const facets = useGetTradeFacetsQuery(pool);
  const f = facets.data;
  const items = cursors.flatMap((_, i) => pages[i]?.items || []);
  const lastPage = pages[cursors.length - 1];
  const total = pages[0]?.total ?? null;
  const count = allMatching ? total || 0 : selected.size;

  const cities = mergeByName((f?.cities || []).filter((c) => !state || c.state?.toLowerCase() === state.toLowerCase()).map((c) => [c.city, c.count]));
  const states = mergeByName((f?.states || []).map((s) => [s.state, s.count]));
  const pageAllSelected = items.length > 0 && items.every((p) => selected.has(p.id));

  const toggle = (id) => {
    setAllMatching(false);
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setAllMatching(false);
    setSelected(pageAllSelected ? new Set() : new Set(items.map((p) => p.id)));
  };
  const clearSelection = () => {
    setSelected(new Set());
    setAllMatching(false);
  };
  const selection = allMatching ? { filter } : { ids: [...selected] };

  /** own contacts: leave this hotel's list (Eazotel keeps the row) */
  const deleteContacts = async (ids) => {
    const ok = await confirm(
      ids.length === 1 ? "Delete this contact from your list?" : `Delete ${formatNumber(ids.length)} contacts from your list?`,
      { title: "Delete contacts", confirmText: "Delete" },
    );
    if (!ok) return;
    try {
      const deleted = await inChunks(ids, (chunk) => removeContacts(chunk).unwrap());
      showToast({ message: `${formatNumber(deleted)} contact${deleted === 1 ? "" : "s"} deleted`, type: "success" });
      clearSelection();
      setOpen(null);
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    }
  };

  /** directory contacts: hidden for this hotel only, with Undo */
  const hide = async (ids) => {
    try {
      const hidden = await inChunks(ids, (chunk) => hideContacts(chunk).unwrap());
      clearSelection();
      setOpen(null);
      showToast({
        message: `${formatNumber(hidden)} contact${hidden === 1 ? "" : "s"} hidden. Find ${hidden === 1 ? "it" : "them"} under "Hidden by me".`,
        type: "success",
        duration: 6000,
        action: { label: "Undo", onClick: () => inChunks(ids, (chunk) => unhideContacts(chunk).unwrap()).catch(() => {}) },
      });
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    }
  };

  const unhide = async (ids) => {
    try {
      const shown = await inChunks(ids, (chunk) => unhideContacts(chunk).unwrap());
      clearSelection();
      setOpen(null);
      showToast({ message: `${formatNumber(shown)} contact${shown === 1 ? "" : "s"} back in your list`, type: "success" });
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    }
  };

  const removeOne = (p) => (p.hiddenByMe ? unhide([p.id]) : mine ? deleteContacts([p.id]) : hide([p.id]));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={mine ? "My contacts" : "Partners listed"} value={f ? formatNumber(f.total) : "…"} icon={BookUser} />
        <StatCard label="On WhatsApp" value={f ? formatNumber(f.reach.whatsapp) : "…"} icon={MessageCircle} />
        <StatCard label="Reachable by email" value={f ? formatNumber(f.reach.email) : "…"} icon={Mail} />
        <StatCard label="States & regions" value={f ? formatNumber(states.length) : "…"} icon={Phone} />
      </div>

      {/* phones: one row that scrolls sideways; wider screens: wraps */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Category">
        <Chip className="shrink-0" selected={!segment} onClick={() => setSegment("")}>
          All <span className="tabular-nums opacity-70">{formatNumber(f?.total)}</span>
        </Chip>
        {categories.filter((s) => (f?.segments.find((x) => x.segment === s.value)?.count || 0) > 0).map((s) => (
          <Chip key={s.value} className="shrink-0 whitespace-nowrap" selected={segment === s.value} onClick={() => setSegment(s.value)}>
            <span className="size-2 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label} <span className="tabular-nums opacity-70">{formatNumber(f.segments.find((x) => x.segment === s.value)?.count)}</span>
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative col-span-2 min-w-0 sm:min-w-56 sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-app-text-muted" aria-hidden />
          <Input className="pl-9" placeholder="Search agency, person or city" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          aria-label="State"
          className="w-full min-w-0 sm:w-auto sm:max-w-52"
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setCity("");
          }}
          options={[{ value: "", label: "All states" }, ...states.map(([name, count]) => ({ value: name, label: `${name} (${formatNumber(count)})` }))]}
        />
        <Select
          aria-label="City"
          className="w-full min-w-0 sm:w-auto sm:max-w-52"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          options={[{ value: "", label: "All cities" }, ...cities.map(([name, count]) => ({ value: name, label: `${name} (${formatNumber(count)})` }))]}
        />
        <Select
          aria-label="Reachable by"
          className="w-full min-w-0 sm:w-auto"
          value={reach}
          onChange={(e) => setReach(e.target.value)}
          options={[
            { value: "", label: "Reachable by: any" },
            { value: "whatsapp", label: "WhatsApp (mobile)" },
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
          ]}
        />
        {!mine && (
          <Button variant="secondary" icon={hiddenView ? ArrowLeft : EyeOff} onClick={() => setHiddenView((v) => !v)} className="w-full sm:w-auto">
            {hiddenView ? "Back to directory" : "Hidden by me"}
          </Button>
        )}
        {mine && (
          <>
            <Button variant="secondary" icon={Upload} onClick={() => setImporting(true)} className="w-full sm:w-auto">
              Import
            </Button>
            <Button icon={Plus} onClick={() => setAdding(true)} className="w-full sm:w-auto">
              Add contact
            </Button>
          </>
        )}
      </div>

      {hiddenView && (
        <Notice tone="info" icon={EyeOff} title="Contacts you hid">
          Only your hotel stops seeing them; other hotels still do. Pick contacts and press &quot;Show again&quot; to bring them back.
        </Notice>
      )}

      {pageAllSelected && total > items.length && !allMatching && !hiddenView && (
        <div className="rounded-lg bg-app-accent-soft px-3 py-2 text-sm text-app-text">
          All {formatNumber(items.length)} on screen are selected.{" "}
          <button type="button" className="font-medium text-app-accent-text underline" onClick={() => setAllMatching(true)}>
            Select all {formatNumber(total)} matching
          </button>
        </div>
      )}
      {allMatching && (
        <div className="rounded-lg bg-app-accent-soft px-3 py-2 text-sm text-app-text">
          All <b>{formatNumber(total)}</b> matching contacts are selected (up to 5,000 per campaign).{" "}
          <button type="button" className="font-medium text-app-accent-text underline" onClick={() => setAllMatching(false)}>
            Clear
          </button>
        </div>
      )}

      <div
        className={`overflow-hidden rounded-xl border border-app-border bg-app-surface ${mine ? "" : "select-none"}`}
        onContextMenu={mine ? undefined : (e) => e.preventDefault()}
      >
        <div className={`hidden items-center gap-3 border-b border-app-border bg-app-surface-secondary px-3 py-2.5 text-xs font-medium text-app-text-muted xl:grid ${COLUMNS}`}>
          <input type="checkbox" checked={pageAllSelected} onChange={toggleAll} aria-label="Select all on screen" className="size-4 accent-primary" />
          <span>Agency / contact</span>
          <span>Category</span>
          <span>Location</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Actions</span>
        </div>
        {/* below xl: one "select all" line above the cards */}
        <label className="flex items-center gap-2 border-b border-app-border bg-app-surface-secondary px-3 py-2 text-xs font-medium text-app-text-muted xl:hidden">
          <input type="checkbox" checked={pageAllSelected} onChange={toggleAll} className="size-4 accent-primary" />
          Select all on screen
        </label>
        {cursors.map((after, i) => (
          <PartnerPage
            key={`${filterKey}:${hiddenView}:${after ?? "first"}`}
            params={{ pool, ...filter, limit: PAGE_SIZE, after, ...(hiddenView ? { hidden: true } : {}) }}
            onLoaded={(page) => setPages((p) => (p[i] === page ? p : { ...p, [i]: page }))}
            selected={selected}
            allMatching={allMatching}
            mine={mine}
            onToggle={toggle}
            onOpen={setOpen}
            onReach={(partner, channel) => setOutreach({ selection: { ids: [partner.id] }, channel, count: 1 })}
            onRemove={removeOne}
          />
        ))}
        {pages[0] && !items.length && (
          <EmptyState
            title={hiddenView ? "Nothing hidden" : mine ? "No contacts yet" : "No partners match"}
            description={
              hiddenView
                ? "Contacts you hide from the directory show here."
                : mine
                  ? "Import an Excel / CSV file or a Google Sheet, or add contacts one by one."
                  : "Try another category, state or search."
            }
          />
        )}
      </div>

      {lastPage?.nextCursor && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setCursors((c) => [...c, lastPage.nextCursor])}>
            Load {PAGE_SIZE} more · showing {formatNumber(items.length)} of {formatNumber(total)}
          </Button>
        </div>
      )}

      {count > 0 && (
        // keeps clear of the AI button in the bottom-right corner (ChatbotWidget)
        <div className="sticky bottom-3 z-20 mr-16 flex flex-wrap items-center gap-2 rounded-xl border border-app-border bg-app-surface p-2.5 shadow-lg sm:mr-20 sm:p-3">
          <span className="w-full text-sm font-medium text-app-text sm:mr-auto sm:w-auto">{formatNumber(count)} selected</span>
          {hiddenView ? (
            <Button size="sm" icon={Eye} loading={unhiding} onClick={() => unhide([...selected])}>
              Show again
            </Button>
          ) : (
            <>
              <Button size="sm" icon={MessageCircle} onClick={() => setOutreach({ selection, channel: "whatsapp", count })}>
                WhatsApp
              </Button>
              <Button size="sm" icon={Send} onClick={() => setOutreach({ selection, channel: "email", count })}>
                Email
              </Button>
              {!allMatching &&
                (mine ? (
                  <Button size="sm" variant="danger" icon={Trash2} loading={removing} onClick={() => deleteContacts([...selected])}>
                    Delete
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" icon={EyeOff} loading={hiding} onClick={() => hide([...selected])}>
                    Hide
                  </Button>
                ))}
            </>
          )}
          <Button size="sm" variant="ghost" icon={X} onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}

      {!mine && (
        <p className="flex items-start gap-1.5 text-xs text-app-text-muted">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Contact details are not shown or downloaded. Emails and WhatsApp go from your own email and
          number.
        </p>
      )}

      {open && (
        <PartnerDrawer
          partner={open}
          onClose={() => setOpen(null)}
          onReach={(channel) => {
            setOutreach({ selection: { ids: [open.id] }, channel, count: 1 });
            setOpen(null);
          }}
          onEdit={() => {
            setEditing(open);
            setOpen(null);
          }}
          onRemove={() => removeOne(open)}
          busy={removing || hiding || unhiding}
        />
      )}
      {outreach && (
        <OutreachDialog
          pool={pool}
          selection={outreach.selection}
          initialChannel={outreach.channel}
          count={outreach.count}
          onClose={() => setOutreach(null)}
          onSent={() => {
            setOutreach(null);
            clearSelection();
            onSent?.();
          }}
        />
      )}
      {editing?.masked && <DirectoryEditDialog partner={editing} onClose={() => setEditing(null)} />}
      {(adding || (editing && !editing.masked)) && (
        <ContactDialog
          contact={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
      {importing && <ImportContactsDialog onClose={() => setImporting(false)} />}
    </div>
  );
};

/** One page of 50, loaded and cached on its own (RTK Query refetches it after changes). */
const PartnerPage = ({ params, onLoaded, selected, allMatching, mine, onToggle, onOpen, onReach, onRemove }) => {
  const { data, isLoading, error, refetch } = useGetTradePartnersQuery(params);
  const { segmentOf } = useTradeCategories();
  useEffect(() => {
    if (data) onLoaded(data);
  }, [data, onLoaded]);

  if (isLoading)
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  if (error) return <ErrorState message={tradeError(error, "Couldn't load contacts.")} onRetry={refetch} />;

  return data.items.map((p) => {
    const seg = segmentOf(p.segment);
    const title = p.company || p.person || "Unlisted agency";
    const sub = [p.company ? p.person : null, p.designation].filter(Boolean).join(" · ");
    const location = [p.city, p.state].filter(Boolean).join(", ");
    const checked = allMatching || selected.has(p.id);
    const morePhones = p.morePhones ?? Math.max(0, (p.phones?.length || 0) - 1);
    return (
      <div
        key={p.id}
        className={`grid cursor-pointer grid-cols-[24px_minmax(0,1fr)] gap-x-2 gap-y-1.5 border-b border-app-border px-3 py-3 last:border-0 hover:bg-app-surface-secondary xl:items-center xl:gap-x-3 ${COLUMNS} ${checked ? "bg-app-accent-soft/40" : ""}`}
        onClick={() => onOpen(p)}
      >
        <input
          type="checkbox"
          checked={checked}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggle(p.id)}
          aria-label={`Select ${title}`}
          className="mt-1 size-4 accent-primary xl:mt-0"
        />
        <div className="min-w-0">
          <div className={`truncate font-medium ${p.company || p.person ? "text-app-text" : "text-app-text-muted italic"}`}>{title}</div>
          {sub && <div className="truncate text-xs text-app-text-muted">{sub}</div>}
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-app-text-muted xl:hidden">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ background: seg.color }} aria-hidden />
              {seg.label}
            </span>
            {location && <span>{location}</span>}
          </div>
        </div>
        <span className="hidden min-w-0 items-center gap-1.5 text-sm text-app-text xl:flex">
          <span className="size-2 shrink-0 rounded-full" style={{ background: seg.color }} aria-hidden />
          <span className="truncate">{seg.label}</span>
        </span>
        <span className="hidden truncate text-sm text-app-text xl:block">{location || "—"}</span>
        <span className="col-start-2 flex min-w-0 items-center gap-1 text-sm whitespace-nowrap text-app-text tabular-nums xl:col-start-auto">
          {p.phones?.[0] ? (
            <>
              {p.masked && <Lock className="size-3 shrink-0 text-app-text-muted" aria-hidden />}
              <span className="truncate">{p.phones[0]}</span>
              {morePhones > 0 && <span className="shrink-0 rounded border border-app-border px-1 text-[10px] text-app-text-muted">+{morePhones}</span>}
            </>
          ) : (
            <span className="text-app-text-muted">No phone</span>
          )}
        </span>
        <span className="col-start-2 flex min-w-0 items-center gap-1 text-sm text-app-text xl:col-start-auto">
          {p.emails?.[0] ? (
            <>
              {p.masked && <Lock className="size-3 shrink-0 text-app-text-muted" aria-hidden />}
              <span className="truncate">{p.emails[0]}</span>
            </>
          ) : (
            <span className="truncate text-app-text-muted">{p.instagram || "No email"}</span>
          )}
        </span>
        <div className="col-start-2 flex gap-1 xl:col-start-auto" onClick={(e) => e.stopPropagation()}>
          {!p.hiddenByMe && (
            <>
              <ReachButton icon={MessageCircle} label="WhatsApp" disabled={!p.reach.whatsapp || p.optOut?.whatsapp} onClick={() => onReach(p, "whatsapp")} tone="text-emerald-600" />
              <ReachButton icon={Mail} label="Email" disabled={!p.reach.email || p.optOut?.email} onClick={() => onReach(p, "email")} />
              <ReachButton icon={Phone} label="Call (coming soon)" disabled onClick={() => {}} />
            </>
          )}
          {p.hiddenByMe ? (
            <ReachButton icon={Eye} label="Show again" onClick={() => onRemove(p)} />
          ) : mine ? (
            <ReachButton icon={Trash2} label="Delete from my list" onClick={() => onRemove(p)} tone="text-red-600" />
          ) : (
            <ReachButton icon={EyeOff} label="Hide from my list" onClick={() => onRemove(p)} />
          )}
        </div>
      </div>
    );
  });
};

const ReachButton = ({ icon: Icon, label, disabled, onClick, tone = "" }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className={`grid size-8 shrink-0 place-items-center rounded-lg border border-app-border hover:bg-app-surface-secondary disabled:cursor-not-allowed disabled:opacity-30 ${tone}`}
  >
    <Icon className="size-4" aria-hidden />
  </button>
);

export default DirectoryBrowser;

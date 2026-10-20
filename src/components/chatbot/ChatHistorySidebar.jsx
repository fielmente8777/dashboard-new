import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, MoreHorizontal, Pencil, Pin, PinOff, Plus, Search, Trash2, X } from "lucide-react";

/**
 * ChatGPT-style history panel: New chat, search, Pinned and Recents,
 * with a three-dot menu per conversation (pin / rename / delete).
 *
 * `history` is what useChatbotHistory returns: { pinned, recents, loading, error,
 * search, setSearch, isSearching, refresh, togglePin, rename, remove }.
 * A conversation is { _id, title, pinned }.
 */
export default function ChatHistorySidebar({
  history,
  activeId,
  onSelect,
  onNewChat,
  onDeleted,
  onOverlayChange,
  disabled,
  className = "",
  onClose,
}) {
  const { pinned, recents, loading, error, search, setSearch, isSearching, refresh, togglePin, rename, remove } = history;
  const [menuId, setMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const overlayOpen = Boolean(menuId || renamingId || confirmDelete);
  useEffect(() => {
    onOverlayChange?.(overlayOpen);
  }, [overlayOpen, onOverlayChange]);

  // Escape closes the innermost overlay instead of the whole chatbot window.
  useEffect(() => {
    if (!overlayOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (confirmDelete && !deleting) setConfirmDelete(null);
      else if (renamingId) setRenamingId(null);
      else setMenuId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, confirmDelete, renamingId, deleting]);

  useEffect(() => {
    if (!actionError) return undefined;
    const t = setTimeout(() => setActionError(null), 4000);
    return () => clearTimeout(t);
  }, [actionError]);

  async function handlePin(conversation) {
    setMenuId(null);
    try {
      await togglePin(conversation);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't update pin.");
    }
  }

  async function handleRename(conversation, title) {
    setRenamingId(null);
    try {
      await rename(conversation, title);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't rename conversation.");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await remove(confirmDelete);
      onDeleted?.(confirmDelete);
      setConfirmDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't delete conversation.");
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const isEmpty = !loading && !error && pinned.length === 0 && recents.length === 0;

  const renderItem = (conversation) => (
    <HistoryItem
      key={conversation._id}
      conversation={conversation}
      active={conversation._id === activeId}
      menuOpen={menuId === conversation._id}
      renaming={renamingId === conversation._id}
      onSelect={() => onSelect(conversation)}
      onToggleMenu={() => setMenuId((id) => (id === conversation._id ? null : conversation._id))}
      onCloseMenu={() => setMenuId(null)}
      onPin={() => handlePin(conversation)}
      onStartRename={() => {
        setMenuId(null);
        setRenamingId(conversation._id);
      }}
      onRename={(title) => handleRename(conversation, title)}
      onCancelRename={() => setRenamingId(null)}
      onDelete={() => {
        setMenuId(null);
        setConfirmDelete(conversation);
      }}
    />
  );

  return (
    <aside className={`flex min-h-0 flex-col border-r border-[var(--cb-border)] bg-[var(--cb-sidebar)] ${className}`} aria-label="Chat history">
      <div className="flex shrink-0 items-center gap-2 p-3">
        <button
          type="button"
          onClick={onNewChat}
          disabled={disabled}
          className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--cb-border)] px-3 py-2.5 text-sm text-[var(--cb-text-2)] transition hover:border-blue-400/40 hover:bg-[var(--cb-hover)] disabled:opacity-40"
        >
          <Plus size={16} className="text-[var(--cb-accent)]" />
          New chat
        </button>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close history" className="rounded-lg p-2 text-[var(--cb-muted)] hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text)] md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="shrink-0 px-3 pb-2">
        <label className="flex items-center gap-2 rounded-lg border border-[var(--cb-border)] bg-[var(--cb-hover)] px-2.5 py-2 focus-within:border-blue-400/40">
          <Search size={14} className="shrink-0 text-[var(--cb-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            aria-label="Search conversations by title"
            maxLength={100}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--cb-text)] outline-none placeholder:text-[var(--cb-faint)]"
          />
          {loading && isSearching ? (
            <Loader2 size={14} className="shrink-0 animate-spin text-[var(--cb-faint)]" />
          ) : search ? (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-[var(--cb-faint)] hover:text-[var(--cb-text)]">
              <X size={14} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading && pinned.length === 0 && recents.length === 0 && (
          <div className="space-y-2 px-1 pt-2" aria-busy="true" aria-label="Loading conversations">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-[var(--cb-hover)]" />
            ))}
          </div>
        )}

        {error && (
          <div className="mx-1 mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-[var(--cb-danger)]">
            <p>{error}</p>
            <button type="button" onClick={refresh} className="mt-2 rounded-md border border-red-300/30 px-2 py-1 hover:bg-red-500/20">
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center px-4 pt-10 text-center text-xs text-[var(--cb-faint)]">
            <MessageSquare size={22} className="mb-2 text-[var(--cb-faint)]" />
            {isSearching ? <p>No chats match “{search.trim()}”.</p> : <p>No conversations yet. Your chats will appear here.</p>}
          </div>
        )}

        {pinned.length > 0 && (
          <section className="mt-1">
            <h3 className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-[var(--cb-faint)]">Pinned</h3>
            <ul className="space-y-0.5">{pinned.map(renderItem)}</ul>
          </section>
        )}

        {recents.length > 0 && (
          <section className="mt-1">
            <h3 className="px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-[var(--cb-faint)]">Recents</h3>
            <ul className="space-y-0.5">{recents.map(renderItem)}</ul>
          </section>
        )}
      </div>

      {actionError && (
        <div role="alert" className="mx-3 mb-3 shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-[var(--cb-danger)]">
          {actionError}
        </div>
      )}

      {confirmDelete && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) setConfirmDelete(null);
          }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="chat-delete-title" className="w-full max-w-sm rounded-2xl border border-[var(--cb-border)] bg-[var(--cb-raised)] p-5 shadow-2xl">
            <h3 id="chat-delete-title" className="text-base font-semibold text-[var(--cb-text)]">
              Delete chat?
            </h3>
            <p className="mt-2 break-words text-sm text-[var(--cb-muted)]">
              This will permanently delete <span className="text-[var(--cb-text-2)]">“{confirmDelete.title}”</span> and all of its messages.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-[var(--cb-border)] px-3 py-2 text-sm text-[var(--cb-text-2)] hover:bg-[var(--cb-hover)] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                autoFocus
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function HistoryItem({
  conversation,
  active,
  menuOpen,
  renaming,
  onSelect,
  onToggleMenu,
  onCloseMenu,
  onPin,
  onStartRename,
  onRename,
  onCancelRename,
  onDelete,
}) {
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState(conversation.title);
  const committedRef = useRef(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) onCloseMenu();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen, onCloseMenu]);

  useEffect(() => {
    if (renaming) {
      committedRef.current = false;
      setDraft(conversation.title);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [renaming, conversation.title]);

  const commit = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    const value = draft.trim();
    if (!value || value === conversation.title) onCancelRename();
    else onRename(value);
  };

  if (renaming) {
    return (
      <li className="px-1">
        <input
          ref={inputRef}
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              committedRef.current = true;
            }
          }}
          aria-label="Conversation title"
          className="w-full rounded-lg border border-blue-500/60 bg-[var(--cb-raised)] px-2.5 py-1.5 text-sm text-[var(--cb-text)] outline-none"
        />
      </li>
    );
  }

  return (
    <li ref={menuRef} className="relative">
      <div
        className={`group flex items-center rounded-lg transition ${
          active ? "bg-[var(--cb-active)] text-[var(--cb-text)]" : "text-[var(--cb-text-2)] hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text)]"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          title={conversation.title}
          aria-current={active ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm"
        >
          {conversation.pinned && <Pin size={12} className="shrink-0 text-[var(--cb-accent)]" />}
          <span className="truncate">{conversation.title}</span>
        </button>
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={`More actions for ${conversation.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={`mr-1 shrink-0 rounded-md p-1 text-[var(--cb-muted)] hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text)] ${
            menuOpen || active ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
          }`}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {menuOpen && (
        <div role="menu" className="absolute right-1 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-[var(--cb-border)] bg-[var(--cb-raised)] py-1 shadow-2xl">
          <MenuButton icon={conversation.pinned ? PinOff : Pin} label={conversation.pinned ? "Unpin" : "Pin"} onClick={onPin} />
          <MenuButton icon={Pencil} label="Rename" onClick={onStartRename} />
          <MenuButton icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      )}
    </li>
  );
}

function MenuButton({ icon, label, onClick, danger }) {
  const Icon = icon;
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[var(--cb-hover)] ${danger ? "text-[var(--cb-danger)]" : "text-[var(--cb-text-2)]"}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
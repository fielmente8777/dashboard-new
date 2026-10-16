
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
// import "./chat-history.css";

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
  const {
    pinned,
    recents,
    loading,
    error,
    search,
    setSearch,
    isSearching,
    refresh,
    togglePin,
    rename,
    remove,
  } = history;

  const [menuId, setMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const overlayOpen = Boolean(menuId || renamingId || confirmDelete);

  useEffect(() => {
    onOverlayChange?.(overlayOpen);
  }, [overlayOpen, onOverlayChange]);

  useEffect(() => {
    if (!overlayOpen) return;

    const onKey = (event) => {
      if (event.key !== "Escape") return;

      if (confirmDelete && !deleting) {
        setConfirmDelete(null);
      } else if (renamingId) {
        setRenamingId(null);
      } else {
        setMenuId(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, confirmDelete, renamingId, deleting]);

  useEffect(() => {
    if (!actionError) return;

    const timer = setTimeout(() => setActionError(null), 4000);
    return () => clearTimeout(timer);
  }, [actionError]);

  async function handlePin(conversation) {
    setMenuId(null);

    try {
      await togglePin(conversation);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Couldn't update pin."
      );
    }
  }

  async function handleRename(conversation, title) {
    setRenamingId(null);

    try {
      await rename(conversation, title);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Couldn't rename conversation."
      );
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
      setActionError(
        err instanceof Error ? err.message : "Couldn't delete conversation."
      );
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const isEmpty =
    !loading &&
    !error &&
    pinned.length === 0 &&
    recents.length === 0;

  const renderItem = (conversation) => (
    <HistoryItem
      key={conversation._id}
      conversation={conversation}
      active={conversation._id === activeId}
      menuOpen={menuId === conversation._id}
      renaming={renamingId === conversation._id}
      onSelect={() => onSelect(conversation)}
      onToggleMenu={() =>
        setMenuId((id) =>
          id === conversation._id ? null : conversation._id
        )
      }
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
    <aside
      className={`relative flex min-h-0 flex-col border-r border-white/[0.07] bg-[#131217] ${className}`}
      aria-label="Chat history"
    >
      <div className="flex shrink-0 items-center gap-2 p-3">
        <button
          type="button"
          onClick={onNewChat}
          disabled={disabled}
          className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-gray-200 transition hover:border-violet-400/40 hover:bg-white/[0.06] disabled:opacity-40"
        >
          <Plus size={16} className="text-violet-300" />
          New chat
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="shrink-0 px-3 pb-2">
        <label className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 focus-within:border-violet-400/40">
          <Search size={14} className="shrink-0 text-gray-500" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chats"
            aria-label="Search conversations by title"
            maxLength={100}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />

          {loading && isSearching ? (
            <Loader2 size={14} className="animate-spin text-gray-500" />
          ) : search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading && pinned.length === 0 && recents.length === 0 && (
          <div className="space-y-2 px-1 pt-2" aria-busy="true">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-8 animate-pulse rounded-lg bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mx-1 mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-2 rounded-md border border-red-300/30 px-2 py-1 hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center px-4 pt-10 text-center text-xs text-gray-500">
            <MessageSquare size={22} className="mb-2 text-gray-600" />
            {isSearching ? (
              <p>No chats match “{search.trim()}”.</p>
            ) : (
              <p>No conversations yet. Your chats will appear here.</p>
            )}
          </div>
        )}

        {pinned.length > 0 && (
          <section className="mt-1">
            <h3 className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Pinned
            </h3>
            <ul className="space-y-0.5">{pinned.map(renderItem)}</ul>
          </section>
        )}

        {recents.length > 0 && (
          <section className="mt-1">
            <h3 className="px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Recents
            </h3>
            <ul className="space-y-0.5">{recents.map(renderItem)}</ul>
          </section>
        )}
      </div>

      {actionError && (
        <div role="alert" className="mx-3 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {actionError}
        </div>
      )}

      {confirmDelete && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setConfirmDelete(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="chat-delete-title"
            className="w-full max-w-sm rounded-2xl border border-[#292832] bg-[#1b1a22] p-5 shadow-2xl"
          >
            <h3 id="chat-delete-title" className="text-base font-semibold text-white">
              Delete chat?
            </h3>

            <p className="mt-2 break-words text-sm text-gray-400">
              This will permanently delete{" "}
              <span className="text-gray-200">“{confirmDelete.title}”</span>{" "}
              and all of its messages.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
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
    if (!menuOpen) return;

    const onDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onCloseMenu();
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen, onCloseMenu]);

  useEffect(() => {
    if (!renaming) return;

    committedRef.current = false;
    setDraft(conversation.title);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [renaming, conversation.title]);

  const commit = () => {
    if (committedRef.current) return;
    committedRef.current = true;

    const value = draft.trim();

    if (!value || value === conversation.title) {
      onCancelRename();
    } else {
      onRename(value);
    }
  };

  if (renaming) {
    return (
      <li className="px-1">
        <input
          ref={inputRef}
          value={draft}
          maxLength={120}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            } else if (event.key === "Escape") {
              committedRef.current = true;
              onCancelRename();
            }
          }}
          aria-label="Conversation title"
          className="w-full rounded-lg border border-violet-500/60 bg-[#1b1a22] px-2.5 py-1.5 text-sm text-white outline-none"
        />
      </li>
    );
  }

  return (
    <li ref={menuRef} className="relative">
      <div
        className={`group flex items-center rounded-lg transition ${
          active
            ? "bg-white/[0.09] text-white"
            : "text-gray-300 hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          title={conversation.title}
          aria-current={active ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm"
        >
          {conversation.pinned && (
            <Pin size={12} className="shrink-0 text-violet-300" />
          )}
          <span className="truncate">{conversation.title}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={`More actions for ${conversation.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="mr-1 shrink-0 rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-1 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-[#292832] bg-[#1f1e26] py-1 shadow-2xl"
        >
          <MenuButton
            icon={conversation.pinned ? PinOff : Pin}
            label={conversation.pinned ? "Unpin" : "Pin"}
            onClick={onPin}
          />
          <MenuButton icon={Pencil} label="Rename" onClick={onStartRename} />
          <MenuButton icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      )}
    </li>
  );
}

function MenuButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-white/[0.07] ${
        danger ? "text-red-300" : "text-gray-200"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

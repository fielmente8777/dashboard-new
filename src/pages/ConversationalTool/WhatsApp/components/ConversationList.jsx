import {
  Check,
  CheckCheck,
  ListChecks,
  MessagesSquare,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState } from "../../../../components/ui/States";
import { getStageTone } from "../../../Leads/leadUtils";
import ContactAvatar from "./ContactAvatar";
import {
  CHAT_TABS,
  byLatestActivity,
  formatListTime,
  getLastActivity,
  isInTab,
  matchesSearch,
} from "../chatUtils";

const ConversationRow = ({
  conversation,
  open,
  checked,
  selecting,
  onOpen,
  onToggleCheck,
}) => {
  const unread = conversation.unread_count || 0;
  const highlighted = selecting ? checked : open;

  return (
    <li
      // while selecting, a click picks the chat instead of opening it
      onClick={selecting ? onToggleCheck : onOpen}
      role={selecting ? "checkbox" : undefined}
      aria-checked={selecting ? checked : undefined}
      className={`group relative mx-2 my-0.5 flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
        highlighted
          ? "bg-blue-500/10 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-blue-500"
          : "hover:bg-app-surface-secondary"
      }`}
    >
      <ContactAvatar name={conversation.name} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={`truncate text-sm capitalize text-app-text ${unread ? "font-semibold" : "font-medium"}`}
          >
            {conversation.name || conversation.phone}
          </p>
          <span
            className={`shrink-0 text-[11px] ${unread ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-app-text-muted"}`}
          >
            {formatListTime(getLastActivity(conversation))}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={`flex min-w-0 items-center gap-1 text-xs ${unread ? "font-medium text-app-text" : "text-app-text-muted"}`}
          >
            {conversation.last_message?.sender === "me" && (
              <Icon icon={CheckCheck} size="xs" className="shrink-0 text-sky-500" />
            )}
            <span className="truncate">
              {conversation.last_message?.text || "No messages yet"}
            </span>
          </p>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="truncate text-[11px] tabular-nums text-app-text-faint">
            {conversation.phone}
          </span>
          {conversation.status && (
            <Badge
              tone={getStageTone(conversation.status)}
              className="px-1.5! py-0! text-[10px]! capitalize"
            >
              {conversation.status.toLowerCase() === "active"
                ? "Open"
                : conversation.status}
            </Badge>
          )}
        </div>
      </div>

      {selecting && (
        <span
          aria-hidden="true"
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            checked
              ? "border-blue-500! bg-blue-500 text-white"
              : "border-app-text-faint/50! bg-app-surface"
          }`}
        >
          {checked && <Icon icon={Check} size="xs" />}
        </span>
      )}
    </li>
  );
};

// The list of conversations: search, the three tabs, and select-to-delete
// (the "Select chats" button turns clicks into picking chats).
//   onOpen(conversation)  onTabChange(tab)  onNew()  onDelete(ids) -> true when deleted
const ConversationList = ({
  conversations,
  openId,
  tab,
  onTabChange,
  onOpen,
  onNew,
  onDelete,
}) => {
  const [search, setSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState([]);
  const [selecting, setSelecting] = useState(false);

  // per tab: every conversation, or only the matches while searching
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CHAT_TABS.map(({ value }) => [
          value,
          conversations.filter(
            (item) => isInTab(item, value) && matchesSearch(item, search),
          ).length,
        ]),
      ),
    [conversations, search],
  );

  // Searching jumps to the tab that has the conversation: the open tab stays
  // when it has a match, otherwise the first tab that does (Active, Inactive,
  // Converted). Clicking another tab afterwards is left alone.
  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) return;

    const hasMatch = (tabValue) =>
      conversations.some(
        (item) => isInTab(item, tabValue) && matchesSearch(item, value),
      );
    if (hasMatch(tab)) return;
    const next = CHAT_TABS.find((item) => hasMatch(item.value));
    if (next) onTabChange(next.value);
  };

  const visible = useMemo(
    () =>
      conversations
        .filter((item) => isInTab(item, tab) && matchesSearch(item, search))
        .sort(byLatestActivity),
    [conversations, tab, search],
  );

  // only what is on screen can be selected
  const checked = checkedIds.filter((id) =>
    visible.some((item) => item._id === id),
  );
  const allChecked = visible.length > 0 && checked.length === visible.length;

  const toggleCheck = (id) =>
    setCheckedIds(
      checked.includes(id)
        ? checked.filter((item) => item !== id)
        : [...checked, id],
    );

  const stopSelecting = () => {
    setSelecting(false);
    setCheckedIds([]);
  };

  const handleDelete = async () => {
    if (await onDelete(checked)) stopSelecting();
  };

  return (
    <div className="flex min-h-0 w-full flex-col bg-app-surface">
      <div className="shrink-0 space-y-3 border-b border-app-border! p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-app-text">Chats</h2>
            <p className="text-xs text-app-text-muted">
              {conversations.length.toLocaleString()} conversations
            </p>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={ListChecks}
              label={selecting ? "Stop selecting" : "Select chats"}
              className={`size-9! ${selecting ? "bg-blue-500/15 text-blue-600! dark:text-blue-300!" : ""}`}
              onClick={() => (selecting ? stopSelecting() : setSelecting(true))}
            />
            <IconButton
              icon={Plus}
              label="Message a new number"
              className="size-9! bg-emerald-600 text-white! hover:bg-emerald-500!"
              onClick={onNew}
            />
          </div>
        </div>

        <div className="relative">
          <Icon
            icon={Search}
            size="sm"
            tone="faint"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search name, number or message"
            aria-label="Search conversations"
            className="rounded-full! bg-app-surface-secondary! pl-9!"
          />
        </div>

        {/* the three tabs as one segmented control */}
        <div
          role="tablist"
          className="grid grid-cols-3 gap-1 rounded-lg bg-app-surface-secondary p-1"
        >
          {CHAT_TABS.map((item) => {
            const active = item.value === tab;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(item.value)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-app-surface text-app-text shadow-sm"
                    : "text-app-text-muted hover:text-app-text"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                    active
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-app-surface/60 text-app-text-faint"
                  }`}
                >
                  {counts[item.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selecting && (
        <div className="anim-enter flex shrink-0 items-center gap-2 border-b border-app-border! bg-blue-500/10 px-3 py-2">
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
            onClick={() =>
              setCheckedIds(allChecked ? [] : visible.map((item) => item._id))
            }
          >
            {allChecked ? "Clear all" : "Select all"}
          </button>
          <span className="flex-1 truncate text-sm text-app-text-muted">
            {checked.length} selected
          </span>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            disabled={checked.length === 0}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <IconButton icon={X} label="Done" onClick={stopSelecting} />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={MessagesSquare}
            title={search ? "No conversations match" : "No conversations here"}
            description={
              search
                ? "Nothing in any tab matches. Try a different name or number."
                : "WhatsApp messages from your guests will appear here."
            }
          />
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto py-1">
          {visible.map((conversation) => (
            <ConversationRow
              key={conversation._id}
              conversation={conversation}
              open={conversation._id === openId}
              checked={checked.includes(conversation._id)}
              selecting={selecting}
              onOpen={() => onOpen(conversation)}
              onToggleCheck={() => toggleCheck(conversation._id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;

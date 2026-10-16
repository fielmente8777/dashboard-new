import { MessagesSquare, Plus, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState } from "../../../../components/ui/States";
import Tabs from "../../../../components/ui/Tabs";
import {
  CHAT_TABS,
  byLatestActivity,
  formatListTime,
  getAvatarColor,
  getLastActivity,
  isInTab,
  matchesSearch,
} from "../chatUtils";

const ConversationRow = ({
  conversation,
  open,
  checked,
  showCheckbox,
  onOpen,
  onToggleCheck,
}) => {
  const unread = conversation.unread_count || 0;

  return (
    <li
      onClick={onOpen}
      className={`group relative flex cursor-pointer items-center gap-3 border-b border-app-border! px-3 py-3 transition-colors ${
        open ? "bg-blue-500/10" : "hover:bg-app-surface-secondary"
      }`}
    >
      {/* the checkbox takes the avatar's place on hover, or while selecting */}
      <div className="relative size-10 shrink-0">
        <span
          className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(conversation.name)} ${
            showCheckbox ? "invisible" : "lg:group-hover:invisible"
          }`}
        >
          {conversation.name?.charAt(0)?.toUpperCase() || <Icon icon={User} />}
        </span>
        <span
          className={`absolute inset-0 items-center justify-center ${
            showCheckbox ? "flex" : "hidden lg:group-hover:flex"
          }`}
        >
          <input
            type="checkbox"
            aria-label={`Select ${conversation.name || conversation.phone}`}
            className="size-4 cursor-pointer accent-primary"
            checked={checked}
            onChange={onToggleCheck}
            onClick={(e) => e.stopPropagation()}
          />
        </span>
      </div>

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
            className={`truncate text-xs ${unread ? "text-app-text" : "text-app-text-muted"}`}
          >
            {conversation.last_message?.sender === "me" && "You: "}
            {conversation.last_message?.text || "No messages yet"}
          </p>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="truncate text-[11px] text-app-text-faint">
            {conversation.phone}
          </span>
          {conversation.status && (
            <Badge tone="green" className="capitalize">
              {conversation.status.toLowerCase() === "active"
                ? "Open"
                : conversation.status}
            </Badge>
          )}
        </div>
      </div>
    </li>
  );
};

// The list of conversations: search, the three tabs, and select-to-delete.
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

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CHAT_TABS.map(({ value }) => [
          value,
          conversations.filter((item) => isInTab(item, value)).length,
        ]),
      ),
    [conversations],
  );

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

  const handleDelete = async () => {
    if (await onDelete(checked)) setCheckedIds([]);
  };

  return (
    <div className="flex min-h-0 w-full flex-col bg-app-surface">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! px-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, number or message"
          aria-label="Search conversations"
        />
        <IconButton
          icon={Plus}
          label="Message a new number"
          className="size-9! bg-primary text-white! hover:bg-primary/90! dark:bg-blue-600"
          onClick={onNew}
        />
      </div>

      <div className="shrink-0 border-b border-app-border! p-2">
        <Tabs
          tabs={CHAT_TABS.map((item) => ({ ...item, count: counts[item.value] }))}
          value={tab}
          onChange={onTabChange}
        />
      </div>

      {checked.length > 0 && (
        <div className="anim-enter flex shrink-0 items-center justify-between gap-2 border-b border-app-border! bg-blue-500/10 px-3 py-2">
          <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm text-app-text">
            <input
              type="checkbox"
              className="size-4 shrink-0 cursor-pointer accent-primary"
              checked={allChecked}
              onChange={() =>
                setCheckedIds(allChecked ? [] : visible.map((item) => item._id))
              }
            />
            <span className="truncate">{checked.length} selected</span>
          </label>
          <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={MessagesSquare}
            title={search ? "No conversations match" : "No conversations here"}
            description={
              search
                ? "Try a different name or number, or look in another tab."
                : "WhatsApp messages from your guests will appear here."
            }
          />
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {visible.map((conversation) => (
            <ConversationRow
              key={conversation._id}
              conversation={conversation}
              open={conversation._id === openId}
              checked={checked.includes(conversation._id)}
              showCheckbox={checked.length > 0}
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

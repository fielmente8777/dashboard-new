import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  PanelRight,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import CustomDropdown from "../../../../components/ui/Dropdown";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import {
  getConversationAssignee,
  getLastActivity,
  isWindowClosed,
} from "../chatUtils";
import ContactAvatar from "./ContactAvatar";

// The bar above the messages: who the chat is with, and the actions on it.
// Clicking the guest's picture or name opens their lead.
// While messages are selected it turns into the bar for deleting them.
//   onBack()  onShowProfile()  onOpenLead()  onCall()  onAssign(user)
//   onDeleteSelected()  onClearSelection()
//   findingLead - the lead is being looked up
const ChatHeader = ({
  conversation,
  users,
  selectedCount,
  findingLead,
  onBack,
  onShowProfile,
  onOpenLead,
  onCall,
  onAssign,
  onDeleteSelected,
  onClearSelection,
}) => {
  if (selectedCount > 0) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! bg-blue-500/10 px-3 sm:px-5">
        <IconButton icon={X} label="Cancel" onClick={onClearSelection} />
        <p className="flex-1 text-sm font-medium text-app-text">
          {selectedCount} {selectedCount === 1 ? "message" : "messages"}{" "}
          selected
        </p>
        <Button variant="danger" size="sm" icon={Trash2} onClick={onDeleteSelected}>
          Delete
        </Button>
      </header>
    );
  }

  const assignee = getConversationAssignee(conversation);
  const open = !isWindowClosed(getLastActivity(conversation));

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! bg-app-surface px-3 sm:px-4">
      <IconButton
        icon={ArrowLeft}
        label="Back to conversations"
        className="lg:hidden"
        onClick={onBack}
      />

      <button
        type="button"
        onClick={onOpenLead}
        disabled={findingLead}
        title="Open this guest's lead"
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 pr-2 text-left transition hover:bg-app-surface-secondary disabled:cursor-wait"
      >
        <span className="relative">
          <ContactAvatar
            name={conversation.name}
            className="ring-2 ring-transparent transition group-hover:ring-blue-500/50"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-app-surface! ${open ? "bg-emerald-500" : "bg-gray-400"}`}
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold capitalize text-app-text group-hover:text-blue-600 dark:group-hover:text-blue-300">
              {conversation.name || conversation.phone}
            </span>
            <Icon
              icon={findingLead ? Loader2 : ExternalLink}
              size="xs"
              className={`shrink-0 text-app-text-faint transition group-hover:text-blue-500 ${findingLead ? "animate-spin" : "opacity-0 group-hover:opacity-100"}`}
            />
          </span>
          <span className="block truncate text-xs text-app-text-muted">
            {conversation.phone}
            <span className="mx-1.5 text-app-text-faint">·</span>
            {open ? "Can reply" : "Template only (24h passed)"}
          </span>
        </span>
      </button>

      <div className="hidden w-40 md:block">
        <CustomDropdown
          key={`${conversation._id}-${assignee}`}
          label={assignee || "Assign to"}
          options={users.map((user) => ({
            value: user.userName,
            label: user.userName,
          }))}
          onChange={(userName) =>
            onAssign(users.find((user) => user.userName === userName))
          }
          className="h-9 border-app-border! py-0!"
        />
      </div>

      <IconButton icon={Phone} label="Call" onClick={onCall} />

      <IconButton
        icon={PanelRight}
        label="Guest details"
        className="xl:hidden"
        onClick={onShowProfile}
      />
    </header>
  );
};

export default ChatHeader;

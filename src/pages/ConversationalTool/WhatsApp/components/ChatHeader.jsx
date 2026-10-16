import { ArrowLeft, PanelRight, Phone, Trash2, X } from "lucide-react";
import Button from "../../../../components/ui/Button";
import CustomDropdown from "../../../../components/ui/Dropdown";
import IconButton from "../../../../components/ui/IconButton";
import { getAvatarColor } from "../chatUtils";

// The bar above the messages: who the chat is with, and the actions on it.
// While messages are selected it turns into the bar for deleting them.
//   onBack()  onShowProfile()  onOpenLead()  onCall()  onAssign(user)
//   onDeleteSelected()  onClearSelection()
const ChatHeader = ({
  conversation,
  users,
  selectedCount,
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

  const assignee = conversation.assignee || conversation.assignedTo;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! bg-app-surface px-3 sm:px-5">
      <IconButton
        icon={ArrowLeft}
        label="Back to conversations"
        className="lg:hidden"
        onClick={onBack}
      />

      <button
        type="button"
        onClick={onShowProfile}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(conversation.name)}`}
        >
          {conversation.name?.charAt(0)?.toUpperCase() || "?"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold capitalize text-app-text">
            {conversation.name || conversation.phone}
          </span>
          <span className="block truncate text-xs text-app-text-muted">
            {conversation.phone}
          </span>
        </span>
      </button>

      {conversation.leadId && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={onOpenLead}
        >
          View lead
        </Button>
      )}

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
        />
      </div>

      <Button size="sm" icon={Phone} onClick={onCall}>
        <span className="hidden sm:inline">Call</span>
      </Button>

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

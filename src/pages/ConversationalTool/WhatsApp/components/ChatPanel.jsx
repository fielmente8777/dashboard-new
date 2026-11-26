import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import CallLeadDialog from "../../../../components/CallLeadDialog";
import Button from "../../../../components/ui/Button";
import { ErrorState } from "../../../../components/ui/States";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useApiAction } from "../../../../hooks/useApiAction";
import {
  useGetTeamUsersQuery,
  useGetWhatsAppTemplatesQuery,
  useMakeCallMutation,
} from "../../../../redux/api/callsApi";
import {
  useDeleteMessagesMutation,
  useGetFlowSessionQuery,
  useGetMessagesQuery,
  useGetQuickRepliesQuery,
  useGetWhatsAppAccountQuery,
  useGetWhatsAppFlowsQuery,
  useSetConversationHandlingMutation,
  useUpdateFlowSessionMutation,
} from "../../../../redux/api/whatsappApi";
import {
  getConversationAssignee,
  getHandling,
  getWindowStart,
  isWindowClosed,
} from "../chatUtils";
import { useChatCache } from "../hooks/useChatCache";
import { useConversationLead } from "../hooks/useConversationLead";
import { useOpenConversationLead } from "../hooks/useOpenConversationLead";
import { useSendMessage } from "../hooks/useSendMessage";
import AssignPrompt from "./AssignPrompt";
import ChatHeader from "./ChatHeader";
import Composer from "./Composer";
import MessageList from "./MessageList";
import WindowClosingBar from "./WindowClosingBar";

const NO_MESSAGES = [];

// Shown instead of the message box when someone else is replying.
const HandlingBar = ({ children, action }) => (
  <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-t border-app-border! bg-app-surface-secondary px-4 py-3 text-sm text-app-text-muted">
    {children}
    {action}
  </div>
);

// The open conversation: header, messages and the message box.
// Give it `key={conversation._id}` so each conversation starts clean.
//   canCall     - the calling provider is connected
//   knownLeadId - the lead the chat was opened from, if any
//   onBack()  onShowProfile()  onSend()
const ChatPanel = ({
  conversation,
  hid,
  ndid,
  canCall,
  knownLeadId,
  onBack,
  onShowProfile,
  onSend,
}) => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const cache = useChatCache(hid);
  const authUser = useSelector((state) => state.userProfile.authUser);
  const userEmail = authUser?.emailId;

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isCallOpen, setIsCallOpen] = useState(false);

  const messages = useGetMessagesQuery(conversation._id, {
    refetchOnMountOrArgChange: true,
  });
  const account = useGetWhatsAppAccountQuery(hid);
  const templates = useGetWhatsAppTemplatesQuery(hid);
  const flows = useGetWhatsAppFlowsQuery(hid);
  const quickReplies = useGetQuickRepliesQuery(hid);
  const users = useGetTeamUsersQuery();
  const flowSession = useGetFlowSessionQuery(
    { hid, ndid, phone: conversation.phone },
    { refetchOnMountOrArgChange: true },
  );

  const [deleteMessages] = useDeleteMessagesMutation();
  const [setHandling, { isLoading: isChangingHandling }] =
    useSetConversationHandlingMutation();
  const [updateFlowSession, { isLoading: isStoppingFlow }] =
    useUpdateFlowSessionMutation();
  const [makeCall, { isLoading: isCalling }] = useMakeCallMutation();

  const send = useSendMessage(hid, conversation, onSend);
  const saveLead = useConversationLead(hid, conversation);
  const lead = useOpenConversationLead({
    hid,
    conversation,
    knownLeadId,
    saveLead,
  });

  const messageList = messages.data || NO_MESSAGES;
  const windowClosed = isWindowClosed(getWindowStart(conversation));

  // with the AI on, only the person who took the chat over may write
  const aiEnabled = Boolean(account.data?.ai?.enabled);
  const handling = getHandling(conversation, userEmail);

  // `send` changes with every message; the list gets a handler that does not,
  // so its (memoised) bubbles are not all redrawn each time
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  const handleResend = useCallback(
    (message) => sendRef.current.resend(message),
    [],
  );

  // the fields the call dialog reads; stable so the dialog keeps what is typed
  const callTarget = useMemo(
    () => ({
      Contact: conversation.phone,
      assignee: getConversationAssignee(conversation),
    }),
    [conversation],
  );

  const handleToggleSelect = useCallback((message) => {
    const key = message.messageId || message._id;
    setSelectedKeys((keys) =>
      keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key],
    );
  }, []);

  const handleDeleteSelected = async () => {
    const count = selectedKeys.length;
    const confirmed = await confirm(
      `Delete ${count} ${count === 1 ? "message" : "messages"}?`,
      { title: "Delete messages" },
    );
    if (!confirmed) return;

    // messages that never reached WhatsApp only exist here
    const sentIds = messageList
      .filter((message) => selectedKeys.includes(message.messageId))
      .map((message) => message.messageId);

    if (sentIds.length > 0) {
      const deleted = await run(deleteMessages(sentIds), {
        error: "Could not delete the messages.",
      });
      if (!deleted) return;
    }

    cache.patchMessages(conversation._id, (list) =>
      list.filter(
        (message) =>
          !selectedKeys.includes(message.messageId || message._id),
      ),
    );
    setSelectedKeys([]);
  };

  const changeHandling = async (release) => {
    if (release) {
      const confirmed = await confirm(
        "The AI will resume replying to this guest.",
        { title: "Hand back to AI?", confirmText: "Hand back", variant: "primary" },
      );
      if (!confirmed) return;
    }

    const result = await run(
      setHandling({ conversationId: conversation._id, userEmail, release }),
      {
        success: release
          ? "Conversation handed back to the AI"
          : "You are now replying to this guest",
        error: release
          ? "Could not hand the conversation back to the AI."
          : "Could not take over. Someone else may already be replying.",
      },
    );
    if (!result) return;

    cache.patchConversation(conversation._id, {
      handling:
        result.handling ||
        (release
          ? { mode: "AI", assignedTo: null }
          : { mode: "HUMAN", assignedTo: userEmail }),
    });
  };

  const stopFlow = async () => {
    const stopped = await run(
      updateFlowSession({
        hid,
        ndid,
        phone: conversation.phone,
        isActive: false,
      }),
      {
        success: "You can reply now",
        error: "Could not take over from the automated flow.",
      },
    );
    if (stopped) flowSession.refetch();
  };

  // Assigns the chat; gian gives every lead of the guest's number (WhatsApp,
  // Meta, web form ...) the same assignee, so All Leads shows the same person.
  const handleAssign = (user) =>
    saveLead(
      {
        assignee: user.userName,
        assigneeNumber: user.phone || null,
        assigneeEmail: user.emailId || null,
      },
      `Assigned to ${user.userName}`,
    );

  // the signed-in person as a team member, for "Assign to me"
  const me = useMemo(() => {
    if (!userEmail) return null;
    const member = (users.data || []).find(
      (user) => String(user.emailId).toLowerCase() === String(userEmail).toLowerCase(),
    );
    if (member) return member;
    const name = authUser?.userName || authUser?.displayName;
    return name ? { userName: name, emailId: userEmail, phone: authUser?.phone } : null;
  }, [users.data, userEmail, authUser]);

  const handleCallClick = () => {
    // without the calling provider, hand the number to the device instead
    if (canCall) setIsCallOpen(true);
    else window.location.assign(`tel:${conversation.phone}`);
  };

  const handleCall = async (fromNumber, toNumber) => {
    // the chat's name goes with the call, so the Calls page shows who was called
    const started = await run(makeCall({ hid, fromNumber, toNumber, guestName: conversation.name || undefined, guestSource: "whatsapp" }), {
      success: "Call started. The team member's phone will ring first.",
      error: "Could not start the call.",
    });
    if (started) setIsCallOpen(false);
  };

  const renderFooter = () => {
    // who may write is not known until the account has loaded
    if (account.isLoading) return null;

    if (aiEnabled && handling.byOther) {
      return (
        <HandlingBar>A teammate is replying to this conversation.</HandlingBar>
      );
    }

    if (aiEnabled && handling.byAi) {
      return (
        <HandlingBar
          action={
            <Button
              size="sm"
              loading={isChangingHandling}
              onClick={() => changeHandling(false)}
            >
              Take over
            </Button>
          }
        >
          The AI is replying to this guest.
        </HandlingBar>
      );
    }

    if (flowSession.data === true) {
      return (
        <HandlingBar
          action={
            <Button size="sm" loading={isStoppingFlow} onClick={stopFlow}>
              Take over
            </Button>
          }
        >
          An automated flow is replying to this guest.
        </HandlingBar>
      );
    }

    return (
      <Composer
        windowClosed={windowClosed}
        templates={templates.data || []}
        templatesLoading={templates.isLoading}
        flows={flows.data || []}
        quickReplies={quickReplies.data || []}
        send={send}
        onHandBack={
          aiEnabled && handling.byMe ? () => changeHandling(true) : undefined
        }
        handingBack={isChangingHandling}
      />
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-app-surface">
      <ChatHeader
        conversation={conversation}
        users={users.data || []}
        selectedCount={selectedKeys.length}
        onBack={onBack}
        onShowProfile={onShowProfile}
        findingLead={lead.finding}
        onOpenLead={lead.openLead}
        onCall={handleCallClick}
        onAssign={handleAssign}
        onDeleteSelected={handleDeleteSelected}
        onClearSelection={() => setSelectedKeys([])}
      />

      <AssignPrompt conversation={conversation} me={me} onAssign={handleAssign} />

      {messages.isError ? (
        <div className="min-h-0 flex-1 p-4">
          <ErrorState
            message="Could not load the messages."
            onRetry={messages.refetch}
          />
        </div>
      ) : (
        <MessageList
          conversation={conversation}
          messages={messageList}
          loading={messages.isLoading}
          ndid={ndid}
          selectedKeys={selectedKeys}
          onToggleSelect={handleToggleSelect}
          onResend={handleResend}
        />
      )}

      <WindowClosingBar conversation={conversation} />
      {renderFooter()}

      <CallLeadDialog
        open={isCallOpen}
        lead={callTarget}
        users={users.data || []}
        calling={isCalling}
        onCall={handleCall}
        onClose={() => setIsCallOpen(false)}
      />
    </div>
  );
};

export default ChatPanel;

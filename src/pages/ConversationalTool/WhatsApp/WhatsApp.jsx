import { MessageCircle, MessagesSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import { useGetWhatsAppTemplatesQuery } from "../../../redux/api/callsApi";
import {
  useConnectWhatsAppMutation,
  useDeleteConversationMutation,
  useDeleteConversationsMutation,
  useGetConversationsQuery,
  useGetIntegrationStatusQuery,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
} from "../../../redux/api/whatsappApi";
import { getConversationTab, samePhone } from "./chatUtils";
import ChatPanel from "./components/ChatPanel";
import ChatSkeleton from "./components/ChatSkeleton";
import ConversationList from "./components/ConversationList";
import NewContactModal from "./components/NewContactModal";
import ProfilePanel from "./components/ProfilePanel";
import { useChatCache } from "./hooks/useChatCache";
import { useChatSocket } from "./hooks/useChatSocket";

const NO_CONVERSATIONS = [];
const PAGE_TITLE = "WhatsApp";

const ConnectWhatsApp = ({ connecting, onConnect }) => (
  <div className="flex w-full items-start justify-center overflow-y-auto px-4 py-10">
    <div className="anim-enter w-full max-w-md rounded-2xl border border-app-border! bg-app-surface p-6 text-center sm:p-8">
      <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Icon icon={MessageCircle} size={28} />
      </span>
      <h2 className="text-xl font-semibold text-app-text">
        Connect WhatsApp Business
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-app-text-muted">
        Connect your WhatsApp Business account to chat with guests, send
        templates and automate replies, all from this dashboard.
      </p>
      <Button
        size="lg"
        className="mt-6 w-full"
        loading={connecting}
        onClick={onConnect}
      >
        Connect WhatsApp Business
      </Button>
      <p className="mt-4 text-xs text-app-text-faint">
        Secure sign-in with Meta · Official WhatsApp Cloud API
      </p>
    </div>
  </div>
);

// WhatsApp live chat: the conversations, the open chat and the guest's
// details. On a wide screen all three sit side by side; on a narrow one
// `pane` says which one is showing.
const WhatsApp = () => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const cache = useChatCache(hid);
  const [searchParams, setSearchParams] = useSearchParams();

  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState("active");
  const [pane, setPane] = useState("list"); // "list" | "chat" | "profile"
  const [isNewOpen, setIsNewOpen] = useState(false);

  const integration = useGetIntegrationStatusQuery(hid, { skip: !hid });
  const isConnected = Boolean(integration.data?.metaWhatsapp);
  const conversationsQuery = useGetConversationsQuery(hid, {
    skip: !hid || !isConnected,
    refetchOnMountOrArgChange: true,
  });
  // only needed once "new message" has been opened
  const templates = useGetWhatsAppTemplatesQuery(hid, {
    skip: !hid || !isNewOpen,
  });
  const [connect, { isLoading: isConnecting }] = useConnectWhatsAppMutation();
  const [markRead] = useMarkConversationReadMutation();
  const [deleteOne, { isLoading: isDeletingOne }] =
    useDeleteConversationMutation();
  const [deleteMany] = useDeleteConversationsMutation();

  const conversations = conversationsQuery.data || NO_CONVERSATIONS;
  const openConversation =
    conversations.find((item) => item._id === openId) || null;
  // already loaded by the chat panel; here for "last active"
  const openMessages = useGetMessagesQuery(openId, { skip: !openConversation });

  useChatSocket({ hid, ndid, openConversation });

  const handleOpen = useCallback(
    (conversation) => {
      setOpenId(conversation._id);
      setPane("chat");

      if (conversation.unread_count > 0) {
        cache.patchConversation(conversation._id, { unread_count: 0 });
        markRead(conversation._id);
      }
    },
    [cache, markRead],
  );

  // Opened from a link (global search, a lead): ?conversationId= or ?phone=
  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    const phone = searchParams.get("phone") || searchParams.get("number");
    if ((!conversationId && !phone) || conversations.length === 0) return;

    const match =
      conversations.find((item) => String(item._id) === conversationId) ||
      (phone && conversations.find((item) => samePhone(item.phone, phone)));

    if (match) {
      setTab(getConversationTab(match));
      handleOpen(match);
    }

    // done with them: a reload must not reopen the conversation
    const next = new URLSearchParams(searchParams);
    ["conversationId", "phone", "number", "status"].forEach((name) =>
      next.delete(name),
    );
    setSearchParams(next, { replace: true });
  }, [conversations, searchParams, setSearchParams, handleOpen]);

  // the browser tab shows how many conversations are waiting, and gets its
  // own title back when the page is left
  const [originalTitle] = useState(() => document.title);
  const waiting = conversations.filter((item) => item.unread_count > 0).length;
  useEffect(() => {
    document.title = waiting ? `(${waiting}) ${PAGE_TITLE}` : PAGE_TITLE;
    return () => {
      document.title = originalTitle;
    };
  }, [waiting, originalTitle]);

  const removeFromList = (ids) => {
    cache.patchConversations((list) =>
      list.filter((item) => !ids.includes(item._id)),
    );
    if (ids.includes(openId)) {
      setOpenId(null);
      setPane("list");
    }
  };

  const handleDeleteMany = async (ids) => {
    const confirmed = await confirm(
      `Delete ${ids.length} ${ids.length === 1 ? "conversation" : "conversations"} and all their messages?`,
      { title: "Delete conversations" },
    );
    if (!confirmed) return false;

    const deleted = await run(deleteMany({ hid, conversationIds: ids }), {
      success: ids.length === 1 ? "Conversation deleted" : "Conversations deleted",
      error: "Could not delete the conversations.",
    });
    if (deleted) removeFromList(ids);
    return Boolean(deleted);
  };

  const handleDeleteOpen = async () => {
    const confirmed = await confirm(
      "Delete this conversation and all its messages?",
      { title: "Delete conversation" },
    );
    if (!confirmed) return;

    const deleted = await run(
      deleteOne({
        hid,
        conversationId: openConversation._id,
        phone: openConversation.phone,
      }),
      {
        success: "Conversation deleted",
        error: "Could not delete the conversation.",
      },
    );
    if (deleted) removeFromList([openConversation._id]);
  };

  const handleConnect = async () => {
    const signupUrl = await run(connect({ hid, ndid }), {
      error: "Could not start the WhatsApp connection.",
    });
    if (typeof signupUrl === "string" && signupUrl) {
      window.open(signupUrl, "_blank", "noopener");
    }
  };

  // after a reply the conversation is active again: keep it in view
  const handleSend = useCallback(
    () => setTab((current) => (current === "inactive" ? "active" : current)),
    [],
  );

  if (!hid || integration.isLoading || conversationsQuery.isLoading) {
    return <ChatSkeleton />;
  }

  const frameClassName = "flex h-[calc(100dvh-8vh)] bg-app-surface";

  if (integration.isError || conversationsQuery.isError) {
    const failed = integration.isError ? integration : conversationsQuery;
    return (
      <div className={`${frameClassName} items-start p-4`}>
        <div className="w-full">
          <ErrorState
            message="Could not load your WhatsApp conversations."
            onRetry={failed.refetch}
          />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={frameClassName}>
        <ConnectWhatsApp connecting={isConnecting} onConnect={handleConnect} />
      </div>
    );
  }

  // Narrow screens show one pane; from `lg` the list and chat sit side by
  // side, and from `xl` the guest details join them.
  const showOn = (name) => (pane === name ? "flex" : "hidden");

  return (
    <div className={frameClassName}>
      <div
        className={`${showOn("list")} min-h-0 w-full shrink-0 border-app-border! lg:flex lg:w-80 lg:border-r xl:w-96`}
      >
        <ConversationList
          conversations={conversations}
          openId={openId}
          tab={tab}
          onTabChange={setTab}
          onOpen={handleOpen}
          onNew={() => setIsNewOpen(true)}
          onDelete={handleDeleteMany}
        />
      </div>

      {openConversation ? (
        <>
          <div
            className={`${showOn("chat")} min-h-0 min-w-0 flex-1 ${pane === "profile" ? "xl:flex" : "lg:flex"}`}
          >
            <ChatPanel
              key={openConversation._id}
              conversation={openConversation}
              hid={hid}
              ndid={ndid}
              canCall={Boolean(integration.data?.exotel)}
              onBack={() => setPane("list")}
              onShowProfile={() => setPane("profile")}
              onSend={handleSend}
            />
          </div>

          <div
            className={`${showOn("profile")} min-h-0 w-full border-app-border! lg:min-w-0 lg:flex-1 xl:flex xl:w-80 xl:flex-none xl:border-l`}
          >
            <ProfilePanel
              key={openConversation._id}
              conversation={openConversation}
              hid={hid}
              lastActive={
                openMessages.data?.at(-1)?.createdAt ||
                openConversation.last_message?.created_at
              }
              deleting={isDeletingOne}
              onBack={() => setPane("chat")}
              onDelete={handleDeleteOpen}
            />
          </div>
        </>
      ) : (
        <div className="chat-backdrop hidden min-w-0 flex-1 items-center justify-center p-6 lg:flex">
          <EmptyState
            icon={MessagesSquare}
            title="Select a conversation"
            description="Choose a conversation on the left to read and reply to it."
          />
        </div>
      )}

      <NewContactModal
        open={isNewOpen}
        templates={templates.data || []}
        loading={templates.isLoading}
        onClose={(sent) => {
          setIsNewOpen(false);
          // the message may have started a conversation
          if (sent) conversationsQuery.refetch();
        }}
      />
    </div>
  );
};

export default WhatsApp;

import { MessagesSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import Icon from "../../../components/ui/Icon";
import { ErrorState } from "../../../components/ui/States";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import { useConfirm } from "../../../context/ConfirmContext";
import {
  useDeleteInstagramConversationMutation,
  useDeleteInstagramConversationsMutation,
  useGetInstagramAccountsQuery,
  useGetInstagramConversationsQuery,
  useLazyGetInstagramDebugQuery,
  useMarkInstagramConversationReadMutation,
  useSubscribeInstagramMutation,
} from "../../../redux/api/instagramApi";
import { useConnectMetaLeadMutation } from "../../../redux/api/integrationsApi";
import ChatSkeleton from "../WhatsApp/components/ChatSkeleton";
import IgChatPanel from "./components/IgChatPanel";
import IgConversationList from "./components/IgConversationList";
import IgProfilePanel from "./components/IgProfilePanel";
import { useInstagramCache } from "./hooks/useInstagramCache";
import { useInstagramSocket } from "./hooks/useInstagramSocket";

const NO_CONVERSATIONS = [];
const PAGE_TITLE = "Instagram";
const FRAME = "flex h-[calc(100dvh-8vh)] overflow-hidden bg-app-surface";

const InstagramBadge = ({ size = 28 }) => (
  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white">
    <Icon icon={FaInstagram} size={size} />
  </span>
);

const ConnectInstagram = ({ connecting, onConnect }) => (
  <div className="flex w-full items-start justify-center overflow-y-auto px-4 py-10">
    <div className="anim-enter w-full max-w-md rounded-2xl border border-app-border! bg-app-surface p-6 text-center sm:p-8">
      <InstagramBadge />
      <h2 className="mt-5 text-xl font-semibold text-app-text">
        Connect Instagram
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-app-text-muted">
        Connect your Facebook Page and select the Instagram business account
        linked to it. Guests' Instagram DMs will then show up here, and you can
        reply from this dashboard.
      </p>
      <Button size="lg" className="mt-6 w-full" loading={connecting} onClick={onConnect}>
        Connect with Facebook
      </Button>
      <p className="mt-4 text-xs text-app-text-faint">
        In the Meta window, tick your Page and its Instagram account.
      </p>
    </div>
  </div>
);

// Setup & debugging: what is connected, which webhook fields the Page is
// subscribed to, whether the token can message, and a button to subscribe.
const DebugDialog = ({ open, hid, onClose }) => {
  const run = useApiAction();
  const [loadDebug, debug] = useLazyGetInstagramDebugQuery();
  const [subscribe, { isLoading: subscribing }] = useSubscribeInstagramMutation();
  const [subscribeResult, setSubscribeResult] = useState(null);

  useEffect(() => {
    if (open && hid) loadDebug(hid);
  }, [open, hid, loadDebug]);

  const handleSubscribe = async () => {
    const result = await run(subscribe(hid), {
      error: "Could not subscribe the Page.",
    });
    if (result) {
      setSubscribeResult(result);
      loadDebug(hid);
    }
  };

  return (
    <Dialog
      open={open}
      size="lg"
      title="Instagram setup & debug"
      description="Use this to check why DMs are or aren't arriving."
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => loadDebug(hid)} loading={debug.isFetching}>
            Refresh
          </Button>
          <Button onClick={handleSubscribe} loading={subscribing}>
            Subscribe Pages to DMs
          </Button>
        </div>
      }
    >
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-app-text-muted">
        <li>
          Meta App Dashboard → Webhooks → <b>Instagram</b>: callback URL{" "}
          <code className="rounded bg-app-surface-secondary px-1">
            {"{BACKEND_URL}"}/api/v1/instagram/webhook
          </code>
          , subscribe to <b>messages</b>, <b>message_reactions</b>, <b>messaging_seen</b>.
        </li>
        <li>
          Reconnect Facebook here so the new <b>instagram_manage_messages</b>{" "}
          permission is granted (check <i>canMessage</i> below).
        </li>
        <li>Click "Subscribe Pages to DMs" (keeps your existing leadgen subscription).</li>
        <li>
          Instagram app → Settings → Messages → Connected tools →{" "}
          <b>Allow access to messages</b> must be on.
        </li>
      </ol>

      {debug.isError && (
        <ErrorState message="Could not load the debug info." onRetry={() => loadDebug(hid)} />
      )}
      {subscribeResult && (
        <pre className="mb-3 max-h-40 overflow-auto rounded-lg bg-app-surface-secondary p-3 text-xs text-app-text">
          {JSON.stringify(subscribeResult, null, 2)}
        </pre>
      )}
      <pre className="max-h-80 overflow-auto rounded-lg bg-app-surface-secondary p-3 text-xs text-app-text">
        {debug.isFetching && !debug.data
          ? "Loading..."
          : JSON.stringify(debug.data, null, 2)}
      </pre>
    </Dialog>
  );
};

// Instagram DMs live chat: the conversations and the open chat, same layout
// as the WhatsApp live chat.
const InstagramDM = () => {
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const cache = useInstagramCache(hid);
  const [searchParams, setSearchParams] = useSearchParams();

  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState("all");
  // narrow screens show one pane; from `lg` list + chat, from `xl` the details too
  const [pane, setPane] = useState("list"); // "list" | "chat" | "profile"
  const [debugOpen, setDebugOpen] = useState(false);

  const accounts = useGetInstagramAccountsQuery(hid, { skip: !hid });
  const isConnected = (accounts.data || []).length > 0;
  const conversationsQuery = useGetInstagramConversationsQuery(hid, {
    skip: !hid || !isConnected,
    refetchOnMountOrArgChange: true,
  });
  const [connectMeta, { isLoading: isConnecting }] = useConnectMetaLeadMutation();
  const [markRead] = useMarkInstagramConversationReadMutation();
  const [deleteOne, { isLoading: isDeletingOne }] = useDeleteInstagramConversationMutation();
  const [deleteMany] = useDeleteInstagramConversationsMutation();
  const { confirm } = useConfirm();

  const conversations = conversationsQuery.data || NO_CONVERSATIONS;
  const openConversation = conversations.find((item) => item._id === openId) || null;

  useInstagramSocket({ hid, ndid, openConversation });

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

  // opened from a notification / lead: ?conversationId=
  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    if (!conversationId || conversations.length === 0) return;

    const match = conversations.find((item) => String(item._id) === conversationId);
    if (match) {
      setTab("all");
      handleOpen(match);
    }
    // done with it: a reload must not reopen the conversation
    const next = new URLSearchParams(searchParams);
    next.delete("conversationId");
    setSearchParams(next, { replace: true });
  }, [conversations, searchParams, setSearchParams, handleOpen]);

  const [originalTitle] = useState(() => document.title);
  const waiting = conversations.filter((item) => item.unread_count > 0).length;
  useEffect(() => {
    document.title = waiting ? `(${waiting}) ${PAGE_TITLE}` : PAGE_TITLE;
    return () => {
      document.title = originalTitle;
    };
  }, [waiting, originalTitle]);

  const removeFromList = (ids) => {
    cache.patchConversations((list) => list.filter((item) => !ids.includes(item._id)));
    if (ids.includes(openId)) {
      setOpenId(null);
      setPane("list");
    }
  };

  // deletes the conversations with all their messages and their leads
  const handleDeleteMany = async (ids) => {
    const confirmed = await confirm(
      `Delete ${ids.length} ${ids.length === 1 ? "conversation" : "conversations"}, all their messages and their leads? This cannot be undone.`,
      { title: "Delete conversations" },
    );
    if (!confirmed) return false;

    const deleted = await run(deleteMany(ids), {
      success: ids.length === 1 ? "Conversation deleted" : "Conversations deleted",
      error: "Could not delete the conversations.",
    });
    if (deleted) removeFromList(ids);
    return Boolean(deleted);
  };

  const handleDeleteOpen = async () => {
    const confirmed = await confirm(
      "Delete this conversation, all its messages and its lead? This cannot be undone.",
      { title: "Delete conversation" },
    );
    if (!confirmed) return;

    const deleted = await run(deleteOne(openConversation._id), {
      success: "Conversation deleted",
      error: "Could not delete the conversation.",
    });
    if (deleted) removeFromList([openConversation._id]);
  };

  const handleConnect = async () => {
    const result = await run(connectMeta({ hid, ndid }), {
      error: "Could not start the Facebook connection.",
    });
    const url = result?.result?.docs?.authUrl;
    if (url) window.location.assign(url);
  };

  if (!hid || accounts.isLoading || conversationsQuery.isLoading) {
    return <ChatSkeleton />;
  }

  if (accounts.isError || conversationsQuery.isError) {
    const failed = accounts.isError ? accounts : conversationsQuery;
    return (
      <div className={`${FRAME} items-start p-4`}>
        <div className="w-full">
          <ErrorState
            message="Could not load your Instagram conversations."
            onRetry={failed.refetch}
          />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={FRAME}>
        <ConnectInstagram connecting={isConnecting} onConnect={handleConnect} />
      </div>
    );
  }

  const showOn = (name) => (pane === name ? "flex" : "hidden");

  return (
    <div className={FRAME}>
      <div
        className={`${showOn("list")} min-h-0 w-full shrink-0 border-app-border! lg:flex lg:w-80 lg:border-r xl:w-96`}
      >
        <IgConversationList
          conversations={conversations}
          openId={openId}
          tab={tab}
          multipleAccounts={accounts.data.length > 1}
          onTabChange={setTab}
          onOpen={handleOpen}
          onDebug={() => setDebugOpen(true)}
          onDelete={handleDeleteMany}
        />
      </div>

      {openConversation ? (
        <>
          <div
            className={`${showOn("chat")} min-h-0 min-w-0 flex-1 ${pane === "profile" ? "xl:flex" : "lg:flex"}`}
          >
            <IgChatPanel
              key={openConversation._id}
              conversation={openConversation}
              hid={hid}
              onBack={() => setPane("list")}
              onShowProfile={() => setPane("profile")}
            />
          </div>

          <div
            className={`${showOn("profile")} min-h-0 w-full border-app-border! lg:min-w-0 lg:flex-1 xl:flex xl:w-80 xl:flex-none xl:border-l`}
          >
            <IgProfilePanel
              key={openConversation._id}
              conversation={openConversation}
              hid={hid}
              deleting={isDeletingOne}
              onBack={() => setPane("chat")}
              onDelete={handleDeleteOpen}
            />
          </div>
        </>
      ) : (
        <div className="chat-backdrop hidden min-w-0 flex-1 items-center justify-center p-6 lg:flex">
          <div className="max-w-sm rounded-2xl border border-app-border! bg-app-surface/95 p-8 text-center shadow-sm backdrop-blur">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-pink-500/15 text-pink-600 dark:text-pink-400">
              <Icon icon={MessagesSquare} size={28} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-app-text">
              Select a conversation
            </h2>
            <p className="mt-1 text-sm text-app-text-muted">
              Pick an Instagram chat on the left to read and reply.
              Connected: {accounts.data
                .map((account) => `@${account.igUsername || account.igAccountId}`)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      <DebugDialog open={debugOpen} hid={hid} onClose={() => setDebugOpen(false)} />
    </div>
  );
};

export default InstagramDM;

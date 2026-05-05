import { useContext, useEffect, useRef, useState } from "react";
import WebSocketClient from "../../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../data/constant";

import WhatesAppChatSkeleton from "../../../components/Skeltons/WhatsappChatSkelton";
import DataContext from "../../../context/DataContext";
import useNotificationSound from "../../../hooks/useNotificationSound";
import { connectWhatsapp } from "../../../services/api/Integration";
import { getWhatsappConversation } from "../../../services/api/whatsApp";
import ChatArea from "./components/ChatArea";
import ProfilePanel from "./components/ProfilePanel";
import SidebarChat from "./components/SidebarChat";

const WhatsApp = () => {
  const wsRef = useRef(null);
  const {
    integrationStatus,
    checkIntegrationStatus,
    setConversations,
    conversations,
    selectedConversation,
    isLoadingIntegrationStatus,
    mobileActive,
  } = useContext(DataContext);

  const [loading, setLoading] = useState(false);
  const playNotification = useNotificationSound(
    "/notification-sound/Sound1.mp3",
  );

  const updateConversationWithMessage = (
    conversations,
    incomingMessage,
    selectedConversationId,
  ) => {
    const fromPhone = incomingMessage.from;

    // 1️⃣ Find index of conversation
    const index = conversations.findIndex((conv) => conv.phone === fromPhone);

    // If conversation not found → ignore (or create new)
    if (index === -1) return conversations;

    const conv = conversations[index];

    // 2️⃣ Update conversation data
    const updatedConversation = {
      ...conv,
      last_message: {
        text: incomingMessage.body || incomingMessage.text,
        sender: incomingMessage.sender,
        created_at: incomingMessage.createdAt || new Date(),
        updated_at: incomingMessage.updatedAt || new Date(),
      },
      unread_count:
        conv._id === selectedConversationId
          ? conv.unread_count // if open → don't increment
          : (conv.unread_count || 0) + 1,
      updatedAt: new Date(),
    };

    // 3️⃣ Remove from current position
    const newList = [...conversations];
    newList.splice(index, 1);

    // 4️⃣ Add to TOP
    newList.unshift(updatedConversation);

    return newList;
  };

  // 🔹 Fetch contacts → build conversations
  const getWhatsappConversations = async () => {
    setLoading(true);

    if (!integrationStatus?.metaWhatsapp) return setLoading(false);

    try {
      const response = await getWhatsappConversation();

      if (response?.success && response?.responseStatusCode === 200) {
        setConversations(response?.result?.conversations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 WebSocket incoming messages
  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      const { data } = serverResponse;

      console.log(data);

      if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_NEW_CONVERSATION
      ) {
        const conversation = {
          _id: data._id,
          phone: data.phone,
          name: data.name,
          profile_image: data.profile_image,
          last_message: data?.last_message,
          status: data?.status,
          unreadCount: 0,
          updatedAt: new Date(),
          createdAt: data?.createdAt,
        };

        console.log("data", data);

        if (data?.ndid === localStorage.getItem("ndid")) {
          playNotification();
          setConversations((prev) => [conversation, ...prev]);
        }
      } else if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_NEW_MESSAGE
      ) {
        if (data?.ndid !== localStorage.getItem("ndid")) return;
        playNotification();
        setConversations((prev) =>
          updateConversationWithMessage(prev, data, selectedConversation?._id),
        );

        document.title = `(${data?.unread_count + 1}) ${data?.name} | Whatsapp`;
      }
    });

    return () => wsRef.current?.close();
  }, [selectedConversation, conversations]);

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  useEffect(() => {
    getWhatsappConversations();
  }, [integrationStatus?.metaWhatsapp]);

  const handleWhatsappConnect = async () => {
    try {
      const response = await connectWhatsapp();

      if (response?.success && response?.responseStatusCode) {
        window.open(response?.result?.docs?.signupUrl, "_blank");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoadingIntegrationStatus || loading) return <WhatesAppChatSkeleton />;

  return (
    <div className="h-[calc(100vh-8vh)] flex bg-gray-50">
      {integrationStatus?.metaWhatsapp ? (
        <div className="flex w-full">
          <div className="hidden md:flex w-full">
            <SidebarChat />

            {selectedConversation ? <ChatArea /> : <Fallback />}
            {selectedConversation && (
              <ProfilePanel
                selectedContact={selectedConversation}
                fetchConversations={getWhatsappConversations}
              />
            )}
          </div>
          <div className="flex w-full md:hidden  flex-col ">
            {mobileActive === "sidebar" && <SidebarChat />}

            {mobileActive === "chatarea" && selectedConversation && (
              <ChatArea />
            )}
            {mobileActive === "profile" && selectedConversation && (
              <ProfilePanel
                selectedContact={selectedConversation}
                fetchConversations={getWhatsappConversations}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex w-full justify-center py-12 ">
          <div>
            <div className="max-w-md w-full rounded-2xl bg-white p-8 border border-gray-100 text-center">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-ternary/20">
                <svg
                  className="h-7 w-7 text-ternary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 21l1.5-4.5A8.5 8.5 0 1 1 21 12a8.5 8.5 0 0 1-8.5 8.5H3z" />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-semibold text-gray-900">
                Connect WhatsApp Business
              </h2>

              {/* Description */}
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Connect your WhatsApp Business account to send messages, manage
                conversations, automate notifications, and engage with customers
                directly from your dashboard.
              </p>

              {/* CTA */}
              <button
                onClick={handleWhatsappConnect} // 👈 Meta OAuth / Embedded Signup
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ternary/90  px-6 py-3 text-sm font-medium text-white transition hover:bg-ternary focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <span>Connect WhatsApp Business</span>
              </button>

              {/* Helper text */}
              <p className="mt-4 text-xs text-gray-400">
                Secure Meta OAuth • Embedded signup • Official WhatsApp Cloud
                API
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp;

const Fallback = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center h-full w-full bg-linear-to-br from-green-50 to-teal-50 px-6 text-center">
      {/* Icon Circle */}
      <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-6 animate-pulse">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-teal-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.3-3.9A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Welcome to Eaz-WhatsApp
      </h2>

      {/* Subtext */}
      <p className="text-gray-500 max-w-sm leading-relaxed">
        Select a conversation from the left panel to start chatting. Your
        messages will appear here.
      </p>

      {/* Decorative Divider */}
      <div className="mt-8 w-24 h-1 bg-teal-400 rounded-full opacity-60"></div>
    </div>
  );
};

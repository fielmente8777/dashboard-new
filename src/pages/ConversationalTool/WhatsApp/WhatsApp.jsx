import { useEffect, useRef, useState } from "react";
import WebSocketClient from "../../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../data/constant";
import normalizePhone from "../../../utils/normalizePhone";

import WhatesAppChatSkeleton from "../../../components/Skeltons/WhatsappChatSkelton";
import {
  getWhatsappConversation,
  getWhatsappConversationMessages,
  sendWhatsAppMessage,
} from "../../../services/api/whatsApp";
import ChatArea from "./components/ChatArea";
import SidebarChat from "./components/SidebarChat";
import ProfilePanel from "./components/ProfilePanel";

const WhatsApp = () => {
  const wsRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  // const [selectedConversationId, setSelectedConversationId] = useState(null);

  // 🔹 Fetch contacts → build conversations
  const getWhatsappConversations = async () => {
    setLoading(true);
    try {
      const response = await getWhatsappConversation();

      if (response?.success && response?.responseStatusCode === 200) {
        const list = response.result.conversations.map((c) => ({
          id: c._id,
          phone: c.phone,
          name: c.name,
          profile_image: c.profile_image,
          messages: [],
          lastMessage: c.last_message || null,
          unreadCount: c.unread_count || 0,
          updatedAt: c.updatedAt,
        }));

        setConversations(list);
        setSelectedConversation(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Sidebar click
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // setSelectedConversation(conversation);

    // clear unread
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
      ),
    );
  };

  const handleSendMessage = async (data) => {
    if (!selectedConversation) return;

    const message = {
      text: data?.text,
      sender: "me",
      createdAt: new Date(),
    };

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === selectedConversation.id) {
          return {
            ...c,
            messages: [...c.messages, message],
            lastMessage: message,
          };
        }
        return c;
      });
      return updated;
    });

    try {
      const formData = new FormData();
      formData.append("phone", selectedConversation.phone);
      console.log(data);

      if (data?.text) {
        formData.append("text", data.text);
      }

      if (data?.file) {
        formData.append("file", data.file); // 👈 KEY LINE
      }
      const response = await sendWhatsAppMessage(formData);

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 WebSocket incoming messages
  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_NEW_CONVERSATION
      ) {
        const { data } = serverResponse;
        const conversation = {
          id: data._id,
          phone: data.phone,
          name: data.name,
          profile_image: data.profile_image,
          messages: [],
          lastMessage: null,
          unreadCount: 0,
          updatedAt: new Date(),
        };
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversation(conversation);
      }

      if (serverResponse.event !== WEBSOCKET_EVENTS.WHATSAPP_NEW_MESSAGE)
        return;

      const { data } = serverResponse;
      const fromPhone = normalizePhone(data.from);

      setConversations((prev) => {
        let updatedConversation = null;

        const updated = prev.map((conv) => {
          if (normalizePhone(conv.phone) !== fromPhone) return conv;

          const message = {
            text: data.text,
            ...(data?.image && { image: data.image }),
            sender: "contact",
            createdAt: new Date(),
          };

          const isActive = conv.id === selectedConversation?.id;

          updatedConversation = {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message,
            updatedAt: new Date(),
            unreadCount: isActive ? 0 : conv.unreadCount + 1,
          };

          return updatedConversation;
        });

        if (!updatedConversation) return prev;

        // ✅ Auto-open ONLY if none selected or same chat
        if (
          !selectedConversation?.id ||
          selectedConversation?.id === updatedConversation.id
        ) {
          setSelectedConversation(updatedConversation);
        }

        // move to top
        return [
          updatedConversation,
          ...updated.filter((c) => c.id !== updatedConversation.id),
        ];
      });

      // if (selectedConversation?.contact?.phone === data.from) {
      //   setSelectedConversation((prev) => ({
      //     ...prev,
      //     messages: [
      //       ...prev.messages,
      //       { text: data.text, sender: "contact", createdAt: new Date() },
      //     ],
      //     lastMessage: {
      //       text: data.text,
      //       sender: "contact",
      //       createdAt: new Date(),
      //     },
      //   }));
      // }
    });

    return () => wsRef.current?.close();
  }, [selectedConversation]);

  useEffect(() => {
    // if (!selectedConversation?.id) return;

    const loadMessages = async (conversationId) => {
      setLoadingMessages(true);
      try {
        const response = await getWhatsappConversationMessages(conversationId);

        if (response?.success && response?.responseStatusCode === 200) {
          const messages = response?.result?.messages;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConversation.id
                ? {
                    ...c,
                    messages,
                    lastMessage: messages[messages.length - 1] || null,
                    unreadCount: 0,
                  }
                : c,
            ),
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages(selectedConversation?.id);
  }, [selectedConversation?.id]);

  useEffect(() => {
    getWhatsappConversations();
  }, []);

  if (loading) return <WhatesAppChatSkeleton />;

  return (
    <div className="h-[calc(100vh-9.8vh)] flex bg-gray-50">
      <SidebarChat
        conversations={conversations}
        selectedConversationId={selectedConversation}
        onSelect={handleSelectConversation}
      />

      <ChatArea
        selectedContact={selectedConversation}
        messages={selectedConversation?.messages}
        onSubmit={handleSendMessage}
        loadingMessage={loadingMessages}
      />
      <ProfilePanel selectedContact={selectedConversation}/>
    </div>
  );
};

export default WhatsApp;

import { useContext, useEffect, useRef, useState } from "react";
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
import DataContext from "../../../context/DataContext";

const WhatsApp = () => {
  const wsRef = useRef(null);
  const {
      conversations, setConversations, selectedConversation, setSelectedConversation
    } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 🔹 Fetch contacts → build conversations
  const getWhatsappConversations = async () => {
    setLoading(true);
    try {
      const response = await getWhatsappConversation();

      console.log(response);
      // if (response?.success && response?.responseStatusCode === 200) {
      //   const list = response.result.conversations.map((c) => ({
      //     id: c._id,
      //     phone: c.phone,
      //     name: c.name,
      //     profile_image: c.profile_image,
      //     messages: [],
      //     lastMessage: c.last_message || null,
      //     unreadCount: c.unread_count || 0,
      //     updatedAt: c.updatedAt,
      //   }));

      //   // setSelectedConversation(list[0]);
      // }
      setConversations(response?.result?.conversations);

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
          lastMessage: null,
          unreadCount: 0,
          updatedAt: new Date(),
        };
        setConversations((prev) => [conversation, ...prev]);
      }
    });

    return () => wsRef.current?.close();
  }, [selectedConversation]);


  useEffect(() => {
    getWhatsappConversations();
  }, []);

  if (loading) return <WhatesAppChatSkeleton />;

  // console.log(selectedConversation);
  return (
    <div className="h-[calc(100vh-6.2vh)] flex bg-gray-50">
      <SidebarChat/>

      {selectedConversation ? 
      <ChatArea      /> :
        <Fallback />
      }


      {selectedConversation && <ProfilePanel selectedContact={selectedConversation} />}
    </div>
  );
};

export default WhatsApp;





const Fallback = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-green-50 to-teal-50 px-6 text-center">

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
        Select a conversation from the left panel to start chatting.
        Your messages will appear here.
      </p>

      {/* Decorative Divider */}
      <div className="mt-8 w-24 h-1 bg-teal-400 rounded-full opacity-60"></div>

    </div>
  )
}
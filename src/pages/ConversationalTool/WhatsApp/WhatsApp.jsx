import { useContext, useEffect, useRef, useState } from "react";
import WebSocketClient from "../../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../data/constant";

import WhatesAppChatSkeleton from "../../../components/Skeltons/WhatsappChatSkelton";
import {
  getWhatsappConversation,
} from "../../../services/api/whatsApp";
import ChatArea from "./components/ChatArea";
import SidebarChat from "./components/SidebarChat";
import ProfilePanel from "./components/ProfilePanel";
import DataContext from "../../../context/DataContext";
import { connectWhatsapp } from "../../../services/api/Integration";

const WhatsApp = () => {
  const wsRef = useRef(null);
  const {
    integrationStatus,
    checkIntegrationStatus, setConversations, selectedConversation
  } = useContext(DataContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

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



    console.log(integrationStatus);
  if (loading) return <WhatesAppChatSkeleton />;

  return (
    <div className="h-[calc(100vh-6.2vh)] flex bg-gray-50">
      {integrationStatus?.metaWhatsapp?
        <>

          <SidebarChat />

          {selectedConversation ?
            <ChatArea /> :
            <Fallback />
          }
          {selectedConversation && <ProfilePanel selectedContact={selectedConversation} />}
        </>
        :
        <div className="flex w-full justify-center py-12">
          <div>

          <div className="max-w-md w-full rounded-2xl bg-white p-8 border border-gray-100 text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg
                className="h-7 w-7 text-green-600"
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
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <span>Connect WhatsApp Business</span>
            </button>

            {/* Helper text */}
            <p className="mt-4 text-xs text-gray-400">
              Secure Meta OAuth • Embedded signup • Official WhatsApp Cloud API
            </p>
          </div>
          </div>

        </div>
      }
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
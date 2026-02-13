import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import SidebarChat from "./components/SidebarChat";
import ChatArea from "./components/ChatArea";
import ProfilePanel from "./components/ProfilePanel";
import {
  BASE_URL,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../../data/constant";
import axios from "axios";
import { getContacts } from "../../../services/api/contact.api";
import { sendWhatsAppMessage } from "../../../services/api/whatsApp";
import WebSocketClient from "../../../config/websocketClient";
import WhatesAppChatSkeleton from "../../../components/Skeltons/WhatsappChatSkelton";

const WhatsApp = () => {
  const wsRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState("KATESHIYAD77");
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [contacts, setContacts] = useState([]);

  const getContactsData = async () => {
    // API call to fetch contacts will be here
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await getContacts(token);

      setContacts(response);
      setSelectedContact(response[0]);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessageWhatsapp = async (
    selectedContacted,
    messagePayload,
  ) => {
    // setMessages([...messages, messagePayload]);
    // const { phone, name } = selectedContacted;
    // const ndid = localStorage.getItem("ndid");

    // const cleanPhone = phone.replace(/[^\d]/g, "");

    // const payload = {
    //   phoneNumber: cleanPhone,
    //   name,
    //   message: messagePayload?.text,
    //   ndid,
    // };

    try {
      const response = await sendWhatsAppMessage();
      console.log(response);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    getContactsData();
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      if (serverResponse.event === WEBSOCKET_EVENTS["WHATSAPP_NEW_MESSAGE"]) {
        const { data } = serverResponse;
        console.log(data);
        const incomingMessage = {
          text: data?.text,
          sender: data?.sender,
        };
        console.log(selectedContact);
        if (selectedContact?.phone === data?.from) {
          console.log("aaya");
          setMessages((prevMessages) => [...prevMessages, incomingMessage]);
        }
      }
    });

    return () => {
      wsRef.current?.close();
    };
  }, [selectedContact]);

  return (
    <div className="h-[calc(100vh-8.2vh)] bg-gray-50 flex flex-col">
      {/* <Header /> */}
      {loading ? (
        <WhatesAppChatSkeleton />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <SidebarChat
            contacts={contacts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedContact={selectedContact}
            handleSelectContact={handleSelectContact}
          />
          <ChatArea
            selectedContact={selectedContact}
            onSubmit={handleSendMessageWhatsapp}
            messages={messages}
          />
          {/* <ProfilePanel selectedContact={selectedContact} /> */}
        </div>
      )}
    </div>
  );
};

export default WhatsApp;

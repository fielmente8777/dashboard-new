import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import SidebarChat from "./components/SidebarChat";
import ChatArea from "./components/ChatArea";
import ProfilePanel from "./components/ProfilePanel";
import { BASE_URL } from "../../../data/constant";
import axios from "axios";
import { getContacts } from "../../../services/api/contact.api";

const WhatsApp = () => {
  const [selectedContact, setSelectedContact] = useState("KATESHIYAD77");
  const [activeTab, setActiveTab] = useState("ACTIVE");

  const [contacts, setContacts] = useState([]);

  const getContactsData = async () => {
    // API call to fetch contacts will be here
    try {
      const token = localStorage.getItem("token");
      const response = await getContacts(token);

      setContacts(response);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSendMessageWhatsapp = async (selectedContacted, message) => {
    const { phone, name } = selectedContacted;
    const ndid = localStorage.getItem("ndid");
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/send-message",
        { ndid: ndid, phone: phone, name: name, message: message }
      );
      console.log(data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    getContactsData();
  }, []);

  return (
    <div className="h-[calc(100vh-8.2vh)] bg-gray-50 flex flex-col">
      {/* <Header /> */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarChat
          contacts={contacts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
        />
        <ChatArea
          selectedContact={selectedContact}
          onSubmit={handleSendMessageWhatsapp}
        />
        {/* <ProfilePanel selectedContact={selectedContact} /> */}
      </div>
    </div>
  );
};

export default WhatsApp;

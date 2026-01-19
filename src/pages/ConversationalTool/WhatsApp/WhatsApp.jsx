import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import SidebarChat from "./components/SidebarChat";
import ChatArea from "./components/ChatArea";
import ProfilePanel from "./components/ProfilePanel";
import { BASE_URL } from "../../../data/constant";

const WhatsApp = () => {
  const [selectedContact, setSelectedContact] = useState("KATESHIYAD77");
  const [activeTab, setActiveTab] = useState("ACTIVE");

  const [contacts, setContacts] = useState([]);

  const getContacts = async () => {
    // API call to fetch contacts will be here
    try {
      const response = await fetch(`${BASE_URL}/contact`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      console.log(result);
      setContacts(result.Data.reverse());
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    getContacts();
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
        <ChatArea selectedContact={selectedContact} />
        <ProfilePanel selectedContact={selectedContact} />
      </div>
    </div>
  );
};

export default WhatsApp;

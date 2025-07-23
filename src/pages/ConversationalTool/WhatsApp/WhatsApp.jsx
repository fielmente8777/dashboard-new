import React, { useState } from "react";
import Header from "./components/Header";
import SidebarChat from "./components/SidebarChat";
import ChatArea from "./components/ChatArea";
import ProfilePanel from "./components/ProfilePanel";

const WhatsApp = () => {
  const [selectedContact, setSelectedContact] = useState("KATESHIYAD77");
  const [activeTab, setActiveTab] = useState("ACTIVE");

  return (
    <div className="h-[calc(100vh-8.2vh)] bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <SidebarChat
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

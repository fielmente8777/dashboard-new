import React, { useEffect, useMemo, useState } from "react";
import SidebarChat from "./components/SidebarChat";
import ChatArea from "./components/ChatArea";
import ProfilePanel from "./components/ProfilePanel";
import Header from "./components/Header";
import { io } from "socket.io-client";
import { BASE_URL } from "../../../data/constant";

const EazbotChat = () => {
  const [selectedContact, setSelectedContact] = useState();
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]); // ✅ Add this state

  const getAllChats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leadeazbot/chats  `, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      // console.log(result);
      setContacts(result.Data);
    } catch (error) {
      console.error("Error fetching data", error.message);
    }
  };

  useEffect(() => {
    getAllChats();
  }, []);

  const socket = useMemo(
    () =>
      io("http://localhost:4000", {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }),
    []
  );

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      getAllChats();

      setMessages([contacts[0].messages]);
      // if (selectedContact?.guestId === newMessage.senderId) {
      //   setMessages((prev) => [...prev, newMessage]);
      // }

      // setContacts((prevContacts) => {
      //   return prevContacts.map((chat) => {
      //     if (chat.guestId === newMessage.senderId) {
      //       return {
      //         ...chat,
      //         messages: [...chat.messages, newMessage],
      //       };
      //     }
      //     return chat;
      //   });
      // });
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedContact]);

  useEffect(() => {
    if (!selectedContact) return;
    const chat = contacts.find((c) => c.chat_id === selectedContact.chat_id);
    setMessages(chat?.chats || []);
  }, [selectedContact, contacts]);

  const selectedChat = useMemo(() => {
    if (!selectedContact || !contacts.length) return null;
    return contacts.find((chat) => chat.chat_id === selectedContact.chat_id);
  }, [selectedContact, contacts]);

  console.log(selectedChat);

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
          name={selectedChat?.name}
          chat={selectedChat?.chats}
          messages={messages}
          setMessages={setMessages}
        />

        {selectedChat && <ProfilePanel selectedContact={selectedChat} />}
      </div>
    </div>
  );
};

export default EazbotChat;

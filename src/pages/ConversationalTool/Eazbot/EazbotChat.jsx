import React, { useEffect, useMemo, useState } from 'react';
import SidebarChat from './components/SidebarChat';
import ChatArea from './components/ChatArea';
import ProfilePanel from './components/ProfilePanel';
import Header from './components/Header';
import { io } from "socket.io-client";

const EazbotChat = () => {
    const [selectedContact, setSelectedContact] = useState();
    const [activeTab, setActiveTab] = useState("ACTIVE");
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]); // ✅ Add this state

    const getAllChats = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/chat/get-all-chats`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const result = await response.json();
            setContacts(result.data);
        } catch (error) {
            console.error("Error fetching data", error.message);
        }
    };

    useEffect(() => {
        getAllChats();
    }, []);

    const socket = useMemo(() => io("http://localhost:4000", {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    }), []);

    useEffect(() => {
        socket.on("newMessage", (newMessage) => {

            console.log(newMessage)
            if (selectedContact?.guestId === newMessage.senderId || selectedContact.botId === newMessage.senderId) {
                setMessages(prev => [...prev, newMessage]);
            }

            // Sync message in global contact list
            setContacts(prevContacts => {
                return prevContacts.map(chat => {
                    if (chat.guestId === newMessage.senderId || chat.botId === newMessage.senderId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, newMessage]
                        };
                    }
                    return chat;
                });
            });
        });

        return () => {
            socket.off("newMessage");
        };
    }, [socket, selectedContact]);

    // ✅ Whenever selected contact changes, update messages
    useEffect(() => {
        if (!selectedContact) return;
        const chat = contacts.find(c => c.guestId === selectedContact.guestId);
        setMessages(chat?.messages || []);
    }, [selectedContact, contacts]);

    const selectedChat = useMemo(() => {
        if (!selectedContact || !contacts.length) return null;
        return contacts.find(chat => chat.guestId === selectedContact.guestId);
    }, [selectedContact, contacts]);

    console.log(messages)
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
                <ChatArea chat={selectedChat} messages={messages} />
                {/* <ProfilePanel chat={selectedChat} /> */}
            </div>
        </div>
    );
};

export default EazbotChat;

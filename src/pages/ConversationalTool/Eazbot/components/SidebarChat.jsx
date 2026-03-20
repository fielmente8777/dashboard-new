import React from "react";
const SidebarChat = ({
  contacts,
  activeTab,
  setActiveTab,
  selectedContact,
  setSelectedContact,
  isPhoneView,
}) => {
  const tabs = [
    { id: "ACTIVE", label: "ACTIVE", count: 0 },
    // { id: 'REQUESTING', label: 'REQUESTING', count: 5 },
    // { id: 'INTERVENED', label: 'INTERVENED', count: 1 },
  ];

  const getAvatarColor = (name) => {
    const colors = [
      "bg-teal-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    return colors[name?.charCodeAt(0) % colors.length];
  };

  return (
    <div
      className={`${
        selectedContact && isPhoneView ? "w-0" : isPhoneView ? "w-full" : "w-80"
      } bg-white border-r border-gray-200 flex flex-col`}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs?.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-[21px] text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-teal-500 text-teal-600 bg-teal-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {contacts
          ?.map((contact, index) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedContact === contact.name
                  ? "bg-teal-50 border-l-4 border-l-teal-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative flex items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                    contact.name
                  )}`}
                >
                  {contact?.name?.charAt(0).toUpperCase()}
                </div>

                {/* {contact.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {contact.unread}+
                </div>
              )} */}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate capitalize">
                    {contact.name}
                  </p>
                  {contact.time && (
                    <span className="text-xs text-gray-500">
                      {contact.time}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {contact?.chats?.length > 0
                    ? contact.chats[contact.chats.length - 1].message
                    : "No messages yet"}
                </p>
              </div>
            </div>
          ))
          .reverse()}
      </div>
    </div>
  );
};

export default SidebarChat;

import { useContext, useEffect, useState } from "react";
import DataContext from "../../../../context/DataContext";
import useDebounce from "../../../../hooks/useDebounce";
import {
  FacebookIcon,
  GoogleAdsIcon,
  InstaICon,
  WhatsappIcon,
} from "../../../../icons/icon";
import {
  getWhatsAppMessageTemplates,
  markMessageAsRead,
} from "../../../../services/api/whatsApp";
import { is24HoursCompletedFnc } from "../../../../utils/is24Hours";
import NewContactModal from "./NewContactModal";

const tabs = ["Active", "Inactive", "New Contact"];

const SidebarChat = () => {
  const [templates, setTemplates] = useState([]);
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const debouncedSearch = useDebounce(search, 500);
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

  const {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    setMobileActive,
  } = useContext(DataContext);

  const [filteredConversations, setFilteredConversations] = useState([]);

  const handleSelectConversation = async (conv) => {
    try {
      setConversations((prevConversations) => {
        return prevConversations.map((item) => {
          if (item._id === conv._id) {
            return {
              ...item,
              unread_count: 0,
            };
          }
          return item;
        });
      });

      setSelectedConversation(conv);

      if (conv.unread_count > 0) {
        await markMessageAsRead(conv._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    if (debouncedSearch === "" && activeTab.toLowerCase() === "active") {
      return setFilteredConversations(activeConversations());
    } else if (
      debouncedSearch === "" &&
      activeTab.toLowerCase() === "history"
    ) {
      return setFilteredConversations(historyConversations());
    }
    const lowerSearch = debouncedSearch.toLowerCase();

    const filtered = filteredConversations?.filter(
      (conv) =>
        conv.name?.toLowerCase().includes(lowerSearch) ||
        conv.phone?.includes(lowerSearch) ||
        conv.lastMessage?.toLowerCase().includes(lowerSearch),
    );

    setFilteredConversations(filtered);
  };

  const activeConversations = () => {
    return conversations.filter(
      (conv) => !is24HoursCompletedFnc(conv.last_message?.created_at),
    );
  };

  const historyConversations = () => {
    return conversations.filter((conv) =>
      is24HoursCompletedFnc(conv.last_message?.created_at),
    );
  };

  const handleTabChnage = (tab) => {
    setActiveTab(tab);
    const activeTab = tab.toLowerCase();

    activeTab === "new contact"
      ? setOpenNewContactModal(true)
      : activeTab === "active"
        ? setFilteredConversations(activeConversations())
        : setFilteredConversations(historyConversations());
  };

  const fetchTemplates = async () => {
    const response = await getWhatsAppMessageTemplates();
    if (response.success) {
      setTemplates(response?.result?.docs?.data || []);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [debouncedSearch, conversations]);

  useEffect(() => {
    if (activeTab === "active" && activeConversations) {
      const actConversations = activeConversations();
      setFilteredConversations(actConversations);
      setSelectedConversation(null);
      // setSelectedConversation(actConversations[0]);
    }

    fetchTemplates();
  }, []);

  return (
    <div className="w-full md:w-90 border-b md:border-l md:border-r border-gray-200 flex flex-col bg-white">
      <div className="px-4 py-3 shadow-sm h-16 flex">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="text-sm font-medium bg-gray-100 px-3 py-2 rounded-xl w-full"
        />
      </div>

      <div className="flex  justify-center items-center gap-2 border-b border-gray-200">
        {tabs?.map((tab) => (
          <button
            onClick={() => handleTabChnage(tab)}
            key={tab}
            className={`px-4 py-4 w-full ${tab.toLowerCase() === activeTab.toLowerCase() ? "bg-primary text-white" : ""} text-sm font-medium text-slate-800 cursor-pointer `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {filteredConversations && filteredConversations?.length > 0 ? (
          filteredConversations?.map((conv) => (
            <div
              key={conv._id}
              onClick={() => {
                handleSelectConversation(conv);
                setMobileActive("chatarea");
              }}
              // onClick={() => setSelectedConversationId(conv._id)}
              className={`flex p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedConversation?._id === conv._id
                  ? "bg-teal-100/20"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                    conv?.name,
                  )}`}
                >
                  {conv?.name?.charAt(0).toUpperCase()}
                </div>

                {conv?.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {conv?.unread_count}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 truncat flex flex-col">
                    {conv?.name}

                    <span className="text-[10px] mt-1">{conv?.phone}</span>
                  </p>

                  {conv.updatedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(conv.updatedAt).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>

                <div className="flex justify-between">
                  <p className="text-sm text-gray-500 truncate mt-1 w-44">
                    {conv?.last_message?.text || "No messages yet"}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* {conv?.adAttribution?.sourceType && (
                      <span className="border! border-orange-600! bg-amber-100 text-orange-600 rounded px-2 capitalize text-xs flex items-center justify-center">
                        {conv?.adAttribution?.sourceType}
                      </span>
                    )} */}

                    <span className="border! border-orange-600! bg-amber-100 text-orange-600 rounded px-2 capitalize text-xs flex items-center justify-center">
                      {conv?.adAttribution?.sourceType || "Ad"}
                    </span>

                    {conv?.adAttribution?.sourceUrl &&
                      (conv?.adAttribution?.sourceUrl.match(
                        /^https:\/\/www.instagram.com/,
                      ) ? (
                        <InstaICon />
                      ) : conv?.adAttribution?.sourceUrl.match(
                          /^https:\/\/www.facebook.com/,
                        ) ? (
                        <FacebookIcon />
                      ) : conv?.adAttribution?.sourceUrl.match(
                          /^https:\/\/wa.me/,
                        ) ? (
                        <WhatsappIcon />
                      ) : (
                        <GoogleAdsIcon />
                      ))}

                    {/* {conv?.adAttribution?.sourceUrl &&
                    conv?.adAttribution?.sourceUrl.startsWith(
                      "https://www.instagram.com",
                    ) ? (
                      <InstaICon />
                    ) : conv?.adAttribution?.sourceUrl.includes("facebook") ? (
                      <FacebookIcon />
                    ) : conv?.adAttribution?.sourceUrl.startsWith(
                        "https://wa.me",
                      ) ? (
                      <WhatsappIcon />
                    ) : (
                      <GoogleAdsIcon />
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col max-md:h-[60dvh] items-center justify-center h-full px-6 text-center text-gray-500">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-teal-500"
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

            {/* Text */}
            <p className="text-sm font-medium text-gray-700">
              No conversations yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Incoming WhatsApp messages will appear here
            </p>
          </div>
        )}
      </div>

      {openNewContactModal && (
        <NewContactModal
          onClose={() => setOpenNewContactModal(false)}
          templates={templates}
        />
      )}
    </div>
  );
};

export default SidebarChat;

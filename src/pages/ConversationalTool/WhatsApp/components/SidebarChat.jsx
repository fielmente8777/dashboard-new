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
  deleteConversation,
  deleteMultipleConversation,
  getWhatsAppMessageTemplates,
  markMessageAsRead,
} from "../../../../services/api/whatsApp";
import { is24HoursCompletedFnc } from "../../../../utils/is24Hours";
import NewContactModal from "./NewContactModal";
import { FaUser } from "react-icons/fa";
import { useToast } from "../../../../context/ToastContext";
import { useConfirm } from "../../../../context/ConfirmContext";

const tabs = ["Active", "Inactive", "Converted", "Add"];

const SidebarChat = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [templates, setTemplates] = useState([]);
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [hoveredConversation, setHoveredConversation] = useState(null);
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
  const [countsConversation, setCountsConversation] = useState({
    active: "",
    inactive: "",
    converted: "",
  });

  const isAllSelected =
    filteredConversations.length > 0 &&
    selectedConversations.length === filteredConversations.length;

  const handleCheckboxChange = (conversationId) => {
    setSelectedConversations((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId],
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(filteredConversations.map((conv) => conv._id));
    }
  };

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
    const conver = conversations
      .filter(
        (conv) =>
          !is24HoursCompletedFnc(
            conv.last_message?.updated_at || conv.createdAt,
          ),
      )
      .sort(
        (a, b) =>
          new Date(b.last_message?.updated_at || b.createdAt) -
          new Date(a.last_message?.updated_at || a.createdAt),
      );

    return conver;
  };

  const convertedConversations = () => {
    const conver = conversations?.filter(
      (conv) => conv.status?.toLowerCase() === "converted",
    );
    return conver;
  };

  const historyConversations = () => {
    return conversations
      .filter((conv) =>
        is24HoursCompletedFnc(conv.last_message?.updated_at || conv.createdAt),
      )
      .sort(
        (a, b) =>
          new Date(b.last_message?.updated_at || b.createdAt) -
          new Date(a.last_message?.updated_at || a.createdAt),
      );
  };

  const handleTabChnage = (tab) => {
    setActiveTab(tab);
    const activeTab = tab.toLowerCase();

    activeTab === "add"
      ? setOpenNewContactModal(true)
      : activeTab === "active"
        ? setFilteredConversations(activeConversations())
        : activeTab === "inactive"
          ? setFilteredConversations(historyConversations())
          : setFilteredConversations(convertedConversations());
  };

  const fetchTemplates = async () => {
    const response = await getWhatsAppMessageTemplates();
    if (response.success) {
      setTemplates(response?.result?.docs?.data || []);
    }
  };

  const handleDeleteConversations = async () => {
    // setIsDeleteLoading(true);
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to delete conversations?",
      );

      if (!isConfirmed) return;

      const response = await deleteMultipleConversation({
        conversationIds: selectedConversations,
      });

      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => !selectedConversations.includes(conv._id),
        ),
      );

      // setConversations((prevConversations) =>
      //   prevConversations.filter(
      //     (conv) => conv._id !== selectedConversation._id,
      //   ),
      // );

      setSelectedConversations([]);

      if (response?.success) {
        showToast({
          message:
            response?.responseMessage || "Conversation deleted successfully",
          type: "success",
          position: "bottom-right",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to delete conversation",
        type: "error",
        position: "bottom-right",
      });
    } finally {
      // setIsDeleteLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [debouncedSearch, conversations]);

  useEffect(() => {
    if (activeTab === "active" && activeConversations) {
      const actConversations = activeConversations();
      setFilteredConversations(actConversations);
      // setSelectedConversation(null);
      // setSelectedConversation(actConversations[0]);
    } else if (activeTab === "Inactive" && historyConversations) {
      setFilteredConversations(historyConversations());
    } else if (activeTab === "converted" && convertedConversations) {
      setFilteredConversations(convertedConversations());
    }

    const actCount = activeConversations()?.length;
    const inactCount = historyConversations()?.length;
    const convCount = convertedConversations()?.length;
    setCountsConversation({
      active: actCount,
      inactive: inactCount,
      converted: convCount,
    });

    fetchTemplates();
  }, [conversations]);

  return (
    <div className="w-full xl:w-90! lg:w-60! border-b  md:border-r dark:border-primary/60! flex flex-col bg-app-surface">
      <div className="px-4 py-3 shadow-sm h-16 flex ">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="border border-ternary! text-sm text-app-text dark:text-app-text font-medium dark:bg-primary px-3 py-2 rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-ternary"
        />
      </div>

      <div className="flex border-b dark:border-primary/60! bg-app-surface-secondary overflow-x-auto hide-scrollbar">
        {tabs?.map((tab) => {
          const isActive = tab.toLowerCase() === activeTab.toLowerCase();
          const count = countsConversation?.[tab.toLowerCase()];

          return (
            <button
              key={tab}
              onClick={() => handleTabChnage(tab)}
              className={`flex items-center justify-center gap-2 px-4 py-3 w-full text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? "bg-ternary text-white border-b-2  "
                  : "text-slate-600 dark:text-app-text-muted hover:bg-slate-100 border-b-2 border-transparent hover:border-gray-300"
              }`}
            >
              <span>{tab}</span>

              {count > 0 && (
                <span
                  className={`min-w-5 h-5 px-1 flex items-center justify-center rounded-full text-[10px] font-semibold
                    ${
                      isActive
                        ? "bg-gray-100 text-primary "
                        : "bg-slate-200 text-slate-700"
                    }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* <div className="flex  justify-center items-center gap-2 border-b border-gray-200">
        {tabs?.map((tab) => (
          <button
            onClick={() => handleTabChnage(tab)}
            key={tab}
            className={`px-4 py-4 w-full ${tab.toLowerCase() === activeTab.toLowerCase() ? "bg-primary text-white" : ""} text-sm font-medium text-slate-800 cursor-pointer relative`}
          >
            {tab}

            {Object.keys(countsConversation)?.length > 0 &&
              countsConversation[tab?.toLowerCase()] && (
                <span className="absolute top-0 left-0 size-6 flex justify-center items-center rounded-full bg-slate-900 text-white text-xs">
                  {countsConversation[tab.toLowerCase()]}
                </span>
              )}
          </button>
        ))}
      </div> */}

      {selectedConversations.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-primary/10">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
            <span>Select All ({selectedConversations.length})</span>
          </label>

          <button
            onClick={() => {
              handleDeleteConversations();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
          >
            Delete
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {filteredConversations && filteredConversations?.length > 0 ? (
          filteredConversations?.map((conv) => (
            <div
              key={conv._id}
              onClick={() => {
                handleSelectConversation(conv);
                setMobileActive("chatarea");
              }}
              onMouseEnter={() => setHoveredConversation(conv._id)}
              onMouseLeave={() => setHoveredConversation(null)}
              className={`relative flex p-3 pl-6 border-b border-primary/60! cursor-pointer transition-colors ${
                selectedConversation?._id === conv._id
                  ? "bg-app-surface-secondary"
                  : "hover:bg-green-200/30 dark:hover:bg-primary/30"
              }`}
            >
              <div className="flex items-center absolute left-1 top-5">
                {(hoveredConversation === conv._id ||
                  selectedConversations.length > 0) && (
                  <input
                    type="checkbox"
                    checked={selectedConversations.includes(conv._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(conv._id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>

              {/* Avatar */}
              <div className="relative">
                {conv.name ? (
                  <div
                    className={`size-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                      conv?.name,
                    )}`}
                  >
                    {conv?.name?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="size-10 rounded-full flex items-center justify-center text-white font-medium bg-gray-400">
                    <FaUser />
                  </div>
                )}

                {conv?.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {conv?.unread_count}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-app-text-muted truncat flex flex-col">
                    {conv?.name}

                    <span className="text-[10px] mt-1">{conv?.phone}</span>

                    <p className="text-sm text-gray-500 truncate mt-1 w-44">
                      {conv?.last_message?.text || "No messages yet"}
                    </p>
                  </p>

                  {conv.updatedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(conv.updatedAt).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>

                <div className="flex justify-between mt-2">
                  <div className="flex justify-end text-xs text-white bg-green-500 w-fit px-2 rounded-full">
                    {conv?.status?.toLowerCase() === "active"
                      ? "Open"
                      : conv?.status}
                  </div>

                  <div className="flex justify-between">
                    {/* <div className="flex items-center gap-2">
                      <span className="border! border-orange-600! bg-amber-100 text-orange-600 rounded px-2 capitalize text-xs flex items-center justify-center">
                        {conv?.adAttribution?.sourceType || "Ad"}
                      </span>

                      {conv?.adAttribution?.sourceUrl ? (
                        conv?.adAttribution?.sourceUrl.match(
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
                          ""
                        )
                      ) : (
                        <GoogleAdsIcon />
                      )}
                    </div> */}
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

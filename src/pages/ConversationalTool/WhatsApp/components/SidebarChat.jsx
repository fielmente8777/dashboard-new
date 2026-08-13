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
    <div className="w-full lg:w-60! xl:w-90! shrink-0 min-h-0 border-b md:border-r border-app-border dark:border-primary/60! flex flex-col bg-app-surface">
      {/* Search */}
      <div className="shrink-0 px-3 sm:px-4 py-3 shadow-sm h-16 flex items-center border-b border-app-border dark:border-primary/60!">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="border border-ternary! text-sm text-app-text placeholder:text-app-text-faint font-medium bg-app-surface-secondary px-3 py-2 rounded-xl w-full min-w-0 focus:outline-none focus:ring-1 focus:ring-ternary"
        />
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-app-border dark:border-primary/60! bg-app-surface-secondary overflow-x-auto hide-scrollbar">
        {tabs?.map((tab) => {
          const isActive = tab.toLowerCase() === activeTab.toLowerCase();
          const count = countsConversation?.[tab.toLowerCase()];

          return (
            <button
              key={tab}
              onClick={() => handleTabChnage(tab)}
              className={`flex flex-1 min-w-fit items-center justify-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
                isActive
                  ? "bg-ternary text-white border-b-2 border-ternary"
                  : "text-slate-600 dark:text-app-text-muted hover:bg-slate-100 dark:hover:bg-app-surface border-b-2 border-transparent hover:border-gray-300 dark:hover:border-primary/60"
              }`}
            >
              <span>{tab}</span>

              {count > 0 && (
                <span
                  className={`min-w-5 h-5 px-1 flex items-center justify-center rounded-full text-[10px] font-semibold
                    ${
                      isActive
                        ? "bg-white text-ternary"
                        : "bg-slate-200 dark:bg-app-surface text-slate-700 dark:text-app-text-muted"
                    }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bulk select bar */}
      {selectedConversations.length > 0 && (
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-app-border dark:border-primary/60! bg-primary/10">
          <label className="flex items-center gap-2 text-sm text-app-text min-w-0 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="h-4 w-4 shrink-0 accent-primary cursor-pointer"
            />
            <span className="truncate">
              Select All ({selectedConversations.length})
            </span>
          </label>

          <button
            onClick={() => {
              handleDeleteConversations();
            }}
            className="shrink-0 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
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
              className={`relative flex p-3 pl-6 border-b border-app-border dark:border-primary/60! cursor-pointer transition-colors ${
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
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                )}
              </div>

              {/* Avatar */}
              <div className="relative shrink-0">
                {conv.name ? (
                  <div
                    className={`size-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                      conv?.name,
                    )}`}
                  >
                    {conv?.name?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="size-10 rounded-full flex items-center justify-center text-white font-medium bg-gray-400 dark:bg-app-surface-secondary">
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
                <div className="flex justify-between gap-2">
                  <div className="min-w-0 flex flex-col">
                    <p className="text-sm font-medium text-gray-900 dark:text-app-text-muted truncate">
                      {conv?.name}
                    </p>

                    <span className="text-[10px] mt-1 text-gray-500 dark:text-app-text-faint truncate">
                      {conv?.phone}
                    </span>

                    <p className="text-sm text-gray-500 dark:text-app-text-faint truncate mt-1">
                      {conv?.last_message?.text || "No messages yet"}
                    </p>
                  </div>

                  {conv.updatedAt && (
                    <span className="shrink-0 text-xs text-gray-500 dark:text-app-text-faint">
                      {new Date(conv.updatedAt).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center gap-2 mt-2">
                  <div className="text-xs text-white bg-green-500 w-fit px-2 py-0.5 rounded-full capitalize">
                    {conv?.status?.toLowerCase() === "active"
                      ? "Open"
                      : conv?.status}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col max-md:h-[60dvh] items-center justify-center h-full px-6 py-10 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-app-surface-secondary flex items-center justify-center mb-4">
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
            <p className="text-sm font-medium text-gray-700 dark:text-app-text">
              No conversations yet
            </p>
            <p className="text-xs text-gray-400 dark:text-app-text-faint mt-1">
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
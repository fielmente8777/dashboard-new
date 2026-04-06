import { useContext, useEffect, useRef, useState } from "react";
import { BsCheckAll, BsCheckLg } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { MdCall, MdChat, MdClose, MdOutlineDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";
import WebSocketClient from "../../../../config/websocketClient";
import DataContext from "../../../../context/DataContext";
import { RiDeleteBin6Line } from "react-icons/ri";

import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileAlt,
} from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";

const MAX_LENGTH = 150; // adjust as needed
// import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import {
  NEW_BASE_URL,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../../../data/constant";
import {
  addWhatsAppLead,
  deleteWhatsAppMessage,
  getFlowSession,
  getWhatsappConversationMessages,
  getWhatsAppMessageTemplates,
  sendWhatsAppMessage,
  updateFlowSession,
} from "../../../../services/api/whatsApp";
import { is24HoursCompletedFnc } from "../../../../utils/is24Hours";
import normalizePhone from "../../../../utils/normalizePhone";
import { renderMessageWithLinks } from "../../../../utils/urlParser";
import AudioMessage from "./AudioMessage";
import InteractiveMessage from "./InteractiveMesssage";
import VideoMessage from "./VideoMessage";
import { useToast } from "../../../../context/ToastContext";
import { useConfirm } from "../../../../context/ConfirmContext";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { fetchUserManagementData } from "../../../../services/api";
import { updateLead } from "../../../../services/api/leads.api";

const ChatArea = () => {
  const wsRef = useRef(null);
  const menuRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  // });

  // const [marker, setMarker] = useState(null);

  const textareaRef = useRef(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const {
    selectedConversation,
    setSelectedConversation,
    conversations,
    setMobileActive,
  } = useContext(DataContext);

  const [isTakeOver, setIsTakeOver] = useState(false);
  const is24HourComplete = is24HoursCompletedFnc(
    selectedConversation?.last_message?.created_at,
  );

  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const selectionMode = selectedMessages.length > 0;

  const [messageList, setMessageList] = useState([]);
  const [messageLoading, setLoadingMessages] = useState(true);
  const [messageValue, setMessageValue] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const [templateClick, setTemplateClick] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState();
  const [expandedMessages, setExpandedMessages] = useState({});

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (is24HourComplete && !selectedTemplate) {
      alert("24 hour window expired. Please send a template message.");
      return;
    }

    try {
      if (selectedTemplate) {
        const templateParams =
          selectedTemplate.components?.[0]?.example?.body_text?.[0] || [];

        const templateText =
          selectedTemplate.components?.find((c) => c.type === "BODY")?.text ||
          "";

        // Render text instantly
        let renderedBody = templateText;

        templateParams.forEach((param, index) => {
          renderedBody = renderedBody.replace(`{{${index + 1}}}`, param);
        });

        const templatePayload = {
          phone: selectedConversation.phone,
          templateName: selectedTemplate.name,
          templateLanguage: selectedTemplate.language || "en",
          templateParams: templateParams,
        };

        const optimisticMessage = {
          _id: `temp-${Date.now()}`, // temporary id
          conversationId: selectedConversation._id,
          from: "me",
          to: selectedConversation.phone,
          sender: "me",
          direction: "outbound",
          messageType: "template",
          body: renderedBody,
          template: {
            template: {
              name: selectedTemplate.name,
              language: selectedTemplate.language || "en",
              parameters: templateParams,
            },
          },
          status: "sent",
          timestamp: new Date(),
          createdAt: new Date(),
        };

        // Push instantly to UI (optimistic update)
        setMessageList((prev) => [...prev, optimisticMessage]);

        const response = await sendWhatsAppMessage(templatePayload);

        setSelectedTemplate(null);
        setTemplateClick(false);

        if (response?.success && response?.responseStatusCode === 200) {
          // Update UI
          setMessageList((prev) =>
            prev.map((m) => {
              if (m._id === optimisticMessage._id) {
                return {
                  ...m,
                  messageId: response?.result?.docs?.messageId,
                  status: "sent",
                };
              }
              return m;
            }),
          );
        }
        return;
      }

      const formData = new FormData();
      formData.append("phone", selectedConversation.phone);

      if (messageValue) {
        formData.append("text", messageValue);
      }

      if (file) {
        formData.append("file", file);
      }

      // Build optimistic message
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: selectedConversation._id,
        from: "me",
        to: selectedConversation.phone,
        sender: "me",
        direction: "outbound",
        messageType: file ? "image" : "text",
        body: file ? null : messageValue,
        media: file
          ? {
              url: URL.createObjectURL(file), // 👈 show preview instantly
              mimeType: file.type,
            }
          : undefined,
        status: "sent",
        timestamp: new Date(),
        createdAt: new Date(),
      };
      // Push optimistic message
      setMessageList((prev) => [...prev, optimisticMessage]);
      setMessageValue("");
      setFile(null);
      setSelectedTemplate(null);

      const response = await sendWhatsAppMessage(formData);

      if (response?.success && response?.responseStatusCode === 200) {
        // Update UI
        setMessageList((prev) =>
          prev.map((m) => {
            if (m._id === optimisticMessage._id) {
              return {
                ...m,
                messageId: response?.result?.docs?.messageId,
                status: "sent",
              };
            }
            return m;
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await getWhatsappConversationMessages(conversationId);
      // setMessageList(response?.result?.messages)

      if (response?.success && response?.responseStatusCode === 200) {
        setMessageList(response?.result?.messages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleTemplate = (value) => {
    setSelectedTemplate(null);
    setTemplateClick(value);
  };

  const handleChange = (e) => {
    const el = textareaRef.current;
    setMessageValue(e.target.value);

    // Reset height to recalculate
    el.style.height = "auto";

    const lineHeight = 24; // adjust if needed
    const maxRows = 8;
    const maxHeight = lineHeight * maxRows;

    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const handleTakeOver = async () => {
    const payload = {
      phone: selectedConversation.phone,
      isActive: !isTakeOver,
    };
    try {
      const response = await updateFlowSession(payload);
      console.log(response);
      if (response?.success) {
        showToast({
          message: response?.responseMessage,
          type: "success",
        });
      }
      setIsTakeOver(!isTakeOver);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFlowSession = async () => {
    const payload = {
      phone: selectedConversation.phone,
    };
    try {
      const response = await getFlowSession(payload);
      console.log(response);
      if (response.success) {
        setIsTakeOver(response?.result?.docs?.flowSession?.isActive);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleSelectMode = (message) => {
    setOpenMenuIndex(null);
    setSelectedMessages([message?.messageId]); // auto select first message
  };

  const toggleSelectMessage = (id) => {
    setSelectedMessages((prev) => {
      return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || "");
    setOpenMenuIndex(null);
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm(
      `Are you sure you want to delete ${selectedMessages.length} ${selectedMessages?.length > 1 ? "messages" : "message"}?`,
    );

    if (!isConfirmed) return;
    try {
      setMessageList((prev) =>
        prev.filter((m) => !selectedMessages.includes(m.messageId)),
      );

      const response = await deleteWhatsAppMessage({
        ids: selectedMessages,
      });

      if (response?.success) {
        showToast({
          message: response?.responseMessage,
          type: "success",
        });

        setSelectedMessages([]);
      }

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleReadMore = (id) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleUserAssign = async (value) => {
    const isEdit = selectedConversation?.markAsLead;

    const payload = {
      Contact: selectedConversation.phone,
      Name: selectedConversation.name,
      ndid: selectedConversation.ndid,
      notes: selectedConversation.notes,
      status: selectedConversation.status,
      conversationId: selectedConversation._id,
      hId: selectedConversation?.hid || localStorage.getItem("hid"),
      assignee: value,
    };
    isEdit ? await updateLead(payload) : await addWhatsAppLead(payload);

    setSelectedConversation({ ...selectedConversation, assignee: value });
  };

  const fetchUsersData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
    setAllUsers(usersData);
  };

  useEffect(() => {
    fetchTemplate();
    fetchUsersData();
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_NEW_MESSAGE &&
        serverResponse?.data?.ndid === localStorage.getItem("ndid") &&
        normalizePhone(serverResponse?.data?.from) ===
          normalizePhone(selectedConversation?.phone)
      ) {
        const { data } = serverResponse;
        const fromPhone = normalizePhone(data.from);
        if (normalizePhone(selectedConversation.phone) !== fromPhone) return;
        const message = { ...data };
        setMessageList((prev) => [...prev, message]);
      } else if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_MESSAGE_STATUS
      ) {
        const { data } = serverResponse;

        setMessageList((prev) =>
          prev.map((m) => {
            if (m.messageId === data.messageId) {
              return {
                ...m,
                status: data.status,
              };
            }
            return m;
          }),
        );
      } else if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_AUTO_NEW_MESSAGE &&
        serverResponse?.data?.ndid === localStorage.getItem("ndid") &&
        normalizePhone(serverResponse?.data?.to) ===
          normalizePhone(selectedConversation?.phone)
      ) {
        const { data } = serverResponse;
        setMessageList((prev) => [...prev, data]);
      }
    });

    return () => wsRef.current?.close();
  }, [selectedConversation, conversations, messageList]);

  useEffect(() => {
    setSelectedMessages([]);
    loadMessages(selectedConversation?._id);
    fetchFlowSession();
  }, [selectedConversation?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({});
  }, [messageList]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex z-5 max-md:bg-white justify-between items-center px-4 md:px-6 h-16 shadow-sm max-md:fixed max-md:w-full">
        <div className=" flex items-center">
          <div className="mr-2 md:hidden ">
            <IoArrowBack size={22} onClick={() => setMobileActive("sidebar")} />
          </div>
          <div
            onClick={() => setMobileActive("profile")}
            className="w-8 h-8 md:w-12 md:h-12 text-white bg-teal-600 rounded-full flex items-center justify-center  font-bold text-sm mr-2 md:mr-4"
          >
            {selectedConversation?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div onClick={() => setMobileActive("profile")}>
            <h3 className="text-md md:text-lg font-semibold ">
              {selectedConversation?.name}
            </h3>
            <p className="text-xs md:text-sm ">+{selectedConversation.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {selectionMode && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium ">
                  {selectedMessages.length} Messages
                </span>
              </div>

              <button
                onClick={handleBulkDelete}
                className="text-red-600 font-medium size-7 flex justify-center items-center bg-red-200 rounded-full"
              >
                <RiDeleteBin6Line size={16} />
              </button>
            </div>
          )}
          <Link
            to={`tel:${selectedConversation?.phone}`}
            className="bg-teal-600  text-lime-50 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <MdCall size={18} /> Call
          </Link>

          <div>
            <CustomDropdown
              label={selectedConversation?.assignedTo || "Select User"}
              options={
                allUsers?.map((user) => ({
                  value: user?.userName,
                  label: user?.userName,
                })) || []
              }
              onChange={(value) => handleUserAssign(value)}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cubes.png')",
        }}
        className="flex-1 p-6  max-md:mt-16 max-md:mb-30 overflow-y-auto scrollbar-hidden "
      >
        {messageLoading ? (
          <div className="space-y-4">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          <div className="space-y-1">
            {selectedConversation?.adAttribution && (
              <div className="max-w-xs flex flex-col gap-2 px-3 py-2 mb-2 bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700">
                {selectedConversation?.adAttribution?.mediaType === "image" && (
                  <img
                    src={selectedConversation?.adAttribution?.imageUrl}
                    alt={selectedConversation?.adAttribution?.sourceType}
                    className="rounded"
                  />
                )}
                {selectedConversation?.adAttribution?.mediaType === "video" &&
                  selectedConversation?.adAttribution?.videoUrl && (
                    <video
                      className="rounded"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    >
                      <source
                        src={selectedConversation?.adAttribution?.videoUrl}
                        type="video/mp4"
                      />
                    </video>
                    // <img
                    //   src={"https://scontent.xx.fbcdn.net/v/t15.5256-10/649561265_919658240780341_2774417990312888579_n.jpg?stp=dst-jpg_p180x540_tt6&_nc_cat=108&ccb=1-7&_nc_sid=40cf1a&_nc_ohc=FuFjMQHfdogQ7kNvwGf5n0N&_nc_oc=Admab3rVEXpXJfb0ENwfNJ9X8xwAjYoSh4vxTQRujDrJE8w2zpqrckyqX1eGggxIWGwBSSte9wpSj4LjFzd-LhOI&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&_nc_gid=d8LpEvFRFPgFTVvr5h5baA&_nc_ss=8&oh=00_AfxVaChDBeHwPmiHpXZPp5bE507iew1PQTG3QRQkf5ELPQ&oe=69B9C69D"}
                    //   alt={selectedConversation?.adAttribution?.sourceType}
                    //   className="rounded"
                    // />
                  )}

                <h1 className="font-medium ">
                  {selectedConversation?.adAttribution?.headline}
                </h1>
                <p className="text-sm">
                  {selectedConversation?.adAttribution?.body}
                </p>

                <div className="flex justify-end items-center gap-3">
                  <p className="text-sm capitalize bg-gray-200 rounded px-2 py-1">
                    {selectedConversation?.adAttribution?.sourceType}
                  </p>
                  <p className="text-[10px] opacity-70">
                    {new Date(
                      selectedConversation?.adAttribution?.receivedAt,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {messageList?.length > 0 ? (
              messageList.map((message, index) => {
                const isMe = message.sender === "me";

                return (
                  <div
                    className={`flex gap-1 items-center py-2 ${
                      selectedMessages.includes(message?.messageId)
                        ? "bg-slate-200 border-blue-400"
                        : isMe
                          ? ""
                          : ""
                    }`}
                  >
                    {selectionMode && (
                      <input
                        type="checkbox"
                        className="mt-3"
                        checked={selectedMessages.includes(message?.messageId)}
                        onChange={() =>
                          toggleSelectMessage(
                            message?.messageId || message?._id,
                          )
                        }
                      />
                    )}

                    <div
                      key={index}
                      className={`relative flex flex-1 ${isMe ? "justify-end" : "justify-start"}  mb-2`}
                    >
                      <div
                        className={`relative max-w-xs  p-3 ${
                          isMe
                            ? "rounded-tl-xl border rounded-br-xl rounded-bl-lg bg-white"
                            : "bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700"
                        }`}
                      >
                        {/* all message types */}
                        <div className="mt-4">
                          {/* TEXT */}
                          {(message.messageType === "text" ||
                            message?.messageType === "interactive") &&
                            message.body && (
                              <div className="max-w-xs ml-auto mt-3">
                                <div className=" text-slate-700 rounded-lg relative">
                                  {/* Context / Reply Preview */}
                                  {message?.context &&
                                    message?.context?.message && (
                                      <div className="bg-slate-600 border-l-4 border-green-300 px-2 py-1 rounded mb-1">
                                        <p className="text-xs text-green-100 truncate">
                                          {message?.context?.message}
                                        </p>
                                      </div>
                                    )}

                                  {/* Actual Message */}

                                  <p className="text-sm whitespace-pre-wrap">
                                    {expandedMessages[message._id]
                                      ? renderMessageWithLinks(message?.body)
                                      : renderMessageWithLinks(
                                          message?.body?.slice(0, MAX_LENGTH),
                                        )}

                                    {message?.body?.length > MAX_LENGTH && (
                                      <span
                                        onClick={() =>
                                          toggleReadMore(message._id)
                                        }
                                        className="text-blue-500 cursor-pointer ml-1"
                                      >
                                        {expandedMessages[message._id]
                                          ? " Read less"
                                          : "... Read more"}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}

                          {message?.messageType === "template" &&
                            message?.template?.template?.name && (
                              <div className="bg-green-100 px-4 py-2 rounded-lg max-w-xs">
                                <p className="text-xs text-gray-500 mb-1 capitalize">
                                  {message.template?.template?.name}
                                </p>

                                <p className="text-sm">
                                  {message.body ? (
                                    message.body
                                  ) : (
                                    <span className="text-xs text-zinc-400">
                                      No text defined
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}

                          {/* IMAGE */}
                          {(message.messageType === "image" ||
                            message.messageType === "sticker") && (
                            <img
                              onClick={() =>
                                setImagePreview(
                                  message?.media?.url ||
                                    ` ${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`,
                                )
                              }
                              src={
                                message.media?.url ||
                                ` ${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`
                              }
                              alt="WhatsApp"
                              className="mt-2 rounded-lg w-full size-44 cursor-pointer"
                            />
                          )}

                          {/* AUDIO */}
                          {message.messageType === "audio" && (
                            <div className="flex items-center gap-1">
                              <AudioMessage
                                src={
                                  message?.media?.url ||
                                  `${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`
                                }
                              />
                              {/* <audio
                            src={
                              message?.media?.url ||
                              ` ${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`
                            }
                            controls
                            className="mt-2"
                          /> */}
                            </div>
                          )}

                          {message?.messageType === "video" && (
                            <div>
                              <VideoMessage
                                src={
                                  message?.media?.url ||
                                  `${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`
                                }
                                caption={message?.caption}
                                // isMe={isMe}
                              />
                            </div>
                          )}

                          {/* {message?.messageType === "document" && (
                            <div>
                              <a
                                href={
                                  message?.media?.url ||
                                  `${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <iframe src />
                              </a>
                            </div>
                          )} */}

                          {message?.messageType === "document" &&
                            (() => {
                              const url =
                                message?.media?.url ||
                                `${NEW_BASE_URL}/api/v1/whatsapp/media/${message?.media?.id}?ndid=${localStorage.getItem("ndid")}`;

                              const mime = message?.media?.mimeType || "";
                              const fileName =
                                message?.media?.filename || "Document";

                              const isPDF = mime.includes("pdf");

                              // 🔥 Detect file type
                              const getIcon = () => {
                                const lowerMime = mime.toLowerCase();

                                // ✅ PDF
                                if (lowerMime.includes("pdf")) {
                                  return (
                                    <FaFilePdf className="text-red-500 text-3xl" />
                                  );
                                }

                                // ✅ EXCEL (check FIRST before word)
                                if (
                                  lowerMime.includes("spreadsheet") ||
                                  lowerMime.includes("excel") ||
                                  lowerMime.includes("sheet")
                                ) {
                                  return (
                                    <FaFileExcel className="text-green-600 text-3xl" />
                                  );
                                }

                                // ✅ WORD
                                if (
                                  lowerMime.includes("wordprocessingml") ||
                                  lowerMime.includes("msword")
                                ) {
                                  return (
                                    <FaFileWord className="text-blue-500 text-3xl" />
                                  );
                                }

                                // ✅ IMAGE (optional)
                                if (lowerMime.includes("image")) {
                                  return (
                                    <FaFileImage className="text-purple-500 text-3xl" />
                                  );
                                }

                                // ✅ DEFAULT
                                return (
                                  <FaFileAlt className="text-gray-500 text-3xl" />
                                );
                              };

                              return (
                                <div className="max-w-60">
                                  {/* 📦 CARD */}
                                  <div
                                    onClick={() => window.open(url, "_blank")}
                                    className="h-32 overflow-hidden cursor-pointer relative rounded-lg border bg-white flex flex-col justify-center items-center"
                                  >
                                    {isPDF ? (
                                      <iframe
                                        src={url}
                                        className="w-full h-full pointer-events-none"
                                        style={{ border: "none" }}
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-gray-600 px-2">
                                        {getIcon()}
                                      </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-transparent" />
                                  </div>

                                  {/* 📄 FILE NAME */}
                                  <p className="text-xs mt-1 truncate text-gray-700">
                                    {fileName}
                                  </p>

                                  {/* ⬇️ DOWNLOAD */}
                                  <a
                                    href={url}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-2"
                                  >
                                    <MdOutlineFileDownload size={20} /> Download
                                  </a>
                                </div>
                              );
                            })()}

                          {message?.messageType === "location" && (
                            <div>
                              <iframe
                                // style={"border:0"}
                                loading="lazy"
                                src={`https://www.google.com/maps?q=${message?.location?.latitude},${message?.location?.longitude}&output=embed`}
                                className="max-w-70 w-full aspect-4/3"
                              />
                            </div>
                          )}

                          {message?.reaction && (
                            <div className="flex items-center gap-1 mt-4 absolute bottom-0 right-1">
                              <p className="text-sm">
                                {message?.reaction?.emoji}
                              </p>
                            </div>
                          )}

                          {message?.interactive && (
                            <InteractiveMessage
                              interactive={message.interactive}
                            />
                          )}
                        </div>

                        {/* status and time  */}
                        <div className="flex justify-end px-2 mt-1">
                          <div className="flex items-center gap-1.5">
                            <div className="text-[10px] text-right mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>

                            {isMe && (
                              <span className="text-xs flex justify-end mt-0.5">
                                {message.status === "sent" && <BsCheckLg />}
                                {message.status === "delivered" && (
                                  <BsCheckAll size={18} />
                                )}{" "}
                                {message.status === "read" && (
                                  <span className="text-blue-400">
                                    <BsCheckAll size={18} />
                                  </span>
                                )}{" "}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* menu */}
                        <div className="absolute -top-1 right-1">
                          <button
                            ref={menuRef}
                            onClick={() => {
                              // e.preventDefault();
                              setOpenMenuIndex(
                                openMenuIndex === index ? null : index,
                              );
                            }}
                            className="text-gray-600 hover:text-black p-1"
                          >
                            ⋮
                          </button>

                          {openMenuIndex === index && (
                            <div className="absolute -right-6 mt-1 w-28 bg-white border rounded shadow-md z-10">
                              {![
                                "image",
                                "video",
                                "audio",
                                "template",
                                "location",
                                "interactive",
                              ].includes(message?.messageType) && (
                                <button
                                  onClick={() => handleCopy(message.body)}
                                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                                >
                                  Copy
                                </button>
                              )}
                              {/* <button
                                onClick={() => handleSelectMode(message)}
                                className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                              >
                                Select
                              </button> */}
                              <button
                                onClick={(e) => {
                                  // e.stopPropagation();

                                  handleSelectMode(message);
                                }}
                                className="block w-full text-left px-3 py-1 hover:bg-red-100 text-sm text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400">No conversation yet</p>
            )}

            {imagePreview && (
              <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-9999999"
                onClick={() => setImagePreview("")}
              >
                {/* Prevent closing when clicking on image */}
                <div
                  className="relative max-w-4xl w-full px-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setImagePreview("")}
                    className="absolute -top-10 right-0 text-white text-2xl"
                  >
                    ✕
                  </button>

                  {/* Image */}
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t flex flex-col px-6 py-5 max-md:fixed bottom-0 max-md:w-full "
      >
        {templateClick && (
          <div className=" mb-2 grid grid-cols-2 lg:grid-cols-4 max-h-50  gap-2 overflow-auto scrollbar-hidden">
            {templates?.length > 0 &&
              templates?.map((template) => (
                <div
                  onClick={() => setSelectedTemplate(template)}
                  key={template?.id}
                  className={`cursor-pointer flex flex-col gap-2 rounded-lg overflow-hidden ${selectedTemplate?.id === template?.id ? "border !border-green-600 " : "border border-gray-300 opacity-60"} `}
                >
                  <p className="text-sm capitalize font-medium border-b px-2 py-2 bg-teal-50">
                    {template?.name}
                  </p>
                  <p className="text-sm px-2 pb-2 ">
                    {template?.components[0]?.text}
                  </p>
                </div>
              ))}
          </div>
        )}

        {file && (
          <div className="flex flex-col items-start gap-2 mb-2 relative w-fit">
            <div
              onClick={() => setFile(null)}
              className="flex justify-center items-center absolute left-1 -top-2 cursor-pointer size-4 bg-red-500 rounded-full text-white text-xs"
            >
              X
            </div>
            <img
              src={URL.createObjectURL(file)}
              alt="file"
              className="w-40 h-20 rounded-md object-contain"
            />
          </div>
        )}

        <div className={`${!is24HourComplete ? "" : "flex"} items-center`}>
          <div className="flex gap-2 items-center">
            {!templateClick ? (
              <>
                {!isTakeOver ? (
                  <span
                    onClick={() => handleTemplate(true)}
                    className="cursor-pointer bg-zinc-100 flex items-center gap-1 rounded-lg px-4 py-1 text-sm text-gray-500"
                  >
                    <MdChat className="" /> Templates
                  </span>
                ) : (
                  ""
                )}
              </>
            ) : (
              <span
                onClick={() => handleTemplate(false)}
                className="whitespace-nowrap cursor-pointer flex items-center gap-1 bg-zinc-100 rounded-lg px-4 py-1 text-sm text-gray-500"
              >
                Close Templates <MdClose />
              </span>
            )}

            {isTakeOver && (
              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleTakeOver}
                  className={`text-xs bg-primary rounded-sm text-white px-2 py-1 ${!isTakeOver ? "opacity-70" : ""}`}
                >
                  Take Over
                </button>
              </div>
            )}
          </div>

          {!isTakeOver && (
            <div className="bg-white py-3 flex w-full items-center gap-3">
              {/* Attachment */}
              {!is24HourComplete && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-gray-500 hover:text-teal-600"
                >
                  {/* Paperclip SVG */}
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l9.9-9.9a3.5 3.5 0 114.95 4.95l-9.9 9.9a2 2 0 11-2.83-2.83l8.49-8.48"
                    />
                  </svg>
                </button>
              )}

              {!is24HourComplete && (
                <input
                  disabled={is24HourComplete}
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                  }}
                />
              )}

              {!is24HourComplete ? (
                <textarea
                  disabled={is24HourComplete}
                  ref={textareaRef}
                  value={messageValue}
                  onChange={handleChange}
                  placeholder="Type a message"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // ❗ stop newline
                      handleSendMessage(e); // OR trigger form submit
                    }
                  }}
                  className="flex-1 bg-zinc-100 resize-none rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 overflow-y-auto"
                />
              ) : (
                <div className="flex-1"></div>
              )}

              {/* Send Button */}
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                {/* Send SVG */}
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 2L11 13"
                  />
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 2L15 22l-4-9-9-4 20-7z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* <div className="w-full h-80">
          <GoogleMap
            zoom={10}
            center={{ lat: 28.6139, lng: 77.209 }}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            onClick={(e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setMarker({ lat, lng });
            }}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>

          <button
            // onClick={() => onSelect(marker)}
            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded"
          >
            Send Location
          </button>
        </div> */}
      </form>
    </div>
  );
};

export default ChatArea;

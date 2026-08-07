import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BsCheckAll, BsCheckLg, BsMenuApp } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { MdCall, MdChat, MdClose, MdOutlineDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";
import WebSocketClient from "../../../../config/websocketClient";
import DataContext from "../../../../context/DataContext";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiX } from "react-icons/fi";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (adjust as needed)

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
  getWhatsAppFlowScreens,
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
import CustomDropdown2 from "../../../../components/ui/Dropdown2";
import { MessageSquareReply, X } from "lucide-react";

const ChatArea = () => {
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const menuRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [flows, setFlows] = useState([]);

  const { integrationStatus } = useContext(DataContext);
  console.log("integrationStatus", integrationStatus);

  const [quickReplies, setQuickReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  // const [setSelectedQuickReply, setSelectedQuickReply] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const textareaRef = useRef(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    conversations,
    setMobileActive,
    setLastMessage,
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
  const [templateLoading, setTemplateLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState();
  const [expandedMessages, setExpandedMessages] = useState({});
  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [flowConfig, setFlowConfig] = useState({
    header: "",
    body: "Please fill in your details below 👇",
    footer: "Powered by Eazotel",
    cta: "Fill Details",
  });

  const [agentNumber, setAgentNumber] = useState();
  const [selectedGuestNumber, setSelectedGuestNumber] = useState("");

  const [callPopup, setCallPopup] = useState(false);

  const getMessageTypeFromFile = (file) => {
    if (!file) return "text";

    const type = file.type;

    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";

    // 👇 Everything else = document
    return "document";
  };
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (file && file.size > MAX_FILE_SIZE) {
      showToast({
        type: "error",
        message: "File is too large. Maximum allowed size is 5MB.",
      });
      // alert("File is too large. Maximum allowed size is 5MB.");
      return;
    }

    if (is24HourComplete && !selectedTemplate) {
      showToast({
        type: "error",
        message: "24 hour window expired. Please send a template message.",
      });
      // alert("24 hour window expired. Please send a template message.");
      return;
    }

    console.log("selectedTemplate", selectedTemplate);

    try {
      if (selectedTemplate) {
        const templateParams =
          selectedTemplate?.components?.find((c) => c.type === "BODY")?.example
            ?.body_text?.[0] || [];

        const templateParamsHeader =
          selectedTemplate?.components?.find((c) => c.type === "HEADER")
            ?.example?.header_text || [];

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
          templateParamsHeader: templateParamsHeader,
        };

        console.log("templatePayload", templatePayload);

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
        setConversations((prevConversations) =>
          prevConversations.map((conv) => {
            if (conv._id === selectedConversation._id) {
              return {
                ...conv,
                last_message: {
                  text: messageValue || "template",
                  type: messageValue ? "text" : "template",
                  sender: "me",
                  updated_at: new Date(),
                },
              };
            }
            return conv;
          }),
        );

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

      if (selectedFlowId) {
        const selectedFlow = flows.find(
          (flow) => flow.flowId === selectedFlowId,
        );

        const payload = {
          phone: selectedConversation.phone,
          interactive: {
            type: "flow",

            header: flowConfig.header
              ? {
                  type: "text",
                  text: flowConfig.header,
                }
              : undefined,

            body: {
              text: flowConfig.body,
            },

            footer: flowConfig.footer
              ? {
                  text: flowConfig.footer,
                }
              : undefined,

            action: {
              name: "flow",
              parameters: {
                flow_message_version: "3",
                flow_token: `flow_${Date.now()}`,
                flow_id: selectedFlow.flowId,
                flow_cta: flowConfig.cta || "Open Form",
              },
            },
          },
        };

        const optimisticMessage = {
          _id: `temp-${Date.now()}`,
          conversationId: selectedConversation._id,
          from: "me",
          to: selectedConversation.phone,
          sender: "me",
          direction: "outbound",
          messageType: "interactive",
          body: flowConfig.body,
          interactive: payload.interactive,
          status: "sent",
          timestamp: new Date(),
          createdAt: new Date(),
        };

        setMessageList((prev) => [...prev, optimisticMessage]);
        await sendWhatsAppMessage(payload);

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
        messageType: file ? getMessageTypeFromFile(file) : "text",
        body: file ? null : messageValue,
        media: file
          ? {
              url: URL.createObjectURL(file),
              mimeType: file.type,
              filename: file.name, // ✅ ADD THIS
            }
          : undefined,
        status: "sent",
        timestamp: new Date(),
        createdAt: new Date(),
      };
      // Push optimistic message
      setMessageList((prev) => [...prev, optimisticMessage]);
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv._id === selectedConversation._id) {
            return {
              ...conv,
              last_message: {
                text: messageValue || "template",
                type: messageValue ? "text" : "template",
                sender: "me",
                updated_at: new Date(),
              },
            };
          }
          return conv;
        }),
      );
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
      showToast({
        message: error?.responseMessage || "Failed to send message",
        type: "error",
      });
      console.error(error);
    }
  };

  const handleResend = async (message) => {
    try {
      let payload;

      switch (message.messageType) {
        case "text":
          payload = {
            phone: message.to,
            text: message.body,
          };
          break;

        case "image":
        case "video":
        case "document":
        case "audio":
          payload = {
            phone: message.to,
            file: {
              mediaId: message.media.id,
              mimetype: message.media.mimeType,
            },
          };
          break;

        case "template": {
          const template = message.template.template;

          const bodyComponent = template.components?.find(
            (c) => c.type.toLowerCase() === "body",
          );

          const headerComponent = template.components?.find(
            (c) => c.type.toLowerCase() === "header",
          );

          payload = {
            phone: message.to,
            templateName: template.name,
            templateLanguage: template.language.code,
            templateParams: bodyComponent?.parameters?.map((p) => p.text) || [],
            templateParamsHeader: headerComponent?.parameters?.[0] || null,
          };

          break;
        }

        case "interactive":
          payload = {
            phone: message.to,
            interactive: message.interactive,
          };
          break;

        default:
          return;
      }

      const response = await sendWhatsAppMessage(payload);

      if (response.success) {
        setMessageList((prev) =>
          prev.map((m) =>
            m._id === message._id
              ? {
                  ...m,
                  status: "sent",
                  messageId: response.result.docs.messageId,
                }
              : m,
          ),
        );

        showToast({
          type: "success",
          message: "Message resent successfully.",
        });
      }
    } catch (err) {
      showToast({
        type: "error",
        message: "Failed to resend message.",
      });
    }
  };

  const loadMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await getWhatsappConversationMessages(conversationId);
      // setMessageList(response?.result?.messages)

      if (response?.success && response?.responseStatusCode === 200) {
        const messages = response?.result?.messages;
        setMessageList(messages);

        if (setLastMessage) {
          setLastMessage(messages[messages.length - 1]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchTemplate = async () => {
    setTemplateLoading(true);
    try {
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setTemplateLoading(false);
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

  const handleUserAssign = async (item) => {
    const [phone, email] = item.value.split(",");

    const isEdit = selectedConversation?.markAsLead;

    const payload = {
      Contact: selectedConversation.phone,
      Name: selectedConversation.name,
      ndid: selectedConversation.ndid,
      notes: selectedConversation.notes,
      status: selectedConversation.status,
      conversationId: selectedConversation._id,
      hId: selectedConversation?.hid || localStorage.getItem("hid"),
      assignee: item?.label,
      assigneeNumber: phone || null,
      assigneeEmail: email || null,
    };

    isEdit ? await updateLead(payload) : await addWhatsAppLead(payload);

    setSelectedConversation({ ...selectedConversation, assignee: item.label });
  };

  const handleSendQuickReply = async (reply) => {
    try {
      const sortedItems = [...reply.items].sort((a, b) => a.order - b.order);

      for (const item of sortedItems) {
        // TEXT
        if (item.type === "text") {
          const formData = new FormData();

          formData.append("phone", selectedConversation.phone);
          formData.append("text", item.text);

          // Optimistic UI
          const optimisticMessage = {
            _id: `temp-${Date.now()}-${Math.random()}`,
            conversationId: selectedConversation._id,
            from: "me",
            to: selectedConversation.phone,
            sender: "me",
            direction: "outbound",
            messageType: "text",
            body: item.text,
            status: "sent",
            timestamp: new Date(),
            createdAt: new Date(),
          };

          setMessageList((prev) => [...prev, optimisticMessage]);

          await sendWhatsAppMessage(formData);

          continue;
        }

        // IMAGE / VIDEO / DOCUMENT
        if (item.media?.length) {
          for (const media of item.media) {
            const payload = {
              phone: selectedConversation.phone,
              file: {
                mediaUrl: media.url,
                mimeType: media.mimeType,
                filename: media.fileName,
              },
            };

            // Optimistic UI
            const optimisticMessage = {
              _id: `temp-${Date.now()}-${Math.random()}`,
              conversationId: selectedConversation._id,
              from: "me",
              to: selectedConversation.phone,
              sender: "me",
              direction: "outbound",
              messageType: item.type,
              body: null,
              media: {
                url: media.url,
                mimeType: media.mimeType,
                filename: media.fileName,
              },
              status: "sent",
              timestamp: new Date(),
              createdAt: new Date(),
            };

            setMessageList((prev) => [...prev, optimisticMessage]);

            await sendWhatsAppMessage(payload);
          }
        }
      }
    } catch (error) {
      console.error(error);

      showToast({
        type: "error",
        message: error?.responseMessage || "Failed to send quick reply",
      });
    }
  };

  const handleSelectQuickReply = (reply) => {
    handleSendQuickReply(reply);
    setShowQuickReplies(false);
  };

  const fetchUsersData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
    setAllUsers(usersData);
  };

  const fetchFlows = async () => {
    try {
      const response = await getWhatsAppFlowScreens();

      if (response?.success) {
        setFlows(response?.result?.docs?.flows || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      // setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      setLoadingReplies(true);

      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/quick-reply?hid=${localStorage.getItem("hid")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setQuickReplies(data.result.docs);
      }
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleCall = async () => {
    console.log("Contact", selectedGuestNumber, agentNumber);
    try {
      if (!agentNumber || !selectedGuestNumber) {
        alert("Both numbers are required");
        return;
      }

      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/call/auth/make-call?hid=${localStorage.getItem("hid")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // authMiddleware expects this
          },
          body: JSON.stringify({
            fromNumber: agentNumber,
            toNumber: selectedGuestNumber,
          }),
        },
      );

      const data = await response.json();

      // console.log("lkjhgfdxcvbmnm,",data);

      if (!response.ok) {
        alert(data?.error || "Call failed");
        return;
      }

      alert("✅ Call initiated successfully");
      setCallPopup(false);
      // setFromNumber("");
      // setToNumber("");
    } catch (error) {
      console.error("Call error:", error);
      alert("Something went wrong while making the call");
    }
  };

  console.log("integrationStatus", integrationStatus);

  useEffect(() => {
    fetchTemplate();
    fetchUsersData();
    fetchFlows();
    fetchReplies();
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

    setSelectedGuestNumber(selectedConversation?.phone);
  }, [selectedConversation?._id]);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({});
  }, [messageList]);

  const isImage = file?.type?.startsWith("image/");
  const isPDF = file?.type === "application/pdf";
  const isExcel = file?.type?.includes("sheet");
  const isWord = file?.type?.includes("word");

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex z-5 max-md:bg-app-surface justify-between items-center px-4 md:px-6 h-16 shadow-sm max-md:fixed max-md:w-full">
        <div className=" flex items-center">
          <div className="mr-2 lg:hidden ">
            <IoArrowBack size={20} onClick={() => setMobileActive("sidebar")} />
          </div>

          <div>
            <div
              onClick={() => setMobileActive("profile")}
              className="w-8 h-8 md:w-12 md:h-12 text-white bg-teal-600 rounded-full flex items-center justify-center  font-bold text-sm mr-2 md:mr-4"
            >
              {selectedConversation?.name?.charAt(0)?.toUpperCase()}
            </div>
            {/* <p className="text-xs md:text-sm text-gray-600 ">
              {selectedConversation.phone}
            </p> */}
          </div>

          <div onClick={() => setMobileActive("profile")}>
            <h3 className="text-md md:text-md text-gray-600 font-medium capitalize">
              {selectedConversation?.name}
            </h3>
            <p className="text-xs md:text-sm  text-gray-600 ">
              {selectedConversation.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center md:gap-6 gap-2">
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

          {integrationStatus?.exotel ? (
            <button
              onClick={() => setCallPopup(true)}
              // to={`tel:${selectedConversation?.phone}`}
              className="bg-teal-600  text-lime-50 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <MdCall size={18} /> Call
            </button>
          ) : (
            <Link
              // onClick={() => setCallPopup(true)}
              to={`tel:${selectedConversation?.phone}`}
              className="bg-teal-600  text-lime-50 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <MdCall size={18} /> Call
            </Link>
          )}

          <div>
            <CustomDropdown2
              label={selectedConversation?.assignedTo || "Select User"}
              options={
                allUsers?.map((user) => ({
                  value: `${user?.phone},${user?.emailId}`,
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
        className="flex-1 p-6 max-md:mt-16 max-md:mb-30 overflow-y-auto scrollbar-hidden  "
      >
        {messageLoading ? (
          <div className="space-y-4">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          <div className="space-y-1">
            {selectedConversation?.adAttribution && (
              <div className="max-w-xs flex flex-col gap-2 px-3 py-2 mb-2 bg-app-surface-secondary border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700">
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
                            ? "rounded-tl-xl border shadow-md !border-ternary dark:border-primary/60 rounded-br-xl rounded-bl-lg bg-white dark:bg-app-surface"
                            : "rounded-br-xl border shadow-md !border-ternary dark:border-primary/60 rounded-tr-xl rounded-bl-lg bg-white dark:bg-app-surface"
                        }`}
                      >
                        {/* all message types */}
                        <div className="mt-4">
                          {/* TEXT */}
                          {(message.messageType === "text" ||
                            message?.messageType === "unsupported" ||
                            message?.messageType === "interactive") &&
                            message.body && (
                              <div className="max-w-xs ml-auto mt-3">
                                <div className=" text-slate-700 rounded-lg relative">
                                  {/* Context / Reply Preview */}
                                  {message?.context &&
                                    message?.context?.message && (
                                      <div className="bg-slate-600 border-l-4 border-green-300 px-2 py-1 rounded mb-1">
                                        <p className="text-xs text-green-100 dark:text-app-text-faint truncate">
                                          {message?.context?.message}
                                        </p>
                                      </div>
                                    )}

                                  {/* Actual Message */}

                                  <p className="text-sm whitespace-pre-wrap text-blue-500">
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
                            message?.template?.template?.name &&
                            (() => {
                              const header =
                                message.template.template.components?.find(
                                  (c) => c.type?.toLowerCase() === "header",
                                );

                              const headerParam = header?.parameters?.[0];

                              const imageUrl =
                                message?.media?.url ||
                                `${NEW_BASE_URL}/api/v1/whatsapp/media/${headerParam?.image?.id}?ndid=${localStorage.getItem(
                                  "ndid",
                                )}`;

                              return (
                                <div className="px-2 py-1 rounded-lg max-w-xs dark:bg-primary!">
                                  {/* HEADER */}
                                  {header && (
                                    <>
                                      {headerParam?.type === "image" && (
                                        <img
                                          src={imageUrl}
                                          onClick={() =>
                                            setImagePreview(imageUrl)
                                          }
                                          alt="Template Header"
                                          className="mb-2 rounded-lg w-full h-44 object-cover cursor-pointer"
                                        />
                                      )}

                                      {headerParam?.type === "video" && (
                                        <video
                                          controls
                                          className="mb-2 rounded-lg w-full h-44"
                                        >
                                          <source src={imageUrl} />
                                        </video>
                                      )}

                                      {headerParam?.type === "document" && (
                                        <a
                                          href={imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mb-2 flex items-center gap-2 p-3 rounded bg-gray-100 dark:bg-gray-700"
                                        >
                                          📄 View Document
                                        </a>
                                      )}

                                      {headerParam?.type === "text" && (
                                        <p className="font-medium mb-2">
                                          {headerParam.text}
                                        </p>
                                      )}
                                    </>
                                  )}

                                  {/* Template Name */}
                                  <p className="text-xs text-orange-500 dark:text-app-text-faint mb-1 capitalize">
                                    {message.template.template.name}
                                  </p>

                                  {/* Body */}
                                  <pre className="text-sm whitespace-pre-wrap font-sans">
                                    {message.body || (
                                      <span className="text-xs text-zinc-400 dark:text-app-text-faint">
                                        No text defined
                                      </span>
                                    )}
                                  </pre>
                                </div>
                              );
                            })()}
                          {/* {message?.messageType === "template" &&
                            message?.template?.template?.name && (
                              <div className=" px-2 py-1 rounded-lg max-w-xs dark:bg-primary!">
                                <img
                                  onClick={() =>
                                    setImagePreview(
                                      message?.media?.url ||
                                        `${NEW_BASE_URL}/api/v1/whatsapp/media/${
                                          message?.template?.template
                                            ?.components?.[0]?.parameters?.[0]
                                            ?._id
                                        }?ndid=${localStorage.getItem("ndid")}`,
                                    )
                                  }
                                  src={
                                    message?.media?.url ||
                                    `${NEW_BASE_URL}/api/v1/whatsapp/media/${
                                      message?.template?.template
                                        ?.components?.[0]?.parameters?.[0]?._id
                                    }?ndid=${localStorage.getItem("ndid")}`
                                  }
                                  alt="WhatsApp"
                                  className="mt-2 rounded-lg w-full size-44 cursor-pointer"
                                />

                                <p className="text-xs text-orange-500 dark:text-app-text-faint mb-1 capitalize">
                                  {message.template?.template?.components[0].parameters[0].type}
                                </p>
                                <img
                              onClick={() =>
                                setImagePreview(
                                  message?.media?.url ||
                                    ` ${NEW_BASE_URL}/api/v1/whatsapp/media/${message.template?.template?.components[0].parameters[0]._id}?ndid=${localStorage.getItem("ndid")}`,
                                )
                              }
                              src={
                                message.media?.url ||
                                ` ${NEW_BASE_URL}/api/v1/whatsapp/media/${message.template?.template?.components[0].parameters[0]._id}?ndid=${localStorage.getItem("ndid")}`
                              }
                              alt="WhatsApp"
                              className="mt-2 rounded-lg w-full size-44 cursor-pointer"
                            />
                                <p className="text-xs text-orange-500 dark:text-app-text-faint mb-1 capitalize">
                                  {message.template?.template?.name}
                                </p>

                                <pre className="text-sm whitespace-pre-wrap font-sans">
                                  {message.body ? (
                                    message.body
                                  ) : (
                                    <span className="text-xs text-zinc-400 dark:text-app-text-faint">
                                      No text defined
                                    </span>
                                  )}
                                </pre>
                              </div>
                            )} */}

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
                                    className="h-32 overflow-hidden cursor-pointer relative rounded-lg border bg-app-surface flex flex-col justify-center items-center"
                                  >
                                    {/* <iframe
                                      src={url}
                                      className="w-full h-full pointer-events-none"
                                      style={{ border: "none" }}
                                    /> */}

                                    <div className="flex flex-col items-center justify-center text-gray-600 px-2">
                                      {getIcon()}
                                    </div>

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
                                {message.status === "failed" && (
                                  <span className="text-red-500 flex items-center">
                                    failed <FiX />
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* resend if failed  */}
                        {message?.status === "failed" && (
                          <button
                            onClick={() => handleResend(message)}
                            className="text-xs flex justify-end w-full underline text-blue-500"
                          >
                            Resend
                          </button>
                        )}

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
                            <div className="absolute -right-6 mt-1 w-28 bg-app-surface border rounded shadow-md z-10">
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
        className=" bg-app-surface-secondary border-t flex flex-col px-6 py-5 max-md:fixed bottom-0 max-md:w-full "
      >
        {templateClick && (
          <div className="mb-2 grid grid-cols-2 lg:grid-cols-3 h-40 gap-2 overflow-y-scroll scrollbar-hidden">
            {templates?.length > 0 &&
              templates?.map((template) => (
                // <div
                //   onClick={() => setSelectedTemplate(template)}
                //   key={template?.id}
                //   className={`cursor-pointer flex flex-col gap-2 rounded-lg overflow-hidden ${selectedTemplate?.id === template?.id ? "border border-green-600! " : "border border-gray-600 opacity-60"} h-30 `}
                // >
                //   <p className=" break-words text-xs capitalize font-medium border-b px-2 py-2 bg-teal-100">
                //     {template?.name}
                //   </p>
                //   <p className="text-sm px-2 pb-2 bg-gray-100">
                //     {template?.components[0]?.text}
                //   </p>
                // </div>
                <div
                  onClick={() => setSelectedTemplate(template)}
                  key={template?.id}
                  className={`
    cursor-pointer rounded-xl overflow-hidden transition-all h-30
    ${
      selectedTemplate?.id === template?.id
        ? "ring-1 ring-orange-500 bg-orange-50 dark:bg-orange-950/50"
        : "border border-gray-200 bg-white hover:border-orange-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-orange-700"
    }
  `}
                >
                  <div className="flex items-center justify-between px-3 py-2 bg-orange-100 border-b border-orange-200 dark:bg-orange-900/30 dark:border-orange-900">
                    <p className="break-words text-xs font-semibold text-orange-700 dark:text-orange-300 truncate">
                      {template?.name}
                    </p>

                    {selectedTemplate?.id === template?.id && (
                      <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-lg p-2 w-full">
                      <p className="text-xs text-gray-800 dark:text-gray-300 line-clamp-3 break-words">
                        {template?.components?.[0]?.text ||
                          template?.components?.[1]?.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {showQuickReplies && (
          <div className="relative grid grid-cols-3 gap-2 mb-2 bg-white w-full border rounded-lg shadow-lg max-h-96 overflow-auto p-2">
            {quickReplies.map((reply) => {
              const textItem = reply.items.find((i) => i.type === "text");
              const mediaItem = reply.items.find((i) => i.type !== "text");

              return (
                <button
                  type="button"
                  key={reply._id}
                  onClick={() => handleSelectQuickReply(reply)}
                  className="w-full text-left p-3 hover:bg-gray-50 bg-gray-100 rounded-lg border border-primary/30!"
                >
                  <div className="font-medium">{reply.title}</div>

                  <div className="text-sm text-gray-500 truncate">
                    {textItem?.text}
                  </div>

                  {mediaItem && (
                    <div className="text-xs mt-1">
                      {mediaItem.media.length} {mediaItem.type}
                    </div>
                  )}
                </button>
              );
            })}

            <div
              className="absolute top-1 right-2 pb-5 cursor-pointer"
              onClick={() => setShowQuickReplies(false)}
            >
              <X size={16} />
            </div>
          </div>
        )}

        {file && (
          <div className="flex flex-col items-start gap-2 mb-2 relative w-fit">
            <div
              onClick={() => setFile(null)}
              className="flex justify-center items-center absolute -left-1 -top-1 cursor-pointer size-3.5 bg-red-500 rounded-full text-white"
            >
              <FiX size={10} />
            </div>

            {/* ✅ IMAGE PREVIEW */}
            {isImage ? (
              <img
                src={URL.createObjectURL(file)}
                alt="file"
                className="w-40 h-20 rounded-md object-contain"
              />
            ) : (
              // ✅ DOCUMENT UI
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-app-surface-secondary max-w-60">
                {/* ICON */}
                {isPDF && <FaFilePdf className="text-red-500 text-xl" />}
                {isExcel && <FaFileExcel className="text-green-600 text-xl" />}
                {isWord && <FaFileWord className="text-blue-500 text-xl" />}
                {!isPDF && !isExcel && !isWord && (
                  <FaFileAlt className="text-gray-500 dark:text-app-text-faint text-xl" />
                )}

                {/* FILE NAME */}
                <p className="text-xs truncate">{file.name}</p>
              </div>
            )}
          </div>
        )}

        <div
          className={`${!is24HourComplete ? "" : "flex"} items-center space-y-1`}
        >
          {flows?.length > 0 && (
            <div>
              <select
                value={selectedFlowId || ""}
                onChange={(e) => {
                  setSelectedFlowId(e.target.value);
                  if (e.target.value) {
                    setShowFlowModal(true);
                  }
                }}
                className="border bg-gray-100 dark:bg-primary outline-none text-sm py-1 rounded-md"
              >
                <option value="">Select Form</option>

                {flows.map((flow) => (
                  <option key={flow.flowId} value={flow.flowId}>
                    {flow.flowName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2 items-center">
            {templateLoading ? (
              <p className="text-xs text-gray-500 animate-pulse">
                Loading Templates...
              </p>
            ) : (
              <div>
                {!templateClick ? (
                  <span
                    onClick={() => {
                      if (!templates?.length) {
                        navigate(
                          `/dashboard/client/68017653/settings?tab=whatsapp&template=true`,
                        );
                      }

                      handleTemplate(true);
                    }}
                    className="cursor-pointer bg-gray-200 dark:bg-primary flex items-center gap-1 rounded-lg px-4 py-1 text-sm text-gray-500 dark:text-app-text-faint"
                  >
                    <MdChat className="" /> Templates
                  </span>
                ) : (
                  <span
                    onClick={() => handleTemplate(false)}
                    className="whitespace-nowrap cursor-pointer flex items-center gap-1 bg-gray-200 dark:bg-primary rounded-lg px-4 py-1 text-sm text-gray-500 dark:text-app-text-faint"
                  >
                    Close Templates <MdClose />
                  </span>
                )}
              </div>
            )}

            {!is24HourComplete && (
              <button
                type="button"
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MessageSquareReply size={20} />
              </button>
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
            <div className="py-3 flex w-full items-center gap-3">
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
                  className="flex-1 bg-zinc-100 dark:bg-app-surface-secondary resize-none rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 overflow-y-auto"
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
      </form>

      {showFlowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Set Flow</h3>

              <button onClick={() => setShowFlowModal(false)}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Header</label>
                <input
                  type="text"
                  value={flowConfig.header}
                  onChange={(e) =>
                    setFlowConfig((p) => ({
                      ...p,
                      header: e.target.value,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Body <span className="text-red-500">*</span>
                </label>

                <textarea
                  rows={4}
                  value={flowConfig.body}
                  onChange={(e) =>
                    setFlowConfig((p) => ({
                      ...p,
                      body: e.target.value,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Footer</label>

                <input
                  type="text"
                  value={flowConfig.footer}
                  onChange={(e) =>
                    setFlowConfig((p) => ({
                      ...p,
                      footer: e.target.value,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">CTA Button Text</label>

                <input
                  type="text"
                  value={flowConfig.cta}
                  onChange={(e) =>
                    setFlowConfig((p) => ({
                      ...p,
                      cta: e.target.value,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFlowModal(false)}
                className="border px-4 py-2 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setSelectedFlowId(null);
                  setShowFlowModal(false);
                  handleSendMessage();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {callPopup && (
        <div className="fixed inset-0 z-[99999] flex justify-center bg-black/50">
          <div className="w-[400px] h-50 max-w-md p-4 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-[#2d3748] shadow-xl flex flex-col rounded-lg">
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 dark:text-[#e8eaed]">
                Enter Number to make a call!
              </h1>

              <CustomDropdown
                // label={lead?.assignee || "Select Agent"}
                label="Select Agent"
                options={
                  allUsers?.map((user) => ({
                    value: user?.phone,
                    label: user?.userName,
                  })) || []
                }
                onChange={(value) => setAgentNumber(value)}
              />

              <input
                value={selectedGuestNumber}
                onChange={(e) => setSelectedGuestNumber(e.target.value)}
                placeholder="Guest number"
                required
                className="mt-1 w-full border border-gray-300 dark:border-[#2d3748] bg-white dark:bg-[#242b3d] text-gray-900 dark:text-[#e8eaed] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCallPopup(false)}
                  className="border py-1 px-5 bg-red-300 dark:bg-red-500/20 dark:text-red-300 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCall}
                  className="border border-gray-300 dark:border-[#2d3748] py-1 px-5 rounded text-gray-900 dark:text-[#e8eaed] hover:bg-orange-400 dark:hover:bg-orange-500/20"
                >
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;

import { useContext, useEffect, useRef, useState } from "react";
import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";
import {
  NEW_BASE_URL,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../../../data/constant";
import DataContext from "../../../../context/DataContext";
import {
  addWhatsAppLead,
  getWhatsappConversationMessages,
  getWhatsAppMessageTemplates,
  sendWhatsAppMessage,
} from "../../../../services/api/whatsApp";
import { MdCall, MdChat, MdClose } from "react-icons/md";
import WebSocketClient from "../../../../config/websocketClient";
import normalizePhone from "../../../../utils/normalizePhone";
import { is24HoursCompletedFnc } from "../../../../utils/is24Hours";
import { BsCheckAll } from "react-icons/bs";
import { BsCheckLg } from "react-icons/bs";
import Loader from "../../../../components/Loader";
import Swal from "sweetalert2";
import { renderMessageWithLinks } from "../../../../utils/urlParser";

const ChatArea = () => {
  const wsRef = useRef(null);
  const textareaRef = useRef(null);
  const { selectedConversation, conversations ,setSelectedConversation} = useContext(DataContext);

  const is24HourComplete = is24HoursCompletedFnc(
    selectedConversation?.last_message?.created_at,
  );

  const [messageList, setMessageList] = useState([]);
  const [messageLoading, setLoadingMessages] = useState(true);
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [messageValue, setMessageValue] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const [templateClick, setTemplateClick] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState();

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

  const handleAddLead = async () => {
    setAddLeadLoading(true);
    try {
      const payload = {
        phone: selectedConversation.phone,
        name: selectedConversation.name,
        ndid: selectedConversation.ndid,
        notes: selectedConversation.notes,
        stage: selectedConversation.stage,
        conversationId: selectedConversation._id,
      };
      const response = await addWhatsAppLead(payload);

      if (response.success && response.responseStatusCode === 200) {
        Swal.fire("Success", response?.responseMessage, "success");
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setAddLeadLoading(false);
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

  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      if (serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_NEW_MESSAGE) {
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
      }
    });

    return () => wsRef.current?.close();
  }, [selectedConversation, conversations]);

  useEffect(() => {
    loadMessages(selectedConversation?._id);
  }, [selectedConversation?._id]);

  const header = [
  { label: "Open Queries", value: "Open" },
  { label: "Contacted", value: "Contacted" },
  { label: "Converted", value: "Converted" },
  { label: "Out Of Budget", value: "Out Of Budget" },
  { label: "Potential For Later", value: "Potential" },
  { label: "Quotation Provided", value: "Quotation Provided" },
  { label: "Dead Lead", value: "Dead Lead" },
  { label: "Date Sold Out", value: "Date Sold Out" },
  { label: "Duplicate", value: "Duplicate" },
  { label: "Hot", value: "Hot" },
];

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "stage") {
      setSelectedConversation((prev) => ({
        ...prev,
        stage: value,
      }));
    }
  };
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 h-16 shadow-sm">
        <div className="bg-white flex items-center">
          <div className="w-12 h-12 text-white bg-teal-600 rounded-full flex items-center justify-center  font-bold text-lg mr-4">
            {selectedConversation?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold ">
              {selectedConversation?.name}
            </h3>
            <p className="text-sm ">+{selectedConversation.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button
              className="bg-teal-600  text-lime-50 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <MdCall size={18}/> Call
            </button>
            {/* <button
              className="bg-primary  text-lime-50 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            >
                {selectedConversation?.status}
            </button> */}
            <select
              name="stage"
              id=""
              className="border !px-4 bg-primary text-white border-gray-50 outline-none py-1 rounded-md w-full"
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              {header?.map((item) => {
                return <option value={item.value}>{item.label}</option>;
              })}
            </select>

        {!selectedConversation?.markAsLead && (
            <button
              disabled={addLeadLoading}
              onClick={handleAddLead}
              className="bg-primary/95 whitespace-nowrap text-lime-50 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              Add Lead {addLeadLoading && <Loader size={12} color="#fff" />}
            </button>
        )}
          </div>

      </div>

      {/* Messages */}
      <div
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cubes.png')",
        }}
        className="flex-1 p-6 overflow-y-auto scrollbar-hidden "
      >
        {messageLoading ? (
          <div className="space-y-4">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          <>
            {selectedConversation?.adAttribution &&
              <div className="max-w-xs flex flex-col gap-2 px-3 py-2 mb-2 bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700">
                {selectedConversation?.adAttribution?.mediaType==='image'&&<img src={selectedConversation?.adAttribution?.imageUrl} alt={selectedConversation?.adAttribution?.sourceType}
                  className="rounded"
                />}

                <h1 className="font-medium ">{selectedConversation?.adAttribution?.headline}</h1>
                <p className="text-sm">{selectedConversation?.adAttribution?.body}</p>

                <div className="flex justify-end items-center gap-3">
                  <p className="text-sm capitalize bg-gray-200 rounded px-2 py-1">{selectedConversation?.adAttribution?.sourceType}</p>
                  <p className="text-[10px] opacity-70">

                    {new Date(selectedConversation?.adAttribution?.receivedAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>

              </div>
            }
            {messageList?.length > 0 ? (
              messageList.map((message, index) => {
                const isMe = message.sender === "me";

                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-xs  px-3 py-2 ${isMe
                          ? "rounded-tl-xl border rounded-br-xl rounded-bl-lg bg-white"
                          : "bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700"
                        }`}
                    >
                      {/* TEXT */}
                      {message.messageType === "text" && message.body && (
                        <p className="text-sm whitespace-pre-wrap bg-white">
                          {renderMessageWithLinks(message?.body)}
                        </p>
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
                      {message.messageType === "image" && (
                        <img
                          src={
                            message.media?.url ||
                            ` ${NEW_BASE_URL}/api/v1/whatsapp/media/${message.media.id}?ndid=${localStorage.getItem("ndid")}`
                          }
                          alt="WhatsApp"
                          className="mt-2 rounded-lg w-full"
                        />
                      )}

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
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400">No conversation yet</p>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t flex flex-col px-6 py-5"
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

        
        <div className={`${!is24HourComplete?"":"flex"} items-center`}>

        <div className="flex gap-2">
          {!templateClick ? (
            <span
              onClick={() => handleTemplate(true)}
              className="cursor-pointer bg-zinc-100 flex items-center gap-1 rounded-lg px-4 py-1 text-sm text-gray-500"
            >
              <MdChat className="" /> Templates
            </span>
          ) : (
            <span
              onClick={() => handleTemplate(false)}
              className="whitespace-nowrap cursor-pointer flex items-center gap-1 bg-zinc-100 rounded-lg px-4 py-1 text-sm text-gray-500"
            >
              Close Templates <MdClose />
            </span>
          )}
        </div>

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

        </div>
      </form>
    </div>
  );
};

export default ChatArea;

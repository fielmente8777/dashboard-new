import { useContext, useEffect, useRef, useState } from "react";
import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";
import { NEW_BASE_URL, WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../../data/constant";
import DataContext from "../../../../context/DataContext";
import { getWhatsappConversationMessages, getWhatsAppMessageTemplates, sendWhatsAppMessage } from "../../../../services/api/whatsApp";
import { MdChat, MdClose } from "react-icons/md";
import WebSocketClient from "../../../../config/websocketClient";
import normalizePhone from "../../../../utils/normalizePhone";

const ChatArea = () => {
  const wsRef = useRef(null);
  const { conversations, setConversations, selectedConversation, setSelectedConversation } = useContext(DataContext);

  const [messageList, setMessageList] = useState([])
  const [messageLoading, setLoadingMessages] = useState(true)
  const [messageValue, setMessageValue] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);


  const [templateClick, setTemplateClick] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState();

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messageList]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedConversation) return;

    try {
      // =============================
      // 🚀 TEMPLATE SELECTED
      // =============================
      if (selectedTemplate) {

        const templateParams =
          selectedTemplate.components?.[0]?.example?.body_text?.[0] || [];

        const templateText =
          selectedTemplate.components?.find(c => c.type === "BODY")?.text || "";

        // Render text instantly
        let renderedBody = templateText;

        templateParams.forEach((param, index) => {
          renderedBody = renderedBody.replace(`{{${index + 1}}}`, param);
        });

        const templatePayload = {
          phone: selectedConversation.phone,
          templateName: selectedTemplate.name,
          templateLanguage: selectedTemplate.language || "en",
          templateParams: templateParams
        };

        console.log("tempalte payload", templatePayload);
        // Optimistic message matches DB structure
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
            name: selectedTemplate.name,
            language: selectedTemplate.language || "en",
            parameters: templateParams
          },
          status: "pending",
          timestamp: new Date(),
          createdAt: new Date()
        };

        // Push instantly to UI (optimistic update)
        setMessageList(prev => [
          ...prev,optimisticMessage ]);

        await sendWhatsAppMessage(templatePayload);

        setSelectedTemplate(null);
        setTemplateClick(false);
        return;
      }

      // =============================
      // 🚀 NORMAL MESSAGE
      // =============================
      const formData = new FormData();
      formData.append("phone", selectedConversation.phone);

      if (messageValue) {
        formData.append("text", messageValue);
      }

      if (file) {
        formData.append("file", file);
      }

      // Optimistic UI
      setMessageList(prev => [
        ...prev,
        {
          sender: "me",
          type: "text",
          text: messageValue,
          createdAt: new Date()
        }
      ]);

      setMessageValue("");

      await sendWhatsAppMessage(formData);

    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {

      // console.log("Server response ", serverResponse);
      if (
        serverResponse?.event === WEBSOCKET_EVENTS.WHATSAPP_NEW_MESSAGE
      ) {
        const { data } = serverResponse;
        // console.log(data);
        const fromPhone = normalizePhone(data.from);
        if (normalizePhone(selectedConversation.phone) !== fromPhone) return;
        const message = { ...data };
        setMessageList((prev) => [...prev, message])
      }
    });

    return () => wsRef.current?.close();
  }, [selectedConversation]);


  const loadMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const response = await getWhatsappConversationMessages(conversationId);
      // setMessageList(response?.result?.messages)

      if (response?.success && response?.responseStatusCode === 200) {
        setMessageList(response?.result?.messages)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  };


  useEffect(() => {
    loadMessages(selectedConversation?._id);
  }, [selectedConversation?._id]);

  const fetchTemplate = async () => {
    try {
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (error) {
      console.log("Error", error);
    }
  }

  useEffect(() => {
    fetchTemplate()
  }, [])


  const handleTemplate = (value) => {
    setSelectedTemplate(null);
    setTemplateClick(value);
  }


  // console.log("selected cnvo", selectedConversation);

  return (
    <div className="flex-1 flex flex-col ">
      {/* Header */}
      <div className="bg-white flex items-center px-6 h-16 shadow-sm">
        <div className="w-12 h-12 text-white bg-teal-600 rounded-full flex items-center justify-center  font-bold text-lg mr-4">
          {selectedConversation?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold ">
            {selectedConversation?.name}
          </h3>
          <p className="text-sm ">+{selectedConversation.phone}</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/cubes.png')",
      }} className="flex-1 p-6 overflow-y-auto scrollbar-hidden ">
        {messageLoading ? (
          <div className="space-y-4">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          <>
            {messageList?.length > 0 ? (
              messageList.map((message, index) => {
                const isMe = message.sender === "me";

                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-xs  px-3 py-2 ${isMe ? "rounded-tl-xl rounded-br-xl rounded-bl-lg bg-teal-50/90 border !border-green-600 " : "bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl text-gray-700"
                        }`}
                    >
                      {/* TEXT */}
                      {message.messageType === "text" && message.body && (
                        <p className="text-sm whitespace-pre-wrap">
                          {message.body}
                        </p>
                      )}
                      {message.messageType === "template" && message.template.name && (
                        <div className="bg-green-100 px-4 py-2 rounded-lg max-w-xs">
                          <p className="text-xs text-gray-500 mb-1 capitalize">
                            {message.template?.name}
                          </p>

                          <p className="text-sm">
                            {message.body ? message.body : <span className="text-xs text-zinc-400">No text defined</span>}
                          </p>
                        </div>
                      )}

                      {/* IMAGE */}
                      {message.messageType &&message.media?.id && (
                        <img
                          src={`${NEW_BASE_URL}/api/v1/whatsapp/media/${message.media.id}?ndid=${localStorage.getItem("ndid")}`}
                          alt="WhatsApp"
                          className="mt-2 rounded-lg w-full"
                        />
                      )}

                      <div className="text-[10px] text-right mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
        {templateClick &&
          <div className=" mb-2 grid grid-cols-2 lg:grid-cols-4 max-h-50  gap-2 overflow-auto scrollbar-hidden">
            {templates.map((template) => (
              <div onClick={() => setSelectedTemplate(template)} key={template?.id} className={`cursor-pointer flex flex-col gap-2 rounded-lg overflow-hidden ${selectedTemplate?.id === template?.id ? "border !border-green-600 " : "border border-gray-300 opacity-60"} `}>
                <p className="text-sm capitalize font-medium border-b px-2 py-2 bg-teal-50">{template?.name}</p>
                <p className="text-sm px-2 pb-2 ">{template?.components[0]?.text}</p>

              </div>
            ))}

          </div>}
        <div className="flex gap-2">
          {!templateClick ? <span onClick={() => handleTemplate(true)} className="cursor-pointer bg-zinc-100 flex items-center gap-1 rounded-lg px-4 py-1 text-sm text-gray-500">
            <MdChat className="" /> Templates
          </span> :
            <span onClick={() => handleTemplate(false)} className=" cursor-pointer flex items-center gap-1 bg-zinc-100 rounded-lg px-4 py-1 text-sm text-gray-500">
              Close Templates <MdClose /></span>}
        </div>

        <div className="bg-white py-3 flex w-full items-center gap-3">

          {/* Attachment */}
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

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
          />

          {/* Text Input */}
          <input
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-zinc-100 rounded-lg  px-4 py-2 focus:outline-none focus:border-teal-500"
          />

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

      </form>
    </div>
  );
};

export default ChatArea;

// import { useEffect, useRef, useState } from "react";
// import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";
// import { NEW_BASE_URL } from "../../../../data/constant";

// const ChatArea = ({ selectedContact, messages, onSubmit, loadingMessage }) => {
//   const [messageValue, setMessageValue] = useState("");
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView();
//   }, [messages]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!messageValue.trim()) return;

//     onSubmit({
//       text: messageValue,
//       sender: "me",
//       createdAt: new Date(),
//     });

//     setMessageValue("");
//   };

//   return (
//     <div className="flex-1 flex flex-col bg-gray-50">
//       {/* Header */}
//       <div className="bg-teal-600 text-white px-6 py-4">
//         <h2 className="text-lg font-semibold">{selectedContact?.name}</h2>
//       </div>

//       {/* Messages */}

//       <div className="flex-1 p-6 overflow-y-auto scrollbar-hidden">
//         {loadingMessage ? (
//           <div className="flex-1 p-6 space-y-4 overflow-hidden">
//             <MessageSkeleton align="left" />
//             <MessageSkeleton align="right" />
//             <MessageSkeleton align="left" />
//             <MessageSkeleton align="right" />
//             <MessageSkeleton align="left" />
//           </div>
//         ) : (
//           <div>
//             {messages?.length > 0 ? (
//               messages?.map((message, index) => {
//                 const isMe = message.sender === "me";
//                 // const image = message.image;

//                 return (
//                   <div
//                     key={index}
//                     className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
//                   >
//                     <div
//                       className={`max-w-xs rounded-lg px-2 py-1 ${
//                         !isMe
//                           ? "bg-teal-600 border text-white"
//                           : "bg-white border"
//                       }`}
//                     >
//                       {/* ✅ TEXT MESSAGE */}
//                       {message.text && (
//                         <p className="text-sm whitespace-pre-wrap">
//                           {message.text}
//                         </p>
//                       )}

//                       {/* ✅ IMAGE MESSAGE */}
//                       {message.image?.url && (
//                         <div className="w-full">
//                           <img
//                             src={`${NEW_BASE_URL}/api/v1/whatsapp/media/${message.image.id}?ndid=${localStorage.getItem("ndid")}`}
//                             alt="WhatsApp Image"
//                             className="mt-2 rounded-lg max-w-xs w-full h-full"
//                           />
//                         </div>
//                       )}

//                       {/* Timestamp */}
//                       <div className="text-[10px] text-white text-right mt-1">
//                         {new Date(message.createdAt).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <p className="text-center text-gray-400">No conversation yet</p>
//             )}
//             <div ref={bottomRef} />
//           </div>
//         )}
//       </div>

//       {/* Input */}
//       <form onSubmit={handleSendMessage} className="bg-white border-t p-4 flex">
//         <input
//           value={messageValue}
//           onChange={(e) => setMessageValue(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 border rounded-lg px-4 py-2 mr-4"
//         />
//         <button
//           type="submit"
//           className="bg-teal-600 text-white px-6 py-2 rounded-lg"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatArea;

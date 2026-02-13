import { useEffect, useRef, useState } from "react";
import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";
import { NEW_BASE_URL } from "../../../../data/constant";

const ChatArea = ({ selectedContact, messages, onSubmit, loadingMessage }) => {
  const [messageValue, setMessageValue] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    // if (!messageValue.trim() || !file) return;

    onSubmit({
      text: messageValue,
      file,
      createdAt: new Date(),
    });

    setMessageValue("");
    setFile(null);
  };

  console.log(file);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white px-6 py-4">
        <h2 className="text-lg font-semibold">{selectedContact?.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-hidden">
        {loadingMessage ? (
          <div className="space-y-4">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
          </div>
        ) : (
          <>
            {messages?.length > 0 ? (
              messages.map((message, index) => {
                const isMe = message.sender === "me";

                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-3 py-2 ${
                        isMe ? "bg-white border" : "bg-teal-600 text-white"
                      }`}
                    >
                      {/* TEXT */}
                      {message.text && (
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}

                      {/* IMAGE */}
                      {message.image?.id && (
                        <img
                          src={`${NEW_BASE_URL}/api/v1/whatsapp/media/${message.image.id}?ndid=${localStorage.getItem("ndid")}`}
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
        className="bg-white border-t px-4 py-3 flex items-center gap-3"
      >
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
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-teal-500"
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

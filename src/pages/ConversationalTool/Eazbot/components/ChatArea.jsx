import { useEffect, useRef } from "react";

const ChatArea = ({ name, chat, messages }) => {
  const chatEndRef = useRef(null);
  // const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // const handleSubmit = async () => {
  //   const message = {
  //     senderType: "user",
  //     message: responseMessage,
  //   };
  //   try {
  //     // const sendMessageResponse = await axios.post(
  //     //   "http://localhost:4000/api/chat/send-message",
  //     //   {
  //     //     ndid: localStorage.getItem("ndid"), // unique website/client ID
  //     //     guestId: chat?.guestId, // guest user ID
  //     //     botId: localStorage.getItem("ndid"), // admin ID (can be placeholder initially)
  //     //     senderId: localStorage.getItem("ndid"), // who is sending this message
  //     //     senderType: "bot", // "guest", "admin", or "bot"
  //     //     message: responseMessage,
  //     //   }
  //     // );

  //     setMessages((prev) => [...prev, message]);

  //     setResponseMessage("");
  //   } catch (error) {
  //     console.error("Error sending message", error.message);
  //   }
  // };

  if (!chat)
    return (
      <div className="flex border justify-center items-center w-full  h-full">
        Select a chat to see messages
      </div>
    );
  return (
    <div className="flex-1 flex flex-col bg-gray-50 ">
      {/* Chat Header */}
      <div className="bg-teal-600 text-white px-6 py-4 border-none border-red-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">{name}</h2>
          <button className="text-teal-100 hover:text-white text-sm">
            Chat Profile
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-hidden">
        <div className="flex justify-center mb-4">
          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
            22/07/2025
          </span>
        </div>

        {/* Message */}
        {/* {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-start mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
              K
            </div>
            <div className="bg-teal-600 rounded-2xl rounded-tl-sm p-4 max-w-sm text-white">
              <div className="flex items-center text-teal-100 text-xs mb-2">
                <BsImage className="mr-1" />
                Message via ad
              </div>
              <div className="bg-white rounded-lg p-2 mb-3">
                <img
                  src="https://plus.unsplash.com/premium_photo-1676823547752-1d24e8597047?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGl2aW5nJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Resort"
                  className="w-full h-40 object-cover rounded"
                />
              </div>
              <p className="text-sm font-medium mb-2">
                Looking for your next goa ge...
              </p>
              <p className="text-xs text-teal-100 mb-2">
                Escape to Nature. Indulge in Lu...
              </p>
              <p className="text-xs text-teal-100 mb-2">fb.me</p>
              <p className="text-xs text-teal-100 mb-3">
                Ad ID: 120225047748280256
              </p>
              <p className="text-sm">Is there any upcoming packages?</p>
            </div>
          </div>
        ))} */}
        {messages?.map((message, index) => {
          return (
            <div key={index}>
              {message?.senderType === "bot" && (
                <div className="flex justify-end">
                  <div className="flex justify-end items-end mt-1 flex-col max-w-xl w-full">
                    <div className="bg-[#2e3b61]/80 rounded-2xl max-w-[80%] rounded-tr-sm p-4 text-white border text-left ">
                      <div
                        dangerouslySetInnerHTML={{ __html: message?.message }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {message?.created_at
                        ? new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {message?.senderType === "user" && (
                <div className="flex w-fit flex-col max-w-[60%] mt-1">
                  <div className="bg-teal-600 w-auto rounded-2xl rounded-tl-sm p-4 text-white">
                    <div
                      dangerouslySetInnerHTML={{ __html: message?.message }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs ml-2 self-end">
                    {message?.created_at
                      ? new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}
      {/* <div className="bg-white border-t border-gray-200 p-4 flex justify-center">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Intervene
                </button>
            </div> */}
      {/* <div className="bg-white border-t border-gray-200 p-4 flex items-center">
        <input
          type="text"
          value={responseMessage}
          onChange={(e) => setResponseMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 mr-4"
        />
        <button
          onClick={handleSubmit}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Send
        </button>
      </div> */}
    </div>
  );
};

export default ChatArea;

import { useState } from "react";
import ChatTool from "./ChatTool";
import { FaShare } from "react-icons/fa6";

const ConversationalTool = () => {
  const [active, setActive] = useState("Whatsapp")
  const [activeUser, setActiveUser] = useState(1)


  const [messages, setMessages] = useState([
    { from: "them", text: "Hi there! How can I help you?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { from: "me", text: input }]);
    setInput("");
  };





  const chatWhat = [
    {
      name: "Aman",
    },
    {
      name: "Raman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
  ]
  const chatInsta = [
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },

  ]
  const chatFace = [
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },
    {
      name: "Aman",
    },

  ]



  return (
    <div className="bg-white p-4 flex gap-10">
      <ChatTool setActive={setActive} active={active} />


      {active === "Whatsapp" && <div className="w-[350px]  ">
        <ul>

          {chatWhat.map((item, index) => (
            <li onClick={() => setActiveUser(index)} className="border cursor-pointer py-2 px-2 bg-gray-50">{item.name}</li>
          ))}
        </ul>

      </div>}
      {active === "Instagram" && <div className="border w-[350px] ">
        <ul>

          {chatInsta.map((item, index) => (
            <li onClick={() => setActiveUser(index)} key={index} className="border cursor-pointer bg-gray-50 py-2 px-2">{item.name}</li>
          ))}
        </ul>

      </div>}
      {active === "Facebook" && <div className="border w-[350px]">
        <ul>

          {chatFace.map((item, index) => (
            <li onClick={() => setActiveUser(index)} key={index} className="border bg-gray-50 cursor-pointer py-2 px-2">{item.name}</li>
          ))}
        </ul>

      </div>}




      {active === "Whatsapp" && <div className="border w-full max-w-md mx-auto flex flex-col h-[75dvh] rounded-2xl shadow-md overflow-hidden bg-white">
        {/* Chat Header */}
        <div className="bg-green-600 text-white px-4 py-2 font-semibold text-lg">
          {chatWhat[activeUser]?.name}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[70%] w-fit px-4 py-2 rounded-xl text-sm ${msg.from === "me"
                ? "bg-green-100 self-end text-right ml-auto"
                : "bg-white border self-start"
                }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t bg-white">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 p-2 border rounded-full text-sm focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
          >
            <FaShare size={16} />
          </button>
        </div>
      </div>}
      {active === "Instagram" && <div className="border w-full max-w-md mx-auto flex flex-col h-[75dvh] rounded-2xl shadow-md overflow-hidden bg-white">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-yellow-200 via-pink-300 to-purple-400 text-black px-4 py-2 font-semibold text-lg">
          {chatInsta[activeUser]?.name}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[70%] w-fit px-4 py-2 rounded-xl text-sm ${msg.from === "me"
                ? "bg-green-100 self-end text-right ml-auto"
                : "bg-white border self-start"
                }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t bg-white">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 p-2 border rounded-full text-sm focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
          >
            <FaShare size={16} />
          </button>
        </div>
      </div>}
      {active === "Facebook" && <div className="border w-full max-w-md mx-auto flex flex-col h-[75dvh] rounded-2xl shadow-md overflow-hidden bg-white">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-300 to-indigo-400 text-white px-4 py-2 font-semibold text-lg">
          {chatFace[activeUser]?.name}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[70%] w-fit px-4 py-2 rounded-xl text-sm ${msg.from === "me"
                ? "bg-green-100 self-end text-right ml-auto"
                : "bg-white border self-start"
                }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t bg-white">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 p-2 border rounded-full text-sm focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
          >
            <FaShare size={16} />
          </button>
        </div>
      </div>}
    </div>
  );
};

export default ConversationalTool;





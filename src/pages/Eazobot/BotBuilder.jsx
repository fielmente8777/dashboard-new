import React, { useRef, useState } from "react";
import { FiCheck, FiMessageSquare, FiX } from "react-icons/fi";
import { IoIosCopy } from "react-icons/io";

const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const BotBuilderStep = ({ chatbotData, setChatbotData, setIsEdit }) => {
  const [openStep, setOpenStep] = useState(null);
  const [config, setConfig] = useState({
    name: "Lotus CRM",
    platform: "codeless",
    audience: "all",
    initiateTrigger: ["land"],
    responseInterval: "2",
    idleChatHandling: false,
    greetingMessage: "Hey there!",
    followupMessage: "How can we help you?",
    color: "#1e40af",
    script: `<script>
      window.eazbotConfig = {
        ndid: "******",
        hid: "*******",
        interval: "2000",
      };
</script>
<script src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js"></script>
  `,
  });

  const colorInputRef = useRef(null);

  const isCustom = !colors.includes(config.color);

  const toggleStep = (step) => {
    // setIsEdit(true);
    setOpenStep(openStep === step ? null : step);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(config);
  };

  console.log(chatbotData);
  return (
    <div className="w-full mx-auto p-6 bg-gray-50 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Build Your Chatbot</h2>

      <div>
        {/* Accordion Step: Intro */}
        <Accordion
          title="🤖 Intro"
          isOpen={openStep === 0}
          onToggle={() => toggleStep(0)}
        >
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🤖 Welcome to Your Chatbot Builder
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Let's craft a chatbot tailored to your needs. Follow the steps
              below to personalize its design, behavior, and installation.
            </p>
          </div>
        </Accordion>

        {/* Accordion Step: Customize */}
        <Accordion
          title="🛃 Customize"
          isOpen={openStep === 1}
          onToggle={() => toggleStep(1)}
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Customize Chat Widget
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pick a color
              </h3>

              <div className="flex space-x-3 items-center">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setIsEdit(true);
                      setChatbotData((prev) => ({ ...prev, bgcolor: color }));
                    }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      config.color === color
                        ? "border-gray-400"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {chatbotData?.bgcolor === color && (
                      <FiCheck className="text-white" size={20} />
                    )}
                  </button>
                ))}

                {/* Custom Color Button */}

                <div className="border p-2 flex flex-col items-center shadow-lg">
                  <button
                    onClick={() => colorInputRef.current?.click()}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition relative`}
                    style={{
                      backgroundColor: chatbotData?.theme?.bg_color,
                      mixBlendMode: "multiply",
                      borderColor: isCustom ? "#9CA3AF" : "transparent", // gray-400 if custom
                    }}
                  >
                    {isCustom && <FiCheck className="text-white" size={20} />}
                    <input
                      ref={colorInputRef}
                      type="color"
                      // value={chatbotData?.bgcolor || config.color}
                      value={"#4F46E5"}
                      onChange={(e) => {
                        setIsEdit(true);
                        setChatbotData((prev) => ({
                          ...prev,
                          bgcolor: e.target.value,
                        }));
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </button>
                  <span>Pick Color</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Greeting message
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={chatbotData?.welcome_message}
                  onChange={(e) => {
                    setIsEdit(true);
                    setChatbotData((prev) => ({
                      ...prev,
                      welcome_message: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter greeting message"
                />
                {/* <input
                  type="text"
                  value={config.followupMessage}
                  onChange={(e) =>
                    setConfig({ ...config, followupMessage: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter follow-up message"
                /> */}
              </div>
            </div>

            {/* Chat Preview */}
            <div className="flex justify-end">
              <div className="relative">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: chatbotData?.bgcolor || colors[0],
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {chatbotData?.welcome_message || "Greeting Message"}
                      </span>
                    </div>
                    <FiX className="text-gray-400" size={16} />
                  </div>
                  {/* <p className="text-sm text-gray-600">
                    {config.followupMessage}
                  </p> */}
                </div>
                <div
                  className="absolute -bottom-8 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: chatbotData?.bgcolor || colors[0] }}
                >
                  <FiMessageSquare size={20} />
                </div>
              </div>
            </div>
          </div>
        </Accordion>

        {/* Accordion Step: Script */}
        <Accordion
          title="📜 Script"
          isOpen={openStep === 2}
          onToggle={() => toggleStep(2)}
        >
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Your Script is Ready!
            </h3>
            <p className="mb-4 text-gray-600">
              Below is your chatbot script configuration:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              <div className="flex justify-end ">
                <span
                  className="size-8 rounded-md bg-blue-100 cursor-pointer flex justify-center items-center"
                  title="Copy"
                  onClick={() => copyToClipboard(config)}
                >
                  <IoIosCopy color="#3B82F6" />
                </span>
              </div>
              {config.script}
            </pre>
          </div>
        </Accordion>
      </div>
    </div>
  );
};

// 💡 Reusable Accordion Component
const Accordion = ({ title, isOpen, onToggle, children }) => (
  <div className="border-b shadow-sm ">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center px-4 py-6 bg-gray-100 hover:bg-gray-200 font-semibold"
    >
      <span>{title}</span>
      <span>{isOpen ? "−" : "+"}</span>
    </button>
    {isOpen && <div className="p-4 bg-white border-t">{children}</div>}
  </div>
);

export default BotBuilderStep;

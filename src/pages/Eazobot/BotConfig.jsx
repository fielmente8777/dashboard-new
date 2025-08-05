import React, { useState } from "react";

const BotConfigStep = ({ chatbotData, setChatbotData, setIsEdit }) => {
  const [form, setForm] = useState({
    terminateMessage: "",
    fallbackMessage: "",
    showBranding: false,
    showTyping: false,
    timeInterval: "",
    enableLiveChat: false,
    isActive: false,
  });

  const handleChange = (e) => {
    setIsEdit(true);
    const { name, value } = e.target;
    setChatbotData({ ...form, [name]: value });
  };

  const handleToggle = (e) => {
    setIsEdit(true);
    const { name, checked } = e.target;
    setChatbotData({ ...chatbotData, [name]: checked });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configure Bot</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chat Terminate Message
          </label>
          <input
            type="text"
            name="terminate_message"
            value={chatbotData?.chat_terminate_message}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fallback Message
          </label>
          <input
            type="text"
            name="fallback_message"
            value={chatbotData?.fallback_message}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Interval (in seconds)
          </label>
          <input
            type="number"
            name="time_interval"
            value={chatbotData?.time_interval && chatbotData?.time_interval}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {[
          { label: "Show Eazotel Branding", name: "show_eazotel_branding" },
          { label: "Show Typing Indicator", name: "show_typing_indicator" },
          { label: "Enable Live Chat", name: "enable_live_chat" },
          { label: "Active", name: "active" },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between bg-gray-50 p-4 border rounded-md"
          >
            <span className="text-sm text-gray-800 font-medium">
              {item.label}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name={item.name}
                checked={chatbotData[item.name]}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:bg-primary transition-all duration-300"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border rounded-full transform peer-checked:translate-x-full transition-all duration-300"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotConfigStep;

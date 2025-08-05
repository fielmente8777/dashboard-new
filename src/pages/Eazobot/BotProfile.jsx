import { useState } from "react";

const BotProfileStep = ({ chatbotData, setChatbotData, setIsEdit }) => {
  const [botName, setBotName] = useState("");
  const [botTitle, setBotTitle] = useState("");
  const [botIntro, setBotIntro] = useState("");
  const [botLogo, setBotLogo] = useState(null);

  const handleLogoChange = (e) => {
    setIsEdit(true);
    const file = e.target.files[0];
    if (file) {
      setChatbotData({ ...chatbotData, avatar_url: file });
      setBotLogo(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setIsEdit(true);
    const { name, value } = e.target;
    setChatbotData({ ...chatbotData, [name]: value });
  };

  return (
    <div className="space-y-6 shadow-md rounded-md p-4">
      <h2 className="text-2xl font-bold text-gray-900">Bot Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bot Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bot Name
          </label>
          <input
            type="text"
            value={chatbotData.bot_name}
            name="bot_name"
            // onChange={(e) => setBotName(e.target.value)}
            onChange={handleChange}
            placeholder="Enter your bot's name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bot Title */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bot Title
          </label>
          <input
            type="text"
            name="bot_name"
            value={botTitle}
            onChange={handleChange}
            // onChange={(e) => setBotTitle(e.target.value)}
            placeholder="e.g. Your AI Assistant"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div> */}
      </div>

      {/* Intro Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={chatbotData.description}
          name="description"
          // onChange={(e) => setBotIntro(e.target.value)}
          onChange={handleChange}
          placeholder="Hello! I'm your virtual assistant. How can I help you today?"
          rows={4}
          className="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bot Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bot Logo
        </label>
        <div className="flex items-center gap-4 border px-2 py-4 rounded-md">
          <input type="file" accept="image/*" onChange={handleLogoChange} />

          {(botLogo || chatbotData.avatar_url) && (
            <div className="border-2 p-1 border-gray-400 rounded-full">
              <img
                src={botLogo || chatbotData.avatar_url}
                alt="Bot Logo"
                className="w-16 h-16 rounded-full object-cover border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      {/* <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-primary text-white px-5 py-2 rounded-md hover:opacity-90 transition"
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default BotProfileStep;

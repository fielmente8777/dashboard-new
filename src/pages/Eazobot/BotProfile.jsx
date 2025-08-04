import { useState } from "react";

const BotProfileStep = ({ onNext, onBack }) => {
  const [botName, setBotName] = useState("");
  const [botTitle, setBotTitle] = useState("");
  const [botIntro, setBotIntro] = useState("");
  const [botLogo, setBotLogo] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBotLogo(URL.createObjectURL(file));
    }
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
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="Enter your bot's name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bot Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bot Title
          </label>
          <input
            type="text"
            value={botTitle}
            onChange={(e) => setBotTitle(e.target.value)}
            placeholder="e.g. Your AI Assistant"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Intro Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Intro Message
        </label>
        <textarea
          value={botIntro}
          onChange={(e) => setBotIntro(e.target.value)}
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

          {botLogo && (
            <div className="border-2 p-1 border-gray-400 rounded-full">
              <img
                src={botLogo}
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

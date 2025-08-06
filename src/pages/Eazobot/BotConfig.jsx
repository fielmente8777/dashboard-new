import React, { useState } from "react";

// Supported input types for questions
const INPUT_TYPES = [
  "text",
  "number",
  "email",
  "select",
  "checkbox",
  "radio",
  "date",
];

const BotConfigStep = ({ chatbotData, setChatbotData, setIsEdit }) => {
  const [activeTab, setActiveTab] = useState("basic");

  // Questions tab states
  const [editIndex, setEditIndex] = useState(null);
  const [editQuestion, setEditQuestion] = useState({
    key: "",
    question: "",
    type: "text",
  });

  // === Handlers for Basic Setup ===
  const handleChange = (e) => {
    setIsEdit(true);
    const { name, value } = e.target;
    setChatbotData({ ...chatbotData, [name]: value });
  };

  const handleToggle = (e) => {
    setIsEdit(true);
    const { name, checked } = e.target;
    setChatbotData({ ...chatbotData, [name]: checked });
  };

  // === Handlers for Questions Tab ===
  const handleQuestionEditChange = (e) => {
    const { name, value } = e.target;
    setEditQuestion((prev) => ({ ...prev, [name]: value }));
    setIsEdit(true);
  };

  const startEditing = (index) => {
    const q = chatbotData?.chat_flow[index];
    setEditQuestion({ ...q });
    setEditIndex(index);
  };

  const cancelEditing = () => {
    setEditIndex(null);
    setEditQuestion({ key: "", question: "", type: "text" });
  };

  const updateQuestion = () => {
    const updatedQuestions = [...chatbotData.chat_flow];
    updatedQuestions[editIndex] = editQuestion;
    setChatbotData({ ...chatbotData, chat_flow: updatedQuestions });
    setEditIndex(null);
    setEditQuestion({ key: "", question: "", type: "text" });
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = chatbotData.chat_flow.filter(
      (_, i) => i !== index
    );
    setChatbotData({ ...chatbotData, chat_flow: updatedQuestions });
    setIsEdit(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configure Bot</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["basic", "questions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab === "basic" ? "Basic Setup" : "Questions"}
          </button>
        ))}
      </div>

      {activeTab === "basic" ? (
        <>
          {/* BASIC SETUP FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="chat_terminate_message"
              placeholder="Chat Terminate Message"
              value={chatbotData?.chat_terminate_message || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              name="fallback_message"
              placeholder="Fallback Message"
              value={chatbotData?.fallback_message || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <div className="md:col-span-2">
              <input
                type="number"
                name="time_interval"
                placeholder="Time Interval (in seconds)"
                value={chatbotData?.time_interval || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* TOGGLE BUTTONS */}
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
                    checked={chatbotData[item.name] || false}
                    onChange={handleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border rounded-full transform peer-checked:translate-x-full transition-all duration-300"></div>
                </label>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* EDIT FORM (conditional) */}
          {editIndex !== null && (
            <div className="my-5 p-4 border rounded-md bg-gray-50 space-y-4">
              <h4 className="text-md font-semibold text-gray-700">
                Edit Question
              </h4>
              <input
                type="text"
                name="key"
                placeholder="Key"
                value={editQuestion.key}
                onChange={handleQuestionEditChange}
                className="w-full px-4 py-2 border rounded-md"
                disabled
              />
              <input
                type="text"
                name="question"
                placeholder="Question"
                value={editQuestion.question}
                onChange={handleQuestionEditChange}
                className="w-full px-4 py-2 border rounded-md"
              />
              <select
                name="type"
                value={editQuestion.type}
                onChange={handleQuestionEditChange}
                className="w-full px-4 py-2 border rounded-md"
                disabled
              >
                {INPUT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={updateQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Update
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* QUESTIONS LIST */}
          <div className="space-y-4">
            {chatbotData?.chat_flow?.map((q, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-4 border rounded-md"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {q.question} ({q.type})
                  </div>
                  <div className="text-xs text-gray-500">Key: {q.key}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(index)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteQuestion(index)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BotConfigStep;

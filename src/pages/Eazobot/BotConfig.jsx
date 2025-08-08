import React, { useState } from "react";
import { FiEdit, FiEye, FiEyeOff } from "react-icons/fi";

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

  const toggleStatus = (index) => {
    setIsEdit(true);
    const updatedFlow = [...chatbotData.chat_flow];
    updatedFlow[index].active = !updatedFlow[index].active;

    setChatbotData((prev) => ({
      ...prev,
      chat_flow: updatedFlow,
    }));
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = chatbotData.chat_flow.filter(
      (_, i) => i !== index
    );
    setChatbotData({ ...chatbotData, chat_flow: updatedQuestions });
    setIsEdit(true);
  };

  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">Configure Bot</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["basic", "questions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium ${activeTab === tab ? "bg-primary text-white" : "bg-gray-200"
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
            <div>
              <lable htmlFor="terminate" className="font-medium text-md text-gray-500">Chat Terminate Message</lable>
              <input
                id="terminate"
                type="text"
                name="chat_terminate_message"
                placeholder="Thanks for you response, Our team will reach out to you asap!"
                value={chatbotData?.chat_terminate_message || ""}
                onChange={handleChange}
                className="w-full px-4 py-4 mt-1 border rounded-md outline-none"
              />
            </div>

            <div>
              <lable htmlFor="fallback" className="font-medium text-gray-500" >Fallback Message</lable>
              <input
                id="fallback"
                type="text"
                name="fallback_message"
                placeholder="I'm sorry, Please choose a valid formate"
                value={chatbotData?.fallback_message || ""}
                onChange={handleChange}
                className="w-full px-4 py-4 border mt-1 rounded-md outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <lable htmlFor="interval" className="font-medium text-gray-500" >Time Intetval</lable>
              <input
                id="interval"
                type="number"
                name="time_interval"
                placeholder="Time Interval (in seconds)"
                value={chatbotData?.time_interval || ""}
                onChange={handleChange}
                className="w-full px-4 py-4 border mt-1 rounded-md outline-none"
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
                className="flex items-center justify-between bg-white p-4 border rounded-md"
              >
                <span className="text-md text-gray-500 font-medium">
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
              <h4 className="text-md font-semibold text-gray-500">
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
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Update
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md "
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* QUESTIONS LIST */}
          <div className="space-y-4">
            {chatbotData?.chat_flow?.map((q, index) => {
              const isActive = q.active;

              return (
                <div
                  key={index}
                  className={`flex justify-between items-center p-4 border rounded-md transition-all duration-200 ${isActive ? "bg-white" : "bg-gray-100 opacity-60"
                    }`}
                >
                  <div>
                    <div className="text-md font-medium text-gray-500">
                      {q.question}{" "}
                      <span className="text-gray-500">({q.type})</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Key: {q.key}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Active Status */}
                    <button
                      onClick={() => toggleStatus(index)}
                      className="text-gray-600 hover:text-gray-800 transition"
                      title={isActive ? "Deactivate" : "Activate"}
                    >
                      {isActive ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => startEditing(index)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <FiEdit size={16} />
                    </button>

                    {/* Delete Button */}
                    {/* <button
                      onClick={() => deleteQuestion(index)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BotConfigStep;

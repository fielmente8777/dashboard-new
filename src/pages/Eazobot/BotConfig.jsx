import React, { useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiTrash2,
} from "react-icons/fi";

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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [editingOption, setEditingOption] = useState(null);

  // console.log(chatbotData);

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

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Toggle option active status
  const toggleOptionStatus = (qIndex, oIndex) => {
    setChatbotData((prev) => {
      const updated = { ...prev };
      updated.chat_flow[qIndex].options[oIndex].active =
        !updated.chat_flow[qIndex].options[oIndex].active;
      return updated;
    });
  };

  // Handle option editing
  const handleOptionChange = (qIndex, oIndex, field, newValue) => {
    setChatbotData((prev) => {
      const updated = { ...prev };
      updated.chat_flow[qIndex].options[oIndex][field] = newValue;
      return updated;
    });
  };

  const addOption = (qIndex) => {
    setChatbotData((prev) => {
      const newData = { ...prev };
      const options = newData.chat_flow[qIndex].options || [];
      options.push({
        label: "New Option",
        value: "new_option",
        active: true,
      });
      newData.chat_flow[qIndex].options = [...options];
      return newData;
    });

    // immediately put new option into edit mode
    setEditingOption({
      index: qIndex,
      oIndex: chatbotData.chat_flow[qIndex].options.length,
    });
  };

  const removeOption = (qIndex, oIndex) => {
    setChatbotData((prev) => {
      const newData = { ...prev };
      const options = newData.chat_flow[qIndex].options || [];

      // remove by filtering out the option at oIndex
      newData.chat_flow[qIndex].options = options.filter(
        (_, i) => i !== oIndex
      );

      return newData;
    });

    // if you were editing the option being removed, reset editing
    setEditingOption((prev) =>
      prev && prev.index === qIndex && prev.oIndex === oIndex ? null : prev
    );
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = chatbotData.chat_flow.filter(
      (_, i) => i !== index
    );
    setChatbotData({ ...chatbotData, chat_flow: updatedQuestions });
    setIsEdit(true);
  };

  // console.log(chatbotData);

  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">
        Configure Bot
      </h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {["basic", "questions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === tab ? "bg-primary text-white" : "bg-app-surface-secondary"
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
              <lable
                htmlFor="terminate"
                className="font-medium text-md text-gray-500 dark:text-app-text-faint"
              >
                Chat Terminate Message
              </lable>
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
              <lable htmlFor="fallback" className="font-medium text-gray-500 dark:text-app-text-faint">
                Fallback Message
              </lable>
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
              <lable htmlFor="interval" className="font-medium text-gray-500 dark:text-app-text-faint">
                Time Intetval
              </lable>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 ">
            {[
              { label: "Show Eazotel Branding", name: "show_eazotel_branding" },
              { label: "Show Typing Indicator", name: "show_typing_indicator" },
              { label: "Enable Live Chat", name: "enable_live_chat" },
              { label: "Active", name: "active" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between bg-app-surface-secondary p-4 border rounded-md"
              >
                <span className="text-md text-gray-500 dark:text-app-text-faint font-medium">
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
            <div className="my-5 p-4 border rounded-md bg-app-surface-secondary space-y-4">
              <h4 className="text-md font-semibold text-gray-500 dark:text-app-text-faint">
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
              const isActive = q.active ?? true;
              const isExpanded = expandedIndex === index;

              return (
                <div className="flex flex-col">
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 border rounded-md transition-all duration-200 ${
                      isActive ? "bg-app-surface-secondary" : "bg-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {q.options && q.options.length > 0 && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="text-gray-500  hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <FiChevronDown size={16} />
                          ) : (
                            <FiChevronRight size={16} />
                          )}
                        </button>
                      )}

                      <div>
                        <div className="text-md font-medium text-gray-500 dark:text-app-text-faint">
                          {q.question}{" "}
                          <span className="text-gray-500">({q.type})</span>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          Key: {q.key}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle Active Status */}
                      <button
                        onClick={() => toggleStatus(index)}
                        className="text-gray-600 hover:text-gray-800 transition"
                        title={isActive ? "Deactivate" : "Activate"}
                      >
                        {isActive ? (
                          <FiEye size={16} />
                        ) : (
                          <FiEyeOff size={16} />
                        )}
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

                  {isExpanded &&
                    q.options &&
                    q.options.length > 0 &&
                    isActive && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-end">
                          <button
                            onClick={() => addOption(index)}
                            className="text-green-600 text-sm font-medium hover:underline"
                            disabled={!isActive}
                          >
                            + Add Option
                          </button>
                        </div>
                        {q.options.map((opt, oIndex) => {
                          const isOptionActive = opt.active ?? true;
                          const isEditing =
                            editingOption?.index === index &&
                            editingOption?.oIndex === oIndex;

                          return (
                            <div
                              key={oIndex}
                              className={`flex gap-4 items-center justify-between p-3 border rounded-md ${
                                isOptionActive
                                  ? "bg-app-surface"
                                  : "bg-app-surface-secondary opacity-60"
                              }`}
                            >
                              {/* Left side */}
                              <div className="flex items-center gap-2 flex-1">
                                {q.type === "radio" && (
                                  <input type="radio" disabled />
                                )}
                                {q.type === "checkbox" && (
                                  <input type="checkbox" disabled />
                                )}
                                {q.type === "select" && (
                                  <span className="text-xs text-blue-500 px-2 py-1 border rounded">
                                    Select Option
                                  </span>
                                )}

                                {isEditing ? (
                                  <div className="flex gap-2 w-full">
                                    <input
                                      type="text"
                                      value={opt.label}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          index,
                                          oIndex,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                      className="border rounded px-2 py-2 text-sm w-1/2"
                                    />
                                    <input
                                      type="text"
                                      value={opt.value}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          index,
                                          oIndex,
                                          "value",
                                          e.target.value
                                        )
                                      }
                                      className="border rounded px-2 py-1 text-sm w-1/2"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm font-medium text-gray-700">
                                      {opt.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      ({opt.value})
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Right side actions */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    toggleOptionStatus(index, oIndex)
                                  }
                                  className="text-gray-600 hover:text-gray-800 transition"
                                  disabled={!isActive} // disable if parent not active
                                  title={
                                    isOptionActive
                                      ? "Hide Option"
                                      : "Show Option"
                                  }
                                >
                                  {isOptionActive ? (
                                    <FiEye size={14} />
                                  ) : (
                                    <FiEyeOff size={14} />
                                  )}
                                </button>
                                {isEditing ? (
                                  <button
                                    onClick={() => setEditingOption(null)}
                                    className="text-green-600 text-xs font-medium"
                                  >
                                    Save
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setEditingOption({ index, oIndex })
                                    }
                                    className="text-blue-600 text-xs font-medium"
                                    title="Edit Option"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                )}
                                {/* Delete */}
                                <button
                                  onClick={() => removeOption(index, oIndex)}
                                  className="text-red-600 hover:text-red-800 transition"
                                  title="Remove Option"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* {isExpanded && q.options && q.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oIndex) => {
                        const isOptionActive = opt.active ?? true;

                        return (
                          <div
                            key={oIndex}
                            className={`flex items-center justify-between p-2 border rounded-md ${
                              isOptionActive
                                ? "bg-gray-50"
                                : "bg-gray-100 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {q.type === "radio" && (
                                <input type="radio" disabled />
                              )}
                              {q.type === "checkbox" && (
                                <input type="checkbox" disabled />
                              )}
                              {q.type === "select" && (
                                <span className="text-xs text-blue-500 px-2 py-1 border rounded">
                                  Select Option
                                </span>
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                {opt.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({opt.value})
                              </span>
                            </div>

                            <button
                              // onClick={() => toggleOptionStatus(qIndex, oIndex)}
                              className="text-gray-600 hover:text-gray-800 transition"
                              title={
                                isOptionActive ? "Hide Option" : "Show Option"
                              }
                            >
                              {isOptionActive ? (
                                <FiEye size={14} />
                              ) : (
                                <FiEyeOff size={14} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )} */}
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

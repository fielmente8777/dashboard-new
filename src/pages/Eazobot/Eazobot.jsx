import React, { useEffect, useState } from "react";
import BotBuilderStep from "./BotBuilder";
import BotProfileStep from "./BotProfile";
import BotConfigStep from "./BotConfig";
import BotInstallStep from "./BotInstallStep";
import StepIndicator from "./StepIndicator";
import {
  createChatbotData,
  getChatbotData,
} from "../../services/api/chatbot.api";

const steps = [
  { id: 0, title: "Bot Builder" },
  { id: 1, title: "Profile" },
  { id: 2, title: "Configuration" },
  { id: 3, title: "Install" },
];

const Eazobot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [chatbotData, setChatbotData] = useState({
    bot_name: "",
    email: "",
    contact: "",
    description: "",
    welcome_message: "",
    fallback_message: "",
    chat_terminate_message: "",
    bgcolor: "",
    textcolor: "",
    buttoncolor: "",
    buttontextcolor: "",
    active: false,
    avatar_url: "",
    enable_live_chat: false,
    show_typing_indicator: false,
    time_interval: "",
    show_eazotel_branding: false,
    bot_type: "",
    chat_flow: [],
  });

  const [isEdit, setIsEdit] = useState(false);

  const handlePublish = async () => {
    try {
      const chatbotFormData = {
        hid: "4534543",
        chatbotData,
      };
      const data = await createChatbotData({
        hid: "4534543",
        chatbotData: {
          bot_name: "Your Bot is ud",
          email: "bot@example.com",
          contact: "+1234567890",
          description: "This is a demo chatbot for support.",
          welcome_message: "Hello! How can ?",
          fallback_message: "I'm sorry, I didn't understand that?",
          chat_terminate_message: "",
          bgcolor: "#ffffff",
          textcolor: "#000000",
          buttoncolor: "#007bff",
          buttontextcolor: "#ffffff",
          active: true,
          avatar_url: "https://yourcdn.com/bot-avatar.png",
          enable_live_chat: false,
          show_typing_indicator: true,
          time_interval: 40000,
          show_eazotel_branding: true,
          bot_type: "lead",
          chat_flow: [
            { key: "name", question: "What's your Name?", type: "text" },
          ],
        },
      });
      console.log(data);
    } catch (error) {}
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BotBuilderStep
            chatbotData={chatbotData}
            setChatbotData={setChatbotData}
            setIsEdit={setIsEdit}
          />
        );
      case 1:
        return (
          <BotProfileStep
            chatbotData={chatbotData}
            setChatbotData={setChatbotData}
            setIsEdit={setIsEdit}
          />
        );
      case 2:
        return (
          <BotConfigStep
            chatbotData={chatbotData}
            setChatbotData={setChatbotData}
            setIsEdit={setIsEdit}
          />
        );
      case 3:
        return <BotInstallStep />;
      default:
        return null;
    }
  };

  const updatedSteps = steps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
  }));

  const getChatbotDetails = async () => {
    const data = await getChatbotData({
      ndid: "5617a084-5783-4bac-b299-bdb6e8e471bb",
      hid: "4534543",
    });

    if (data?.Status) {
      setChatbotData((prev) => ({
        ...prev,
        ...data?.Data,
      }));
    }
  };

  useEffect(() => {
    getChatbotDetails();
  }, []);

  return (
    <div className="max-w-7xl w-full mx-auto py-6 px-2">
      <div>
        {isEdit && (
          <div className="flex justify-end">
            <button
              className="border border-primary text-primary px-4 py-2 mb-4 rounded-sm hover:bg-primary hover:text-white transition-all duration-200"
              onClick={handlePublish}
            >
              Publish
            </button>
          </div>
        )}

        <StepIndicator steps={updatedSteps} currentStep={currentStep} />
      </div>

      <div className="mt-6">{renderStep()}</div>

      <div className="flex gap-5 mt-8 items-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded text-white transition ${
            currentStep === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary hover:bg-primary/80"
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`px-4 py-2 rounded text-white transition ${
            currentStep === steps.length
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary hover:bg-primary/80"
          }`}
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Eazobot;

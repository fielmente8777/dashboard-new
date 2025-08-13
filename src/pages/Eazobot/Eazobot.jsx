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
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

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
    bg_color: "",
    text_color: "",
    button_color: "",
    button_text_color: "",
    active: false,
    avatar_url: "",
    enable_live_chat: false,
    show_typing_indicator: false,
    time_interval: "40",
    show_eazotel_branding: false,
    bot_type: "",
    chat_flow: [],
  });

  const [isLoader, setIsLoader] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const handlePublish = async () => {
    setIsLoader(true);
    try {
      const chatbotFormData = {
        hid: localStorage.getItem("hid"),
        chatbotData: {
          bot_name: chatbotData.bot_name,
          email: chatbotData.email,
          contact: chatbotData.contact,
          description: chatbotData.description,
          welcome_message: chatbotData.welcome_message,
          fallback_message: chatbotData.fallback_message,
          chat_terminate_message: chatbotData.chat_terminate_message,
          bg_color: chatbotData.bg_color,
          text_color: chatbotData?.text_color,
          button_color: chatbotData?.button_color,
          button_text_color: chatbotData?.button_text_color,
          active: chatbotData.active,
          avatar_url: chatbotData.avatar_url,
          enable_live_chat: chatbotData.enable_live_chat,
          show_typing_indicator: chatbotData.show_typing_indicator,
          time_interval: chatbotData.time_interval,
          show_eazotel_branding: chatbotData.show_eazotel_branding,
          bot_type: "lead",
          chat_flow: chatbotData?.chat_flow,
          redirection_url: "thankyou",
        },
      };

      const data = await createChatbotData(chatbotFormData);
      console.log(data)
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data?.Message,
      });
    } catch (error) {
    } finally {
      setIsLoader(false);
    }
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
      //   ndid: "5617a084-5783-4bac-b299-bdb6e8e471bb",
      //   hid: "4534543",
      ndid: localStorage.getItem("ndid"),
      hid: localStorage.getItem("hid"),
    });

    if (data?.Status) {
      setChatbotData((prev) => ({
        ...prev,
        ...data?.Data,
        bgcolor: data?.Data?.theme?.bg_color,
      }));
    }
  };

  useEffect(() => {
    getChatbotDetails();
  }, []);

  return (
    <div className=" w-full mx-auto py-6">
      <div className="">
        {isEdit && (
          <div className="flex justify-end px-4">
            <button
              disabled={isLoader}
              className={`flex items-center gap-2 border border-primary hover:bg-primary/80 px-4 py-2 mb-4 rounded-sm bg-primary text-white transition-all duration-200 ${isLoader && "opacity-40"
                }`}
              onClick={handlePublish}
            >
              Publish {isLoader && <Loader size={20} color="#fff" />}
            </button>
          </div>
        )}

        <StepIndicator steps={updatedSteps} currentStep={currentStep} />
      </div>

      <div className="mt-6">{renderStep()}</div>

      <div className="flex gap-5 mt-8 items-center px-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded text-white transition ${currentStep === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-primary hover:bg-primary/80"
            }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`px-4 py-2 rounded text-white transition ${currentStep === steps.length
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

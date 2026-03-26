import React, { useEffect, useState } from "react";
import {
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiCode,
  FiCheck,
  FiCopy,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiInfo,
} from "react-icons/fi";
import { BASE_URL } from "../../data/constant";

const Eazobot = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  });

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/leadeazbot/get/dashboard?ndid=5617a084-5783-4bac-b299-bdb6e8e471bb&hid=4534543`
      );
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching website details:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [scriptCopied, setScriptCopied] = useState(false);

  const steps = [
    { id: 1, title: "Bot builder", completed: currentStep > 1 },
    { id: 2, title: "Bot Profile", completed: currentStep > 2 },
    { id: 3, title: "Configurations", completed: currentStep > 3 },
    { id: 4, title: "Codeless bot builder", completed: false },
  ];

  const colors = [
    "#1e40af", // blue
    "#16a34a", // green
    "#dc2626", // red
    "#ca8a04", // yellow
    "#6b7280", // gray
  ];

  const platforms = [
    {
      id: "codeless",
      title: "Codeless bot builder",
      description:
        "A no coding bot builder platform. Just drag and drop and build a powerful bot to assist your website visitors.",
      icon: "💬",
      selected: true,
    },
    {
      id: "scripts",
      title: "SalesIQ Scripts",
      description:
        "An advanced bot builder for developers powered by Zoho Creator Deluge Scripts.",
      icon: "ƒx",
      selected: false,
    },
    // {
    //   id: 'zia',
    //   title: 'Zia Skills',
    //   description: 'Build a conversational bot assistant with Zia Skills platform.',
    //   icon: '🤖',
    //   selected: false
    // }
  ];

  const generateScript = () => {
    return `<script>window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}</script><script id="zsiqscript" src="https://salesiq.zoho.com/widget?wc=siq${Math.random()
      .toString(36)
      .substr(2, 9)}" defer></script>`;
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generateScript());
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex  items-center w-full justify-center mb-8 bg-white border-b border-gray-200 py-4">
      <button
        onClick={prevStep}
        className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        disabled={currentStep === 1}
      >
        <FiChevronLeft size={20} />
      </button>

      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : step.id === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.completed ? <FiCheck size={16} /> : step.id}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step.id === currentStep ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderBotBuilder = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Name your bot</h2>
        <div className="relative">
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full max-w-md px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:border-blue-600 text-lg"
            placeholder="Enter bot name"
          />
          <span className="absolute right-4 top-3 text-gray-400 text-sm">
            {config.name.length}/60
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Choose a platform
        </h3>
        <div className="flex space-x-4 mb-6">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
            SalesIQ platforms
          </button>
          <button className="px-6 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
            Third-party platforms
          </button>
          <button className="px-6 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
            Vendor platforms
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Build a compelling chatbot with our in-house bot-building platforms to
          suit your business needs.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                platform.selected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setConfig({ ...config, platform: platform.id })}
            >
              <div className="text-3xl mb-4">{platform.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {platform.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                {platform.description}
              </p>
              <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderBotProfile = () => (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="bg-white rounded-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customize chat widget
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pick a color
            </h3>
            <div className="flex space-x-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig({ ...config, color })}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    config.color === color
                      ? "border-gray-400"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {config.color === color && (
                    <FiCheck className="text-white" size={20} />
                  )}
                </button>
              ))}
              <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Greeting message
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={config.greetingMessage}
                onChange={(e) =>
                  setConfig({ ...config, greetingMessage: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter greeting message"
              />
              <input
                type="text"
                value={config.followupMessage}
                onChange={(e) =>
                  setConfig({ ...config, followupMessage: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter follow-up message"
              />
            </div>
          </div>

          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Done
          </button>
        </div>

        {/* Chat Preview */}
        <div className="flex justify-end">
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: config.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {config.greetingMessage}
                  </span>
                </div>
                <FiX className="text-gray-400" size={16} />
              </div>
              <p className="text-sm text-gray-600">{config.followupMessage}</p>
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: config.color }}
            >
              <FiMessageSquare size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfigurations = () => (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 rounded-lg p-4 mr-8">
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
              Choose bot audience
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              When should the bot initiate chat?
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              Response interval
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              Chat inactivity
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              Operator handoff
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              Forward message
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
              Actions
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose bot audience
            </h2>
            <p className="text-gray-600 mb-6">
              Select the type of visitor to initiate proactive conversation.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer ${
                  config.audience === "all"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setConfig({ ...config, audience: "all" })}
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  All visitors
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  The bot will assist all visitors who land on your website.
                </p>
                <p className="text-blue-500 text-sm">Visitor type is All</p>
              </div>

              <div
                className={`border-2 rounded-lg p-6 cursor-pointer ${
                  config.audience === "custom"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setConfig({ ...config, audience: "custom" })}
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Custom visitors
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  The bot will assist visitors if they match the set condition
                  and criteria.
                </p>
                <button className="text-blue-500 text-sm font-medium">
                  Add rule
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                When should the bot initiate chat?
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.initiateTrigger.includes("land")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({
                          ...config,
                          initiateTrigger: [...config.initiateTrigger, "land"],
                        });
                      } else {
                        setConfig({
                          ...config,
                          initiateTrigger: config.initiateTrigger.filter(
                            (t) => t !== "land"
                          ),
                        });
                      }
                    }}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    When visitors land on the site
                  </span>
                  <FiInfo className="ml-2 text-gray-400" size={16} />
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.initiateTrigger.includes("click")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({
                          ...config,
                          initiateTrigger: [...config.initiateTrigger, "click"],
                        });
                      } else {
                        setConfig({
                          ...config,
                          initiateTrigger: config.initiateTrigger.filter(
                            (t) => t !== "click"
                          ),
                        });
                      }
                    }}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    When visitors click the chat widget
                  </span>
                  <FiInfo className="ml-2 text-gray-400" size={16} />
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.initiateTrigger.includes("action")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({
                          ...config,
                          initiateTrigger: [
                            ...config.initiateTrigger,
                            "action",
                          ],
                        });
                      } else {
                        setConfig({
                          ...config,
                          initiateTrigger: config.initiateTrigger.filter(
                            (t) => t !== "action"
                          ),
                        });
                      }
                    }}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    When visitors perform the custom action
                  </span>
                  <FiInfo className="ml-2 text-gray-400" size={16} />
                </label>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Response interval
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Add an interval to your bot's response time during interactive
                chats for a more natural conversational flow.
              </p>
              <select
                value={config.responseInterval}
                onChange={(e) =>
                  setConfig({ ...config, responseInterval: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="1">1 Second</option>
                <option value="2">2 Seconds</option>
                <option value="3">3 Seconds</option>
                <option value="5">5 Seconds</option>
              </select>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Idle chat handling
                  </h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.idleChatHandling}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        idleChatHandling: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstallation = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FiCode className="text-blue-500 mr-3" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            Add live chat to your website
          </h2>
          <span className="ml-auto text-sm text-gray-500">Less than 1 min</span>
        </div>

        <p className="text-gray-600 mb-8">
          Your customized SalesIQ chat is all set and ready to go! Add it to
          your website now for your visitors to easily connect with you.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-start mb-4">
            <div className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 mt-1">
              1
            </div>
            <div className="flex-1">
              <p className="text-gray-700 mb-4">
                Copy and paste the below code before the closing &lt;/body&gt;
                tag of your website's HTML source code.
              </p>

              <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
                  {generateScript()}
                </pre>
                <button
                  onClick={copyScript}
                  className={`absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    scriptCopied
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {scriptCopied ? "Copied!" : "Copy this code"}
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <FiInfo className="inline mr-1" />
                You can also engage your mobile apps users using our Mobile SDK.
                <a href="#" className="text-blue-500 hover:text-blue-600 ml-1">
                  📱 iOS
                </a>
                <span className="mx-1">☁️</span>
                <a href="#" className="text-blue-500 hover:text-blue-600">
                  Android
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 mt-1">
              2
            </div>
            <div className="flex-1">
              <p className="text-gray-700 mb-4">
                Once the above code is added and published, the SalesIQ live
                chat will be up and running instantly on your website at the
                bottom right corner.
              </p>
              <p className="text-gray-600 text-sm">
                Don't see your widget? Check out our{" "}
                <a href="#" className="text-blue-500 hover:text-blue-600">
                  Trouble shooting guide
                </a>{" "}
                or{" "}
                <a href="#" className="text-blue-500 hover:text-blue-600">
                  Contact us
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need help?
          </h3>
          <p className="text-gray-600 mb-6">
            Here are installation tutorials for various platforms
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">W</span>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-orange-600">M</span>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-blue-600">≈</span>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-blue-600">○</span>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">S</span>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⋯</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-gray-500">or</span>
          </div>

          <div className="flex justify-center space-x-4 mt-4">
            <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              Send installation code to webmaster
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              Schedule a free setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {renderStepIndicator()}

      <div className="pb-8">
        {currentStep === 1 && renderBotBuilder()}
        {currentStep === 2 && renderBotProfile()}
        {currentStep === 3 && renderConfigurations()}
        {currentStep === 4 && renderInstallation()}
      </div>
    </div>
  );
};

export default Eazobot;

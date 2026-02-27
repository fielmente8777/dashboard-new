"use client";
import { useState } from "react";
import { MdClose } from "react-icons/md";
import normalizePhone from "../../utils/normalizePhone";
import { sendWhatsAppMessage } from "../../services/api/whatsApp";
import Swal from "sweetalert2";
import {
  normalizeTemplate,
  renderTemplatePreview,
} from "../../utils/whatsappTemplate";
import { IoArrowBack } from "react-icons/io5";

// Step 1: Define channels
const channels = [
  {
    id: 0,
    key: "whatsapp",
    name: "WhatsApp",
    icon: "📱",
    detail: "+91 0000000000",
  },
  // { id: 1, name: "SMS", icon: "📩", detail: "+91 1234567890" },
  // { id: 2, name: "Email", icon: "📧", detail: "hem@example.com" },
];

// Component: Channel Option
const ChannelOption = ({ channel, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(channel)}
      className={`cursor-pointer border-2 px-4 py-3 rounded-full flex justify-between items-center ${
        selected.id === channel.id ? "bg-primary text-white" : "bg-white"
      } border-primary/75`}
    >
      <div>
        <div className="flex gap-2 items-center">
          <span>{channel.icon}</span>
          <p>{channel.name}</p>
        </div>
      </div>
      <input type="radio" checked={selected?.id === channel.id} readOnly />
    </div>
  );
};

// Component: Template Card
const TemplateCard = ({ template, selected, onSelect }) => {
  return (
    <div className="border rounded p-4 flex justify-between items-start gap-5 bg-gray-100">
      <div className="flex-1">
        <h3 className="font-semibold">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.body}</p>
        <p className="text-xs text-gray-400 mt-1">
          Language: {template.language}
        </p>
      </div>

      <button
        onClick={() => onSelect(template)}
        className={`px-4 py-2 rounded ${
          selected?.id === template.id
            ? "bg-green-600 text-white"
            : "bg-primary/90 hover:bg-primary text-white"
        }`}
      >
        {selected?.id === template.id ? "Selected" : "Select"}
      </button>
    </div>
  );
};

const TemplatePreview = ({ template, values, setValues }) => {
  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderedText = renderTemplatePreview(template.body, values);

  return (
    <div className=" rounded mt-4">
      <div className="">
        {/* message preview  */}
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <div className="relative max-w-90 w-full rounded-2xl rounded-br-sm bg-[#e7fce3] px-4 py-3 shadow-sm">
              {/* message text */}
              <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {renderedText}
              </p>

              {/* time + ticks */}
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                <span>10:30 AM</span>
                <svg
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L4 8L9 2"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 5L9 8L14 2"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Variable Inputs */}
        <div className="w-full ">
          {/* Variable Inputs */}
          {template.variables.length > 0 && (
            <div className=" ">
              <p className="text-sm font-medium mb-2">Variables</p>

              <div className="grid grid-cols-4 gap-2">
                {template &&
                  template.variables?.length > 0 &&
                  template.variables.map((v) => {
                    const index = v.replace(/[{}]/g, "");
                    return (
                      <div className="relative max-w-40">
                        <input
                          key={v}
                          type="text"
                          placeholder={`Value for {{${index}}}`}
                          className="w-full border rounded p-2 outline-none border-gray-200 focus:border-gray-300! focus:border-2"
                          onChange={(e) => handleChange(index, e.target.value)}
                        />

                        <span className="absolute left-0 -top-3 text-red-500 text-xl">
                          *
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const QuickResponsePopup = ({ open, setOpen, lead, templates }) => {
  const tabs = [
    {
      label: "Text",
      value: "text",
    },
    {
      label: "WhatsApp Templates",
      value: "whatsapp templates",
    },
  ];
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTab, setSelectedTab] = useState("text");
  const [text, setText] = useState("");
  const [values, setValues] = useState({});

  const handleSend = async () => {
    const phone = normalizePhone(lead.Contact);

    console.log(values);

    const payload = {
      phone,
    };

    if (selectedTab === "text") {
      payload.text = text.trim();
    }

    if (selectedTab === "whatsapp templates") {
      payload.templateLanguage = selectedTemplate.language;
      payload.templateName = selectedTemplate.name;
      payload.templateParams = Object.values(values)
        ?.map((v) => v.trim())
        ?.filter(Boolean);

      if (
        payload?.templateParams?.length < selectedTemplate?.variables?.length
      ) {
        alert("Please fill all the required fields");
        return;
      }
    }

    try {
      const response = await sendWhatsAppMessage(payload);
      if (response.success) {
        Swal.fire("Success", "Message sent successfully", "success");
        setOpen(false);
        setValues({});
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to send message", "error");
    }
  };

  const normalizeTemplates = templates.map((template) =>
    normalizeTemplate(template),
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg flex md:flex-row flex-col min-h-96 max-w-4xl w-full mx-4 overflow-hidden relative">
        {/* Left Panel */}
        <div className="md:w-64 w-full bg-gray-100 p-4 space-y-6">
          <div className="border-b border-gray-200! py-1">
            <h2 className="text-lg font-semibold">Send Response To</h2>
            <p className="text-primary font-medium">{lead?.Name}</p>
          </div>

          <div>
            <div className="space-y-4">
              {channels.map((channel) => (
                <ChannelOption
                  key={channel.id}
                  channel={channel}
                  selected={selectedChannel}
                  onSelect={(id) => {
                    setSelectedChannel(id);
                    setSelectedTemplate(null); // reset selected template when channel changes
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4">
            {tabs?.map((tab) => (
              <button
                key={tab.value}
                className={`${selectedTab === tab.value && " text-primary border-b-2 border-gray-400!"} px-2 py-1.5 font-medium`}
                onClick={() => setSelectedTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedTab === "text" && (
            <div className="w-full">
              <textarea
                rows={8}
                className={`w-full outline-none border border-gray-200! rounded-sm p-3 bg-gray-50 resize-none focus:border-gray-300! transition duration-300`}
                placeholder="Type your message here..."
                onChange={(e) => setText(e.target.value)}
              />

              <button
                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
                onClick={handleSend}
              >
                Send Message
              </button>
            </div>
          )}

          {selectedTab === "whatsapp templates" && (
            <div className="space-y-2 max-h-90 overflow-y-auto">
              {!selectedTemplate &&
                normalizeTemplates?.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplate}
                    onSelect={setSelectedTemplate}
                  />
                ))}

              {selectedTemplate && (
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      className="size-6 bg-gray-200 rounded-full flex justify-center items-center"
                      onClick={() => {
                        setSelectedTemplate(null);
                        setValues({});
                      }}
                    >
                      <IoArrowBack />
                    </button>
                    <h2 className="text-lg font-bold">Template Preview</h2>
                  </div>

                  {selectedTemplate && (
                    <TemplatePreview
                      template={selectedTemplate}
                      values={values}
                      setValues={setValues}
                    />
                  )}

                  <button
                    className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 mt-4"
                    onClick={handleSend}
                  >
                    Send Template
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cross Icon */}
        <div
          className="absolute right-4 top-2 size-5 flex items-center justify-center bg-red-500 text-white rounded-full cursor-pointer"
          onClick={() => {
            setOpen(false);
            setValues({});
          }}
        >
          <span className="text-lg font-bold">
            <MdClose size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickResponsePopup;

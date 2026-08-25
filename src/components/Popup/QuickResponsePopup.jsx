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
import TemplatePreview from "../../pages/Channels/Whatsapp/components/TemplatePreview";

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

/* ── shared presentation tokens ─────────────────────────────── */
const SEND_BTN =
  "w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors";

// Component: Channel Option
const ChannelOption = ({ channel, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(channel)}
      className={`cursor-pointer border-2 px-4 py-3 rounded-full flex justify-between items-center gap-2 transition-colors ${
        selected.id === channel.id
          ? "bg-primary text-white"
          : "bg-app-surface text-app-text hover:bg-app-surface-secondary"
      } border-primary/75`}
    >
      <div className="min-w-0">
        <div className="flex gap-2 items-center">
          <span>{channel.icon}</span>
          <p className="truncate">{channel.name}</p>
        </div>
      </div>
      <input
        type="radio"
        checked={selected?.id === channel.id}
        readOnly
        className="shrink-0 h-4 w-4 accent-primary cursor-pointer"
      />
    </div>
  );
};

// Component: Template Card
const TemplateCard = ({ template, selected, onSelect }) => {
  return (
    <div className="border border-app-border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-5 bg-app-surface-secondary">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-app-text break-words">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-app-text-muted break-words">
          {template.body}
        </p>
        <p className="text-xs text-gray-400 dark:text-app-text-faint mt-1">
          Language: {template.language}
        </p>
      </div>

      <button
        onClick={() => onSelect(template)}
        className={`shrink-0 w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

// const TemplatePreview = ({ template, values, setValues }) => {
//   const handleChange = (key, value) => {
//     setValues((prev) => ({ ...prev, [key]: value }));
//   };

//   const renderedText = renderTemplatePreview(template.body, values);

//   return (
//     <div className=" rounded mt-4">
//       <div className="">
//         {/* message preview  */}
//         <div className="flex-1">
//           <div className="flex justify-end mb-4">
//             <div className="relative max-w-90 w-full rounded-2xl rounded-br-sm bg-[#e7fce3] px-4 py-3 shadow-sm">
//               {/* message text */}
//               <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
//                 {renderedText}
//               </p>

//               {/* time + ticks */}
//               <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
//                 <span>10:30 AM</span>
//                 <svg
//                   width="16"
//                   height="10"
//                   viewBox="0 0 16 10"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     d="M1 5L4 8L9 2"
//                     stroke="#4ade80"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                   <path
//                     d="M6 5L9 8L14 2"
//                     stroke="#4ade80"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Variable Inputs */}
//         <div className="w-full ">
//           {/* Variable Inputs */}
//           {template.variables.length > 0 && (
//             <div className=" ">
//               <p className="text-sm font-medium mb-2">Variables</p>

//               <div className="grid grid-cols-4 gap-2">
//                 {template &&
//                   template.variables?.length > 0 &&
//                   template.variables.map((v) => {
//                     const index = v.replace(/[{}]/g, "");
//                     return (
//                       <div className="relative max-w-40">
//                         <input
//                           key={v}
//                           type="text"
//                           placeholder={`Value for {{${index}}}`}
//                           className="w-full border rounded p-2 outline-none border-gray-200 focus:border-gray-300! focus:border-2"
//                           onChange={(e) => handleChange(index, e.target.value)}
//                         />

//                         <span className="absolute left-0 -top-3 text-red-500 text-xl">
//                           *
//                         </span>
//                       </div>
//                     );
//                   })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

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
  // const [headerVariables, setHeaderVariables] = useState([]);
  // const [bodyVariables, setBodyVariables] = useState([]);

  const handleSend = async () => {
    const phone = normalizePhone(lead.Contact);

    const payload = {
      phone,
    };

    if (selectedTab === "text") {
      payload.text = text.trim();
    }

    if (selectedTab === "whatsapp templates") {
      payload.templateLanguage = selectedTemplate.language;
      payload.templateName = selectedTemplate.name;
      // payload.templateParams = Object.values(values)
      //   ?.map((v) => v.trim())
      //   ?.filter(Boolean);

      payload.templateParams =
        selectedTemplate?.components?.find((c) => c.type === "BODY")?.example
          ?.body_text[0] || [];

      payload.templateParamsHeader =
        selectedTemplate?.components?.find((c) => c.type === "HEADER")?.example
          ?.header_text || [];

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-99999 p-4 scheme-light dark:scheme-dark]">
      <div className="bg-app-surface rounded-xl shadow-lg flex md:flex-row flex-col min-h-96 max-h-[90dvh] max-w-4xl w-full overflow-hidden hide-scrollbar relative transition-all duration-300 ease-in-out">
        {/* Left Panel */}
        <div className="md:w-64 w-full shrink-0 bg-app-surface-secondary p-4 space-y-5 md:space-y-6 md:overflow-y-auto hide-scrollbar">
          <div className="border-b border-app-border py-1 pr-10 md:pr-0">
            <h2 className="text-lg font-semibold text-app-text">
              Send Response To
            </h2>
            <p className="text-primary font-medium break-words">
              {lead?.Name}
            </p>
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
        <div className="flex-1 min-w-0 p-4 sm:p-6 space-y-5 md:space-y-6 overflow-y-auto hide-scrollbar">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ">
            {tabs?.map((tab) => (
              <button
                key={tab.value}
                className={`${
                  selectedTab === tab.value
                    ? "text-app-text border-b-2 border-primary"
                    : "text-gray-500 dark:text-app-text-faint border-b-2 border-transparent! hover:text-app-text"
                } px-2 py-1.5 font-medium text-sm sm:text-base whitespace-nowrap transition-colors -mb-px`}
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
                className={`w-full outline-none border border-app-border rounded-lg p-3 bg-app-surface-secondary text-app-text placeholder:text-app-text-faint resize-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition duration-300`}
                placeholder="Type your message here..."
                onChange={(e) => setText(e.target.value)}
              />

              <button className={`${SEND_BTN} mt-3`} onClick={handleSend}>
                Send Message
              </button>
            </div>
          )}

          {selectedTab === "whatsapp templates" && (
            <div className="space-y-2 max-h-90 overflow-y-auto hide-scrollbar">
              {!selectedTemplate &&
                templates?.map((template) => (
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
                      className="size-8 shrink-0 bg-app-surface-secondary hover:bg-app-surface text-app-text rounded-full flex justify-center items-center transition-colors"
                      onClick={() => {
                        setSelectedTemplate(null);
                        setValues({});
                      }}
                    >
                      <IoArrowBack />
                    </button>
                    <h2 className="text-base sm:text-lg font-bold text-app-text">
                      Template Preview
                    </h2>
                  </div>

                  {selectedTemplate && (
                    <TemplatePreview
                      components={selectedTemplate?.components}
                      // headerVariables={
                      //   selectedTemplate?.components?.find(
                      //     (c) => c.type === "HEADER",
                      //   ).example?.header_text || []
                      // }
                      // bodyVariables={
                      //   selectedTemplate?.components?.find(
                      //     (c) => c.type === "BODY",
                      //   ).example?.body_text[0] || []
                      // }
                      // bodyVariables={bodyVariables}
                      // values={values}
                      // setValues={setValues}
                    />
                  )}

                  <button
                    className={`${SEND_BTN} mt-4`}
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
        <button
          type="button"
          aria-label="Close"
          className="absolute right-3 top-3 size-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full cursor-pointer transition-colors z-10"
          onClick={() => {
            setOpen(false);
            setValues({});
          }}
        >
          <MdClose size={16} />
        </button>
      </div>
    </div>
  );
};

export default QuickResponsePopup;
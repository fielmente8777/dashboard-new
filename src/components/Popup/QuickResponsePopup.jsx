"use client";
import React, { useState } from "react";
import { formatPhoneNumber } from "./LeadPopup";
import { MdClose } from "react-icons/md";
import axios from "axios";

// Step 1: Define channels
const channels = [
  { id: 0, name: "WhatsApp", icon: "📱", detail: "+91 0000000000" },
  // { id: 1, name: "SMS", icon: "📩", detail: "+91 1234567890" },
  // { id: 2, name: "Email", icon: "📧", detail: "hem@example.com" },
];

// Step 2: Define templates for each channel
const templatesByChannel = {
  0: [
    {
      id: 0,
      title: "WhatsApp: Welcome",
      content: "Hi! Welcome to our WhatsApp support.",
    },
    {
      id: 1,
      title: "WhatsApp: Follow-up",
      content: "Just checking in with you again on WhatsApp.",
    },
  ],
  1: [
    {
      id: 0,
      title: "SMS: Welcome",
      content: "Hi! Thanks for joining us. This is your first SMS.",
    },
    {
      id: 1,
      title: "SMS: Reminder",
      content: "Reminder: You have a pending action to complete.",
    },
  ],
  2: [
    {
      id: 0,
      title: "Email: Greeting",
      content: "Dear customer, thank you for subscribing!",
    },
    {
      id: 1,
      title: "Email: Follow-up",
      content: "Just following up on our last email.",
    },
  ],
};

// Component: Channel Option
const ChannelOption = ({ channel, selected, onSelect }) => (
  <div
    onClick={() => onSelect(channel.id)}
    className={`cursor-pointer border-2 px-4 py-3 rounded-full flex justify-between items-center ${
      selected === channel.id ? "bg-primary text-white" : "bg-white"
    } border-primary/75`}
  >
    <div>
      <div className="flex gap-2 items-center">
        <span>{channel.icon}</span>
        <p>{channel.name}</p>
      </div>
      {/* <p>{channel.detail}</p> */}
    </div>
    <input type="radio" checked={selected === channel.id} readOnly />
  </div>
);

// Component: Template Card
const TemplateCard = ({ template, selected, onSelect }) => (
  <div className="border rounded p-4 flex justify-between items-start gap-4">
    <div className="flex-1">
      <h3 className="font-semibold">{template.title}</h3>
      <p className="text-sm text-gray-600">{template.content}</p>
    </div>
    <button
      onClick={() => onSelect(template)}
      className={`px-4 py-2 rounded ${
        selected?.id === template.id
          ? "bg-green-600 text-white"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {selected?.id === template.id ? "Selected" : "Select"}
    </button>
  </div>
);

// Main Component
const QuickResponsePopup = ({ open, setOpen, lead, hotelName }) => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSend = async () => {
    const phone = formatPhoneNumber(lead.Contact);
    const message = selectedTemplate?.content?.trim();

    if (!phone || !message) {
      console.error("Phone number or message is missing");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/send-message",
        { ndid: lead.ndid, phone: phone, name: lead.Name, message: message }
      );
      // console.log(data);
    } catch (error) {
      console.log(error);
    }

    // const url = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

    // // const isMobile =
    // //   typeof window !== "undefined" &&
    // //   /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    // //   !window.matchMedia("(hover: hover)").matches;

    // // const url = isMobile
    // //   ? `https://api.whatsapp.com/send?phone=${phone}&text=${message}` // Opens app
    // //   : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`; // Opens Web

    // window.open(url, "_blank");
    // setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg flex md:flex-row flex-col min-h-96 max-w-4xl w-full mx-4 overflow-hidden relative">
        {/* Left Panel */}
        <div className="md:w-64 w-full bg-gray-100 p-4 space-y-6">
          <div>
            <h2 className="text-lg font-bold">Send Quick Response to</h2>
            <p className="text-gray-700">{lead?.Name}</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Select Channel</p>
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
          {selectedChannel === null ? (
            <p className="text-gray-600">Please select a channel first.</p>
          ) : selectedTemplate ? (
            <>
              <h2 className="text-lg font-bold">Edit and Send Message</h2>
              <textarea
                className="w-full h-48 border p-3 rounded"
                value={selectedTemplate.content}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    content: e.target.value,
                  })
                }
              />
              <button
                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
                onClick={handleSend}
              >
                Send via {channels[selectedChannel].name}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold">Choose a Template</h2>
              <div className="space-y-4">
                {templatesByChannel[selectedChannel]?.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplate}
                    onSelect={setSelectedTemplate}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cross Icon */}
        <div className="absolute right-4 top-1" onClick={() => setOpen(false)}>
          <span className="text-lg font-semibold">
            <MdClose />
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickResponsePopup;

// import React from "react";
// import { useState } from "react";

// const QuickResponsePopup = ({ open, setOpen }) => {
//   const [currentTab, setCurrentTab] = useState(0);
//   const [templateSelected, setTemplateSelected] = useState(null);

//   const [selectedVia, setSelectedVia] = useState(0);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
//       <div className="max-w-4xl w-full mx-auto  bg-white flex rounded-sm">
//         <div className="w-64 bg-gray-200 p-4 space-y-5">
//           <div className="">
//             <h2 className="text-lg font-semibold">Send Quick Response to</h2>
//             <h3>Hem Bhadur</h3>
//           </div>

//           <div className="space-y-3">
//             <p>Sending Via</p>

//             <div className="space-y-4">
//               <div
//                 onClick={() => setSelectedVia(0)}
//                 className={`flex justify-between items-center rounded-full ${
//                   selectedVia === 0 ? "bg-primary text-white" : "bg-white"
//                 } border-2 border-primary/75 px-4 py-2`}
//               >
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span>Icon</span>
//                     <p>What's App</p>
//                   </div>

//                   <p>+91 0000000000</p>
//                 </div>

//                 <div>
//                   <input type="radio" name="" id="" />
//                 </div>
//               </div>
//               {/*
//               <div
//                 className={`flex justify-between items-center rounded-full ${
//                   selectedVia === 1 ? "bg-primary text-white" : "bg-white"
//                 } border-2 border-primary/75 px-4 py-2`}
//                 onClick={() => setSelectedVia(1)}
//               >
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span>Icon</span>
//                     <p>What's App</p>
//                   </div>

//                   <p>+91 0000000000</p>
//                 </div>

//                 <div>
//                   <input type="radio" name="" id="" />
//                 </div>
//               </div> */}

//               {/* <div
//                 className={`flex justify-between items-center rounded-full ${
//                   selectedVia === 2 ? "bg-primary text-white" : "bg-white"
//                 } border-2 border-primary/75 px-4 py-2`}
//                 onClick={() => setSelectedVia(2)}
//               >
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span>Icon</span>
//                     <p>What's App</p>
//                   </div>

//                   <p>+91 0000000000</p>
//                 </div>

//                 <div>
//                   <input type="radio" name="" id="" />
//                 </div>
//               </div> */}
//             </div>
//           </div>
//         </div>

//         <div className="flex-1 p-4">
//           {selectedVia === 0 && (
//             <div>
//               <div>Tabs</div>

//               {selectedVia === 0 &&
//                 (selectedVia === 0 && templateSelected === 0 ? (
//                   <div className="flex flex-col gap-5">
//                     <div>
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                     </div>

//                     <div className="flex-1">
//                       <textarea
//                         name=""
//                         id=""
//                         className="w-full h-full border"
//                         rows={12}
//                       />
//                     </div>

//                     <div>
//                       <button className="w-full text-center bg-green-500 text-white py-3">
//                         Send Whats'app
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-8">
//                     <div className="flex">
//                       <div className="flex-1">
//                         <h2>Exampple 1 : First Message to new Lead</h2>
//                         <p className="text-sm">
//                           Lorem ipsum dolor sit amet consectetur, adipisicing
//                           elit
//                         </p>
//                       </div>

//                       <div>
//                         <button
//                           className="bg-blue-300 text-white px-6 py-2"
//                           onClick={() => setSelectedVia(1)}
//                         >
//                           Select
//                         </button>
//                       </div>
//                     </div>

//                     <div className="flex">
//                       <div className="flex-1">
//                         <h2>Exampple 1 : First Message to new Lead</h2>
//                         <p className="text-sm">
//                           Lorem ipsum dolor sit amet consectetur, adipisicing
//                           elit
//                         </p>
//                       </div>

//                       <div>
//                         <button className="bg-blue-300 text-white px-6 py-2">
//                           Select
//                         </button>
//                       </div>
//                     </div>

//                     <div className="flex">
//                       <div className="flex-1">
//                         <h2>Exampple 1 : First Message to new Lead</h2>
//                         <p className="text-sm">
//                           Lorem ipsum dolor sit amet consectetur, adipisicing
//                           elit
//                         </p>
//                       </div>

//                       <div>
//                         <button className="bg-blue-300 text-white px-6 py-2">
//                           Select
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           )}

//           {selectedVia === 1 && (
//             <div>
//               {/* <div>Tabs</div> */}

//               {selectedVia === 1 && (
//                 <div className="space-y-8">
//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button
//                         className="bg-blue-300 text-white px-6 py-2"
//                         onClick={() => setSelectedVia("1")}
//                       >
//                         Select
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button className="bg-blue-300 text-white px-6 py-2">
//                         Select
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button className="bg-blue-300 text-white px-6 py-2">
//                         Select
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {selectedVia === 2 && (
//             <div>
//               {/* <div>Tabs</div> */}

//               {selectedVia === 2 && (
//                 <div className="space-y-8">
//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button
//                         className="bg-blue-300 text-white px-6 py-2"
//                         onClick={() => setSelectedVia("1")}
//                       >
//                         Select
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button className="bg-blue-300 text-white px-6 py-2">
//                         Select
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button className="bg-blue-300 text-white px-6 py-2">
//                         Select
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* <div className="flex-1 p-4">
//           {selectedVia ? (
//             <div className="flex flex-col gap-5">
//               <div>
//                 <h2>Exampple 1 : First Message to new Lead</h2>
//               </div>

//               <div className="flex-1">
//                 <textarea
//                   name=""
//                   id=""
//                   className="w-full h-full border"
//                   rows={12}
//                 />
//               </div>

//               <div>
//                 <button className="w-full text-center bg-green-500 text-white py-3">
//                   Send Whats'app
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <div>Tabs</div>

//               {selectedVia === 0 && (
//                 <div className="space-y-8">
//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button
//                         className="bg-blue-300 text-white px-6 py-2"
//                         onClick={() => setSelectedVia("1")}
//                       >
//                         Select
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button className="bg-blue-300 text-white px-6 py-2">
//                         Select
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex">
//                     <div className="flex-1">
//                       <h2>Exampple 1 : First Message to new Lead</h2>
//                       <p className="text-sm">
//                         Lorem ipsum dolor sit amet consectetur, adipisicing elit
//                       </p>
//                     </div>

//                     <div>
//                       <button className="bg-blue-300 text-white px-6 py-2">
//                         Select
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default QuickResponsePopup;

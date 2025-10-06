// import { useState } from "react";
// import JoditEditor from "jodit-react";
// import { FiEdit2 } from "react-icons/fi";

// const mockUsers = [
//   { id: 1, name: "Sushil KC", email: "sushil@example.com" },
//   { id: 2, name: "Hem Bahadur", email: "hem@example.com" },
//   { id: 3, name: "John Doe", email: "john@example.com" },
// ];

// const initialTemplates = [
//   {
//     id: "welcome",
//     title: "Welcome Template",
//     subject: "👋 Welcome to Our Service",
//     body: "Hi there! We're thrilled to have you on board. Get ready to explore amazing features.",
//     footer: "Cheers, The Team",
//   },
//   {
//     id: "discount",
//     title: "Discount Offer",
//     subject: "🎉 Exclusive 20% Discount Just for You",
//     body: "Don't miss out on this special deal! Use code SAVE20 at checkout and enjoy 20% off.",
//     footer: "Offer valid till Sunday!",
//   },
//   {
//     id: "newsletter",
//     title: "Newsletter",
//     subject: "📰 Your Weekly Update",
//     body: "Stay in the loop with the latest news, tips, and community updates. Thanks for being with us!",
//     footer: "See you next week 👋",
//   },
// ];

// const EmailMarketingManagement = () => {
//   const [selectedEmails, setSelectedEmails] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [templates, setTemplates] = useState(initialTemplates);
//   const [selectedTemplate, setSelectedTemplate] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [editTemplate, setEditTemplate] = useState(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [newTemplate, setNewTemplate] = useState({
//     id: "",
//     title: "",
//     subject: "",
//     body: "",
//     footer: "",
//   });

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedEmails([]);
//     } else {
//       setSelectedEmails(mockUsers.map((user) => user.id));
//     }
//     setSelectAll(!selectAll);
//   };

//   // Handle single select
//   const toggleEmail = (id) => {
//     if (selectedEmails.includes(id)) {
//       setSelectedEmails(selectedEmails.filter((item) => item !== id));
//     } else {
//       setSelectedEmails([...selectedEmails, id]);
//     }
//   };

//   // Handle send
//   const handleSend = () => {
//     if (!selectedTemplate) {
//       alert("Please select a template");
//       return;
//     }
//     if (selectedEmails.length === 0) {
//       alert("Please select at least one email");
//       return;
//     }

//     const selectedUsers = mockUsers.filter((u) =>
//       selectedEmails.includes(u.id)
//     );

//     console.log("Sending template:", selectedTemplate, "to", selectedUsers);

//     // TODO: Replace with API call
//     alert(`Message sent to ${selectedUsers.length} users!`);
//   };

//   // Open editor
//   const handleEdit = (tpl) => {
//     setEditTemplate({ ...tpl }); // clone
//     setIsEditing(true);
//   };

//   // Save edited template
//   const handleSaveEdit = () => {
//     setTemplates(
//       templates.map((tpl) => (tpl.id === editTemplate.id ? editTemplate : tpl))
//     );
//     setIsEditing(false);
//   };

//   // Save new template
//   const handleSaveNewTemplate = () => {
//     if (!newTemplate.title || !newTemplate.subject || !newTemplate.body) {
//       alert("Please fill at least Title, Subject, and Body");
//       return;
//     }
//     const templateToAdd = {
//       ...newTemplate,
//       id: Date.now().toString(), // unique id
//     };
//     setTemplates([...templates, templateToAdd]);
//     setIsCreating(false);
//     setNewTemplate({ id: "", title: "", subject: "", body: "", footer: "" });
//   };

//   return (
//     <div className="p-4 mx-auto bg-white">
//       <h2 className="text-lg font-semibold mb-4">📧 Email Marketing</h2>

//       {/* Email List */}
//       <div className="border rounded-lg p-4 mb-4">
//         <div className="flex items-center mb-2">
//           <input
//             type="checkbox"
//             checked={selectAll}
//             onChange={handleSelectAll}
//             className="mr-2"
//           />
//           <span className="font-medium">Select All</span>
//         </div>
//         {mockUsers.map((user) => (
//           <div key={user.id} className="flex items-center mb-2">
//             <input
//               type="checkbox"
//               checked={selectedEmails.includes(user.id)}
//               onChange={() => toggleEmail(user.id)}
//               className="mr-2"
//             />
//             <span>
//               {user.name} ({user.email})
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Template Emails */}
//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-2">
//           <label className="block font-medium">Choose a Template</label>
//           <button
//             onClick={() => setIsCreating(true)}
//             className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/80 text-sm"
//           >
//             + Create Template
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           {templates.map((tpl) => (
//             <div
//               key={tpl.id}
//               className={`relative rounded-xl shadow-md transition transform hover:-translate-y-1 hover:shadow-xl bg-white border overflow-hidden 
//       ${
//         selectedTemplate === tpl.title
//           ? "border-blue-800 ring-2 ring-green-400"
//           : "border-gray-200"
//       }`}
//             >
//               {/* Email Header */}
//               <div
//                 onClick={() => setSelectedTemplate(tpl.title)}
//                 className="bg-primary text-white px-4 py-3 text-sm font-semibold cursor-pointer"
//               >
//                 {tpl.subject}
//               </div>

//               {/* Email Body */}
//               <div
//                 onClick={() => setSelectedTemplate(tpl.title)}
//                 className="p-4 text-sm text-gray-700 cursor-pointer min-h-[120px]"
//               >
//                 <p
//                   className="mb-3 leading-relaxed"
//                   dangerouslySetInnerHTML={{ __html: tpl.body }}
//                 />
//                 <p className="text-gray-500 text-xs border-t pt-2">
//                   {tpl.footer}
//                 </p>
//               </div>

//               {/* Edit Button */}
//               <button
//                 onClick={() => handleEdit(tpl)}
//                 className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-white text-blue-600 border border-blue-600 rounded-full shadow-sm hover:bg-gray-200 hover:text-primary transition"
//                 title="Edit Template"
//               >
//                 <FiEdit2 size={16} />
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Send Button */}
//       <button
//         onClick={handleSend}
//         className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition w-60"
//       >
//         🚀 Send Emails
//       </button>

//       {/* Edit Modal */}
//       {isEditing && editTemplate && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-[99999]">
//           <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full">
//             <h3 className="text-lg font-semibold mb-4">
//               Edit Template – {editTemplate.title}
//             </h3>

//             {/* Subject Input */}
//             <label className="block text-sm font-medium mb-1">Subject</label>
//             <input
//               type="text"
//               value={editTemplate.subject}
//               onChange={(e) =>
//                 setEditTemplate({ ...editTemplate, subject: e.target.value })
//               }
//               className="w-full border rounded-lg p-2 mb-4"
//             />

//             {/* Body Editor */}
//             <label className="block text-sm font-medium mb-1">Body</label>
//             <JoditEditor
//               value={editTemplate.body}
//               onChange={(newContent) =>
//                 setEditTemplate({ ...editTemplate, body: newContent })
//               }
//             />

//             {/* Footer Input */}
//             <label className="block text-sm font-medium mt-4 mb-1">
//               Footer
//             </label>
//             <input
//               type="text"
//               value={editTemplate.footer}
//               onChange={(e) =>
//                 setEditTemplate({ ...editTemplate, footer: e.target.value })
//               }
//               className="w-full border rounded-lg p-2"
//             />

//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 onClick={() => setIsEditing(false)}
//                 className="px-4 py-2 rounded-lg border"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveEdit}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Template Modal */}
//       {isCreating && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-[99999]">
//           <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full">
//             <h3 className="text-lg font-semibold mb-4">Create New Template</h3>

//             {/* Title Input */}
//             <label className="block text-sm font-medium mb-1">Title</label>
//             <input
//               type="text"
//               value={newTemplate.title}
//               onChange={(e) =>
//                 setNewTemplate({ ...newTemplate, title: e.target.value })
//               }
//               className="w-full border rounded-lg p-2 mb-4"
//             />

//             {/* Subject Input */}
//             <label className="block text-sm font-medium mb-1">Subject</label>
//             <input
//               type="text"
//               value={newTemplate.subject}
//               onChange={(e) =>
//                 setNewTemplate({ ...newTemplate, subject: e.target.value })
//               }
//               className="w-full border rounded-lg p-2 mb-4"
//             />

//             {/* Body Editor */}
//             <label className="block text-sm font-medium mb-1">Body</label>
//             <JoditEditor
//               value={newTemplate.body}
//               onChange={(newContent) =>
//                 setNewTemplate({ ...newTemplate, body: newContent })
//               }
//             />

//             {/* Footer Input */}
//             <label className="block text-sm font-medium mt-4 mb-1">
//               Footer
//             </label>
//             <input
//               type="text"
//               value={newTemplate.footer}
//               onChange={(e) =>
//                 setNewTemplate({ ...newTemplate, footer: e.target.value })
//               }
//               className="w-full border rounded-lg p-2"
//             />

//             <div className="flex justify-end gap-2 mt-6">
//               <button
//                 onClick={() => setIsCreating(false)}
//                 className="px-4 py-2 rounded-lg border"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveNewTemplate}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmailMarketingManagement;

import { useState } from 'react';
// import {
//   Search,
//   SlidersHorizontal,
//   MoreVertical,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Square,
//   Star,
//   Inbox,
//   Send,
//   FileText,
//   Tag,
//   ChevronDown,
//   Plus,
//   HelpCircle,
//   Settings,
//   Menu,
//   Sparkles
// } from 'lucide-react';


function EmailMarketingManagement() {
  const [emails] = useState([
    { id: 1, sender: 'Subframe', subject: 'More ideas? Create new projects in Subframe', preview: 'Every idea counts. Build more projects in Subframe. Projects let you work on different apps from one Subframe account, each w...', time: '16:07', starred: false, read: false },
    { id: 2, sender: 'Deepti Mankani', subject: 'Invitation: The Lumi X Eazotel @ Mon Oct 6, 2025 3pm - 4pm (IST) (Abhijeet)', preview: 'The Lumi X Eazotel Join with Google Meet – You have been invited by Deepti Mankani to atten...', time: '14:06', starred: false, read: false },
    { id: 3, sender: 'Brand24', subject: 'Eazotel - new mentions: 1', preview: 'Starting today, we are unlocking automatic e-mail reports! Now you can stay on top of your project data. 6 days left of your Free Trial - keep the insig...', time: '14:06', starred: false, read: false },
    { id: 4, sender: 'Brand24 Webinars', subject: 'Want proof of your social listening skills? Get certified 👍', preview: 'Hi there, We\'re excited to invite you to our Free Masterclass, where you can become the Certified Social Listening ...', time: '13:33', starred: false, read: false },
    { id: 5, sender: 'Atlassian', subject: 'Tip #4: create perfect roadmaps for every stakeholder', preview: 'Communicate the right amount of information for every audience The right roadmap for every audience Tip #4: creat...', time: '12:36', starred: false, read: false },
    { id: 6, sender: 'Chrome Web Store', subject: 'Annual reminder about our Chrome Web Store terms and policies', preview: 'Hi Chrome Web Store user, This email is an annual reminder that your use of the Chrome Web Store is subj...', time: '07:30', starred: false, read: false },
    { id: 7, sender: 'Help Desk', subject: 'Request to publish DNS records for my domain', preview: 'Base Camp Hospitality Share Text Records Account Inactive Hi This email is from ZohoCampaigns on behalf of Help Desk(info@...', time: '5 Oct', starred: false, read: true },
    { id: 8, sender: 'Atlassian', subject: 'Step 3: automate repetitive tasks', preview: 'Save hours with just a few clicks Focus on what\'s important and let automation do the rest Step 3: automate repetitive tasks Quickly scale se...', time: '5 Oct', starred: false, read: true },
    { id: 9, sender: 'Atlassian', subject: 'Tip #3: keep all data and insights in one place', preview: 'No more decisions based on gut feel Add evidence to ideas with insights Tip #3: keep all data and insights in one place Add insi...', time: '5 Oct', starred: false, read: true },
    { id: 10, sender: 'Eric at Bolt.new', subject: 'Happy Birthday, Bolt!', preview: 'Bolt turns 1 🎂 + watch Bolt\'s origin story + don\'t miss the v2 livestream Hey builders, Happy Birthday, Bolt! One year ago today, Bolt gave non-developer...', time: '3 Oct', starred: false, read: true },
    { id: 11, sender: 'Atlassian', subject: 'How to deliver great service experiences, fast', preview: 'Tips to help you streamline Three tips for delivering great service experiences, fast We noticed you selected our general servic...', time: '3 Oct', starred: false, read: true },
    { id: 12, sender: 'Pinterest', subject: 'Abhijeet, big mood', preview: 'Marriage Jokes | Funny Work Jokes | Funny Marriage Jokes Architectural Designs House Plans Marriage Jokes | ... Marriage Jokes | Funny Work Jokes | Fun...', time: '3 Oct', starred: false, read: true },
    { id: 13, sender: 'Arun Chinnachamy', subject: 'Languages That Refuse to Die', preview: 'Why COBOL, Fortran, and Erlang Still Matter in 2025', time: '3 Oct', starred: false, read: true },
    { id: 14, sender: 'info...@viafreezohor...', subject: 'Add Zoho SalesIQ Code to Our Website', preview: 'Hi, We want to add visitor tracking (driven by Zoho SalesIQ) to our website. Zoho SalesIQ is a real-time sales intelligence platform to c...', time: '3 Oct', starred: false, read: true },
    { id: 15, sender: 'Atlassian', subject: 'Step 2: set up chat', preview: 'Multichannel support makes it easier to ask for help Make it easy for your employees and customers to ask for help Step 2: set up chat Meet your employees...', time: '3 Oct', starred: false, read: true },
  ]);

  const [selectedEmails, setSelectedEmails] = useState([]);

  const toggleEmailSelection = (id) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    );
  };

  const toggleAllEmails = () => {
    setSelectedEmails(selectedEmails.length === emails.length ? [] : emails.map(e => e.id));
  };

  return (
    <div className="h-screen flex flex-col bg-white fixed">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            {/* <Menu className="w-6 h-6 text-gray-600 cursor-pointer" /> */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path fill="#EA4335" d="M5,20 L5,9.5 L12,4 L19,9.5 L19,20 L14,20 L14,13 L10,13 L10,20 Z"/>
                {/* <path fill="#FBBC04" d="M12,4 L5,9.5 L5,5 L12,4 Z"/> */}
                {/* <path fill="#34A853" d="M12,4 L19,9.5 L19,5 L12,4 Z"/> */}
                <path fill="#4285F4" d="M5,9.5 L5,20 L10,15 Z"/>
                <path fill="#188038" d="M19,9.5 L19,20 L14,15 Z"/>
              </svg>
              <span className="text-xl text-gray-700">EazeMail</span>
            </div>
          </div>

          <div className="flex items-center flex-1 max-w-2xl bg-gray-100 rounded-lg px-4 py-2.5 hover:bg-gray-200 transition-colors">
            {/* <Search className="w-5 h-5 text-gray-600" /> */}
            <input
              type="text"
              placeholder="Search mail"
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm"
            />
            {/* <SlidersHorizontal className="w-5 h-5 text-gray-600 cursor-pointer" /> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">Active</span>
            {/* <ChevronDown className="w-4 h-4 text-gray-600" /> */}
          </div>
          {/* <HelpCircle className="w-5 h-5 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-0.5" /> */}
          {/* <Settings className="w-5 h-5 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-0.5" /> */}
          {/* <Sparkles className="w-5 h-5 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-0.5" /> */}
          {/* <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer">
            <span className="text-white text-sm font-medium">A</span>
          </div> */}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 p-2 flex flex-col gap-1">
          <button className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-gray-800 font-medium shadow-sm mb-2">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Compose
          </button>

          <div className="flex flex-col gap-0.5">
            <button className="flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 text-sm">
              {/* <Inbox className="w-5 h-5 text-gray-700" /> */}
              <span className="flex-1 text-left font-medium text-gray-900">Inbox</span>
              <span className="text-gray-900 font-medium">1,883</span>
            </button>
            <button className="flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 text-sm">
              {/* <Star className="w-5 h-5 text-gray-700" /> */}
              <span className="flex-1 text-left text-gray-700">Starred</span>
            </button>
            <button className="flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 text-sm">
              {/* <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div> */}
              <span className="flex-1 text-left text-gray-700">Snoozed</span>
            </button>
            <button className="flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 text-sm">
              {/* <Send className="w-5 h-5 text-gray-700" /> */}
              <span className="flex-1 text-left text-gray-700">Sent</span>
            </button>
            <button className="flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 text-sm">
              {/* <FileText className="w-5 h-5 text-gray-700" /> */}
              <span className="flex-1 text-left text-gray-700">Drafts</span>
              <span className="text-gray-600">8</span>
            </button>
            <button className="flex items-center gap-4 px-4 py-2 rounded-r-full hover:bg-gray-100 text-sm">
              {/* <ChevronDown className="w-5 h-5 text-gray-700" /> */}
              <span className="flex-1 text-left text-gray-700">More</span>
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium text-gray-700">Labels</span>
              {/* <Plus className="w-4 h-4 text-gray-600 cursor-pointer" /> */}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col border-l border-gray-200 ">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedEmails.length === emails.length}
                  onChange={toggleAllEmails}
                  className="w-5 h-5 cursor-pointer"
                />
                {/* <ChevronDown className="w-5 h-5 text-gray-600 cursor-pointer ml-1" /> */}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                {/* <RefreshCw className="w-5 h-5 text-gray-600" /> */}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                {/* <MoreVertical className="w-5 h-5 text-gray-600" /> */}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">1–50 of 2,435</span>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  {/* <ChevronLeft className="w-5 h-5 text-gray-600" /> */}
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  {/* <ChevronRight className="w-5 h-5 text-gray-600" /> */}
                </button>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className='overflow-hidden'>
          <div className="flex-1 overflow-y-auto ">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`flex items-center px-4 py-2 border-b border-gray-100 hover:shadow-sm cursor-pointer ${
                  !email.read ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(email.id)}
                  onChange={() => toggleEmailSelection(email.id)}
                  className="w-5 h-5 mr-2"
                />
                {/* <Star className={`w-5 h-5 mr-2 cursor-pointer ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} /> */}
                <div className="flex-1 min-w-0 text-sm flex items-center gap-4">
                  <span className={`w-48 truncate ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {email.sender}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {email.subject}
                    </span>
                    <span className="text-gray-600"> - {email.preview}</span>
                  </div>
                  <span className={`text-sm whitespace-nowrap ml-4 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {email.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}

export default EmailMarketingManagement;


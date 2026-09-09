// import { useState } from "react";
// import JoditEditor from "jodit-react";
// import { FiEdit2 } from "react-icons/fi";
// import { CiStar } from "react-icons/ci";

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

//   console.log(integrationStatus)

//   useEffect(()=>{
//     checkIntegrationStatus()
//   },[])

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
//     :
//     <div>
//       <Link to={`/dashboard/client/${localStorage.getItem("hid")}/integration`}>Connect Gmail </Link>
//     </div>}
//     </div>

//   );
// };

// export default EmailMarketingManagement;

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiSend,
  FiStar,
  FiInbox,
  FiTrash2,
  FiEdit3,
  FiAlertCircle,
  FiMail,
  FiX,
  FiMenu,
  FiArchive,
  FiClock,
  FiChevronDown,
  FiUpload,
  FiUsers,
  FiFileText,
} from "react-icons/fi";

import * as XLSX from "xlsx"; /*npm install xlsx --legacy-peer-deps */

import { getEmails } from "../../services/api/Email.api";
import ComposeEmail from "../../components/Email/ComposeEmail";

/* =========================================================
   EXCEL RECIPIENT IMPORT
========================================================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const EMAIL_COLUMN_NAMES = new Set([
  "email",
  "emailaddress",
  "emailid",
  "emailids",
  "mail",
  "mailid",
  "mailaddress",
  "recipient",
  "recipientemail",
  "recipientemailaddress",
  "e-mail",
  "e-mailaddress",
]);

const extractEmailsFromExcel = async (file) => {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const foundEmails = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (!rows.length) {
      return;
    }

    /*
      First try to identify a column whose header is:
      Email / Email Address / Mail / Recipient Email etc.
    */
    const headerRow = rows[0] || [];

    const emailColumnIndexes = headerRow
      .map((header, index) => ({
        header: normalizeHeader(header),
        index,
      }))
      .filter(({ header }) => EMAIL_COLUMN_NAMES.has(header))
      .map(({ index }) => index);

    if (emailColumnIndexes.length > 0) {
      // Read only the detected email columns.
      rows.slice(1).forEach((row) => {
        emailColumnIndexes.forEach((columnIndex) => {
          const value = String(row[columnIndex] ?? "")
            .trim()
            .toLowerCase();

          if (EMAIL_REGEX.test(value)) {
            foundEmails.push(value);
          }
        });
      });

      return;
    }

    /*
      If no email column exists, scan every cell.
      This supports spreadsheets where the email column
      has an unusual name or there is no header row.
    */
    rows.forEach((row) => {
      row.forEach((cell) => {
        const value = String(cell ?? "")
          .trim()
          .toLowerCase();

        if (EMAIL_REGEX.test(value)) {
          foundEmails.push(value);
        }
      });
    });
  });

  return [...new Set(foundEmails)];
};

const PAGE_SIZE = 50;

/* =========================================================
   FALLBACK DATA
========================================================= */

const fallbackEmails = [
  {
    id: 1,
    sender: "Subframe",
    email: "hello@subframe.com",
    subject: "More ideas? Create new projects in Subframe",
    preview:
      "Every idea counts. Build more projects in Subframe. Projects let you work on different apps from one Subframe account, each w...",
    time: "16:07",
    starred: false,
    read: false,
  },
  {
    id: 2,
    sender: "Deepti Mankani",
    email: "deepti.mankani@example.com",
    subject:
      "Invitation: The Lumi X Eazotel @ Mon Oct 6, 2025 3pm – 4pm (IST) (Abhijeet)",
    preview:
      "The Lumi X Eazotel Join with Google Meet – You have been invited by Deepti Mankani to atten...",
    time: "14:06",
    starred: false,
    read: false,
  },
  {
    id: 3,
    sender: "Brand24",
    email: "notifications@brand24.com",
    subject: "Eazotel – new mentions: 1",
    preview:
      "Starting today, we are unlocking automatic e-mail reports! Now you can stay on top of your project data...",
    time: "14:06",
    starred: false,
    read: false,
  },
  {
    id: 4,
    sender: "Brand24 Webinars",
    email: "webinars@brand24.com",
    subject: "Want proof of your social listening skills? Get certified 👍",
    preview: "Hi there, We're excited to invite you to our Free Masterclass...",
    time: "13:33",
    starred: false,
    read: false,
  },
  {
    id: 5,
    sender: "Atlassian",
    email: "updates@atlassian.com",
    subject: "Tip #4: create perfect roadmaps for every stakeholder",
    preview:
      "Communicate the right amount of information for every audience...",
    time: "12:36",
    starred: false,
    read: false,
  },
  {
    id: 6,
    sender: "Chrome Web Store",
    email: "chromewebstore-noreply@google.com",
    subject: "Annual reminder about our Chrome Web Store terms and policies",
    preview: "Hi Chrome Web Store user, This email is an annual reminder...",
    time: "07:30",
    starred: false,
    read: false,
  },
  {
    id: 7,
    sender: "Help Desk",
    email: "info@eazotel.com",
    subject: "Request to publish DNS records for my domain",
    preview: "Base Camp Hospitality Share Text Records Account Inactive...",
    time: "5 Oct",
    starred: false,
    read: true,
  },
  {
    id: 8,
    sender: "Atlassian",
    email: "support@atlassian.com",
    subject: "Step 3: automate repetitive tasks",
    preview: "Save hours with just a few clicks. Focus on what's important...",
    time: "5 Oct",
    starred: false,
    read: true,
  },
  {
    id: 9,
    sender: "Atlassian",
    email: "team@atlassian.com",
    subject: "Tip #3: keep all data and insights in one place",
    preview: "No more decisions based on gut feel. Add evidence to ideas...",
    time: "5 Oct",
    starred: false,
    read: true,
  },
  {
    id: 10,
    sender: "Eric at Bolt.new",
    email: "eric@bolt.new",
    subject: "Happy Birthday, Bolt! 🎂",
    preview: "Bolt turns 1 🎂 + watch Bolt's origin story...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 11,
    sender: "Atlassian",
    email: "newsletter@atlassian.com",
    subject: "How to deliver great service experiences, fast",
    preview: "Tips to help you streamline service experiences...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 12,
    sender: "Pinterest",
    email: "news@pinterest.com",
    subject: "Abhijeet, big mood",
    preview: "Marriage Jokes | Funny Work Jokes | Architectural Designs...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 13,
    sender: "Arun Chinnachamy",
    email: "arun@example.com",
    subject:
      "Languages That Refuse to Die – Why COBOL, Fortran, and Erlang Still Matter in 2025",
    preview: "",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 14,
    sender: "info...@viafreezohor...",
    email: "info@viafreezohor.com",
    subject: "Add Zoho SalesIQ Code to Our Website",
    preview: "Hi, We want to add visitor tracking driven by Zoho SalesIQ...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 15,
    sender: "Atlassian",
    email: "chat@atlassian.com",
    subject: "Step 2: set up chat",
    preview: "Multichannel support makes it easier to ask for help...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 16,
    sender: "Atlassian",
    email: "automation@atlassian.com",
    subject: "Step 2: set up chat",
    preview: "Make it easy for your employees and customers to ask for help...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
  {
    id: 17,
    sender: "Atlassian",
    email: "updates@atlassian.com",
    subject: "Step 2: set up chat",
    preview: "Meet your employees and customers where they are...",
    time: "3 Oct",
    starred: false,
    read: true,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function EmailMarketingManagement() {
  /* -------------------------------------------------------
     EMAIL DATA
  ------------------------------------------------------- */

  const [emails, setEmails] = useState(fallbackEmails);

  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  const [search, setSearch] = useState("");

  /* -------------------------------------------------------
     SELECTION
  ------------------------------------------------------- */

  const [selectedEmails, setSelectedEmails] = useState([]);

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const [isLoading, setIsLoading] = useState(false);

  /* -------------------------------------------------------
     COMPOSE
  ------------------------------------------------------- */

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [broadcastRecipients, setBroadcastRecipients] = useState([]);

  /* -------------------------------------------------------
     MAIL NAVIGATION
  ------------------------------------------------------- */

  const [activeFolder, setActiveFolder] = useState("inbox");

  /* -------------------------------------------------------
     MOBILE MAIL SIDEBAR
  ------------------------------------------------------- */

  const [isMobileMailNavOpen, setIsMobileMailNavOpen] = useState(false);

  /* -------------------------------------------------------
     BROADCAST MENU / EXCEL IMPORT
  ------------------------------------------------------- */

  const [isBroadcastMenuOpen, setIsBroadcastMenuOpen] = useState(false);

  const [isImportingExcel, setIsImportingExcel] = useState(false);

  const [isRecipientPreviewOpen, setIsRecipientPreviewOpen] = useState(false);

  const [excelRecipients, setExcelRecipients] = useState([]);

  const excelInputRef = useRef(null);
  /* =======================================================
     LOAD EMAILS
  ======================================================= */

  const loadEmails = async () => {
    try {
      setIsLoading(true);

      const response = await getEmails();

      const apiEmails = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.emails)
            ? response.emails
            : [];

      if (apiEmails.length > 0) {
        const normalizedEmails = apiEmails.map((item, index) => ({
          id: item.id ?? item._id ?? index + 1,

          folder:
            item.folder ??
            item.mailbox ??
            item.folderName ??
            item.mailFolder ??
            "inbox",

          sender: item.sender ?? item.fromName ?? item.from ?? "Unknown Sender",

          email: item.email ?? item.senderEmail ?? item.fromEmail ?? "",

          subject: item.subject ?? "(No subject)",

          preview: item.preview ?? item.snippet ?? item.bodyPreview ?? "",

          time: item.time ?? item.date ?? item.createdAt ?? "",

          starred: Boolean(item.starred),

          read: Boolean(item.read),
        }));

        setEmails(normalizedEmails);
      }
    } catch (error) {
      console.error("Error loading emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase();

    // First filter by selected folder
    const folderEmails = emails.filter(
      (email) => (email.folder || "inbox") === activeFolder,
    );

    // Then apply search
    if (!query) {
      return folderEmails;
    }

    return folderEmails.filter((email) => {
      return (
        email.sender?.toLowerCase().includes(query) ||
        email.email?.toLowerCase().includes(query) ||
        email.subject?.toLowerCase().includes(query) ||
        email.preview?.toLowerCase().includes(query)
      );
    });
  }, [emails, search, activeFolder]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / PAGE_SIZE));

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;

  const visibleEmails = filteredEmails.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
    setSelectedEmails([]);
  }, [search]);

  /* =======================================================
     SELECTION
  ======================================================= */

  const toggleEmailSelection = (id) => {
    setSelectedEmails((prev) => {
      if (prev.includes(id)) {
        return prev.filter((emailId) => emailId !== id);
      }

      return [...prev, id];
    });
  };

  const isAllSelected =
    visibleEmails.length > 0 &&
    visibleEmails.every((email) => selectedEmails.includes(email.id));

  const toggleSelectAll = () => {
    const visibleIds = visibleEmails.map((email) => email.id);

    if (isAllSelected) {
      setSelectedEmails((prev) =>
        prev.filter((id) => !visibleIds.includes(id)),
      );

      return;
    }

    setSelectedEmails((prev) => [...new Set([...prev, ...visibleIds])]);
  };

  /* =======================================================
     STAR
  ======================================================= */

  const toggleStar = (id) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id
          ? {
              ...email,
              starred: !email.starred,
            }
          : email,
      ),
    );
  };

  /* =======================================================
     BROADCAST
  ======================================================= */

  const openSelectedBroadcast = () => {
    if (selectedEmails.length === 0) {
      setIsBroadcastMenuOpen(true);
      return;
    }

    const recipients = [
      ...new Set(
        emails
          .filter((email) => selectedEmails.includes(email.id))
          .map((email) => email.email?.trim())
          .filter((email) => email && EMAIL_REGEX.test(email)),
      ),
    ];

    if (recipients.length === 0) {
      alert("No valid email addresses found for selected emails");
      return;
    }

    console.log("Selected Email IDs:", selectedEmails);

    console.log("Broadcast Recipients:", recipients);

    setBroadcastRecipients(recipients);
    setIsComposeOpen(true);
    setIsBroadcastMenuOpen(false);
    setIsMobileMailNavOpen(false);
  };

  const openExcelPicker = () => {
    setIsBroadcastMenuOpen(false);
    excelInputRef.current?.click();
  };

  const handleExcelFileChange = async (event) => {
    const file = event.target.files?.[0];

    // Allow the same file to be selected again later.
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setIsImportingExcel(true);

      const recipients = await extractEmailsFromExcel(file);

      if (recipients.length === 0) {
        alert("No valid email addresses were found in this Excel file.");
        return;
      }

      console.log("Excel file:", file.name);

      console.log("Imported recipients:", recipients);

      setExcelRecipients(recipients);
      setIsRecipientPreviewOpen(true);

      setBroadcastRecipients([]);
      setSelectedEmails([]);
      setIsComposeOpen(false);
      setIsMobileMailNavOpen(false);
    } catch (error) {
      console.error("Excel recipient import failed:", error);

      alert(
        "Could not read this Excel file. Please upload a valid .xlsx or .xls file.",
      );
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleRecipientEdit = (index, value) => {
    setExcelRecipients((prev) =>
      prev.map((email, i) => (i === index ? value : email)),
    );
  };

  const handleRecipientDelete = (index) => {
    setExcelRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinueToCompose = () => {
    const validRecipients = [
      ...new Set(
        excelRecipients
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email && EMAIL_REGEX.test(email)),
      ),
    ];

    if (validRecipients.length === 0) {
      alert("Please add at least one valid email address.");
      return;
    }

    setBroadcastRecipients(validRecipients);

    setIsRecipientPreviewOpen(false);

    setIsComposeOpen(true);
  };
  /* =======================================================
     NORMAL COMPOSE
  ======================================================= */

  const openCompose = () => {
    setBroadcastRecipients([]);

    setIsComposeOpen(true);

    setIsMobileMailNavOpen(false);
  };

  /* =======================================================
     CLOSE COMPOSE
  ======================================================= */

  const closeCompose = () => {
    setIsComposeOpen(false);

    setBroadcastRecipients([]);
  };

  /* =======================================================
     FOLDER
  ======================================================= */

  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
    setSelectedEmails([]);
    setCurrentPage(1);
    setSearch("");
    setIsBroadcastMenuOpen(false);
    setIsMobileMailNavOpen(false);
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const goPrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  /* =======================================================
     RANGE
  ======================================================= */

  const rangeText =
    filteredEmails.length === 0
      ? "0–0 of 0"
      : `${startIndex + 1}–${Math.min(
          startIndex + PAGE_SIZE,
          filteredEmails.length,
        )} of ${filteredEmails.length}`;

  /* =======================================================
     FOLDER COUNTS
  ======================================================= */

  const folderCounts = useMemo(
    () => ({
      inbox: emails.filter((email) => (email.folder || "inbox") === "inbox")
        .length,
      sent: emails.filter((email) => email.folder === "sent").length,
      spam: emails.filter((email) => email.folder === "spam").length,
      bin: emails.filter((email) => email.folder === "bin").length,
    }),
    [emails],
  );

  /* =======================================================
     MAIL NAV
  ======================================================= */

  const MailNavigation = ({ mobile = false }) => (
    <div className={`flex flex-col ${mobile ? "h-full" : "h-full"}`}>
      {/* Compose */}
      <div className="p-4">
        <button
          type="button"
          onClick={openCompose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <FiEdit3 size={17} />
          Compose
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-3">
        {/* Inbox */}
        <button
          type="button"
          onClick={() => handleFolderChange("inbox")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            activeFolder === "inbox"
              ? "bg-blue-50 font-medium text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FiInbox size={18} />

          <span>Inbox</span>

          <span
            className={`ml-auto text-xs ${
              activeFolder === "inbox" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {folderCounts.inbox}
          </span>
        </button>

        {/* Sent */}
        <button
          type="button"
          onClick={() => handleFolderChange("sent")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            activeFolder === "sent"
              ? "bg-blue-50 font-medium text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FiSend size={18} />

          <span>Sent</span>

          <span
            className={`ml-auto text-xs ${
              activeFolder === "sent" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {folderCounts.sent}
          </span>
        </button>

        {/* Spam */}
        <button
          type="button"
          onClick={() => handleFolderChange("spam")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            activeFolder === "spam"
              ? "bg-blue-50 font-medium text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FiAlertCircle size={18} />

          <span>Spam</span>

          <span
            className={`ml-auto text-xs ${
              activeFolder === "spam" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {folderCounts.spam}
          </span>
        </button>

        {/* Bin */}
        <button
          type="button"
          onClick={() => handleFolderChange("bin")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            activeFolder === "bin"
              ? "bg-blue-50 font-medium text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FiTrash2 size={18} />

          <span>Bin</span>

          <span
            className={`ml-auto text-xs ${
              activeFolder === "bin" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {folderCounts.bin}
          </span>
        </button>
      </nav>

      {/* Extra navigation */}
      <div className="mt-4 border-t border-gray-100 px-3 pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100"
        >
          <FiStar size={18} />

          <span>Starred</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100"
        >
          <FiClock size={18} />

          <span>Snoozed</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100"
        >
          <FiArchive size={18} />

          <span>Archive</span>
        </button>
      </div>
    </div>
  );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="relative flex h-screen min-h-0 w-full min-w-0 overflow-hidden bg-white">
      {/* ==================================================
          MOBILE MAIL SIDEBAR OVERLAY
      ================================================== */}

      {isMobileMailNavOpen && (
        <>
          <button
            type="button"
            aria-label="Close mail navigation"
            onClick={() => setIsMobileMailNavOpen(false)}
            className="fixed inset-0 z-[9990] bg-black/30 md:hidden"
          />

          <aside className="fixed bottom-0 left-0 top-0 z-[9999] w-[280px] bg-white shadow-2xl md:hidden">
            {/* Mobile nav header */}
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
              <div className="flex items-center gap-2">
                <FiMail size={19} className="text-blue-600" />

                <span className="text-sm font-semibold">Mail</span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMailNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <FiX size={19} />
              </button>
            </div>

            <MailNavigation mobile />
          </aside>
        </>
      )}

      {/* ==================================================
          DESKTOP EMAIL SIDEBAR

          IMPORTANT:
          EXACT CLASS REQUESTED BY USER
      ================================================== */}

      <aside className="hidden w-[220px] shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <FiMail size={19} className="text-blue-600" />

            <span className="text-sm font-semibold text-gray-800">
              EazoMail
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MailNavigation />
        </div>
      </aside>

      {/* ==================================================
          EMAIL CONTENT
      ================================================== */}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ==================================================
            MOBILE EMAIL HEADER
        ================================================== */}

        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {/* Mail navigation */}
            <button
              type="button"
              onClick={() => setIsMobileMailNavOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Open mail navigation"
            >
              <FiMenu size={20} />
            </button>

            <span className="truncate text-sm font-semibold text-gray-800">
              {activeFolder === "inbox"
                ? "Inbox"
                : activeFolder === "sent"
                  ? "Sent"
                  : activeFolder === "spam"
                    ? "Spam"
                    : "Bin"}
            </span>
          </div>

          {/* Mobile compose */}
          <button
            type="button"
            onClick={openCompose}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white"
          >
            <FiEdit3 size={14} />
            Compose
          </button>
        </div>

        {/* ==================================================
            SEARCH + BROADCAST
        ================================================== */}

        <div className="flex shrink-0 flex-col gap-2 border-b border-gray-200 p-3 sm:p-4 md:flex-row md:items-center md:gap-3 md:px-5 md:py-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <FiSearch
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mail"
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-100 pl-10 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Desktop actions */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Broadcast split button */}
            <div className="relative flex shrink-0">
              {/* Hidden Excel file input */}
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelFileChange}
                className="hidden"
                aria-hidden="true"
              />

              {/* Main action */}
              <button
                type="button"
                onClick={openSelectedBroadcast}
                disabled={isImportingExcel}
                className="flex h-11 items-center gap-2 rounded-l-lg border-r border-gray-300 bg-gray-100 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60 sm:px-4"
                title={
                  selectedEmails.length > 0
                    ? "Broadcast selected emails"
                    : "Choose recipients"
                }
              >
                <FiSend size={16} />

                <span className="hidden sm:inline">Broadcast</span>

                {selectedEmails.length > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                    {selectedEmails.length}
                  </span>
                )}
              </button>

              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setIsBroadcastMenuOpen((prev) => !prev)}
                disabled={isImportingExcel}
                className="flex h-11 w-9 items-center justify-center rounded-r-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60"
                aria-label="Broadcast options"
                aria-expanded={isBroadcastMenuOpen}
              >
                <FiChevronDown size={15} />
              </button>

              {/* Dropdown menu */}
              {isBroadcastMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[10000] w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  {/* Selected inbox recipients */}
                  <button
                    type="button"
                    onClick={openSelectedBroadcast}
                    disabled={selectedEmails.length === 0}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiUsers
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-800">
                        Selected inbox emails
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-400">
                        {selectedEmails.length > 0
                          ? `${selectedEmails.length} selected recipient${
                              selectedEmails.length === 1 ? "" : "s"
                            }`
                          : "Select emails from Inbox first"}
                      </span>
                    </span>
                  </button>

                  <div className="border-t border-gray-100" />

                  {/* Excel import */}
                  <button
                    type="button"
                    onClick={openExcelPicker}
                    disabled={isImportingExcel}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    <FiUpload
                      size={18}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-800">
                        {isImportingExcel
                          ? "Reading Excel..."
                          : "Import from Excel"}
                      </span>

                      <span className="mt-0.5 block text-xs leading-4 text-gray-400">
                        Upload .xlsx, .xls or .csv and extract email addresses
                      </span>
                    </span>
                  </button>

                  <div className="border-t border-gray-100" />

                  <div className="flex items-start gap-3 px-4 py-3">
                    <FiFileText
                      size={17}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <p className="text-[11px] leading-4 text-gray-400">
                      The importer checks columns such as
                      <span className="font-medium text-gray-500">
                        {" "}
                        Email, Email Address, Mail
                      </span>{" "}
                      and also scans the sheet for valid email addresses.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-11 items-center gap-2 px-1 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="hidden sm:inline">Active</span>
            </div>
          </div>
        </div>

        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3 sm:px-4 md:h-14 md:px-5">
          {/* Left */}
          <div className="flex items-center gap-1">
            {/* Select all */}
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="Select all emails"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                  isAllSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isAllSelected ? "✓" : ""}
              </span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadEmails}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Refresh emails"
            >
              <FiRefreshCw
                size={17}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>

            {selectedEmails.length > 0 && (
              <span className="ml-1 whitespace-nowrap text-xs font-medium text-blue-600 sm:text-sm">
                {selectedEmails.length} selected
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-0.5">
            <span className="mr-1 whitespace-nowrap text-xs text-gray-600 sm:mr-2 sm:text-sm">
              {rangeText}
            </span>

            <button
              type="button"
              onClick={goPrevious}
              disabled={safePage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous page"
            >
              <FiChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={safePage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next page"
            >
              <FiChevronRight size={18} />
            </button>

            <button
              type="button"
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 sm:flex"
            >
              <FiMoreVertical size={17} />
            </button>
          </div>
        </div>

        {/* ==================================================
            EMAIL LIST
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {visibleEmails.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
              <FiInbox size={38} className="mb-3 text-gray-300" />

              <p className="text-sm font-medium text-gray-700">
                {search.trim()
                  ? "No emails found"
                  : `No ${
                      activeFolder === "bin"
                        ? "Bin"
                        : activeFolder.charAt(0).toUpperCase() +
                          activeFolder.slice(1)
                    } emails`}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {search.trim()
                  ? "Try another search."
                  : `Your ${
                      activeFolder === "bin" ? "deleted" : activeFolder
                    } emails will appear here.`}
              </p>
            </div>
          ) : (
            visibleEmails.map((email) => {
              const isSelected = selectedEmails.includes(email.id);

              return (
                <div
                  key={email.id}
                  className={`border-b border-gray-200 transition ${
                    isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {/* =================================================
                      DESKTOP EMAIL ROW
                  ================================================= */}

                  <div className="hidden min-w-0 grid-cols-[38px_38px_minmax(160px,240px)_minmax(0,1fr)_65px] items-center gap-1 px-3 py-3 lg:grid lg:px-4">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleEmailSelection(email.id)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label={`Select ${email.sender}`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>

                    {/* Star */}
                    <button
                      type="button"
                      onClick={() => toggleStar(email.id)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label={`Star ${email.sender}`}
                    >
                      <FiStar
                        size={19}
                        className={
                          email.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    </button>

                    {/* Sender */}
                    <div
                      className={`min-w-0 truncate pr-3 text-sm ${
                        email.read
                          ? "font-normal text-gray-600"
                          : "font-semibold text-gray-900"
                      }`}
                      title={email.email}
                    >
                      {email.sender}
                    </div>

                    {/* Subject */}
                    <div className="min-w-0 truncate text-sm">
                      <span
                        className={
                          email.read
                            ? "text-gray-600"
                            : "font-semibold text-gray-900"
                        }
                      >
                        {email.subject}
                      </span>

                      {email.preview && (
                        <span className="text-gray-500">
                          {" "}
                          - {email.preview}
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <div
                      className={`truncate text-right text-xs ${
                        email.read
                          ? "text-gray-500"
                          : "font-semibold text-gray-900"
                      }`}
                    >
                      {email.time}
                    </div>
                  </div>

                  {/* =================================================
                      TABLET EMAIL ROW
                  ================================================= */}

                  <div className="hidden min-w-0 grid-cols-[36px_32px_minmax(130px,190px)_minmax(0,1fr)_60px] items-center gap-1 px-3 py-3 md:grid lg:hidden">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleEmailSelection(email.id)}
                      className="flex h-8 w-8 items-center justify-center"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>

                    {/* Star */}
                    <button
                      type="button"
                      onClick={() => toggleStar(email.id)}
                      className="flex h-8 w-8 items-center justify-center"
                    >
                      <FiStar
                        size={18}
                        className={
                          email.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    </button>

                    {/* Sender */}
                    <div
                      className={`min-w-0 truncate text-sm ${
                        email.read
                          ? "text-gray-600"
                          : "font-semibold text-gray-900"
                      }`}
                    >
                      {email.sender}
                    </div>

                    {/* Subject */}
                    <div className="min-w-0 truncate text-sm">
                      <span
                        className={
                          email.read
                            ? "text-gray-600"
                            : "font-semibold text-gray-900"
                        }
                      >
                        {email.subject}
                      </span>

                      {email.preview && (
                        <span className="text-gray-500">
                          {" "}
                          - {email.preview}
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <div className="truncate text-right text-xs text-gray-500">
                      {email.time}
                    </div>
                  </div>

                  {/* =================================================
                      MOBILE EMAIL ROW
                  ================================================= */}

                  <div className="flex min-w-0 items-start gap-1 px-2 py-2.5 sm:px-3 sm:py-3 md:hidden">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleEmailSelection(email.id)}
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>

                    {/* Star */}
                    <button
                      type="button"
                      onClick={() => toggleStar(email.id)}
                      className="mt-0.5 flex h-9 w-8 shrink-0 items-center justify-center"
                    >
                      <FiStar
                        size={18}
                        className={
                          email.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    </button>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Sender + Time */}
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p
                          className={`min-w-0 truncate pr-2 text-sm ${
                            email.read
                              ? "text-gray-600"
                              : "font-semibold text-gray-900"
                          }`}
                        >
                          {email.sender}
                        </p>

                        <span
                          className={`shrink-0 text-[11px] ${
                            email.read
                              ? "text-gray-500"
                              : "font-semibold text-gray-900"
                          }`}
                        >
                          {email.time}
                        </span>
                      </div>

                      {/* Subject */}
                      <p
                        className={`mt-0.5 truncate text-[13px] leading-5 ${
                          email.read
                            ? "text-gray-600"
                            : "font-medium text-gray-900"
                        }`}
                      >
                        {email.subject}
                      </p>

                      {/* Preview */}
                      {email.preview && (
                        <p className="truncate text-xs leading-5 text-gray-400">
                          {email.preview}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
      {/* ==================================================
    EXCEL RECIPIENT PREVIEW
================================================== */}

      {isRecipientPreviewOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-3 sm:p-5">
          <div
            className="
        flex
        max-h-[90vh]
        w-full
        max-w-2xl
        flex-col
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-2xl
      "
          >
            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">
                  Broadcast Recipients
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {excelRecipients.length} email
                  {excelRecipients.length === 1 ? "" : "s"} imported from Excel
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsRecipientPreviewOpen(false);
                  setExcelRecipients([]);
                }}
                className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-gray-900
          "
                aria-label="Close recipient preview"
              >
                <FiX size={19} />
              </button>
            </div>

            {/* RECIPIENT LIST */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              {excelRecipients.length > 0 ? (
                <div className="space-y-2">
                  {excelRecipients.map((email, index) => (
                    <div
                      key={`${email}-${index}`}
                      className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  p-2
                  transition
                  hover:bg-white
                "
                    >
                      {/* NUMBER */}
                      <span
                        className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-[11px]
                    font-medium
                    text-gray-500
                  "
                      >
                        {index + 1}
                      </span>

                      {/* EMAIL */}
                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          handleRecipientEdit(index, e.target.value)
                        }
                        className="
                    min-w-0
                    flex-1
                    rounded-md
                    border
                    border-transparent
                    bg-transparent
                    px-2
                    py-1.5
                    text-sm
                    text-gray-800
                    outline-none
                    focus:border-blue-300
                    focus:bg-white
                  "
                      />

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => handleRecipientDelete(index)}
                        className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-400
                    transition
                    hover:bg-red-50
                    hover:text-red-500
                  "
                        title="Remove recipient"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-gray-400">No recipients found.</p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div
              className="
          flex
          shrink-0
          flex-col
          gap-2
          border-t
          border-gray-200
          bg-white
          px-4
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
        "
            >
              {/* CANCEL */}
              <button
                type="button"
                onClick={() => {
                  setIsRecipientPreviewOpen(false);
                  setExcelRecipients([]);
                }}
                className="
            w-full
            rounded-lg
            border
            border-gray-200
            px-4
            py-2
            text-sm
            font-medium
            text-gray-600
            transition
            hover:bg-gray-50
            sm:w-auto
          "
              >
                Cancel
              </button>

              {/* CONTINUE */}
              <button
                type="button"
                onClick={handleContinueToCompose}
                disabled={excelRecipients.length === 0}
                className="
            w-full
            rounded-lg
            bg-blue-600
            px-5
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
          "
              >
                Continue to Compose
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
    COMPOSE
================================================== */}

      {isComposeOpen && (
        <ComposeEmail
          onClose={closeCompose}
          recipients={broadcastRecipients}
          isBroadcast={broadcastRecipients.length > 0}
        />
      )}
      {/* ==================================================
          COMPOSE
      ================================================== */}

      {isComposeOpen && (
        <ComposeEmail
          onClose={closeCompose}
          recipients={broadcastRecipients}
          isBroadcast={broadcastRecipients.length > 0}
        />
      )}
    </div>
  );
}

export default EmailMarketingManagement;

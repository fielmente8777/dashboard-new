import { useState } from "react";
import JoditEditor from "jodit-react";
import { FiEdit2 } from "react-icons/fi";

const mockUsers = [
  { id: 1, name: "Sushil KC", email: "sushil@example.com" },
  { id: 2, name: "Hem Bahadur", email: "hem@example.com" },
  { id: 3, name: "John Doe", email: "john@example.com" },
];

const initialTemplates = [
  {
    id: "welcome",
    title: "Welcome Template",
    subject: "👋 Welcome to Our Service",
    body: "Hi there! We're thrilled to have you on board. Get ready to explore amazing features.",
    footer: "Cheers, The Team",
  },
  {
    id: "discount",
    title: "Discount Offer",
    subject: "🎉 Exclusive 20% Discount Just for You",
    body: "Don't miss out on this special deal! Use code SAVE20 at checkout and enjoy 20% off.",
    footer: "Offer valid till Sunday!",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    subject: "📰 Your Weekly Update",
    body: "Stay in the loop with the latest news, tips, and community updates. Thanks for being with us!",
    footer: "See you next week 👋",
  },
];

const EmailMarketingManagement = () => {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    id: "",
    title: "",
    subject: "",
    body: "",
    footer: "",
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(mockUsers.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle single select
  const toggleEmail = (id) => {
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter((item) => item !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  // Handle send
  const handleSend = () => {
    if (!selectedTemplate) {
      alert("Please select a template");
      return;
    }
    if (selectedEmails.length === 0) {
      alert("Please select at least one email");
      return;
    }

    const selectedUsers = mockUsers.filter((u) =>
      selectedEmails.includes(u.id)
    );

    console.log("Sending template:", selectedTemplate, "to", selectedUsers);

    // TODO: Replace with API call
    alert(`Message sent to ${selectedUsers.length} users!`);
  };

  // Open editor
  const handleEdit = (tpl) => {
    setEditTemplate({ ...tpl }); // clone
    setIsEditing(true);
  };

  // Save edited template
  const handleSaveEdit = () => {
    setTemplates(
      templates.map((tpl) => (tpl.id === editTemplate.id ? editTemplate : tpl))
    );
    setIsEditing(false);
  };

  // Save new template
  const handleSaveNewTemplate = () => {
    if (!newTemplate.title || !newTemplate.subject || !newTemplate.body) {
      alert("Please fill at least Title, Subject, and Body");
      return;
    }
    const templateToAdd = {
      ...newTemplate,
      id: Date.now().toString(), // unique id
    };
    setTemplates([...templates, templateToAdd]);
    setIsCreating(false);
    setNewTemplate({ id: "", title: "", subject: "", body: "", footer: "" });
  };

  return (
    <div className="p-4 mx-auto bg-white">
      <h2 className="text-lg font-semibold mb-4">📧 Email Marketing</h2>

      {/* Email List */}
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="mr-2"
          />
          <span className="font-medium">Select All</span>
        </div>
        {mockUsers.map((user) => (
          <div key={user.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={selectedEmails.includes(user.id)}
              onChange={() => toggleEmail(user.id)}
              className="mr-2"
            />
            <span>
              {user.name} ({user.email})
            </span>
          </div>
        ))}
      </div>

      {/* Template Emails */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block font-medium">Choose a Template</label>
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/80 text-sm"
          >
            + Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className={`relative rounded-xl shadow-md transition transform hover:-translate-y-1 hover:shadow-xl bg-white border overflow-hidden 
      ${
        selectedTemplate === tpl.title
          ? "border-blue-800 ring-2 ring-green-400"
          : "border-gray-200"
      }`}
            >
              {/* Email Header */}
              <div
                onClick={() => setSelectedTemplate(tpl.title)}
                className="bg-primary text-white px-4 py-3 text-sm font-semibold cursor-pointer"
              >
                {tpl.subject}
              </div>

              {/* Email Body */}
              <div
                onClick={() => setSelectedTemplate(tpl.title)}
                className="p-4 text-sm text-gray-700 cursor-pointer min-h-[120px]"
              >
                <p
                  className="mb-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tpl.body }}
                />
                <p className="text-gray-500 text-xs border-t pt-2">
                  {tpl.footer}
                </p>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => handleEdit(tpl)}
                className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-white text-blue-600 border border-blue-600 rounded-full shadow-sm hover:bg-gray-200 hover:text-primary transition"
                title="Edit Template"
              >
                <FiEdit2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition w-60"
      >
        🚀 Send Emails
      </button>

      {/* Edit Modal */}
      {isEditing && editTemplate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-[99999]">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full">
            <h3 className="text-lg font-semibold mb-4">
              Edit Template – {editTemplate.title}
            </h3>

            {/* Subject Input */}
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={editTemplate.subject}
              onChange={(e) =>
                setEditTemplate({ ...editTemplate, subject: e.target.value })
              }
              className="w-full border rounded-lg p-2 mb-4"
            />

            {/* Body Editor */}
            <label className="block text-sm font-medium mb-1">Body</label>
            <JoditEditor
              value={editTemplate.body}
              onChange={(newContent) =>
                setEditTemplate({ ...editTemplate, body: newContent })
              }
            />

            {/* Footer Input */}
            <label className="block text-sm font-medium mt-4 mb-1">
              Footer
            </label>
            <input
              type="text"
              value={editTemplate.footer}
              onChange={(e) =>
                setEditTemplate({ ...editTemplate, footer: e.target.value })
              }
              className="w-full border rounded-lg p-2"
            />

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isCreating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-[99999]">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full">
            <h3 className="text-lg font-semibold mb-4">Create New Template</h3>

            {/* Title Input */}
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, title: e.target.value })
              }
              className="w-full border rounded-lg p-2 mb-4"
            />

            {/* Subject Input */}
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={newTemplate.subject}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, subject: e.target.value })
              }
              className="w-full border rounded-lg p-2 mb-4"
            />

            {/* Body Editor */}
            <label className="block text-sm font-medium mb-1">Body</label>
            <JoditEditor
              value={newTemplate.body}
              onChange={(newContent) =>
                setNewTemplate({ ...newTemplate, body: newContent })
              }
            />

            {/* Footer Input */}
            <label className="block text-sm font-medium mt-4 mb-1">
              Footer
            </label>
            <input
              type="text"
              value={newTemplate.footer}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, footer: e.target.value })
              }
              className="w-full border rounded-lg p-2"
            />

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewTemplate}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketingManagement;

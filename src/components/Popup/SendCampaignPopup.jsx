import { useEffect, useState } from "react";
import {
  broadCastCampaign,
  getCampaignUsers,
  getWhatsAppMessageTemplates,
} from "../../services/api/whatsApp";
import TemplatePreview from "../../pages/Channels/Whatsapp/components/TemplatePreview";
import { useToast } from "../../context/ToastContext";
import { NEW_BASE_URL, Sources } from "../../data/constant";

const SendCampaignPopup = ({ open, setOpen, contacts }) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [totalUser, setTotalUser] = useState(contacts?.length || 0);
  const [selectedSource, setSelectedSource] = useState("");

  const handleSend = async (source = null) => {
    try {
      setIsSending(true);

      if (!selectedTemplate) {
        showToast({
          type: "error",
          message: "Please select a template",
        });
        return;
      }

      if (!totalUser) {
        showToast({
          type: "error",
          message: "Contact not selected",
        });
        return;
      }

      const selectTemplate = templates.find((t) => t.id === selectedTemplate);

      const headerExample =
        selectTemplate.components?.find((c) => c.type === "HEADER")?.example
          ?.header_text?.[0] || [];

      const bodyExample =
        selectTemplate.components?.find((c) => c.type === "BODY")?.example
          ?.body_text?.[0] || [];
      const payload = {
        template: {
          templateName: selectTemplate.name,
          templateLanguage: selectTemplate.language,
          ...(bodyExample && { templateParams: bodyExample }),
          ...(headerExample && { templateParamsHeader: headerExample }),
        },
        ...(contacts.length > 0 && { usersIds: contacts }),
        ...(source && { source }),
      };

      const response = await broadCastCampaign(payload);

      // const data = await res.json();

      // console.log("Campaign response:", data);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send campaign");
    } finally {
      setIsSending(false);
    }
  };

  const handleSourceChange = async (source) => {
    setSelectedSource(source);
    setIsFetchingUsers(true);

    try {
      const params = {
        ...(source && { source }),
      };

      const response = await getCampaignUsers(params);

      if (response.result) {
        setTotalUser(response.result.totalUsers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch templates (mock for now)
  useEffect(() => {
    if (!open) return;

    fetchTemplates();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-96 w-full p-6 z-10 max-h-[80vh] hide-scrollbar overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Send Campaign</h2>

        {/* Dropdown */}
        <label className="text-sm font-medium">Select Template</label>
        <select
          className="w-full mt-2 p-2 border rounded-md"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="">-- Select Template --</option>
          {loading ? (
            <option>Loading templates...</option>
          ) : templates?.length > 0 ? (
            templates.map((template) => (
              <option key={template.id} value={template?.id}>
                {template.name}
              </option>
            ))
          ) : (
            <option>No templates found</option>
          )}
        </select>

        {!contacts.length && (
          <div>
            <select
              onChange={(e) => handleSourceChange(e.target.value)}
              className="w-full mt-2 p-2 border rounded-md"
            >
              <option value="" disabled>
                Select Source
              </option>
              {Sources.map((source) => (
                <option value={source.value}>{source.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Info */}
        <div>
          {isFetchingUsers && (
            <p className="text-xs text-gray-500 mt-2">Fetching users…</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Total Contacts: {totalUser || contacts.length}
          </p>
        </div>

        {/* Template Preview  */}
        {selectedTemplate && (
          <div className="mt-4">
            <TemplatePreview
              components={
                templates.find((t) => t.id === selectedTemplate)?.components ||
                []
              }
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => {
              setSelectedTemplate("");
              setTotalUser(0);
              setOpen(false);
            }}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            // disabled={isSendDisabled}
            onClick={handleSend}
            // disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendCampaignPopup;

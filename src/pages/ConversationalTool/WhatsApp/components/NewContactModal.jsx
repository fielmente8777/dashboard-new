import { useState } from "react";
import TemplateCard from "./TemplateCard";
import { sendWhatsAppMessage } from "../../../../services/api/whatsApp";

/**
 * Extracts variables like {{1}}, {{2}} from template text
 * Returns array: ["1", "2"]
 */
const extractVariables = (text = "") => {
  const matches = text.match(/{{\d+}}/g) || [];
  return [...new Set(matches.map((v) => v.replace(/[{}]/g, "")))];
};

const NewContactModal = ({ templates = [], onClose }) => {
  const [phone, setPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);

    const bodyComponent = tpl.components?.find((c) => c.type === "BODY");

    const bodyText = bodyComponent?.text || "";
    const vars = extractVariables(bodyText);

    // initialize variable state
    const initialVars = {};
    vars.forEach((key) => {
      initialVars[key] = "";
    });

    setVariables(initialVars);
  };

  const handleChange = (key, value) => {
    setVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSend = async () => {
    if (!phone || !selectedTemplate) return;

    setLoading(true);
    try {
      await sendWhatsAppMessage({
        phone,
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language || "en",
        templateParams: Object.keys(variables)
          .sort((a, b) => Number(a) - Number(b)) // important for Meta
          .map((k) => variables[k]),
      });

      onClose();
    } catch (err) {
      console.error("Failed to send template", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 flex gap-6">
        {/* LEFT PANEL */}
        <div className="w-1/2">
          <h3 className="font-semibold mb-3">New Message</h3>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9198XXXXXXXX"
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                selected={selectedTemplate?.id === tpl.id}
                values={variables}
                onSelect={() => handleSelectTemplate(tpl)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 border-l pl-6">
          <div
            className="flex justify-end font-bold cursor-pointer"
            onClick={onClose}
          >
            <span className="mb-2">X</span>
          </div>
          {selectedTemplate ? (
            <>
              <h4 className="font-semibold mb-3">Template Variables</h4>

              {Object.keys(variables).length === 0 && (
                <p className="text-sm text-gray-400 mb-4">
                  This template has no variables.
                </p>
              )}

              {Object.keys(variables)
                .sort((a, b) => Number(a) - Number(b))
                .map((key) => (
                  <input
                    key={key}
                    placeholder={`Value for {{${key}}}`}
                    className="w-full mb-3 border rounded-lg px-3 py-2"
                    value={variables[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                ))}

              <button
                disabled={loading}
                onClick={handleSend}
                className="mt-4 w-full rounded-lg bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </>
          ) : (
            <div className="text-gray-400 text-sm mt-20 text-center">
              Select a template to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewContactModal;

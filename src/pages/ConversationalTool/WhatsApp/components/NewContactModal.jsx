import { useState, useMemo } from "react";
import { sendWhatsAppMessage } from "../../../../services/api/whatsApp";
import { countriesCode } from "../../../../data/constant";

/* extract {{1}}, {{2}} */
const extractVariables = (text = "") => {
  const matches = text.match(/{{\d+}}/g) || [];
  return [...new Set(matches.map((v) => v.replace(/[{}]/g, "")))];
};

/* preview renderer */
const renderPreview = (text, vars) => {
  let output = text;
  Object.entries(vars).forEach(([k, v]) => {
    output = output.replaceAll(`{{${k}}}`, v || `{{${k}}}`);
  });
  return output;
};

const NewContactModal = ({ templates = [], onClose }) => {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState([]);
  const [headerVaribales, setHeaderVariables] = useState([]);
  const [loading, setLoading] = useState(false);

  const bodyText = useMemo(() => {
    return (
      selectedTemplate?.components?.find((c) => c.type === "BODY")?.text || ""
    );
  }, [selectedTemplate]);

  const handleTemplateSelect = (tpl) => {
    setSelectedTemplate(tpl);

    console.log(tpl);

    const bodyVars =
      tpl.components?.find((c) => c.type === "BODY")?.example?.body_text?.[0] ||
      [];

    const headerVars =
      tpl.components?.find((c) => c.type === "HEADER")?.example?.header_text ||
      [];

    setHeaderVariables(() => [...headerVars]);
    setVariables(() => [...bodyVars]);

    // const headerVars = tpl.;

    // const initVars = {};
    // const initHeaderVars = {};
    // vars.forEach((v) => (initVars[v] = ""));
    // headerVars.forEach((v) => (initHeaderVars[v] = ""));
    // setVariables(initVars);
    // setHeaderVariables(initHeaderVars);
  };

  const handleSend = async () => {
    if (!phone || !selectedTemplate) return;
    setLoading(true);

    const normalizeCountryCode = countryCode?.replace("+", "");

    try {
      await sendWhatsAppMessage({
        phone: `${normalizeCountryCode}${phone}`,
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language || "en",
        templateParams: variables,
        templateParamsHeader: headerVaribales,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  console.log(variables);
  console.log(headerVaribales);

  return (
    <div className="fixed inset-0 z-999999999 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 grid grid-cols-2 gap-6">
        {/* LEFT PANEL */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">New Message</h3>

          {/* Phone input */}
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-32 rounded-lg border px-2 py-2"
            >
              {countriesCode.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              className="flex-1 rounded-lg border px-3 py-2"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Templates list */}
          <div className="border rounded-xl max-h-[420px] overflow-y-auto divide-y">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateSelect(tpl)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                  selectedTemplate?.id === tpl.id ? "bg-gray-100" : ""
                }`}
              >
                <div className="font-medium">{tpl.name}</div>
                <div className="text-xs text-gray-500">
                  {tpl.category} • {tpl.language}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="border-l pl-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Preview</h4>
            <button onClick={onClose} className="text-gray-500">
              ✕
            </button>
          </div>

          {selectedTemplate ? (
            <>
              {/* WhatsApp preview */}
              <div className="flex justify-end mb-4">
                <div className="relative max-w-[80%] rounded-2xl rounded-br-sm bg-[#e7fce3] px-4 py-3 shadow-sm">
                  {/* message text */}
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {renderPreview(bodyText, variables)}
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

              {/* Variables */}
              <h5 className="mb-2 text-sm font-medium">Template Variables</h5>
              <div className="space-y-2 flex-1">
                {Object.keys(variables).length === 0 && (
                  <p className="text-xs text-gray-400">
                    This template has no variables
                  </p>
                )}

                {Object.keys(variables)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((key) => (
                    <input
                      key={key}
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder={`Value for {{${key}}}`}
                      value={variables[key]}
                      onChange={(e) =>
                        setVariables((p) => ({
                          ...p,
                          [key]: e.target.value,
                        }))
                      }
                    />
                  ))}
              </div>

              <button
                onClick={handleSend}
                disabled={loading}
                className="mt-2 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Select a template to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewContactModal;

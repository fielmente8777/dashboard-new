import React, { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

const WhatsappWidgetCard = ({ phoneNumber }) => {
  const [copied, setCopied] = useState("");
  const apiCodeSnippet = `const payload = {
  widget: "whatsapp",
  ndid: "${localStorage?.getItem("ndid") || "YOUR_NDID"}",
  hid: "${localStorage?.getItem("hid") || "YOUR_HID"}",
  pageUrl: window.location.href,
  websiteName: window.location.hostname,
  phoneNumber: "${phoneNumber?.displayPhoneNumber || "919999999999"}",
  message: "Hello, I'm interested in your offer."
};

await fetch(
  "https://your-domain.com/api/v1/widget/click",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);`;

  const widgetCodeSnippet = `<script>
window.eazbotConfig = {
  ndid: "${localStorage?.getItem("ndid") || "YOUR_NDID"}",
  hid: "${localStorage?.getItem("hid") || "YOUR_HID"}",
  phoneNumber: "${phoneNumber?.displayPhoneNumber || "919999999999"}",
  message: "Hello"
};
</script>

<script src="https://whatsapp-widget-tau.vercel.app/widget/whatsapp.js"></script>`;

  const copyCode = async (code, type) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 2500);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">WhatsApp Widget Integration</h2>

      <p className="mt-2 text-sm text-gray-600">
        Choose one of the integration methods below.
      </p>

      {/* Widget Script Integration */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">Option 1: Widget Script (Recommended)</h3>

          <button
            onClick={() => copyCode(widgetCodeSnippet, "widget")}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all ${
              copied === "widget"
                ? "border-green-200 bg-green-50 text-green-700"
                : "hover:bg-gray-50"
            }`}
          >
            {copied === "widget" ? <FiCheck /> : <FiCopy />}
            {copied === "widget" ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600">
          Paste this code before the closing <code>{"</body>"}</code> tag of
          your website.
        </p>

        <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm text-primary">
          <code>{widgetCodeSnippet}</code>
        </pre>
      </div>

      {/* Manual API Integration */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">Option 2: Manual API Integration</h3>

          <button
            onClick={() => copyCode(widgetCodeSnippet, "widget")}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all ${
              copied === "widget"
                ? "border-green-200 bg-green-50 text-green-700"
                : "hover:bg-gray-50"
            }`}
          >
            {copied === "widget" ? <FiCheck /> : <FiCopy />}
            {copied === "widget" ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600">
          Use this if you want to manually trigger widget click tracking from
          your application.
        </p>

        <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm text-primary">
          <code>{apiCodeSnippet}</code>
        </pre>
      </div>

      {/* Configuration */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">Configuration Options</h4>

        <ul className="mt-2 list-disc pl-5 text-sm text-blue-800">
          <li>
            <strong>ndid</strong> - Visitor identifier.
          </li>
          <li>
            <strong>hid</strong> - Website identifier.
          </li>
          <li>
            <strong>phoneNumber</strong> - WhatsApp number that receives
            messages.
          </li>
          <li>
            <strong>message</strong> - Default WhatsApp message.
          </li>
          <li>
            <strong>pageUrl</strong> - Current page URL (API integration only).
          </li>
          <li>
            <strong>websiteName</strong> - Current website hostname (API
            integration only).
          </li>
        </ul>
      </div>

      {/* Recommendation */}
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="font-medium text-green-900">Recommendation</h4>

        <p className="mt-2 text-sm text-green-800">
          Use <strong>Widget Script Integration</strong> unless you need custom
          behavior. It automatically handles widget rendering, click tracking,
          and WhatsApp redirection.
        </p>
      </div>
    </div>
  );
};

export default WhatsappWidgetCard;

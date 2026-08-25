import React, { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

const COPY_BTN =
  "flex shrink-0 items-center gap-2 rounded-[var(--r-sm)] border px-[var(--sp-3)] py-1.5 text-[length:var(--fs-sm)] transition-colors";
const CODE_BLOCK =
  "overflow-auto rounded-[var(--r-md)] border border-app-border bg-app-surface-secondary p-[var(--sp-4)] text-[length:var(--fs-sm)] text-primary dark:text-app-text-muted";
const BODY_TEXT =
  "text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-faint";

const WhatsappWidgetCard = ({ phoneNumber }) => {
  const [copied, setCopied] = useState("");
  const apiCodeSnippet = `
try{
  const payload = {
  widget: "whatsapp",
  ndid: "${localStorage?.getItem("ndid") || "YOUR_NDID"}",
  hid: "${localStorage?.getItem("hid") || "YOUR_HID"}",
  pageUrl: window.location.href,
  websiteName: window.location.hostname,
  phoneNumber: "${phoneNumber?.displayPhoneNumber.replace(/ /g, "") || "919999999999"}",
  message: "Hello, I'm interested in your offer."
};

const response = await fetch(
  "https://gian-1eve.onrender.com/api/v1/widget/click",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
); 

const data = await response.json();
const whatsappUrl = data?.result?.doc?.whatsappUrl;

if (whatsappUrl) {
  window.open(whatsappUrl, "_blank");
}
}
catch (error) {
  console.error("WhatsApp Click Error:", error);
}  
`;

  const widgetCodeSnippet = `<script>
window.eazbotConfig = {
  ndid: "${localStorage?.getItem("ndid") || "YOUR_NDID"}",
  hid: "${localStorage?.getItem("hid") || "YOUR_HID"}",
  phoneNumber: "${phoneNumber?.displayPhoneNumber?.replace(/ /g, "") || "919999999999"}",
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
    <div className="bg-app-surface p-[var(--sp-5)] shadow-sm">
      <h2 className="text-[length:var(--fs-xl)] font-semibold text-app-text">
        WhatsApp Widget Integration
      </h2>

      <p className={`mt-2 ${BODY_TEXT}`}>
        Choose one of the integration methods below.
      </p>

      {/* Widget Script Integration */}
      <div className="mt-[var(--sp-5)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-[var(--sp-3)]">
          <h3 className="font-medium text-[length:var(--fs-base)] text-app-text">
            Option 1: Widget Script (Recommended)
          </h3>

          <button
            type="button"
            onClick={() => copyCode(widgetCodeSnippet, "widget")}
            className={`${COPY_BTN} ${
              copied === "widget"
                ? "border-green-300 dark:border-green-500/40 bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                : "border-app-border text-app-text hover:bg-app-surface-secondary"
            }`}
          >
            {copied === "widget" ? <FiCheck /> : <FiCopy />}
            {copied === "widget" ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <p className={`mb-3 ${BODY_TEXT}`}>
          Paste this code before the closing <code>{"</body>"}</code> tag of
          your website.
        </p>

        <pre className={CODE_BLOCK}>
          <code>{widgetCodeSnippet}</code>
        </pre>
      </div>

      {/* Manual API Integration */}
      <div className="mt-[var(--sp-6)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-[var(--sp-3)]">
          <h3 className="font-medium text-[length:var(--fs-base)] text-app-text">
            Option 2: Manual API Integration
          </h3>

          <button
            type="button"
            onClick={() => copyCode(apiCodeSnippet, "api")}
            className={`${COPY_BTN} ${
              copied === "api"
                ? "border-green-300 dark:border-green-500/40 bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                : "border-app-border text-app-text hover:bg-app-surface-secondary"
            }`}
          >
            {copied === "api" ? <FiCheck /> : <FiCopy />}
            {copied === "api" ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <p className={`mb-3 ${BODY_TEXT}`}>
          Use this if you want to manually trigger widget click tracking from
          your application.
        </p>

        <pre className={CODE_BLOCK}>
          <code>{apiCodeSnippet}</code>
        </pre>
      </div>

      {/* Configuration */}
      <div className="mt-[var(--sp-5)] rounded-[var(--r-md)] border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-[var(--sp-4)]">
        <h4 className="font-medium text-[length:var(--fs-base)] text-blue-900 dark:text-blue-300">
          Configuration Options
        </h4>

        <ul className="mt-2 list-disc pl-5 text-[length:var(--fs-sm)] text-blue-800 dark:text-blue-200 space-y-1">
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
      <div className="mt-[var(--sp-5)] rounded-[var(--r-md)] border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-[var(--sp-4)]">
        <h4 className="font-medium text-[length:var(--fs-base)] text-green-900 dark:text-green-300">
          Recommendation
        </h4>

        <p className="mt-2 text-[length:var(--fs-sm)] text-green-800 dark:text-green-200">
          Use <strong>Widget Script Integration</strong> unless you need custom
          behavior. It automatically handles widget rendering, click tracking,
          and WhatsApp redirection.
        </p>
      </div>
    </div>
  );
};

export default WhatsappWidgetCard;